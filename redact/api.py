from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
import PyPDF2
from transformers import pipeline
import io
import re
from typing import List
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import tempfile
import traceback

app = FastAPI(title="PII Redaction API")

# Load the model
model_path = "./models/checkpoint-2334"
if not os.path.exists(model_path):
    raise FileNotFoundError("Model not found")

ner_pipeline = pipeline(
    "ner",
    model=model_path,
    tokenizer=model_path,
    aggregation_strategy="simple"
)

def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extract text from PDF file."""
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text, pdf_reader

def redact_pii(text: str, entities: List[dict]) -> str:
    """Redact PII entities from text."""
    redacted_text = text
    for entity in entities:
        print(entity['word'], entity['entity_group'])
        if entity['entity_group'] in ['PER', 'ORG', 'LOC', 'MISC', 'LABEL_1']:  # PII-related entity types
            redacted_text = re.sub(
                re.escape(entity['word']),
                '[REDACTED]',
                redacted_text
            )
    return redacted_text

def create_redacted_pdf(original_pdf: PyPDF2.PdfReader, redacted_text: str) -> bytes:
    """Create a new PDF with redacted text while preserving formatting."""
    output = io.BytesIO()
    writer = PyPDF2.PdfWriter()
    
    # Create a temporary PDF with the redacted text
    temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    c = canvas.Canvas(temp_pdf.name, pagesize=letter)
    
    # Split text into lines and add to PDF
    lines = redacted_text.split('\n')
    y = 750  # Starting y position
    for line in lines:
        if y < 50:  # Start new page if we're near the bottom
            c.showPage()
            y = 750
        c.drawString(50, y, line)
        y -= 15  # Move to next line
    
    c.save()
    
    # Merge the original PDF's formatting with the redacted text
    temp_reader = PyPDF2.PdfReader(temp_pdf.name)
    for i in range(len(original_pdf.pages)):
        page = original_pdf.pages[i]
        if i < len(temp_reader.pages):
            ...
            page = (temp_reader.pages[i])
        writer.add_page(page)
    
    writer.write(output)
    output.seek(0)
    
    # Clean up temporary file
    # os.unlink(temp_pdf.name)
    
    return output.getvalue()

@app.post("/redact")
async def redact_pdf(file: UploadFile = File(...)):
    try:
        # Read PDF file
        pdf_content = await file.read()
        
        # Extract text from PDF
        text, pdf_reader = extract_text_from_pdf(pdf_content)
        
        # Detect PII entities
        entities = ner_pipeline(text)

        
        # Redact PII
        redacted_text = redact_pii(text, entities)
        
        # Create redacted PDF
        redacted_pdf = create_redacted_pdf(pdf_reader, redacted_text)
        
        # Return the redacted PDF file
        return StreamingResponse(
            io.BytesIO(redacted_pdf),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=redacted_document.pdf"
            }
        )
    
    except Exception as e:
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

@app.post("/redact-txt")
async def redact_txt(file: UploadFile = File(...)):
    try:
        # Read PDF file
        text = (await file.read()).decode('utf-8')

        # Detect PII entities
        entities = ner_pipeline(text)

        
        # Redact PII
        redacted_text = redact_pii(text, entities)

        # Return the redacted text as stream
        return StreamingResponse(
            io.BytesIO(redacted_text.encode('utf-8')),
            media_type="text/plain",
            headers={
                "Content-Disposition": "attachment; filename=redacted_document.txt"
            }
        )
    
    except Exception as e:
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
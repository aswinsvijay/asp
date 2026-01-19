from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
import PyPDF2
from redact_model.train import SpacyModel
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
redact_model_path = "./redact_model/models/checkpoint-2334"
if not os.path.exists(redact_model_path):
    raise FileNotFoundError("Model not found")

ner_pipeline = pipeline(
    "ner",
    model=redact_model_path,
    tokenizer=redact_model_path,
    aggregation_strategy="simple"
)

spacy_model = SpacyModel()
spacy_model.load_model()

# def extract_text_from_pdf(pdf_file: bytes) -> str:
#     """Extract text from PDF file."""
#     pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
#     text = ""
#     for page in pdf_reader.pages:
#         text += page.extract_text() + "\n"
#     return text, pdf_reader

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

@app.get("/redaction-entities")
async def get_redaction_entities(file: UploadFile = File(...)):
    try:
        # Read PDF file
        text = (await file.read()).decode('utf-8')

        # Detect PII entities
        entities = ner_pipeline(text)

        return JSONResponse(
            content={"data": entities}
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
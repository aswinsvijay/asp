from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from summary_model.train import summarizer
from classify_model.train import class_mapping
from transformers import pipeline
import io
import re
from typing import List
import os
import traceback
import json
import numpy as np

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

classify_model_path = "./classify_model/models/classify_model"
if not os.path.exists(classify_model_path):
    raise FileNotFoundError("Model not found")

classify_pipeline = pipeline(
    task="text-classification",
    model=str(classify_model_path),
    tokenizer=str(classify_model_path),
    truncation=True,
    max_length=512,
    return_token_type_ids=False,
)

# https://stackoverflow.com/questions/64154850/convert-dictionary-to-a-json-in-python
class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.float32):
            return float(obj)
        return json.JSONEncoder.default(self, obj)

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

@app.post("/redaction-entities")
async def get_redaction_entities(file: UploadFile = File(...)):
    try:
        # Read PDF file
        text = (await file.read()).decode('utf-8')

        # Detect PII entities
        entities = ner_pipeline(text)

        # replace np.float32 with python float
        entities = json.loads(json.dumps(entities, cls=CustomEncoder))

        # do not include general text
        entities = [*filter(
            lambda entity: '0' not in entity['entity_group'],
            entities
        )]

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

@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    try:
        # Read PDF file
        text = (await file.read()).decode('utf-8')

        # Run document classification pipeline
        result = classify_pipeline(text)
        prediction = result[0] if result else {}
        category_int = prediction.get("label", "unknown")
        category = class_mapping.get(category_int, "unknown")
        score = prediction.get("score")

        return JSONResponse(
            content={"data": {"category": category, "score": score}}
        )
    
    except Exception as e:
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

@app.post("/summarize")
async def summarize(file: UploadFile = File(...)):
    try:
        # Read PDF file
        text = (await file.read()).decode('utf-8')

        # TODO: run summarizer here
        summary = summarizer(text)[0]['summary_text']

        return JSONResponse(
            content={"data": summary}
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
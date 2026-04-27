from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from classify_model.train import class_mapping
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
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

summary_model_path = "./summary_model/models/summary_model"
if not os.path.exists(summary_model_path):
    raise FileNotFoundError("Model not found")

summary_tokenizer = AutoTokenizer.from_pretrained(summary_model_path)
summary_model = AutoModelForSeq2SeqLM.from_pretrained(summary_model_path)

summary_pipeline = pipeline(
    task="summarization",
    model=summary_model,
    tokenizer=summary_tokenizer,
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

def chunk_text(text: str, chunk_size: int):
    # Split the input text into chunks of up to 500 words each
    words = text.split(' ')
    text_chunks: list[str] = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        text_chunks.append(chunk)

    return text_chunks

@app.post("/redaction-entities")
async def get_redaction_entities(file: UploadFile = File(...)):
    try:
        # Read PDF file
        text = (await file.read()).decode('utf-8')

        text_chunks = chunk_text(text, 500)
        nested_entities = [
            *map(
                lambda text: ner_pipeline(text),
                text_chunks,
            )
        ]

        offset = 0
        result = []
        for i, (text, entities) in enumerate(zip(text_chunks, nested_entities)):
            for e in entities:
                e['start'] += offset+i
                e['end'] += offset+i
                result.append(e)
            offset += len(text)

        # replace np.float32 with python float
        result = json.loads(json.dumps(result, cls=CustomEncoder))

        # do not include general text
        result_before_merge = [*filter(
            lambda entity: '0' not in entity['entity_group'],
            result
        )]

        result_after_merge = []
        for entity in result_before_merge:
            idx = int(entity['entity_group'].split('_')[1])
            if idx%2:
                result_after_merge.append(entity)
            else:
                result_after_merge[-1]['end'] = entity['end']

        return JSONResponse(
            content={"data": result_after_merge}
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
        category_id_str = prediction.get("label", "")
        category = class_mapping.get(category_id_str, "")
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

        individual_files = filter(
            lambda x: len(x),
            list(map(lambda x: x.strip(), text.split('<FILE SEPARATOR>')))
        )
        text_chunks_by_file = map(lambda x: chunk_text(x, 500), individual_files)

        summary_by_file = '\n'.join(
            # for every file
            map(
                lambda file_content: ' '.join(
                    # for every chunk
                    map(
                        lambda text: summary_pipeline(text)[0]['summary_text'],
                        file_content
                    )
                ),
                text_chunks_by_file
            )
        )

        return JSONResponse(
            content={"data": summary_by_file}
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
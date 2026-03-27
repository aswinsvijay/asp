# !pip install evaluate
# !pip install rouge_score

import numpy as np
import evaluate
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    DataCollatorForSeq2Seq,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
)

from transformers import pipeline

old_summarizer = pipeline("summarization", model="facebook/bart-large-cnn")


MODEL_NAME = "facebook/bart-large-cnn"
DATASET_NAME = "cnn_dailymail"
DATASET_CONFIG = "3.0.0"
TEXT_COLUMN = "article"
SUMMARY_COLUMN = "highlights"
MAX_INPUT_LENGTH = 512
MAX_TARGET_LENGTH = 64
OUTPUT_DIR = "./summary_model"
TRAIN_SAMPLES = 10000
EVAL_SAMPLES = 1000


dataset = load_dataset(DATASET_NAME, DATASET_CONFIG)
dataset["train"] = dataset["train"].select(range(TRAIN_SAMPLES))
dataset["test"] = dataset["test"].select(range(EVAL_SAMPLES))

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)


def preprocess(examples):
    model_inputs = tokenizer(
        examples[TEXT_COLUMN],
        truncation=True,
        max_length=MAX_INPUT_LENGTH,
    )
    labels = tokenizer(
        text_target=examples[SUMMARY_COLUMN],
        truncation=True,
        max_length=MAX_TARGET_LENGTH,
    )
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs


tokenized_train = dataset["train"].map(
    preprocess,
    batched=True,
    remove_columns=dataset["train"].column_names,
)
tokenized_test = dataset["test"].map(
    preprocess,
    batched=True,
    remove_columns=dataset["test"].column_names,
)

rouge = evaluate.load("rouge")


def compute_metrics(eval_pred):
    preds, labels = eval_pred
    if isinstance(preds, tuple):
        preds = preds[0]

    decoded_preds = tokenizer.batch_decode(preds, skip_special_tokens=True)
    labels = np.where(labels != -100, labels, tokenizer.pad_token_id)
    decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)
    scores = rouge.compute(predictions=decoded_preds, references=decoded_labels, use_stemmer=True)
    return {k: round(v * 100, 4) for k, v in scores.items()}


trainer = Seq2SeqTrainer(
    model=model,
    args=Seq2SeqTrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=1,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        learning_rate=2e-5,
        weight_decay=0.01,
        save_strategy="epoch",
        eval_strategy="epoch",
        predict_with_generate=False,
        generation_max_length=MAX_TARGET_LENGTH,
        generation_num_beams=1,
        load_best_model_at_end=False,
        fp16=False,
    ),
    train_dataset=tokenized_train,
    eval_dataset=tokenized_test,
    processing_class=tokenizer,
    data_collator=DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model),
    compute_metrics=compute_metrics,
)

trainer.train()

trainer.args.predict_with_generate = True
results = trainer.evaluate()
print(results)

trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

# https://www.kaggle.com/datasets/sunilthite/text-document-classification-dataset/code

import os
import pathlib
from typing import Optional
import pandas as pd
from datasets import Dataset, DatasetDict
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report
import numpy as np

dir = os.path.dirname(os.path.realpath(__file__))
MODEL_BASE_PATH = pathlib.Path(dir) / 'models'
dataset_path  = pathlib.Path(dir) / 'data' / 'dataset.csv'

def load_dataset_from_kaggle(
    text_column: str = "text",
    label_column: str = "label"
) -> DatasetDict:
    """
    Load dataset from Kaggle or local CSV file.
    
    Args:
        dataset_path: Path to CSV file. If None, tries to load from Kaggle.
        text_column: Name of the column containing text
        label_column: Name of the column containing labels
    
    Returns:
        DatasetDict with train and test splits
    """
    text_column = "Text"
    label_column = "Label"
    
    # Load CSV file
    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)
    
    # Check if required columns exist
    if text_column not in df.columns:
        raise ValueError(f"Column '{text_column}' not found. Available columns: {df.columns.tolist()}")
    if label_column not in df.columns:
        raise ValueError(f"Column '{label_column}' not found. Available columns: {df.columns.tolist()}")
    
    # Remove rows with missing values
    df = df.dropna(subset=[text_column, label_column])
    
    # Convert to Hugging Face Dataset
    dataset = Dataset.from_pandas(df)
    
    # Split the dataset (80/20)
    dataset = dataset.train_test_split(test_size=0.2, seed=42)
    train_dataset = dataset['train']
    test_dataset = dataset['test']
    
    # Create DatasetDict
    dataset_dict = DatasetDict({
        'train': train_dataset,
        'test': test_dataset
    })
    
    print(f"Loaded {len(dataset_dict['train'])} training samples and {len(dataset_dict['test'])} test samples")
    print(f"Number of classes: {len(df[label_column].unique())}")
    print(f"Classes: {sorted(df[label_column].unique())}")
    
    return dataset_dict, text_column, label_column


def preprocess_dataset(dataset, tokenizer, text_column: str, label_column: str, label2id: dict):
    """
    Preprocess the dataset for training.
    
    Args:
        dataset: Hugging Face Dataset
        tokenizer: Tokenizer to use
        text_column: Name of text column
        label_column: Name of label column
        label2id: Mapping from label to id
    
    Returns:
        Preprocessed dataset
    """
    def tokenize_function(examples):
        # Tokenize texts
        texts = examples[text_column]
        if isinstance(texts, str):
            texts = [texts]
        
        tokenized = tokenizer(
            texts,
            truncation=True,
            padding=True,
            max_length=512,
            return_tensors=None
        )
        
        # Convert labels to ids
        labels = examples[label_column]
        if isinstance(labels, str):
            labels = [labels]
        
        tokenized['labels'] = [label2id[label] for label in labels]
        
        return tokenized
    
    return dataset.map(tokenize_function, batched=True, remove_columns=dataset.column_names)


def compute_metrics(eval_pred):
    """
    Compute metrics for evaluation.
    """
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='weighted')
    accuracy = accuracy_score(labels, predictions)
    
    return {
        'accuracy': accuracy,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }


def train(
    model_name: str = "distilbert-base-uncased",
    output_dir: str = "./models/classify_model",
    num_epochs: int = 3,
    batch_size: int = 16,
    learning_rate: float = 2e-5,
):
    """
    Train a text classification model.
    
    Args:
        dataset_path: Path to CSV dataset file
        model_name: Hugging Face model name
        output_dir: Directory to save the model
        num_epochs: Number of training epochs
        batch_size: Training batch size
        learning_rate: Learning rate
        text_column: Name of text column in dataset
        label_column: Name of label column in dataset
    """
    # Load dataset
    dataset_dict, text_col, label_col = load_dataset_from_kaggle()
    
    # Get unique labels and create mappings
    train_labels = dataset_dict['train'][label_col]
    unique_labels = sorted(list(set(train_labels)))
    num_labels = len(unique_labels)
    
    label2id = {label: idx for idx, label in enumerate(unique_labels)}
    id2label = {idx: label for label, idx in label2id.items()}
    
    print(f"\nLabel mappings:")
    for label, idx in label2id.items():
        print(f"  {label}: {idx}")
    
    # Load tokenizer and model
    print(f"\nLoading model: {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=num_labels,
        id2label=id2label,
        label2id=label2id
    )
    
    # Preprocess datasets
    print("\nPreprocessing datasets...")
    train_dataset = preprocess_dataset(
        dataset_dict['train'],
        tokenizer,
        text_col,
        label_col,
        label2id
    )
    test_dataset = preprocess_dataset(
        dataset_dict['test'],
        tokenizer,
        text_col,
        label_col,
        label2id
    )
    
    # Data collator
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        learning_rate=learning_rate,
        weight_decay=0.01,
        logging_dir=f"{output_dir}/logs",
        logging_steps=100,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        save_total_limit=3,
        warmup_steps=500,
        fp16=True,  # Enable mixed precision training if supported
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )
    
    # Train the model
    print("\nStarting training...")
    trainer.train()
    
    # Evaluate on test set
    print("\nEvaluating on test set...")
    eval_results = trainer.evaluate()
    print("\nTest Set Results:")
    for key, value in eval_results.items():
        print(f"  {key}: {value:.4f}")
    
    # Get detailed classification report
    predictions = trainer.predict(test_dataset)
    y_pred = np.argmax(predictions.predictions, axis=1)
    y_true = predictions.label_ids
    
    print("\nDetailed Classification Report:")
    print(classification_report(
        y_true,
        y_pred,
        target_names=[id2label[i] for i in range(num_labels)],
        digits=4
    ))
    
    # Save the model
    print(f"\nSaving model to {output_dir}...")
    trainer.save_model()
    tokenizer.save_pretrained(output_dir)
    
    # Save label mappings
    import json
    with open(f"{output_dir}/label_mappings.json", "w") as f:
        json.dump({"label2id": label2id, "id2label": id2label}, f, indent=2)
    
    print(f"\nTraining complete! Model saved to {output_dir}")
    return trainer, model, tokenizer


if __name__ == "__main__":
    train(
        model_name="distilbert-base-uncased",
        output_dir="./models/classify_model",
        num_epochs=3,
        batch_size=16,
        learning_rate=2e-5,
    )

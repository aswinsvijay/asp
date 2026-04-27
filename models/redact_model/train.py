# !pip install datasets==3.6.0
from datasets import DatasetDict, Dataset, load_dataset, concatenate_datasets
import re
from transformers import AutoTokenizer, AutoModelForTokenClassification, Trainer, TrainingArguments
import pprint

def multi_split(data: Dataset, name_share: list[tuple[str, int]]):
  total = sum(share for _, share in name_share)
  result: dict[str, Dataset] = {}

  remaining_data = data
  for name, share in name_share:
    fraction = share/total
    is_last = share == total

    if is_last:
      split_data = DatasetDict({
        'train': remaining_data,
        'test': None
      })
    else:
      split_data = remaining_data.train_test_split(train_size=fraction)

    result[name] = split_data['train']
    remaining_data = split_data['test']
    total -= share

  return DatasetDict(result)

dataset = load_dataset("conll2003")
dataset = concatenate_datasets(dataset.values()).shuffle()

dataset = multi_split(dataset, [['train', 6], ['validation', 2], ['test', 2]])
dataset

label_list = dataset["train"].features["ner_tags"].feature.names
label_list

def cleanup_name(name: str):
  regex = '[^A-Za-z0-9]+'
  return re.sub(regex, '_', name)

tokenizer = AutoTokenizer.from_pretrained("bert-base-cased")

def tokenize_and_align_labels(examples):
    tokenized_inputs = tokenizer(
        list(examples["tokens"]),
        truncation=True,
        padding="max_length",
        is_split_into_words=True,
        max_length=128
    )

    labels = []
    for i, label in enumerate(examples[f"{'ner'}_tags"]):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        label_ids = []
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif label[word_idx] == '0':
                label_ids.append(0)
            else:
                label_ids.append(label[word_idx])
        labels.append(label_ids)

    tokenized_inputs["labels"] = labels
    return tokenized_inputs

tokenized_datasets = dataset.map(tokenize_and_align_labels, batched=True)

model = AutoModelForTokenClassification.from_pretrained("bert-base-cased", num_labels=len(label_list))

args = TrainingArguments(
    output_dir="./pii-model",
    save_strategy="epoch",
    learning_rate=2e-5,
    num_train_epochs=3,
    weight_decay=0.01,
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    processing_class=tokenizer,
)

trainer.train()

trainer.evaluate()

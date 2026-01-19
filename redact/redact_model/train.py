from typing import Protocol, Any, Iterable, TypedDict
import spacy
from spacy.util import minibatch
import random
from faker import Faker
import os
import pathlib

dir = os.path.dirname(os.path.realpath(__file__))
MODEL_BASE_PATH = pathlib.Path(dir) / 'models'

class Annotations(TypedDict):
    entities: list[tuple[int, int, str]]

class FakeDataGenerator:
    generator: Faker

    def __init__(self) -> None:
        self.generator = Faker()

    def generate_one(self) -> tuple[str, Annotations]:
        name = self.generator.name()
        address = self.generator.address().replace("\n", ", ")
        phone = self.generator.phone_number()
        ssn = self.generator.ssn()
        card = self.generator.credit_card_number()
        email = self.generator.email()

        sentence = (
            f"{name} lives at {address}. Contact: {phone}, SSN: {ssn}, "
            f"Card: {card}, Email: {email}"
        )

        entities: list[tuple[int, int, str]] = []
        for pii, label in [(name, "PERSON"), (address, "ADDRESS"), (phone, "PHONE"),
                        (ssn, "SSN"), (card, "CREDIT_CARD"), (email, "EMAIL")]:
            start = sentence.find(pii)

            if start < 0:
                continue

            entities.append((start, start + len(pii), label))

        return sentence, {"entities": entities}

    def generate(self, size: int):
        return list(self.generate_one() for _ in range(size))

class Model(Protocol):
    name: str

    @property
    def effective_path(self):
        return MODEL_BASE_PATH / self.name

    def load_dataset(self) -> None:
        ...
    
    def train(self) -> None:
        ...
    
    def run(self, text: str) -> Any:
        ...

    def save_model(self):
        ...

    def load_model(self):
        ...

class SpacyModel(Model):
    name: str = 'spacy'
    dataset: list[tuple[str, Annotations]]

    def __init__(self) -> None:
        self.nlp = spacy.blank("en")
        self.ner = self.nlp.add_pipe("ner")
        self.dataset = []

    def load_dataset(self) -> None:
        self.dataset = FakeDataGenerator().generate(1000)

        for _, annotations in self.dataset:
            for _, _, label in annotations["entities"]:
                self.ner.add_label(label)

    def train(self) -> None:
        self.nlp.begin_training() # type: ignore

        for i in range(10):
            random.shuffle(self.dataset)
            losses: dict[str, float] = {}
            batches: Iterable[list[tuple[str, Annotations]]] = minibatch(self.dataset, size=20)
            for batch in batches:
                examples = []
                for text, ann in batch:
                    doc = self.nlp.make_doc(text)
                    example = spacy.training.Example.from_dict(doc, ann)
                    examples.append(example)
                self.nlp.update(examples, drop=0.2, losses=losses)
            print(f"Iteration {i + 1} - Loss {losses}")

    def run(self, text: str):
        return self.nlp(text)

    def save_model(self):
        self.nlp.to_disk(self.effective_path)

    def load_model(self):
        self.nlp = spacy.load(self.effective_path)
        self.ner = self.nlp.get_pipe("ner")

    def redact(self, text: str):
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ADDRESS", "PHONE", "SSN", "CREDIT_CARD", "EMAIL"]:
                text = text.replace(ent.text, f"[{ent.label_}]")

        return text

if __name__ == "__main__":
    model = SpacyModel()

    model.load_dataset()
    model.train()
    model.save_model()

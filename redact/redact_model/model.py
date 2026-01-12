from typing import Protocol, Any, Iterable
import spacy
from spacy.util import minibatch
import random
from fakedata import FakeDataGenerator
import config
from annotations import Annotations

class Model(Protocol):
    name: str

    @property
    def effective_path(self):
        return config.MODEL_BASE_PATH / self.name

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
        self.dataset = FakeDataGenerator().generate(100)

        for _, annotations in self.dataset:
            for _, _, label in annotations["entities"]:
                self.ner.add_label(label)

    def train(self) -> None:
        self.nlp.begin_training() # type: ignore

        for i in range(30):
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
        self.nlp.from_disk(self.effective_path)

class BertModel(Model):
    name: str = 'checkpoint-2334'

from faker import Faker
from annotations import Annotations

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

from typing import TypedDict

class Annotations(TypedDict):
    entities: list[tuple[int, int, str]]

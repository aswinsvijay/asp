from enum import Enum
import pathlib

class ModelGenerationStrategy(Enum):
    TRAIN = 'TRAIN'
    LOAD_FILE = 'LOAD_FILE'

MODEL_BASE_PATH = pathlib.Path('./models')
MODEL_GENERATION_STRATEGY = ModelGenerationStrategy.TRAIN

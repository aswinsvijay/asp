from model import SpacyModel

model = SpacyModel()

model.load_dataset()
model.train()
model.save_model()

from sentence_transformers import SentenceTransformer
import logging
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("transformers").setLevel(logging.ERROR)

_model = None  # global cache

class Embedder:
    def __init__(self):
        global _model
        if _model is None:
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        self.model = _model

    def embed(self, text: str):
        return self.model.encode(text).tolist()
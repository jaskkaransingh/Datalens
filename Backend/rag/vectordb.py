import chromadb
from chromadb.config import Settings
from rag.embedder import Embedder

class VectorDB:
    def __init__(self):
        self.embedder = Embedder()

        self.client = chromadb.PersistentClient(path="vector_store")

        self.collection = self.client.get_or_create_collection(
            name="dataset_collection"
        )

    def add_document(self, doc_id: str, text: str, metadata: dict):
        embedding = self.embedder.embed(text)

        self.collection.add(
            ids=[doc_id],
            documents=[text],
            embeddings=[embedding],
            metadatas=[metadata]
        )

    def query(self, query_text: str, dataset_names=None, n_results: int = 3):
        query_embedding = self.embedder.embed(query_text)

        where_filter = None

        if dataset_names:
            if isinstance(dataset_names, list):
                where_filter = {"dataset_name": {"$in": dataset_names}}
            else:
                where_filter = {"dataset_name": dataset_names}

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where_filter
        )

        return results
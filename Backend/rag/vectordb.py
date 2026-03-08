import json
import os
import numpy as np
from rag.embedder import Embedder

class VectorDB:
    def __init__(self):
        self.embedder = Embedder()
        self.store_path = "vector_store.json"
        
        self.documents = []
        self.embeddings = []
        self.metadatas = []
        self.ids = []
        
        self.load_store()

    def load_store(self):
        if os.path.exists(self.store_path):
            try:
                with open(self.store_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.documents = data.get("documents", [])
                    self.embeddings = data.get("embeddings", [])
                    self.metadatas = data.get("metadatas", [])
                    self.ids = data.get("ids", [])
            except Exception:
                pass

    def save_store(self):
        with open(self.store_path, "w", encoding="utf-8") as f:
            json.dump({
                "documents": self.documents,
                "embeddings": self.embeddings,
                "metadatas": self.metadatas,
                "ids": self.ids
            }, f)

    def add_document(self, doc_id: str, text: str, metadata: dict):
        embedding = self.embedder.embed(text)
        
        if doc_id in self.ids:
            idx = self.ids.index(doc_id)
            self.documents[idx] = text
            self.embeddings[idx] = embedding
            self.metadatas[idx] = metadata
        else:
            self.ids.append(doc_id)
            self.documents.append(text)
            self.embeddings.append(embedding)
            self.metadatas.append(metadata)
            
        self.save_store()

    def query(self, query_text: str, dataset_names=None, n_results: int = 3):
        if not self.embeddings:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
            
        query_embedding = np.array(self.embedder.embed(query_text))
        all_embeddings = np.array(self.embeddings)
        
        norm_q = np.linalg.norm(query_embedding)
        norm_all = np.linalg.norm(all_embeddings, axis=1)
        
        norm_all[norm_all == 0] = 1e-10
        if norm_q == 0: norm_q = 1e-10
            
        similarities = np.dot(all_embeddings, query_embedding) / (norm_all * norm_q)
        
        valid_indices = []
        for i, meta in enumerate(self.metadatas):
            if dataset_names:
                if isinstance(dataset_names, list) and meta.get("dataset_name") in dataset_names:
                    valid_indices.append(i)
                elif meta.get("dataset_name") == dataset_names:
                    valid_indices.append(i)
            else:
                valid_indices.append(i)
                
        if not valid_indices:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
            
        valid_indices = np.array(valid_indices)
        valid_similarities = similarities[valid_indices]
        
        k = min(n_results, len(valid_indices))
        top_k_idx = np.argsort(valid_similarities)[::-1][:k]
        original_indices = valid_indices[top_k_idx]
        
        results = {
            "documents": [[self.documents[i] for i in original_indices]],
            "metadatas": [[self.metadatas[i] for i in original_indices]],
            "distances": [[float(1.0 - similarities[i]) for i in original_indices]]
        }
        
        return results
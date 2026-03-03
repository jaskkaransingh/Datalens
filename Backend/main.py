from fastapi import FastAPI
from rag.vectordb import VectorDB
from services.rag_service import RAGService

rag_service = RAGService()
app = FastAPI()
db = VectorDB()

@app.get("/")
def root():
    return {"message": "Backend is alive 🚀"} 


@app.get("/ask")
def ask(question: str, dataset: str = None):
    dataset_names = [dataset] if dataset else None
    return {
        "response": rag_service.ask(question, dataset_names)
    }

@app.post("/ingest_snapshot")
def ingest_snapshot(snapshot: dict):
    return rag_service.add_snapshot(snapshot)

@app.post("/ingest_cleaning")
def ingest_cleaning(cleaning: dict):
    return {
        "impact_analysis": rag_service.add_cleaning_update(cleaning)
    }

@app.post("/ingest_visualization")
def ingest_visualization(viz: dict):
    return {
        "visualization_analysis": rag_service.add_visualization_event(viz)
    }
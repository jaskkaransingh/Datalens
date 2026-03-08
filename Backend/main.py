from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from routes import upload, profile, clean, export, visualize, history, modify
from rag.vectordb import VectorDB
from services.rag_service import RAGService

# Initialize services
rag_service = RAGService()
db = VectorDB()

app = FastAPI(
    title="DATALENS Backend",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(profile.router, prefix="/api", tags=["Profile"])
app.include_router(clean.router, prefix="/api", tags=["Cleaning"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(modify.router, prefix="/api", tags=["Modify"])
app.include_router(visualize.router, prefix="/api", tags=["visualize"])

@app.get("/")
def root():
    return {"message": "Backend is alive 🚀"} 

@app.get("/api/ask")
def ask(question: str, dataset: str = None):
    dataset_names = [dataset] if dataset else None
    return {
        "response": rag_service.ask(question, dataset_names)
    }

@app.post("/api/ingest_snapshot")
def ingest_snapshot(snapshot: dict):
    return rag_service.add_snapshot(snapshot)

@app.post("/api/ingest_cleaning")
def ingest_cleaning(cleaning: dict):
    return {
        "impact_analysis": rag_service.add_cleaning_update(cleaning)
    }

@app.post("/api/ingest_visualization")
def ingest_visualization(viz: dict):
    return {
        "visualization_analysis": rag_service.add_visualization_event(viz)
    }

from pydantic import BaseModel
import uuid

class LogEvent(BaseModel):
    message: str
    dataset_name: str = "Unknown"

@app.post("/api/log_event")
def log_event(event: LogEvent):
    # Store arbitrary interaction string in VectorDB for immediate RAG context
    doc_id = f"log_{uuid.uuid4().hex[:8]}"
    db.add_document(
        doc_id=doc_id,
        text=event.message,
        metadata={
            "document_type": "user_interaction",
            "dataset_name": event.dataset_name
        }
    )
    return {"status": "Logged interaction to RAG"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)

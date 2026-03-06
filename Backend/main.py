from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
<<<<<<< HEAD
from routes import upload, profile, clean, export, visualize, history, modify
=======
from routes import upload, profile, clean, export, visualize, history
from rag.vectordb import VectorDB
from services.rag_service import RAGService

# Initialize services
rag_service = RAGService()
db = VectorDB()
>>>>>>> 3e8a6df08b06280b0374a9a1e4985a7c619ab61d

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
<<<<<<< HEAD
app.include_router(modify.router, prefix="/api", tags=["Modify"])
=======

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

>>>>>>> 3e8a6df08b06280b0374a9a1e4985a7c619ab61d

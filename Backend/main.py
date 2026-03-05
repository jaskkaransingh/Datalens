from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from routes import upload, profile, clean, export, visualize,history

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

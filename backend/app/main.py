from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, crimes, analytics, heatmap, reports, copilot
from app.services.prediction import PredictionService

app = FastAPI(title="CrimeGPT KSP — Advanced Police Intelligence Command Center", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind all sub-routers to app under /api prefix for frontend backwards-compatibility
app.include_router(auth.router, prefix="/api")
app.include_router(crimes.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(heatmap.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")

# Bind standard root endpoints for clean RESTful matches
app.include_router(auth.router)
app.include_router(crimes.router)
app.include_router(analytics.router)
app.include_router(heatmap.router)
app.include_router(reports.router)
app.include_router(copilot.router)

@app.get("/")
def read_root():
    return {"status": "operational", "system": "KSP CrimeGPT AI Platform", "clearance": "Level 5 Approved"}

# Trigger RandomForest model training on startup
@app.on_event("startup")
def startup_event():
    PredictionService.train_model()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=10000, reload=True)

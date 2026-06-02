from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_service import RAGService
from app.services.prediction import PredictionService
from app.services.summarizer import SummarizerService
from app.services.network_graph import NetworkGraphService

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    conversation_history: list = []

class PredictRequest(BaseModel):
    district: str
    month: int
    crime_type: str

class SummarizeRequest(BaseModel):
    text: str

@router.post("/chat")
@router.post("/copilot/chat")
def chat_gpt(req: ChatMessage):
    ans = RAGService.answer_query(req.message)
    return {"response": ans}

@router.post("/copilot/recommend")
def recommend_steps():
    return {
        "steps": [
            "Check regional BNS/IPC registration and match suspect aliases.",
            "Scan exit routes CCTV toll networks for Pulsar sighting overlaps.",
            "Verify suspect cell tower dumps and bank mule routing Preserves."
        ]
    }

@router.get("/offenders/repeat")
def get_repeat_offenders():
    return [
        {"name": "Ramesh Nayak", "alias": "Chotta", "risk": "CRITICAL"},
        {"name": "Munna", "alias": "Kariya", "risk": "HIGH"}
    ]

@router.get("/network/{suspect_id}")
@router.get("/stats/network")
def get_network(suspect_id: str = None):
    return NetworkGraphService.get_gang_relations()

@router.post("/predict")
@router.get("/predict/hotspots")
def predict_hotspots(req: PredictRequest = None):
    if req is None:
        return PredictionService.predict("Bengaluru City", 6, "Cyber Crime")
    return PredictionService.predict(req.district, req.month, req.crime_type)

@router.post("/summarize")
def summarize_fir(req: SummarizeRequest):
    return SummarizerService.summarize(req.text)

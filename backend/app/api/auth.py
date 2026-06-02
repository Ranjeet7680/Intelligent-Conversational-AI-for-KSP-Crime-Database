from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.utils.security import create_access_token
from app.models.officer import OfficerCreate

router = APIRouter()

class LoginRequest(BaseModel):
    officer_id: str
    password: str

@router.post("/login")
def login(req: LoginRequest):
    if not req.officer_id or not req.password:
        raise HTTPException(status_code=400, detail="Credentials missing")
    # In a real environment, verify with SQLite hashed passwords
    token = create_access_token({"officer_id": req.officer_id, "role": "Commander"})
    return {"status": "success", "access_token": token, "token_type": "bearer", "officer_id": req.officer_id}

@router.post("/logout")
def logout():
    return {"status": "success", "message": "Logged out successfully"}

@router.get("/profile")
def get_profile():
    return {"officer_id": "KSP-7680", "name": "Ranjeet Kumar", "rank": "Commander", "clearance": "Level 5"}

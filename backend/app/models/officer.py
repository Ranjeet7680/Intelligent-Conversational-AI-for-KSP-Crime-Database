from pydantic import BaseModel
from typing import Optional

class OfficerBase(BaseModel):
    name: str
    rank: str
    badge_no: str
    district: str
    role: str

class OfficerCreate(OfficerBase):
    password: str

class OfficerProfile(OfficerBase):
    id: int
    online_status: bool

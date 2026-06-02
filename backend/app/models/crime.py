from pydantic import BaseModel
from typing import List, Optional

class CrimeBase(BaseModel):
    fir_no: str
    crime_type: str
    sub_crime_type: str
    district: str
    police_station: str
    description: str
    incident_date: str
    status: str

class CrimeCreate(CrimeBase):
    pass

class Crime(CrimeBase):
    id: int

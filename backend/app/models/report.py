from pydantic import BaseModel
from typing import List, Optional

class ReportRequest(BaseModel):
    case_id: int
    format: str = "pdf"

class ReportResponse(BaseModel):
    report_url: str
    status: str

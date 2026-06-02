from fastapi import APIRouter, HTTPException
from app.models.report import ReportRequest, ReportResponse

router = APIRouter()

@router.post("/report/generate")
def generate_report(req: ReportRequest):
    if not req.case_id:
        raise HTTPException(status_code=400, detail="Invalid case ID")
    return {
        "report_url": f"/reports/case_report_{req.case_id}.pdf",
        "status": "success"
    }

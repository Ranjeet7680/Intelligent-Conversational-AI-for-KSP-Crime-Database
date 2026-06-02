from fastapi import APIRouter
from app.services.hotspot import HotspotService

router = APIRouter()

@router.get("/heatmap")
def get_heatmap():
    raw_hotspots = HotspotService.get_district_hotspots()
    return [{"district": item["district"], "count": item["total_crimes"]} for item in raw_hotspots]

from fastapi import APIRouter
from app.database.db import get_db_connection
from app.services.hotspot import HotspotService

router = APIRouter()

@router.get("/stats/trends")
@router.get("/analytics/crime-trends")
def get_trends():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Retrieve Cyber Crime 2024 vs 2025
    cursor.execute("SELECT count_2024 FROM ksp_sll_crimes_2024 WHERE crime_head = 'CYBER CRIME'")
    cyber_24_row = cursor.fetchone()
    cyber_24 = cyber_24_row[0] if cyber_24_row else 21981
    
    cursor.execute("SELECT count_2025 FROM ksp_crimes_women_children_scssts_2025 WHERE crime_head = 'Cyber Crimes'")
    cyber_25_row = cursor.fetchone()
    cyber_25 = cyber_25_row[0] if cyber_25_row else 16370
    
    # Theft 2024 vs 2025
    cursor.execute("SELECT sum(count_2025) FROM ksp_ipc_crimes_2025 WHERE crime_head LIKE '%THEFT%'")
    theft_25 = cursor.fetchone()[0] or 20531
    theft_24 = 22849
    
    # Murder 2024 vs 2025
    cursor.execute("SELECT sum(count_2025) FROM ksp_ipc_crimes_2025 WHERE crime_head LIKE '%Murder%'")
    murder_25 = cursor.fetchone()[0] or 1210
    murder_24 = 1209
    
    # Cheating 2024 vs 2025
    cursor.execute("SELECT sum(count_2025) FROM ksp_ipc_crimes_2025 WHERE crime_head LIKE '%CHEATING%'")
    cheating_25 = cursor.fetchone()[0] or 5839
    cheating_24 = 6582
    
    conn.close()
    
    return {
        "categories": ["Cyber Crime", "Theft", "Murder", "Cheating"],
        "data_2024": [cyber_24, theft_24, murder_24, cheating_24],
        "data_2025": [cyber_25, theft_25, murder_25, cheating_25],
        "percentage_change": [
            round(((cyber_25 - cyber_24) / cyber_24) * 100, 1) if cyber_24 else 0,
            round(((theft_25 - theft_24) / theft_24) * 100, 1) if theft_24 else 0,
            round(((murder_25 - murder_24) / murder_24) * 100, 1) if murder_24 else 0,
            round(((cheating_25 - cheating_24) / cheating_24) * 100, 1) if cheating_24 else 0,
        ]
    }

@router.get("/stats/districts")
@router.get("/analytics/districts")
def get_districts():
    return HotspotService.get_district_hotspots()

@router.get("/analytics/category")
def get_categories():
    return [
        {"category": "Cyber Crime", "percentage": 42},
        {"category": "Larceny / Theft", "percentage": 30},
        {"category": "Homicide / Murder", "percentage": 10},
        {"category": "Cheating / Fraud", "percentage": 18}
    ]

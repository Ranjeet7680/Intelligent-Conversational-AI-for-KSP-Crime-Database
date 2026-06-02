from fastapi import APIRouter, HTTPException, Query
from app.database.db import get_db_connection
from datetime import datetime

router = APIRouter()

@router.get("/cases")
@router.get("/crimes")
def get_crimes(
    page: int = 1,
    limit: int = 15,
    q: str = None,
    district: str = None,
    crime_type: str = None,
    status: str = None
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM cases WHERE 1=1"
    params = []
    
    if q:
        query += " AND (fir_no LIKE ? OR description LIKE ? OR victim_name LIKE ? OR accused_names LIKE ?)"
        params.extend([f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%"])
    if district:
        query += " AND district = ?"
        params.append(district)
    if crime_type:
        query += " AND crime_type = ?"
        params.append(crime_type)
    if status:
        query += " AND status = ?"
        params.append(status)
        
    count_query = f"SELECT COUNT(*) FROM ({query})"
    cursor.execute(count_query, params)
    total_records = cursor.fetchone()[0]
    
    query += " ORDER BY incident_date DESC LIMIT ? OFFSET ?"
    params.extend([limit, (page - 1) * limit])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    cases_list = [dict(row) for row in rows]
    conn.close()
    
    return {
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": (total_records + limit - 1) // limit,
        "cases": cases_list
    }

@router.get("/cases/{case_id}")
@router.get("/crimes/{case_id}")
def get_crime(case_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Case file not found")
        
    case_data = dict(row)
    
    cursor.execute("""
    SELECT a.* FROM accused a 
    JOIN case_accused ca ON a.id = ca.accused_id 
    WHERE ca.case_id = ?
    """, (case_id,))
    accused_rows = cursor.fetchall()
    case_data["linked_accused"] = [dict(r) for r in accused_rows]
    
    try:
        idate = datetime.strptime(case_data["incident_date"], "%Y-%m-%d %H:%M:%S")
    except:
        idate = datetime.now()
    
    timeline = [
        {"title": "Incident Reported", "date": idate.strftime("%d-%m-%Y %H:%M"), "desc": "Official complaint filed by victim.", "status": "completed"},
        {"title": "FIR Registered", "date": idate.strftime("%d-%m-%Y %H:%M"), "desc": f"Case entered into KSP records as {case_data['fir_no']}.", "status": "completed"}
    ]
    
    if case_data["status"] in ["Arrested", "Chargesheeted", "Closed (Convicted)"]:
        timeline.append({"title": "Suspect Arrested", "date": idate.strftime("%d-%m-%Y"), "desc": "Suspects taken into custody.", "status": "completed"})
    else:
        timeline.append({"title": "Suspect Arrested", "date": "TBD", "desc": "Raids underway.", "status": "pending"})
        
    if case_data["status"] in ["Chargesheeted", "Closed (Convicted)"]:
        timeline.append({"title": "Chargesheet Filed", "date": idate.strftime("%d-%m-%Y"), "desc": "Investigation report submitted.", "status": "completed"})
    else:
        timeline.append({"title": "Chargesheet Filed", "date": "TBD", "desc": "Forensic matches pending.", "status": "pending"})
        
    case_data["timeline"] = timeline
    
    steps = []
    if case_data["crime_type"] == "Cyber Crime":
        steps = [
            "Preserve financial logs via BNSS Section 102 bank notifications.",
            "Verify IP routing registers and request KYC registers from telecom companies.",
            "Map layering bank accounts to identify primary beneficiary wallets."
        ]
    elif case_data["crime_type"] == "Murder":
        steps = [
            "Send seized weapons to State Forensic Science Laboratory (FSL) for DNA indexing.",
            "Compile eye-witness depositions under BNSS Section 180.",
            "Analyze cell tower dump records surrounding the location during incident hours."
        ]
    else:
        steps = [
            "Check regional repeat offender indexes for modus operandi matches.",
            "Distribute physical asset descriptors on pawnbroker monitor ledger.",
            "Examine route CCTV feeds for suspect vehicle sightings."
        ]
    case_data["investigation_steps"] = steps
    
    conn.close()
    return case_data

from app.database.db import get_db_connection

class NetworkGraphService:
    @staticmethod
    def get_gang_relations() -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM accused")
        accused_rows = cursor.fetchall()
        
        cursor.execute("""
        SELECT ca.accused_id, ca.case_id, c.fir_no, c.crime_type, c.district 
        FROM case_accused ca 
        JOIN cases c ON ca.case_id = c.id
        """)
        links = cursor.fetchall()
        conn.close()
        
        nodes = []
        edges = []
        
        accused_ids_in_links = set(link['accused_id'] for link in links)
        
        for a in accused_rows:
            if a['id'] not in accused_ids_in_links:
                continue
                
            color = "#00f0ff"
            if a['risk_level'] == "CRITICAL":
                color = "#ff2e2e"
            elif a['risk_level'] == "HIGH":
                color = "#ff8c00"
                
            nodes.append({
                "id": f"accused_{a['id']}",
                "label": a['name'],
                "type": "offender",
                "risk": a['risk_level'],
                "details": f"Alias: {a['alias']} | Affiliation: {a['gang_affiliation']}",
                "color": color,
                "size": 25 if a['risk_level'] in ["CRITICAL", "HIGH"] else 18
            })
            
        unique_cases = {}
        for link in links:
            cid = link['case_id']
            if cid not in unique_cases:
                col = "#00ffff"
                if link['crime_type'] == "Murder":
                    col = "#ff2e2e"
                elif link['crime_type'] == "Cyber Crime":
                    col = "#bf00ff"
                elif link['crime_type'] == "Theft":
                    col = "#ffea00"
                    
                unique_cases[cid] = {
                    "id": f"case_{cid}",
                    "label": link['fir_no'],
                    "type": "case",
                    "details": f"Crime: {link['crime_type']} | Location: {link['district']}",
                    "color": col,
                    "size": 12
                }
                
            edges.append({
                "source": f"accused_{link['accused_id']}",
                "target": f"case_{cid}",
                "label": "Accused In"
            })
            
        nodes.extend(unique_cases.values())
        
        gang_names = ["Kaveri Sand Mafia Syndicate", "Cyber Jamtara Phishing Guild", "Two-Wheeler Snatching Ring", "Gowda Land Grabbing Syndicate"]
        gang_colors = {"Kaveri Sand Mafia Syndicate": "#ff8800", "Cyber Jamtara Phishing Guild": "#aa00ff", "Two-Wheeler Snatching Ring": "#ffff00", "Gowda Land Grabbing Syndicate": "#ff0055"}
        
        for idx, g in enumerate(gang_names):
            associated_accused = [a for a in accused_rows if a['gang_affiliation'] == g]
            if associated_accused:
                nodes.append({
                    "id": f"gang_{idx}",
                    "label": g,
                    "type": "gang",
                    "details": "Organized Criminal Syndicate",
                    "color": gang_colors[g],
                    "size": 35
                })
                for a in associated_accused:
                    if a['id'] in accused_ids_in_links:
                        edges.append({
                            "source": f"accused_{a['id']}",
                            "target": f"gang_{idx}",
                            "label": "Member Of"
                        })
                        
        return {"nodes": nodes, "edges": edges}

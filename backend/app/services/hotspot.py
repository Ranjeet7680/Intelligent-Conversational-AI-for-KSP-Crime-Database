from app.database.db import get_db_connection

class HotspotService:
    @staticmethod
    def get_district_hotspots() -> list:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM ksp_district_wise_2025")
        rows = cursor.fetchall()
        
        coordinates = {
            "Bengaluru City": [12.9716, 77.5946],
            "Mysuru City": [12.2958, 76.6394],
            "Hubballi Dharwad City": [15.3647, 75.1240],
            "Mangaluru City": [12.9141, 74.8560],
            "Belagavi City": [15.8497, 74.4977],
            "Kalaburagi City": [17.3291, 76.8341],
            "Bengaluru Dist": [13.2046, 77.7066],
            "Tumakuru": [13.3422, 77.1017],
            "Kolar": [13.1368, 78.1292],
            "Chickballapura": [13.4354, 77.7275],
            "Chitradurga": [14.2251, 76.3980],
            "Davanagere": [14.4644, 75.9218],
            "Shivamogga": [13.9299, 75.5681],
            "Haveri": [14.7958, 75.3996],
            "Dakshina Kannada": [12.8438, 75.2479],
            "Udupi": [13.3409, 74.7421],
            "Chikkamagaluru": [13.3161, 75.7720],
            "Uttara Kannada": [14.8080, 74.5765],
            "Belagavi Dist": [16.1497, 74.7977],
            "Bagalkot": [16.1810, 75.6958],
            "Vijayapur": [16.8302, 75.7100],
            "Dharwad": [15.4589, 75.0078],
            "Gadag": [15.4326, 75.6428],
            "Kalaburagi": [17.0291, 76.9341],
            "Bidar": [17.9104, 77.5199],
            "Yadgir": [16.7663, 77.1352],
            "Mysuru Dist": [12.1958, 76.5394],
            "Mandya": [12.5218, 76.8951],
            "Chamarajanagar": [11.9261, 76.9402],
            "Hassan": [13.0068, 76.1026],
            "Kodagu": [12.4244, 75.7389],
            "Ballari": [15.1394, 76.9214],
            "Koppal": [15.3468, 76.1554],
            "Raichur": [16.2120, 77.3556],
            "Vijayanagara": [15.2689, 76.3909],
            "Ramanagara": [12.7153, 77.2813],
            "K.G.F": [12.9589, 78.2713]
        }
        
        district_data = []
        for row in rows:
            dname = row['district']
            coords = coordinates.get(dname, [12.97, 77.59])
            
            ipc = row['ipc_crimes']
            sll = row['sll_crimes']
            total = ipc + sll
            
            if total > 20000:
                level = "CRITICAL"
                color = "#ff2e2e"
            elif total > 5000:
                level = "HIGH"
                color = "#ff8c00"
            elif total > 2000:
                level = "MEDIUM"
                color = "#ffea00"
            else:
                level = "LOW"
                color = "#00ff66"
                
            district_data.append({
                "district": dname,
                "coords": coords,
                "ipc_crimes": ipc,
                "sll_crimes": sll,
                "total_crimes": total,
                "threat_level": level,
                "color": color
            })
        conn.close()
        return district_data

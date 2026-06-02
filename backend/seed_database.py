import os
import sqlite3
import pandas as pd
import random
from datetime import datetime, timedelta

def seed_db():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(os.path.dirname(BASE_DIR), "DATASET")
    db_path = os.path.join(BASE_DIR, "ksp_crimes.db")
    
    # Ensure backend directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Creating database schema...")
    
    cursor.execute("DROP TABLE IF EXISTS cases")
    cursor.execute("DROP TABLE IF EXISTS accused")
    cursor.execute("DROP TABLE IF EXISTS case_accused")
    
    # 1. Create table for simulated FIR cases
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fir_no TEXT UNIQUE,
        crime_type TEXT,
        sub_crime_type TEXT,
        bns_sections TEXT,
        incident_date TEXT,
        district TEXT,
        police_station TEXT,
        status TEXT,
        victim_name TEXT,
        accused_names TEXT,
        description TEXT,
        evidence TEXT,
        officer_assigned TEXT,
        officer_rank TEXT
    )
    """)
    
    # 2. Create table for accused profiles (for network graph)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS accused (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        age INTEGER,
        alias TEXT,
        gang_affiliation TEXT,
        risk_level TEXT
    )
    """)
    
    # 3. Create case_accused joint table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS case_accused (
        case_id INTEGER,
        accused_id INTEGER,
        role TEXT,
        PRIMARY KEY (case_id, accused_id),
        FOREIGN KEY (case_id) REFERENCES cases(id),
        FOREIGN KEY (accused_id) REFERENCES accused(id)
    )
    """)
    
    # 4. Create table for raw aggregated datasets to enable quick analytics queries
    cursor.execute("DROP TABLE IF EXISTS ksp_district_wise_2025")
    cursor.execute("""
    CREATE TABLE ksp_district_wise_2025 (
        sl_no TEXT,
        district TEXT,
        ipc_crimes INTEGER,
        sll_crimes INTEGER
    )
    """)
    
    cursor.execute("DROP TABLE IF EXISTS ksp_crimes_women_children_scssts_2025")
    cursor.execute("""
    CREATE TABLE ksp_crimes_women_children_scssts_2025 (
        category TEXT,
        crime_head TEXT,
        count_2025 INTEGER
    )
    """)

    cursor.execute("DROP TABLE IF EXISTS ksp_crimes_women_children_scssts_2024")
    cursor.execute("""
    CREATE TABLE ksp_crimes_women_children_scssts_2024 (
        category TEXT,
        crime_head TEXT,
        count_2024 INTEGER
    )
    """)
    
    cursor.execute("DROP TABLE IF EXISTS ksp_ipc_crimes_2025")
    cursor.execute("""
    CREATE TABLE ksp_ipc_crimes_2025 (
        crime_head TEXT,
        sub_head TEXT,
        count_2025 INTEGER
    )
    """)
    
    cursor.execute("DROP TABLE IF EXISTS ksp_district_major_crimes_2024")
    cursor.execute("""
    CREATE TABLE ksp_district_major_crimes_2024 (
        district TEXT,
        murder INTEGER,
        attempt_murder INTEGER,
        rape INTEGER,
        dacoity INTEGER,
        robbery INTEGER,
        burglary_day INTEGER,
        burglary_night INTEGER,
        theft INTEGER,
        riots INTEGER,
        cases_hurt INTEGER,
        cruelty_husband INTEGER,
        dowry_deaths INTEGER,
        fatal_accidents INTEGER,
        non_fatal_accidents INTEGER,
        molestation INTEGER,
        sc_st INTEGER,
        gambling INTEGER,
        cyber_crime INTEGER,
        pocso INTEGER
    )
    """)
    
    cursor.execute("DROP TABLE IF EXISTS ksp_sll_crimes_2024")
    cursor.execute("""
    CREATE TABLE ksp_sll_crimes_2024 (
        crime_head TEXT,
        sub_head TEXT,
        count_2024 INTEGER
    )
    """)
    
    conn.commit()
    print("Schema created. Parsing CSV files...")
    
    # --- Load KSP aggregated stats from CSVs into SQLite ---
    try:
        # 1. District wise 2025
        df_dist_2025 = pd.read_csv(os.path.join(dataset_dir, "ka-district-wise-2025.csv"))
        for _, row in df_dist_2025.iterrows():
            if pd.isna(row['Districts/Units']) or 'STATE' in str(row['Districts/Units']) or 'Commissionerates' in str(row['Districts/Units']) or 'Range' in str(row['Districts/Units']):
                continue
            cursor.execute("INSERT INTO ksp_district_wise_2025 VALUES (?, ?, ?, ?)", 
                           (str(row['Sl No']), str(row['Districts/Units']).strip(), int(row['IPC/BNS Crimes']), int(row['SLL Crimes'])))
            
        # 2. Women Children SC/ST 2025
        df_women_25 = pd.read_csv(os.path.join(dataset_dir, "ka-crimes-women-children-scssts.csv"))
        # Parse multi-column layout
        for _, row in df_women_25.iterrows():
            # Women
            if not pd.isna(row.iloc[1]) and not pd.isna(row.iloc[2]) and 'Sub Total' not in str(row.iloc[1]) and 'Total' not in str(row.iloc[1]):
                cursor.execute("INSERT INTO ksp_crimes_women_children_scssts_2025 VALUES (?, ?, ?)", 
                               ("Crimes Against Women", str(row.iloc[1]).strip(), int(row.iloc[2])))
            # Children
            if not pd.isna(row.iloc[4]) and not pd.isna(row.iloc[5]) and 'Sub Total' not in str(row.iloc[4]) and 'Total' not in str(row.iloc[4]):
                cursor.execute("INSERT INTO ksp_crimes_women_children_scssts_2025 VALUES (?, ?, ?)", 
                               ("Crimes Against Children", str(row.iloc[4]).strip(), int(row.iloc[5])))
            # SC/ST
            if not pd.isna(row.iloc[7]) and not pd.isna(row.iloc[8]) and 'Sub Total' not in str(row.iloc[7]) and 'Total' not in str(row.iloc[7]):
                cursor.execute("INSERT INTO ksp_crimes_women_children_scssts_2025 VALUES (?, ?, ?)", 
                               ("Crimes Against SCs/STs", str(row.iloc[7]).strip(), int(row.iloc[8])))
                
        # 3. Women Children SC/ST 2024
        df_women_24 = pd.read_csv(os.path.join(dataset_dir, "3305d3ec-e701-4a9b-9fa5-35926acede1d.csv"))
        for _, row in df_women_24.iterrows():
            # Women
            if not pd.isna(row.iloc[1]) and not pd.isna(row.iloc[2]) and 'Sub Total' not in str(row.iloc[1]) and 'Total' not in str(row.iloc[1]):
                cursor.execute("INSERT INTO ksp_crimes_women_children_scssts_2024 VALUES (?, ?, ?)", 
                               ("Crimes Against Women", str(row.iloc[1]).strip(), int(row.iloc[2])))
            # Children
            if not pd.isna(row.iloc[5]) and not pd.isna(row.iloc[6]) and 'Sub Total' not in str(row.iloc[5]) and 'Total' not in str(row.iloc[5]):
                cursor.execute("INSERT INTO ksp_crimes_women_children_scssts_2024 VALUES (?, ?, ?)", 
                               ("Crimes Against Children", str(row.iloc[5]).strip(), int(row.iloc[6])))
            # SC/ST
            if not pd.isna(row.iloc[9]) and not pd.isna(row.iloc[10]) and 'Sub Total' not in str(row.iloc[9]) and 'Total' not in str(row.iloc[9]):
                cursor.execute("INSERT INTO ksp_crimes_women_children_scssts_2024 VALUES (?, ?, ?)", 
                               ("Crimes Against SCs/STs", str(row.iloc[9]).strip(), int(row.iloc[10])))

        # 4. IPC Crimes 2025
        df_ipc_25 = pd.read_csv(os.path.join(dataset_dir, "ka-ipc-crimes-2025.csv"))
        curr_major_head = ""
        for _, row in df_ipc_25.iterrows():
            if pd.isna(row.iloc[1]) and pd.isna(row.iloc[2]):
                continue
            val_col = row.iloc[2]
            head_col = str(row.iloc[1]).strip()
            
            # If value is NaN or empty, and it has text, it's a major crime head
            if pd.isna(val_col) or str(val_col).strip() == "":
                curr_major_head = head_col
            else:
                try:
                    val = int(str(val_col).replace(',', ''))
                    cursor.execute("INSERT INTO ksp_ipc_crimes_2025 VALUES (?, ?, ?)", 
                                   (curr_major_head, head_col, val))
                except ValueError:
                    pass

        # 5. SLL Crimes 2024
        df_sll_24 = pd.read_csv(os.path.join(dataset_dir, "5bb7a3f7-8fe1-4eff-94db-c0e905301ebe.csv"))
        curr_major_head = ""
        for _, row in df_sll_24.iterrows():
            if pd.isna(row.iloc[1]) and pd.isna(row.iloc[2]):
                continue
            val_col = row.iloc[2]
            head_col = str(row.iloc[1]).strip()
            
            if pd.isna(val_col) or str(val_col).strip() == "":
                curr_major_head = head_col
            else:
                try:
                    val = int(str(val_col).replace(',', ''))
                    cursor.execute("INSERT INTO ksp_sll_crimes_2024 VALUES (?, ?, ?)", 
                                   (curr_major_head, head_col, val))
                except ValueError:
                    pass

        # 6. District wise crimes counts 2024
        df_dist_24 = pd.read_csv(os.path.join(dataset_dir, "2a1e057f-3b0b-42e4-ae4b-6cdb49902d31.csv"))
        for _, row in df_dist_24.iterrows():
            dist = str(row['DISTRICT/UNITS']).strip()
            if pd.isna(row['DISTRICT/UNITS']) or dist == 'Total' or dist == 'Commissionerates' or 'Range' in dist:
                continue
            
            # Clean values
            def clean_val(col_name):
                v = row[col_name]
                if pd.isna(v) or str(v).strip() == "":
                    return 0
                return int(float(str(v).replace(',', '')))

            cursor.execute("""
            INSERT INTO ksp_district_major_crimes_2024 VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )""", (
                dist, clean_val('MURDER'), clean_val('ATTEMPT TO MURDER'), clean_val('RAPE'),
                clean_val('DACOITY'), clean_val('ROBBERY'), clean_val('BURGLARY-DAY'), clean_val('BURGLARY-NIGHT'),
                clean_val('THEFT'), clean_val('RIOTS'), clean_val('CASES OF HURT'), clean_val('CRUELTY BY HUSBAND'),
                clean_val('DOWRY DEATHS'), clean_val('FATAL MOTOR ACCIDENTS'), clean_val('NON-FATAL MOTOR ACCIDENTS'),
                clean_val('MOLESTATION'), clean_val('SC/ST'), clean_val('GAMBLING'), clean_val('CYBER CRIME'),
                clean_val('POCSO')
            ))
            
        conn.commit()
        print("Raw aggregated statistics imported from CSV files successfully.")
    except Exception as e:
        print(f"Warning: Failed to load some aggregated statistical CSVs: {e}")

    # --- Seeding simulated repeat offenders ---
    print("Seeding criminal accused profiles...")
    criminals = [
        # Repeat Offenders
        ("Ramesh Nayak", 34, "Palla", "Two-Wheeler Snatching Ring", "HIGH"),
        ("Karthik Gowda", 28, "Appu", "Cyber Jamtara Phishing Guild", "CRITICAL"),
        ("Suresh K. Gowda", 45, "Kariya", "Kaveri Sand Mafia Syndicate", "HIGH"),
        ("Manjunath K.", 42, "Munna", "Kaveri Sand Mafia Syndicate", "MEDIUM"),
        ("Rakesh Gowda", 38, "Rakkasa", "Gowda Land Grabbing Syndicate", "HIGH"),
        ("Amit Patel", 29, "Bhaiya", "Cyber Jamtara Phishing Guild", "HIGH"),
        ("Vikram Hegde", 31, "Vicky", "None", "LOW"),
        ("Kishore Kumar", 36, "Blade Kishore", "Local Anti-Social Element", "HIGH"),
        ("Shiva Raju", 33, "Market Shiva", "Bengaluru Dacoit Associates", "HIGH"),
        ("Praveen Kumar", 27, "Rocky", "Cyber Jamtara Phishing Guild", "CRITICAL")
    ]
    
    cursor.executemany("INSERT INTO accused (name, age, alias, gang_affiliation, risk_level) VALUES (?, ?, ?, ?, ?)", criminals)
    conn.commit()
    
    # Retrieve accused IDs
    cursor.execute("SELECT id, name FROM accused")
    accused_map = {name: uid for uid, name in cursor.fetchall()}
    
    # --- Generate ~120 simulated case records ---
    print("Generating simulated case profiles...")
    
    districts = [
        "Bengaluru City", "Mysuru City", "Hubballi Dharwad City", "Mangaluru City", 
        "Belagavi City", "Kalaburagi City", "Bengaluru Dist", "Tumakuru", "Kolar", 
        "Chickballapura", "Chitradurga", "Davanagere", "Shivamogga", "Haveri", 
        "Dakshina Kannada", "Udupi", "Chikkamagaluru", "Uttara Kannada", "Belagavi Dist", 
        "Bagalkot", "Vijayapur", "Dharwad", "Gadag", "Kalaburagi", "Bidar", "Yadgir", 
        "Mysuru Dist", "Mandya", "Chamarajanagar", "Hassan", "Kodagu", "Ballari", 
        "Koppal", "Raichur", "Vijayanagara"
    ]
    
    # Realistic weights based on actual 2025 KSP stats
    district_weights = [
        0.30, 0.05, 0.04, 0.04, 0.03, 0.03, 0.03, 0.03, 0.02, 0.02,
        0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.03, 0.02,
        0.02, 0.01, 0.01, 0.02, 0.02, 0.01, 0.02, 0.02, 0.01, 0.03,
        0.01, 0.02, 0.01, 0.02, 0.01
    ]
    
    police_stations = {
        "Bengaluru City": ["Whitefield PS", "Ashok Nagar PS", "Indiranagar PS", "Koramangala PS", "Cyber Crime PS", "V V Puram PS", "HSR Layout PS", "Jayanagar PS"],
        "Mysuru City": ["V V Puram PS", "Lashkar PS", "Devaraja PS", "Vijayanagar PS", "Mysuru Cyber PS"],
        "Hubballi Dharwad City": ["Suburban PS", "Gokul Road PS", "Dharwad Town PS"],
        "Mangaluru City": ["Kadri PS", "Urwa PS", "Barkur PS"],
        "Belagavi City": ["Khade Bazar PS", "Camp PS", "Market PS"],
        "Kalaburagi City": ["Chowk PS", "Station Bazar PS", "Raghavendra Nagar PS"],
        "Hassan": ["Hassan Town PS", "Hassan Rural PS", "Pension Lane PS"],
        "Tumakuru": ["Tumakuru Town PS", "Kyathasandra PS", "Jayanagar PS"],
        "Kolar": ["Kolar Town PS", "KGF Cyber PS", "Galipura PS"],
        "Shivamogga": ["Doddapet PS", "Kote PS", "Tunga Nagar PS"]
    }
    
    def get_station(dist):
        if dist in police_stations:
            return random.choice(police_stations[dist])
        # Default fallback station names
        clean_dist = dist.replace(" Dist", "").replace(" City", "")
        return f"{clean_dist} Town PS"
        
    officers = [
        ("Girish K.", "Inspector"), ("Raghavendra S.", "Inspector"), ("Shanthamma M.", "Sub-Inspector"),
        ("Srinivas Gowda", "DySP"), ("Kumaraswamy T.", "Inspector"), ("Ranganath K.", "Sub-Inspector"),
        ("Meenakshi Devi", "Inspector"), ("Anil Kumar", "Sub-Inspector"), ("Nandini R.", "DySP"),
        ("Chandrappa N.", "Inspector"), ("Jagadish Gowda", "Sub-Inspector"), ("Pratap Singh", "Inspector")
    ]
    
    first_names = ["Ramesh", "Suresh", "Manjunath", "Karthik", "Rakesh", "Ganesh", "Mahesh", "Anand", "Vijay", "Prakash", "Lokesh", "Kiran", "Naveen", "Shubha", "Deepa", "Priya", "Kavitha", "Sujatha", "Lakshmi", "Radha"]
    last_names = ["Gowda", "Kumar", "Nayak", "Patel", "Hegde", "Raju", "Shetty", "Aradhya", "Siddappa", "Naidu", "Acharya", "Reddy", "Rao", "Menezes", "Bhat", "Desai"]
    
    def rand_name():
        return f"{random.choice(first_names)} {random.choice(last_names)}"
        
    case_narratives = {
        ("Cyber Crime", "Digital Arrest"): {
            "title": "Coerced Extortion via Skype Video Call",
            "desc": "The victim, {victim}, reported receiving a call from an individual claiming to be a senior Fedex Officer, alleging a parcel containing contraband (MDMA and fake passports) was registered under their Aadhaar ID. The call was transferred to another suspect claiming to be a Delhi Police Officer. {victim} was placed under 'digital arrest' via a Skype video call for 16 hours. Under extreme duress, the victim was coerced into transferring ₹{amount} Lakhs into multiple suspect 'verify escrow' bank accounts. Digital logs and IP routing point toward a syndicate Operating from Jamtara/Jharkhand.",
            "evidence": "Bank transaction receipts, Skype call transcripts, WhatsApp message logs, IP routing analysis",
            "bns": "Sec 66D IT Act & Sec 420 IPC / 318 BNS (Cheating)"
        },
        ("Cyber Crime", "Investment Fraud"): {
            "title": "High Yield Stock Trading Telegram Scam",
            "desc": "Complainant was approached on Telegram and added to an investment advisory channel. The suspects promised 400% weekly returns via pre-IPO allocations on a mock trading application 'KSP-Wealth'. The victim, {victim}, invested ₹{amount} Lakhs in small tranches. The mock app displayed massive dummy profits, but when the victim tried to withdraw, the app demanded a 30% 'income tax fee'. Subsequent verification revealed all money was immediately layered through shell company accounts in Bengaluru and withdrawn via POS merchants.",
            "evidence": "Telegram chat logs, Mock application code review, Shell account statements, UPI transaction maps",
            "bns": "Sec 66D IT Act & Sec 420 IPC / 318 BNS (Cheating)"
        },
        ("Cyber Crime", "Fedex Scam"): {
            "title": "Fedex Parcel Customs Clearance Fraud",
            "desc": "The complainant received an automated call stating a parcel containing illegal passports was intercepted by Customs at Mumbai Airport. Suspects impersonated Customs officials and demanded ₹{amount} Lakhs as clearance fees to avoid prosecution. The victim complied and made multiple transfers. Cyber Crime cell tracked the funds and frozen ₹1.2 Lakhs in one of the mule accounts.",
            "evidence": "Phone call record, Mule account details, frozen transaction slips",
            "bns": "Sec 66D IT Act & Sec 420 IPC / 318 BNS (Cheating)"
        },
        ("Theft", "Chain Snatching"): {
            "title": "Daylight Gold Snatching by Pulsar Motorcycle riders",
            "desc": "On {date} at around 07:15 AM, while the victim, {victim}, was walking near the local park, two unidentified youths riding a black Pulsar motorcycle without a license plate approached from behind. The pillion rider forcefully snatched the victim's gold chain (weighing 50 grams, valued at ₹3.2 Lakhs) and fled at high speed. CCTV footage from surrounding intersections is being retrieved.",
            "evidence": "CCTV Footage, Spot Mahazar, Forensic Fingerprint Scan from discarded visor",
            "bns": "Sec 379, 356 IPC / 303, 309 BNS (Theft and Criminal Force)"
        },
        ("Theft", "Two-Wheeler Theft"): {
            "title": "Parked Motorcycle Theft using Master Key",
            "desc": "A Honda Activa scooter parked in front of a shopping center was stolen between 14:00 and 16:00. The owner, {victim}, filed a complaint after discovering the lock was picked. CCTV analysis revealed a known repeat offender, Ramesh Nayak, unlocking the vehicle with a master key and riding away toward the Outer Ring Road.",
            "evidence": "CCTV footage identifying repeat offender Ramesh Nayak, lock debris analysis",
            "bns": "Sec 379 IPC / 303 BNS (Theft)"
        },
        ("Theft", "Sand Theft"): {
            "title": "Illegal River Sand Excavation and Smuggling",
            "desc": "Police patrol raided an illegal sand excavation spot along the river bank during midnight hours. Two tractors fully loaded with illegally extracted riverbed sand were seized. The laborers fled the scene under the cover of darkness. Inquiry revealed the trucks belonged to local sand mafia elements headed by Suresh K. Gowda.",
            "evidence": "Seized tractors (KA-09-T-4212), Spot Mahazar, Excavation soil samples",
            "bns": "Sec 379 IPC / 303 BNS & Sec 21 Mines & Minerals (Development & Regulation) Act"
        },
        ("Murder", "Property Dispute"): {
            "title": "Fatal Assault Over Agricultural Boundary Dispute",
            "desc": "A violent altercation broke out between two neighboring farmers over land boundary fencing. The suspect, {accused}, in a fit of rage, attacked {victim} with a heavy iron sickle, causing deep lacerations and fatal head trauma. The victim succumbed to injuries en route to the government hospital. The suspect was arrested near the bus stand.",
            "evidence": "Iron sickle (weapon of offense) with blood stains, Forensic autopsy report, Eyewitness testimonies",
            "bns": "Sec 302 IPC / 103 BNS (Murder)"
        },
        ("Murder", "Sudden Quarrel"): {
            "title": "Fatal Stabbing following Altercation at Local Eatery",
            "desc": "A trivial argument over bill payment at a local restaurant escalated into a violent clash. The accused, {accused}, brandished a pocket knife and stabbed the victim, {victim}, in the chest. Restaurant staff secured the accused and handed them over to the patrolling police vehicle. The knife has been seized.",
            "evidence": "Stained pocket knife, Autopsy report, Restaurant CCTV recording",
            "bns": "Sec 302 IPC / 103 BNS (Murder)"
        },
        ("Cheating", "Fake Job Promotion"): {
            "title": "Government Job Employment Racket Fraud",
            "desc": "Suspects operated a fake office claiming to recruit candidates for the Karnataka Public Service Commission (KPSC). The victim, {victim}, was defrauded of ₹{amount} Lakhs after being issued fake appointment letters signed by a dummy secretary. Suspects are currently absconding.",
            "evidence": "Fake appointment letters, Stamp sheets, Bank transaction logs mapping transfers to suspects",
            "bns": "Sec 420, 468, 471 IPC / 318, 336 BNS (Cheating and Forgery)"
        },
        ("POCSO", "CSAM"): {
            "title": "Possession and Distribution of Obscene Media under POCSO",
            "desc": "Cyber Crime monitoring cell flagged a local IP address distributing child sexual abuse material (CSAM) on social media portals. A raid was conducted at the suspect's residence in {district}, resulting in the seizure of three smartphones containing digital evidence. Suspect arrested.",
            "evidence": "Seized smartphones, Forensic hard drive mirror, Cyber tip-line reports",
            "bns": "Sec 15 POCSO Act / Sec 67B IT Act"
        }
    }
    
    # Generate cases
    generated_cases = []
    
    # Generate structured cases to make repeat offenders stand out
    print("Wiring repeat offender profiles into database...")
    
    # रमेश नायक (Ramesh Nayak) - Gold Snatching / Two-Wheeler Theft in Bengaluru, Mysuru
    case1_desc = case_narratives[("Theft", "Chain Snatching")]["desc"].format(
        victim="Lakshmi Aradhya", date="14-05-2025", amount="0"
    )
    generated_cases.append((
        "KSP-2025-0104", "Theft", "Chain Snatching", 
        case_narratives[("Theft", "Chain Snatching")]["bns"], "2025-05-14 07:15:00", 
        "Bengaluru City", "V V Puram PS", "Arrested", "Lakshmi Aradhya", "Ramesh Nayak",
        case1_desc, case_narratives[("Theft", "Chain Snatching")]["evidence"], 
        "Girish K.", "Inspector"
    ))
    
    case2_desc = case_narratives[("Theft", "Two-Wheeler Theft")]["desc"].format(
        victim="Naveen Acharya", date="18-06-2025", amount="0"
    )
    generated_cases.append((
        "KSP-2025-0211", "Theft", "Two-Wheeler Theft", 
        case_narratives[("Theft", "Two-Wheeler Theft")]["bns"], "2025-06-18 15:30:00", 
        "Bengaluru City", "Ashok Nagar PS", "Chargesheeted", "Naveen Acharya", "Ramesh Nayak",
        case2_desc, case_narratives[("Theft", "Two-Wheeler Theft")]["evidence"], 
        "Shanthamma M.", "Sub-Inspector"
    ))
    
    case3_desc = case_narratives[("Theft", "Chain Snatching")]["desc"].format(
        victim="Sujatha Rao", date="22-09-2025", amount="0"
    )
    generated_cases.append((
        "KSP-2025-0814", "Theft", "Chain Snatching", 
        case_narratives[("Theft", "Chain Snatching")]["bns"], "2025-09-22 08:05:00", 
        "Mysuru City", "Lashkar PS", "Under Investigation", "Sujatha Rao", "Ramesh Nayak",
        case3_desc, case_narratives[("Theft", "Chain Snatching")]["evidence"], 
        "Kumaraswamy T.", "Inspector"
    ))
    
    # कार्तिक गौड़ा (Karthik Gowda) - Cyber Investment Fraud and Digital Arrest
    case4_desc = case_narratives[("Cyber Crime", "Digital Arrest")]["desc"].format(
        victim="Deepa Rao", amount="12.5"
    )
    generated_cases.append((
        "KSP-2025-0412", "Cyber Crime", "Digital Arrest", 
        case_narratives[("Cyber Crime", "Digital Arrest")]["bns"], "2025-04-12 11:20:00", 
        "Bengaluru City", "Cyber Crime PS", "Under Investigation", "Deepa Rao", "Karthik Gowda, Amit Patel",
        case4_desc, case_narratives[("Cyber Crime", "Digital Arrest")]["evidence"], 
        "Meenakshi Devi", "Inspector"
    ))
    
    case5_desc = case_narratives[("Cyber Crime", "Investment Fraud")]["desc"].format(
        victim="Lokesh Siddappa", amount="24.0"
    )
    generated_cases.append((
        "KSP-2025-0677", "Cyber Crime", "Investment Fraud", 
        case_narratives[("Cyber Crime", "Investment Fraud")]["bns"], "2025-07-04 10:45:00", 
        "Bengaluru City", "Cyber Crime PS", "Arrested", "Lokesh Siddappa", "Karthik Gowda, Praveen Kumar",
        case5_desc, case_narratives[("Cyber Crime", "Investment Fraud")]["evidence"], 
        "Meenakshi Devi", "Inspector"
    ))
    
    case6_desc = case_narratives[("Cyber Crime", "Investment Fraud")]["desc"].format(
        victim="Vijay Menezes", amount="18.5"
    )
    generated_cases.append((
        "KSP-2025-0982", "Cyber Crime", "Investment Fraud", 
        case_narratives[("Cyber Crime", "Investment Fraud")]["bns"], "2025-09-18 14:15:00", 
        "Mysuru City", "Mysuru Cyber PS", "Under Investigation", "Vijay Menezes", "Karthik Gowda, Amit Patel",
        case6_desc, case_narratives[("Cyber Crime", "Investment Fraud")]["evidence"], 
        "Kumaraswamy T.", "Inspector"
    ))
    
    # सुरेश के. गौड़ा (Suresh K. Gowda) & मंजुनाथ के. (Manjunath K.) - Sand Theft
    case7_desc = case_narratives[("Theft", "Sand Theft")]["desc"].format(
        date="10-03-2025", accused="Suresh K. Gowda"
    )
    generated_cases.append((
        "KSP-2025-0045", "Theft", "Sand Theft", 
        case_narratives[("Theft", "Sand Theft")]["bns"], "2025-03-10 01:10:00", 
        "Hassan", "Hassan Rural PS", "Arrested", "State of Karnataka", "Suresh K. Gowda, Manjunath K.",
        case7_desc, case_narratives[("Theft", "Sand Theft")]["evidence"], 
        "Raghavendra S.", "Inspector"
    ))
    
    case8_desc = case_narratives[("Theft", "Sand Theft")]["desc"].format(
        date="15-08-2025", accused="Suresh K. Gowda"
    )
    generated_cases.append((
        "KSP-2025-0722", "Theft", "Sand Theft", 
        case_narratives[("Theft", "Sand Theft")]["bns"], "2025-08-15 02:40:00", 
        "Mandya", "Mandya Town PS", "Under Investigation", "State of Karnataka", "Suresh K. Gowda",
        case8_desc, case_narratives[("Theft", "Sand Theft")]["evidence"], 
        "Jagadish Gowda", "Sub-Inspector"
    ))
    
    # राकेश गौड़ा (Rakesh Gowda) & मंजुनाथ के. (Manjunath K.) - Property Murder
    case9_desc = case_narratives[("Murder", "Property Dispute")]["desc"].format(
        accused="Rakesh Gowda and Manjunath K.", victim="Kiran Gowda"
    )
    generated_cases.append((
        "KSP-2025-0428", "Murder", "Property Dispute", 
        case_narratives[("Murder", "Property Dispute")]["bns"], "2025-04-28 19:30:00", 
        "Hassan", "Hassan Town PS", "Chargesheeted", "Kiran Gowda", "Rakesh Gowda, Manjunath K.",
        case9_desc, case_narratives[("Murder", "Property Dispute")]["evidence"], 
        "Raghavendra S.", "Inspector"
    ))

    # --- Generate Remaining 110 Cases Dynamically ---
    random.seed(42)
    start_date = datetime(2024, 1, 1)
    
    used_fir_numbers = {"KSP-2025-0104", "KSP-2025-0211", "KSP-2025-0814", "KSP-2025-0412", "KSP-2025-0677", "KSP-2025-0982", "KSP-2025-0045", "KSP-2025-0722", "KSP-2025-0428"}
    
    for i in range(111):
        # Generate random unique FIR No
        year = random.choice([2024, 2025])
        while True:
            fir_no = f"KSP-{year}-{random.randint(1000, 9999)}"
            if fir_no not in used_fir_numbers:
                used_fir_numbers.add(fir_no)
                break
        
        # Pick random district with statistical weights
        dist = random.choices(districts, weights=district_weights, k=1)[0]
        station = get_station(dist)
        
        # Pick random crime type and sub type
        k = random.choice(list(case_narratives.keys()))
        crime_type, sub_crime_type = k
        template = case_narratives[k]
        
        # Generate random details
        vic = rand_name()
        acc = rand_name() if random.random() > 0.15 else "Unidentified Suspects"
        amt = f"{random.uniform(1.5, 45.0):.1f}"
        
        # Random Date within range
        days_offset = random.randint(0, 700)
        inc_date = start_date + timedelta(days=days_offset, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        inc_date_str = inc_date.strftime("%Y-%m-%d %H:%M:%S")
        date_short = inc_date.strftime("%d-%m-%Y")
        
        # Generate Narrative
        desc = template["desc"].format(
            victim=vic, date=date_short, amount=amt, accused=acc, district=dist
        )
        
        status = random.choice(["Under Investigation", "Arrested", "Chargesheeted", "Closed (Convicted)"])
        off = random.choice(officers)
        
        generated_cases.append((
            fir_no, crime_type, sub_crime_type, template["bns"], inc_date_str,
            dist, station, status, vic, acc, desc, template["evidence"],
            off[0], off[1]
        ))
        
    print(f"Adding {len(generated_cases)} cases into SQLite database...")
    cursor.executemany("""
    INSERT INTO cases (
        fir_no, crime_type, sub_crime_type, bns_sections, incident_date,
        district, police_station, status, victim_name, accused_names,
        description, evidence, officer_assigned, officer_rank
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, generated_cases)
    
    conn.commit()
    
    # --- Link dynamic cases to accused IDs in the case_accused table ---
    print("Linking case relationships in network joint table...")
    # Fetch case IDs and their accused names to map ties
    cursor.execute("SELECT id, fir_no, accused_names FROM cases")
    db_cases = cursor.fetchall()
    
    relations_count = 0
    for case_id, fir_no, acc_names in db_cases:
        if not acc_names or acc_names == "Unidentified Suspects":
            continue
        # Split names and see if we match our accused profiles
        for individual in acc_names.split(", "):
            individual_clean = individual.strip()
            if individual_clean in accused_map:
                accused_id = accused_map[individual_clean]
                cursor.execute("INSERT OR IGNORE INTO case_accused (case_id, accused_id, role) VALUES (?, ?, ?)",
                               (case_id, accused_id, "Accused"))
                relations_count += 1
                
    conn.commit()
    print(f"Wired {relations_count} criminal-to-case relations in SQLite joint table successfully.")
    
    # Validate Seeding
    cursor.execute("SELECT count(*) FROM cases")
    total_seeded_cases = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM accused")
    total_seeded_accused = cursor.fetchone()[0]
    
    print(f"\n[SUCCESS] Seeding complete! Database successfully populated.")
    print(f"Total simulated cases: {total_seeded_cases}")
    print(f"Total criminal profiles: {total_seeded_accused}")
    
    conn.close()

if __name__ == "__main__":
    seed_db()

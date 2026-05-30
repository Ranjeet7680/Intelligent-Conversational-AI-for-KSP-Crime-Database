import React, { useState, useEffect, useRef } from 'react'
import { 
  LayoutDashboard, MessageSquare, Map, GitMerge, Search, 
  ShieldAlert, Siren, Volume2, VolumeX, Mic, MicOff, 
  SearchIcon, FileText, ChevronRight, AlertTriangle, ShieldCheck, 
  MapPin, UserCheck, Calendar, ArrowRight, Download, Send, Lock,
  Fingerprint, Settings, User, Server, BarChart3, HelpCircle, 
  CheckSquare, FileSpreadsheet, Globe, BellRing, Printer, Database,
  ZoomIn, ZoomOut, Share2, FileDown, Eye, EyeOff, AlertOctagon, Activity, Sparkles,
  Users, Mail, Code2, Brain, Shield, Cpu, Star, Award, Github
} from 'lucide-react'

const KARNATAKA_LAT_LON = [12.9716, 77.5946] // Centered on Bengaluru City for premium tactical default

// --- App Logo (custom ChatGPT-generated CrimeGPT logo) ---
const AppLogo = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 64 : 40
  return (
    <img 
      src="/app_logo.png" 
      alt="CrimeGPT KSP Logo" 
      style={{ 
        width: dim, 
        height: dim, 
        flexShrink: 0,
        objectFit: 'contain', 
        borderRadius: 8,
        filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.4))'
      }}
    />
  )
}

// Keep KSPLogo as alias
const KSPLogo = AppLogo

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('landing')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [officerId, setOfficerId] = useState('KSP-INT-0000')
  const [password, setPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  
  // Settings
  const [theme, setTheme] = useState('obsidian')
  const [language, setLanguage] = useState('English')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  
  // Alerts list
  const [alerts, setAlerts] = useState([])
  const [alertFeed, setAlertFeed] = useState([
    { id: 1, type: "CRITICAL", msg: "Cybercrime Spike detected in Bengaluru East.", time: "10 mins ago" },
    { id: 2, type: "WARNING", msg: "Repeat Offender Ramesh Nayak tracked in Mysuru.", time: "42 mins ago" },
    { id: 3, type: "INFO", msg: "Shift transition logs compiled for Mysore City.", time: "1.2 hours ago" }
  ])
  
  // Dataset aggregates
  const [trendData, setTrendData] = useState(null)
  const [mapDistricts, setMapDistricts] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState({
    district: "Bengaluru City",
    color: "#ff2e2e",
    threat_level: "CRITICAL",
    ipc_crimes: 24890,
    sll_crimes: 16370,
    total_crimes: 41260
  })
  const [networkData, setNetworkData] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  
  // Cases list
  const [cases, setCases] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterCrime, setFilterCrime] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  
  // Mock Case mapping exactly to Screenshot 2 (Intelligence Extraction #09241)
  const defaultMockCase = {
    id: "09241",
    fir_no: "FIR-2024-BLR-09241",
    district: "Bengaluru City",
    police_station: "High Grounds",
    year: "2024",
    incident_date: "2024-05-11 23:45:00",
    officer_assigned: "Dr. Raghavendra",
    officer_rank: "Circle Beat Inspector",
    status: "FIR Filed",
    crime_type: "Robbery",
    sub_crime_type: "Armed Robbery",
    bns_sections: "Section 304, Section 115, Section 351(2)",
    victim_name: "Dr. Ramesh Kumar",
    victim_age: "44",
    victim_gender: "M",
    victim_profile: "Medical Prof.",
    victim_narrative: "Primary trauma to cranial base. Verified residency in Rajajinagar. High priority witness protection recommended for spouse.",
    accused_names: "Unidentified (3 Suspects)",
    accused_motive: "Likely targeted theft or personal vendetta. High confidence match on vehicle type (Bajaj Pulsar, Silver).",
    accused_age_group: "20-25 Est.",
    description: `Dr. Ramesh Kumar was returning from his late-night shift when he was intercepted near the underpass. According to the witness statements recorded at the scene, the perpetrators were wearing dark hooded jackets. A physical altercation ensued during which the victim sustained blunt force...`,
    evidence: "CCTV footage under review. Weapon trace. Forensic DNA swabs.",
    timeline: [
      { title: "Assault reported at Vasanth Nagar Underpass", date: "11 MAY, 23:45", desc: "Panic button triggered at adjacent ATM.", status: "completed", tag: "EVENT TRIGGER" },
      { title: "First Response unit arrived", date: "12 MAY, 00:15", desc: "CCTV footage from Cafe Nero (CAM-04) secured for review.", status: "completed", tag: "SCENE RECON" },
      { title: "Forensic team collected DNA swabs", date: "12 MAY, 02:30", desc: "DNA swabs from underpass railing. Initial lab request dispatched.", status: "completed", tag: "FORENSIC" }
    ],
    investigation_steps: [
      "Query cell tower routing dumps within the Vasanth Nagar grid between 23:00 and 00:30.",
      "Dispatch search teams to scan Jayanagar two-wheeler parts scrap dealers.",
      "Secure forensic blood splatter metrics mapping spatial vector trails."
    ]
  }

  const [selectedCase, setSelectedCase] = useState(defaultMockCase)
  const [casePage, setCasePage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [caseTabMode, setCaseTabMode] = useState('detail') // 'search' or 'detail'
  
  // AI Chat (Prepopulated exactly with Screenshot 3 conversation)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "System initialized. Ready for investigation. Accessing KSP State Database for real-time analysis. How can I assist you today, Officer?", time: "08:42 AM", meta: "SECURE ENCRYPTION ACTIVE" },
    { sender: 'officer', text: "Summarize active robbery investigations in Bengaluru City (South) from the last 7 days.", time: "08:43 AM" },
    { sender: 'ai', text: "Found 12 incidents matching your criteria. Significant clustering observed in Jayanagar and JP Nagar sectors. Analysis indicates a possible recurring MO involving two-wheelers.", time: "08:43 AM", hasCards: true }
  ])
  
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  
  // ML Forecaster
  const [predDistrict, setPredDistrict] = useState('Bengaluru City')
  const [predMonth, setPredMonth] = useState(5)
  const [predCrime, setPredCrime] = useState('Robbery')
  const [predictionResult, setPredictionResult] = useState(null)
  const [isPredicting, setIsPredicting] = useState(false)

  // Zoom control helper states
  const [docZoom, setDocZoom] = useState(100)

  // Map DOM reference
  const mapContainerRef = useRef(null)
  const leafletMapRef = useRef(null)
  const markersGroupRef = useRef(null)

  useEffect(() => {
    // Immersion loading delay timer
    const loadTimer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)

    fetchTrends()
    fetchDistrictStats()
    fetchNetwork()
    fetchCases()

    return () => clearTimeout(loadTimer)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    fetchCases()
  }, [searchQuery, filterDistrict, filterCrime, filterStatus, casePage])

  // --- Leaflet Hotspot Map ---
  useEffect(() => {
    if (activeTab === 'map' && mapContainerRef.current) {
      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView(KARNATAKA_LAT_LON, 12) // Centered on Bengaluru City for close-up tactical view
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20
        }).addTo(map)
        
        leafletMapRef.current = map
        markersGroupRef.current = L.layerGroup().addTo(map)
      }
      
      const map = leafletMapRef.current
      const markersGroup = markersGroupRef.current
      markersGroup.clearLayers()
      
      // Inject primary hotspots
      const hotspots = [
        { name: "Indiranagar Hotspot", coords: [12.9718, 77.6411], color: "#ff2e2e", radius: 25, details: "Elevated cyber & robbery threats" },
        { name: "Jayanagar Sector", coords: [12.9307, 77.5824], color: "#ffea00", radius: 20, details: "Active 2-wheeler gang MO" },
        { name: "High Grounds Area", coords: [12.9868, 77.5968], color: "#ff2e2e", radius: 30, details: "Assault case #09241 under investigation" },
        { name: "Hebbal Hub", coords: [13.0358, 77.5970], color: "#00ff66", radius: 15, details: "Vehicle trace active" }
      ]
      
      hotspots.forEach(dist => {
        const marker = L.circleMarker(dist.coords, {
          radius: dist.radius,
          fillColor: dist.color,
          fillOpacity: 0.35,
          color: dist.color,
          weight: 2,
          className: 'leaflet-pulsing-marker'
        })
        
        marker.bindTooltip(`
          <div style="background-color:#0b1220; color:#fff; border: 1px solid ${dist.color}; border-radius:6px; padding:8px; font-family:'Inter', sans-serif;">
            <strong style="color:${dist.color}; text-transform:uppercase;">${dist.name}</strong><br/>
            <span style="font-size:0.8rem; color:#94a3b8;">${dist.details}</span>
          </div>
        `, { direction: 'top', sticky: true, opacity: 0.95 })
        
        markersGroup.addLayer(marker)
      })
    }
  }, [activeTab])

  // --- API Fetch Handlers ---
  const fetchTrends = async () => {
    try {
      const res = await fetch('/api/stats/trends')
      const data = await res.json()
      setTrendData(data)
    } catch (e) { console.error(e) }
  }

  const fetchDistrictStats = async () => {
    try {
      const res = await fetch('/api/stats/districts')
      const data = await res.json()
      setMapDistricts(data)
    } catch (e) { console.error(e) }
  }

  const fetchNetwork = async () => {
    try {
      const res = await fetch('/api/stats/network')
      const data = await res.json()
      setNetworkData(data)
    } catch (e) { console.error(e) }
  }

  const fetchCases = async () => {
    try {
      let url = `/api/cases?page=${casePage}&limit=10`
      if (searchQuery) url += `&q=${searchQuery}`
      if (filterDistrict) url += `&district=${filterDistrict}`
      if (filterCrime) url += `&crime_type=${filterCrime}`
      if (filterStatus) url += `&status=${filterStatus}`
      
      const res = await fetch(url)
      const data = await res.json()
      setCases(data.cases)
      setTotalPages(data.total_pages)
    } catch (e) { console.error(e) }
  }

  const fetchCaseDetails = async (id) => {
    if (id === "09241") {
      setSelectedCase(defaultMockCase)
      setCaseTabMode('detail')
      return
    }
    try {
      const res = await fetch(`/api/cases/${id}`)
      const data = await res.json()
      setSelectedCase(data)
      setCaseTabMode('detail')
    } catch (e) { console.error(e) }
  }

  // --- Speech Dictation ---
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const rec = new SpeechRecognition()
    rec.lang = 'en-IN'
    rec.onstart = () => setIsRecording(true)
    rec.onresult = (event) => {
      const text = event.results[0][0].transcript
      setChatInput(text)
    }
    rec.onerror = () => setIsRecording(false)
    rec.onend = () => setIsRecording(false)
    rec.start()
  }

  // --- Handlers ---
  const triggerAlert = (type, message) => {
    const newAlert = {
      id: Date.now(),
      type,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setAlerts([newAlert])
  }

  const handleLoginFingerprint = () => {
    setIsScanning(true)
    setScanResult("scanning")
    
    setTimeout(() => {
      setScanResult("success")
      setTimeout(() => {
        setIsLoggedIn(true)
        setIsScanning(false)
        setActiveTab('dashboard')
      }, 800)
    }, 1500)
  }

  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!chatInput.trim()) return
    
    const userMsg = chatInput
    setChatInput('')
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setChatMessages(prev => [...prev, { sender: 'officer', text: userMsg, time: now }])
    setIsTyping(true)
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.response, time: now }])
    } catch (e) {
      console.error(e)
    } finally {
      setIsTyping(false)
    }
  }

  const downloadPDFReport = (c) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>KSP Case Intelligence Briefing: ${c.fir_no}</title>
          <style>
            body { font-family: 'Courier New', monospace; background-color: #fff; padding: 40px; color: #000; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .badge { font-weight: bold; border: 2px solid #000; padding: 5px; display: inline-block; }
            .content { margin-top: 30px; line-height: 1.5; }
            .section { font-weight: bold; background: #eee; padding: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="badge">KARNATAKA STATE POLICE</div>
            <h2>TACTICAL INTELLIGENCE BRIEFING</h2>
            <p>CONFIDENTIAL // SECURITY ACCESS: LEVEL 4</p>
          </div>
          <div class="content">
            <p><strong>CASE FIR NO:</strong> ${c.fir_no}</p>
            <p><strong>CRIME CATEGORY:</strong> ${c.crime_type} (${c.sub_crime_type || 'General'})</p>
            <p><strong>INCIDENT LOCATION:</strong> ${c.district} - ${c.police_station}</p>
            <p><strong>LEGAL CODES BNS/IPC:</strong> ${c.bns_sections}</p>
            <div class="section">I. CASE SUMMARY DESCRIPTION</div>
            <p>${c.description}</p>
            <div class="section">II. FORENSIC EVIDENCE AND ACQUISITIONS</div>
            <p>${c.evidence}</p>
            <div class="section">III. AI SUGGESTED INVESTIGATION ROADMAP</div>
            <ol>
              ${c.investigation_steps ? c.investigation_steps.map(s => `<li>${s}</li>`).join('') : '<li>Conduct standard local beat monitoring.</li>'}
            </ol>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // --- Immersion Loading Screen ---
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#07090e] flex flex-col justify-center items-center font-mono text-xs text-[var(--accent-cyan)] mesh-grid relative">
        
        {/* Pulsing App logo */}
        <div className="relative flex flex-col items-center space-y-6 animate-fade-in-up">
          <div className="relative">
            <img 
              src="/app_logo.png" 
              alt="CrimeGPT KSP Logo" 
              style={{ 
                width: 112, 
                height: 112, 
                objectFit: 'contain', 
                borderRadius: 16,
                filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.5))'
              }}
            />
            <div className="absolute inset-0" style={{ borderRadius: 16, boxShadow: '0 0 30px rgba(0,240,255,0.3)' }}></div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="title-tactical text-xl font-bold tracking-widest text-white">CRIMEGPT KSP</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Secure Investigation Operating System</p>
          </div>
          
          {/* Loader progress bar */}
          <div className="w-64 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-cyan-950/40 relative">
            <div className="bg-[var(--accent-cyan)] h-full rounded-full w-0 animate-[loading_2.5s_ease-in-out_forwards]"></div>
          </div>
          
          {/* Rotating diagnostic scans */}
          <div className="text-[9px] text-slate-400 font-mono w-72 text-left space-y-1 bg-[#05070c] border border-cyan-950/40 p-4 rounded max-h-[110px] overflow-hidden">
            <div className="flex justify-between"><span>[SEC] Handshake protocol active...</span><span className="text-[#00ff66]">OK</span></div>
            <div className="flex justify-between"><span>[SYS] Synchronizing SQLite FTS5 index...</span><span className="text-[#00ff66]">OK</span></div>
            <div className="flex justify-between"><span>[AI] Warming Scikit-Learn forest...</span><span className="text-[var(--accent-yellow)] animate-pulse">RUN</span></div>
          </div>
        </div>
        
        <style>{`
          @keyframes loading {
            0% { width: 0%; }
            10% { width: 10%; }
            35% { width: 28%; }
            65% { width: 60%; }
            85% { width: 85%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`flex h-screen text-slate-100 font-sans overflow-hidden ${theme === 'obsidian' ? 'bg-[#07090e]' : (theme === 'cyber_blue' ? 'bg-[#040814]' : 'bg-[#f1f5f9]')}`}>
      
      {/* ======================================= */}
      {/* 1. PUBLIC LANDING / DASHBOARD HOME VIEW (Screenshot 1) */}
      {/* ======================================= */}
      {activeTab === 'landing' && (
        <div className="w-full h-full overflow-y-auto flex flex-col justify-between bg-[var(--bg-color)] mesh-grid select-none relative animate-fade-in-up">
          
          {/* Main Top Header Navbar */}
          <header className="px-10 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]/80 backdrop-filter backdrop-blur sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <AppLogo />
              <h1 className="text-xl font-bold tracking-widest text-white font-mono uppercase">CRIMEGPT KSP</h1>
            </div>
            
            <nav className="flex gap-8 text-xs font-mono font-bold uppercase tracking-wider">
              <button onClick={() => setActiveTab('landing')} className="text-white border-b-2 border-[var(--accent-cyan)] pb-1">Dashboard</button>
              <button onClick={() => setActiveTab('login')} className="text-slate-400 hover:text-white transition">FIR Search</button>
              <button onClick={() => setActiveTab('login')} className="text-slate-400 hover:text-white transition">Analytics</button>
            </nav>

            <div className="flex items-center gap-4 text-slate-400">
              <button onClick={() => setActiveTab('login')} className="hover:text-white transition"><BellRing className="w-4.5 h-4.5" /></button>
              <button onClick={() => setActiveTab('login')} className="hover:text-white transition"><Settings className="w-4.5 h-4.5" /></button>
              <button onClick={() => setActiveTab('login')} className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden hover:border-[var(--accent-cyan)] transition">
                <User className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </header>

          {/* Main Hero Console Grid */}
          <section className="flex-1 max-w-6xl w-full mx-auto px-8 py-12 flex flex-col justify-center relative">
            
            {/* FLOATING CARD RIGHT: Threat Detected */}
            <div className="absolute right-12 top-4 w-72 border border-red-950 bg-red-950/10 p-4 rounded-md space-y-2 text-xs font-mono glow-red animate-glow-cyan-pulse">
              <div className="flex items-center gap-2 text-[var(--accent-red)] font-bold tracking-wider">
                <AlertTriangle className="w-4 h-4 pulse-emergency" />
                <span>THREAT DETECTED</span>
              </div>
              <h4 className="font-bold text-slate-200 text-sm">Cybercrime Alert: High</h4>
              <p className="text-[10px] text-slate-400 leading-normal">Source: Suspicious API pattern in RT-Nagar</p>
            </div>

            {/* FLOATING CARD LEFT: Processing Engine */}
            <div className="absolute left-12 top-28 w-48 border border-cyan-950 bg-cyan-950/10 p-3.5 rounded-md space-y-2 text-xs font-mono glow-cyan animate-glow-cyan-pulse">
              <div className="flex justify-between items-center text-[var(--accent-cyan)] font-bold text-[9px]">
                <span>PROCESSING ENGINE</span>
                <Siren className="w-3.5 h-3.5 animate-spin" />
              </div>
              <p className="text-[10px] text-slate-200">Analyzing FIR #429...</p>
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                <div className="bg-[var(--accent-cyan)] h-full w-2/3 rounded-full animate-pulse"></div>
              </div>
              <span className="text-[8px] text-slate-500 block">NODE: BLR-CENTRAL-01</span>
            </div>

            {/* Centered Heading */}
            <div className="text-center space-y-6 max-w-3xl mx-auto z-10 animate-fade-in-up delay-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] text-[10px] font-mono uppercase tracking-widest text-[#00ff66] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-ping"></span>
                SYSTEM STATUS: OPERATIONAL
              </div>
              
              <h2 className="text-5xl font-extrabold tracking-wide leading-tight text-white font-mono uppercase">
                Intelligent Conversational AI for <br/>
                <span className="text-[var(--accent-cyan)]">KSP Crime Database</span>
              </h2>
              
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto font-sans">
                Transforming Criminal Investigation through Generative AI. Access decades of criminal records, 
                FIRs, and behavioral patterns through a secure, high-stakes tactical interface.
              </p>
              
              <div className="flex gap-4 justify-center pt-4 font-mono">
                <button 
                  onClick={() => setActiveTab('login')}
                  className="cyber-btn px-6 py-3 text-xs font-bold tracking-wider flex items-center gap-2 cursor-pointer animate-glow-cyan-pulse"
                >
                  Try Demo <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('login')}
                  className="px-6 py-3 border border-slate-700 bg-slate-900/40 rounded-md text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
                >
                  View Architecture <UserCheck className="w-4 h-4" />
                </button>
              </div>
            </div>

          </section>

          {/* Bottom Features Columns */}
          <section className="border-t border-[var(--border-color)] bg-[var(--panel-bg)]/20 py-10 px-8 flex-shrink-0 animate-fade-in-up delay-2">
            <div className="max-w-6xl w-full mx-auto grid grid-cols-4 gap-6">
              
              {/* Feature 1 */}
              <div className="tactical-panel p-5 space-y-3 bg-[var(--card-bg)] hover:border-cyan-800 transition min-h-[160px] flex flex-col justify-between animate-fade-in-up delay-1">
                <div className="flex items-center gap-2.5">
                  <Search className="w-5 h-5 text-[var(--accent-cyan)]" />
                  <h4 className="font-bold text-slate-200 font-mono text-xs uppercase tracking-wide">Semantic Pattern Recognition</h4>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal font-sans">
                  Query natural language to identify MO similarities across thousands of cold cases. Our LLM understands context beyond simple keywords.
                </p>
                <div className="h-1 border-t border-dashed border-slate-800 mt-2"></div>
              </div>

              {/* Feature 2 */}
              <div className="tactical-panel p-5 space-y-3 bg-[var(--card-bg)] hover:border-cyan-800 transition min-h-[160px] flex flex-col justify-between animate-fade-in-up delay-2">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-5 h-5 text-[var(--accent-red)]" />
                  <h4 className="font-bold text-slate-200 font-mono text-xs uppercase tracking-wide">Heatmap Forecasts</h4>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal font-sans">
                  Predictive modeling for urban crime hotspots with 89% accuracy using historical temporal data.
                </p>
                <div className="h-1 border-t border-dashed border-slate-800 mt-2"></div>
              </div>

              {/* Feature 3 */}
              <div className="tactical-panel p-5 space-y-3 bg-[var(--card-bg)] hover:border-cyan-800 transition min-h-[160px] flex flex-col justify-between animate-fade-in-up delay-3">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-[#00ff66]" />
                  <h4 className="font-bold text-slate-200 font-mono text-xs uppercase tracking-wide">Live Intel Feed</h4>
                </div>
                <div className="space-y-1.5 font-mono text-[9.5px]">
                  <p className="text-slate-300"><span className="text-[#00ff66] font-bold">14:02</span> Vehicle match found in Hebbal.</p>
                  <p className="text-slate-300"><span className="text-[#00ff66] font-bold">13:58</span> Facial ID verified: Subject-B.</p>
                </div>
                <div className="h-1 border-t border-dashed border-slate-800 mt-2"></div>
              </div>

              {/* Feature 4 */}
              <div className="tactical-panel p-5 space-y-3 bg-[var(--card-bg)] hover:border-cyan-800 transition min-h-[160px] flex flex-col justify-between animate-fade-in-up delay-4">
                <div className="flex items-center gap-2.5">
                  <GitMerge className="w-5 h-5 text-[var(--accent-cyan)]" />
                  <h4 className="font-bold text-slate-200 font-mono text-xs uppercase tracking-wide">Criminal Network Graphing</h4>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal font-sans">
                  Visualize complex gang hierarchies and financial money laundering trails with automated relationship extraction.
                </p>
                <button onClick={() => setActiveTab('login')} className="text-[9px] text-[var(--accent-cyan)] font-mono font-bold uppercase tracking-wider text-left underline cursor-pointer">
                  EXPLORE HUB ANALYSIS
                </button>
              </div>

            </div>
          </section>

          {/* Landing Footer */}
          <footer className="px-10 py-5 border-t border-[var(--border-color)] bg-[var(--bg-color)] flex justify-between items-center text-xs text-slate-500 font-mono flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">CRIMEGPT KSP</span>
              <span>© 2024 Karnataka State Police - CrimeGPT Intelligence Division</span>
            </div>
            <div className="flex gap-6">
              <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab('login')}} className="hover:text-white transition">Privacy Policy</a>
              <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab('login')}} className="hover:text-white transition">Terms of Service</a>
              <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab('login')}} className="hover:text-white transition">Contact HQ</a>
            </div>
          </footer>

        </div>
      )}

      {/* ======================================= */}
      {/* 2. AUTHENTICATION (LOGIN) VIEW (Screenshot 5) */}
      {/* ======================================= */}
      {activeTab === 'login' && (
        <div className="w-full h-full flex flex-col justify-between bg-[#07090e] mesh-grid p-10 select-none animate-fade-in-up">
          
          {/* Header Seal */}
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AppLogo />
              <div>
                <h1 className="text-lg font-bold tracking-widest text-white font-mono uppercase">CRIMEGPT KSP</h1>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">INTELLIGENCE DIVISION</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-cyan-950/20 border border-cyan-900/40 p-2.5 rounded text-[10px] font-mono">
              <Shield className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span className="text-[var(--accent-cyan)] font-bold uppercase tracking-wider">DATATHON 2026</span>
              <span className="px-2 py-0.5 bg-cyan-950/40 text-slate-300 font-bold border border-cyan-900/60 rounded text-[9px]">KSP SECURE CLASSIFIED</span>
            </div>
          </header>

          {/* Centered Credential Card */}
          <div className="max-w-md w-full mx-auto bg-[#0b1220]/90 border border-cyan-950 rounded-lg p-8 space-y-6 glow-cyan backdrop-blur-md animate-fade-in-up">
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-mono uppercase tracking-wider text-slate-200">Secure Portal Access</h2>
              <p className="text-xs text-slate-400">Classified intelligence access. Verify your credentials.</p>
            </div>

            <div className="space-y-4 text-xs font-mono text-left">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase text-[9px]">OFFICER IDENTIFICATION CODE</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    className="w-full bg-[#05070c] border border-cyan-950 rounded px-9 py-2.5 text-slate-200 focus:outline-none focus:border-[var(--accent-cyan)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 font-bold uppercase text-[9px]">ENCRYPTION KEY</label>
                  <a href="#" className="text-[9px] text-[var(--accent-cyan)] hover:underline">Forgot Access?</a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#05070c] border border-cyan-950 rounded px-9 py-2.5 text-slate-200 focus:outline-none focus:border-[var(--accent-cyan)]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Fingerprint Authorization Pad */}
              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={handleLoginFingerprint}
                  disabled={isScanning}
                  className="w-full border border-cyan-900/60 bg-cyan-950/20 rounded p-3 flex items-center justify-between hover:border-[var(--accent-cyan)] transition cursor-pointer relative overflow-hidden group animate-glow-cyan-pulse"
                >
                  {isScanning && <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--accent-cyan)] shadow-md animate-bounce"></div>}
                  <div className="flex items-center gap-3">
                    <Fingerprint className={`w-6 h-6 text-[var(--accent-cyan)] ${isScanning ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">
                      {isScanning ? 'Initializing Scan...' : 'Biometric Authorization'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-500">TOUCH SCANNER TO INITIALIZE</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </button>
              </div>

              {/* Login Button */}
              <button 
                onClick={() => { setIsLoggedIn(true); setActiveTab('dashboard') }}
                className="w-full bg-[var(--accent-cyan)] text-[#07090e] py-3 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-400 transition cursor-pointer animate-glow-cyan-pulse"
              >
                Secure Login <ShieldCheck className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom logs indicator */}
            <div className="flex justify-center items-center gap-2 text-[9px] font-mono text-slate-500 pt-2 border-t border-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse"></span>
              <span>ENCRYPTION: AES-256</span>
              <span className="text-slate-800">|</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse"></span>
              <span>NODES: ACTIVE</span>
            </div>

          </div>

          {/* Diagnostic latency footer */}
          <footer className="border-t border-slate-950 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-500 animate-fade-in-up delay-2">
            <div className="space-y-1 text-left">
              <div>SYSTEM STATUS: <span className="text-[#00ff66] font-bold">ALL CORE MODULES NOMINAL</span></div>
              <div>NETWORK LATENCY: <span className="text-[#00ff66] font-bold">2.4 MS @ BANGALORE_HUB</span></div>
            </div>
            <div className="text-right">
              <p>KSP-INT © 2024 Karnataka State Police Intelligence Division. Restricted Access.</p>
              <p className="text-[9px] text-slate-600 mt-0.5">Security Protocol | Privacy Policy | System Status</p>
            </div>
          </footer>

        </div>
      )}

      {/* ======================================= */}
      {/* 3-13. INTERNAL SECURE SHELL INTERFACE */}
      {/* ======================================= */}
      {isLoggedIn && (
        <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-color)] font-mono animate-fade-in-up">
          
          {/* Main Left Navigation Sidebar */}
          <aside className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col h-full z-20 flex-shrink-0 select-none">
            
            {/* Header Badge */}
            <div className="p-5 border-b border-[var(--border-color)] flex items-center gap-3">
              <AppLogo size="sm" />
              <div>
                <h1 className="text-xs font-extrabold tracking-widest text-[var(--accent-cyan)] font-mono uppercase">CrimeGPT KSP</h1>
                <p className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">Vigilance & Precision</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded text-[11px] font-bold uppercase transition ${activeTab === 'dashboard' ? 'bg-[#0f172a] text-[#00f0ff] border-l-4 border-[#00f0ff]' : 'text-slate-400 hover:bg-slate-900/60'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab('investigator'); setCaseTabMode('detail') }}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded text-[11px] font-bold uppercase transition ${activeTab === 'investigator' ? 'bg-[#0f172a] text-[#00f0ff] border-l-4 border-[#00f0ff]' : 'text-slate-400 hover:bg-slate-900/60'}`}
              >
                <Search className="w-4 h-4" />
                <span>FIR Search</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded text-[11px] font-bold uppercase transition ${activeTab === 'analytics' ? 'bg-[#0f172a] text-[#00f0ff] border-l-4 border-[#00f0ff]' : 'text-slate-400 hover:bg-[#0f172a]/20'}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('map')}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded text-[11px] font-bold uppercase transition ${activeTab === 'map' ? 'bg-[#0f172a] text-[#00f0ff] border-l-4 border-[#00f0ff]' : 'text-slate-400 hover:bg-slate-900/60'}`}
              >
                <Map className="w-4 h-4" />
                <span>Heat Map</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('network')}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded text-[11px] font-bold uppercase transition ${activeTab === 'network' ? 'bg-[#0f172a] text-[#00f0ff] border-l-4 border-[#00f0ff]' : 'text-slate-400 hover:bg-[#0f172a]/20'}`}
              >
                <GitMerge className="w-4 h-4" />
                <span>Criminal Net</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded text-[11px] font-bold uppercase transition ${activeTab === 'reports' ? 'bg-[#0f172a] text-[#00f0ff] border-l-4 border-[#00f0ff]' : 'text-slate-400 hover:bg-[#0f172a]/20'}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Reports</span>
              </button>

              <button 
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded text-[11px] font-bold uppercase transition ${activeTab === 'team' ? 'bg-[#0f172a] text-[#00f0ff] border-l-4 border-[#00f0ff]' : 'text-slate-400 hover:bg-[#0f172a]/20'}`}
              >
                <Users className="w-4 h-4" />
                <span>Our Team</span>
              </button>
            </nav>

            {/* Sidebar Bottom Beat */}
            <div className="p-4 space-y-4 border-t border-slate-900">
              <button 
                onClick={() => { setActiveTab('investigator'); setCaseTabMode('search') }}
                className="w-full bg-cyan-950/20 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)] hover:text-[#07090e] py-2.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>+</span> New Investigation
              </button>
              
              <div className="space-y-1 text-[10px] font-mono text-slate-500">
                <button onClick={() => triggerAlert("INFO", "Help Desk synced. Dispatch protocols online.")} className="w-full text-left hover:text-white transition flex items-center gap-2 py-1"><HelpCircle className="w-3.5 h-3.5" /> Support</button>
                <button onClick={() => { setIsLoggedIn(false); setActiveTab('landing') }} className="w-full text-left hover:text-[var(--accent-red)] transition flex items-center gap-2 py-1"><Lock className="w-3.5 h-3.5" /> Logout</button>
              </div>
            </div>

          </aside>

          {/* Main Console Content Body */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-color)]">
            
            {/* Header controls bar */}
            <header className="h-16 bg-[var(--sidebar-bg)] border-b border-[var(--border-color)] px-8 flex justify-between items-center z-10 flex-shrink-0">
              <div className="flex items-center gap-3 animate-fade-in-up">
                <ShieldCheck className="w-5 h-5 text-[var(--accent-cyan)]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">INTELLIGENT DIVISION</span>
              </div>

              {/* Center Head Search bar */}
              <div className="relative w-80 animate-fade-in-up">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search case files, suspects, or areas..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#05070c] border border-cyan-950/60 rounded-md px-9 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[var(--accent-cyan)]"
                />
              </div>
              
              <div className="flex items-center gap-4 text-slate-400 animate-fade-in-up">
                <button onClick={() => triggerAlert("CRITICAL", "New armed robbery reported in Sector 4")} className="relative hover:text-white transition">
                  <BellRing className="w-4.5 h-4.5 text-slate-400" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[var(--accent-red)] animate-ping"></span>
                </button>
                <button onClick={() => setActiveTab('settings')} className="hover:text-white transition"><Settings className="w-4.5 h-4.5" /></button>
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            </header>

            {/* Inner Content Tabs Container */}
            <div className="flex-1 p-8 overflow-y-auto">

              {/* ======================================= */}
              {/* PAGE 3: DASHBOARD / CHAT CO-PILOT VIEW (Screenshot 3) */}
              {/* ======================================= */}
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-3 gap-8 h-full items-start animate-fade-in-up">
                  
                  {/* Left Column: Conversational AI Copilot Terminal */}
                  <div className="tactical-panel col-span-2 h-full flex flex-col justify-between min-h-[500px] animate-fade-in-up delay-1">
                    
                    {/* Console Header Bar */}
                    <div className="p-4 border-b border-slate-800 bg-[#0d1425]/60 flex justify-between items-center text-xs font-bold font-mono">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[var(--accent-cyan)] animate-pulse" />
                        <span className="text-[var(--accent-cyan)] uppercase">CrimeGPT Intelligence Copilot</span>
                      </div>
                      <span className="text-slate-500 font-normal">08:42 AM • SECURE ENCRYPTION ACTIVE</span>
                    </div>

                    {/* Chat Narrative History */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
                      
                      {chatMessages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.sender === 'officer' ? 'justify-end' : 'justify-start'} w-full animate-fade-in-up`}>
                          <div className={`max-w-[85%] rounded p-4 border leading-relaxed space-y-3 ${m.sender === 'officer' ? 'bg-[#0f172a] text-[#00f0ff] border-cyan-950 text-right' : 'bg-[#05070c] border-slate-900'}`}>
                            
                            {m.meta && (
                              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-900 pb-1.5 mb-2 flex items-center justify-between">
                                <span>SYSTEM INITIALIZATION</span>
                                <span>{m.meta}</span>
                              </div>
                            )}

                            <p className="font-sans text-xs text-left leading-normal">{m.text}</p>

                            {/* Mapped Robbery Case Cards (pre-populated like Screenshot 3) */}
                            {m.hasCards && (
                              <div className="grid grid-cols-2 gap-4 pt-3 text-left">
                                
                                {/* Card 1 */}
                                <div className="tactical-panel p-4 bg-[#0c1322] border-red-950 flex flex-col justify-between glow-red animate-glow-cyan-pulse">
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-bold text-slate-400">FIR #2024/BNG/S/0432</span>
                                      <span className="px-1.5 py-0.5 rounded bg-red-950/40 text-[var(--accent-red)] border border-red-900/60 font-bold text-[8px]">CRITICAL</span>
                                    </div>
                                    <h4 className="font-bold text-slate-200 text-xs font-mono">Armed Robbery - Jayanagar 4th Block</h4>
                                    <p className="text-[9px] text-slate-500">24 May 2024, 21:15</p>
                                  </div>
                                  <button 
                                    onClick={() => fetchCaseDetails("09241")}
                                    className="w-full mt-3 py-1.5 border border-slate-800 rounded bg-[#05070c] text-center text-[9px] font-bold text-slate-400 hover:text-white transition hover:border-[var(--accent-cyan)] cursor-pointer"
                                  >
                                    View Digital Dossier
                                  </button>
                                </div>

                                {/* Card 2 */}
                                <div className="tactical-panel p-4 bg-[#0c1322] border-slate-800 flex flex-col justify-between">
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-bold text-slate-400">FIR #2024/BNG/S/0438</span>
                                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold text-[8px]">OPEN</span>
                                    </div>
                                    <h4 className="font-bold text-slate-200 text-xs font-mono">Chain Snatching - JP Nagar 2nd Phase</h4>
                                    <p className="text-[9px] text-slate-500">26 May 2024, 18:30</p>
                                  </div>
                                  <button 
                                    onClick={() => fetchCaseDetails("09241")}
                                    className="w-full mt-3 py-1.5 border border-slate-800 rounded bg-[#05070c] text-center text-[9px] font-bold text-slate-400 hover:text-white transition hover:border-[var(--accent-cyan)] cursor-pointer"
                                  >
                                    View Digital Dossier
                                  </button>
                                </div>

                                {/* Layering Insight Banner */}
                                <div className="col-span-2 border border-cyan-950 bg-cyan-950/10 p-3 rounded text-[10px] leading-relaxed text-slate-300 font-sans flex items-start gap-2">
                                  <AlertOctagon className="w-4 h-4 text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" />
                                  <p>
                                    <strong>CrimeGPT Insight:</strong> Vehicle license plate fragment <span className="text-[var(--accent-cyan)] font-mono">'KA-05-**-45'</span> matches a suspect vehicle identified in a Mysuru highway toll case 14 days ago.
                                  </p>
                                </div>

                              </div>
                            )}

                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="p-3 bg-slate-950 border border-slate-900 rounded italic text-slate-500 font-mono text-[10px] animate-pulse">
                            CrimeGPT Copilot compiling database checksum indices...
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Chips Action suggestion box */}
                    <div className="px-6 py-2.5 bg-[#090d16]/80 border-t border-slate-900 flex gap-3 overflow-x-auto text-[9.5px] font-bold uppercase tracking-wider text-[var(--accent-cyan)]">
                      <button onClick={() => setChatInput("Show robbery cases in Bengaluru last 30 days")} className="px-2 py-1.5 border border-cyan-950 rounded hover:border-[var(--accent-cyan)] bg-[#05070c] cursor-pointer">🔍 Robberies 30 Days</button>
                      <button onClick={() => setChatInput("Suspect profile for 'Manju' alias 'Bullet'")} className="px-2 py-1.5 border border-cyan-950 rounded hover:border-[var(--accent-cyan)] bg-[#05070c] cursor-pointer">👤 Profile 'Manju'</button>
                      <button onClick={() => setChatInput("Cross-check suspect vehicle with toll logs")} className="px-2 py-1.5 border border-cyan-950 rounded hover:border-[var(--accent-cyan)] bg-[#05070c] cursor-pointer">🕸️ Toll Check logs</button>
                    </div>

                    {/* Chat Submission bar */}
                    <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-800 bg-[#0a0f1d] flex items-center gap-3 flex-shrink-0">
                      <button 
                        type="button" 
                        onClick={startSpeechRecognition} 
                        className={`p-3 rounded border transition ${isRecording ? 'bg-red-950 border-red-500 text-red-500' : 'bg-slate-950 border-cyan-950 text-cyan-400 hover:border-[#00f0ff]'}`}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                      
                      <div className="flex-1 relative flex items-center">
                        <input 
                          type="text" 
                          value={chatInput} 
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type command (e.g., 'Compare suspect photos with CCTV 08' or search)..."
                          className="w-full bg-[#05070c] border border-cyan-950 rounded-l px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[var(--accent-cyan)]"
                        />
                        <button 
                          type="button" 
                          onClick={() => triggerAlert("INFO", "Document upload matrix initialized.")} 
                          className="absolute right-3 text-slate-500 hover:text-slate-300"
                        >
                          📎
                        </button>
                      </div>

                      <button 
                        type="submit" 
                        className="bg-[var(--accent-cyan)] text-[#07090e] px-5 py-3 rounded-r font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-cyan-400 transition cursor-pointer animate-glow-cyan-pulse"
                      >
                        <Send className="w-4.5 h-4.5" />
                      </button>
                    </form>

                  </div>

                  {/* Right Column: QUICK STATS & RECENT ALERTS */}
                  <div className="space-y-6 col-span-1 h-full overflow-y-auto animate-fade-in-up delay-2">
                    
                    {/* Quick Stats Box */}
                    <div className="tactical-panel p-5 space-y-4 bg-[var(--card-bg)] border-slate-800 animate-fade-in-up delay-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono border-b border-slate-900 pb-2">📋 Quick Stats</h4>
                      
                      <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                        
                        <div className="bg-[#05070c] p-3 border border-slate-900 rounded space-y-1 relative">
                          <span className="text-[8px] text-slate-500 font-bold block uppercase">Total FIRs</span>
                          <span className="text-2xl font-extrabold text-slate-200">1,248</span>
                          <span className="text-[8px] text-[#00ff66] block font-bold">↑ +12%</span>
                        </div>

                        <div className="bg-[#05070c] p-3 border border-slate-900 rounded space-y-1">
                          <span className="text-[8px] text-slate-500 font-bold block uppercase">Active Cases</span>
                          <span className="text-2xl font-extrabold text-slate-200">342</span>
                          <span className="text-[8px] text-orange-400 block font-bold">24 pending review</span>
                        </div>

                      </div>

                      {/* City Crime index slider bar */}
                      <div className="space-y-2 border-t border-slate-900 pt-3 animate-fade-in-up">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400 font-bold uppercase">Crime Rate Index (City)</span>
                          <span className="text-slate-200 font-bold">4.2</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden relative">
                          <div className="bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 h-full w-[42%] rounded-full"></div>
                        </div>
                      </div>

                    </div>

                    {/* Live Recent Alerts Box */}
                    <div className="tactical-panel p-5 space-y-4 bg-[var(--card-bg)] border-red-950/20 animate-fade-in-up delay-2">
                      
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[var(--accent-cyan)] animate-pulse" /> Recent Alerts
                        </h4>
                        <span className="px-1.5 py-0.5 rounded bg-red-950/40 text-[var(--accent-red)] border border-red-900/60 font-bold text-[8px] tracking-widest animate-pulse">LIVE</span>
                      </div>

                      <div className="space-y-3 text-[10.5px]">
                        
                        {/* Alert 1 */}
                        <div className="bg-[#05070c] border border-red-950/30 p-3 rounded font-mono leading-relaxed space-y-1 relative animate-fade-in-up delay-1">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-[var(--accent-red)] uppercase">ARMED ROBBERY REPORT</span>
                            <span className="text-slate-600">12 mins ago</span>
                          </div>
                          <p className="text-slate-300 leading-normal font-sans">
                            Indiranagar 100ft Rd. 3 Suspects on Pulsar bike. CCTV match pending.
                          </p>
                          <span className="text-[8px] text-slate-500 block pt-1 uppercase">Sector 4</span>
                        </div>

                        {/* Alert 2 */}
                        <div className="bg-[#05070c] border border-slate-900 p-3 rounded font-mono leading-relaxed space-y-1 animate-fade-in-up delay-2">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-slate-400 uppercase">VEHICLE THEFT</span>
                            <span className="text-slate-600">45 mins ago</span>
                          </div>
                          <p className="text-slate-300 leading-normal font-sans">
                            White Fortuner (KA-03-XX-0001) stolen from HSR Layout Sec 2.
                          </p>
                          <span className="text-[8px] text-slate-500 block pt-1 uppercase">Sector 9</span>
                        </div>

                        {/* Alert 3 */}
                        <div className="bg-[#05070c] border border-slate-900 p-3 rounded font-mono leading-relaxed space-y-1 animate-fade-in-up delay-3">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-slate-400 uppercase">BOLO UPDATE</span>
                            <span className="text-slate-600">1 hour ago</span>
                          </div>
                          <p className="text-slate-300 leading-normal font-sans">
                            Known suspect 'Irfan' spotted near Electronic City Toll Gate.
                          </p>
                          <span className="text-[8px] text-slate-500 block pt-1 uppercase">Highway Div</span>
                        </div>

                      </div>

                      <button 
                        onClick={() => triggerAlert("INFO", "Loading full active alerts list matrix.")}
                        className="w-full py-2 border border-slate-800 rounded bg-[#05070c] text-center text-[9px] font-bold text-slate-400 hover:text-white transition uppercase tracking-wider cursor-pointer"
                      >
                        View All Active Alerts →
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* ======================================= */}
              {/* PAGE 4: FIR SCANNED DOCsplit-pane VIEW (Screenshot 2) */}
              {/* ======================================= */}
              {activeTab === 'investigator' && selectedCase && (
                <div className="space-y-6 animate-fade-in-up">
                  
                  {/* Top Breadcrumb and action headers */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-shrink-0 font-mono">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        FIR SEARCH &gt; <span className="text-[var(--accent-cyan)]">{selectedCase.fir_no}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-200 mt-2 uppercase tracking-wide">Intelligence Extraction: Case #{selectedCase.id}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-red-950/40 text-[var(--accent-red)] border border-red-900/60 font-bold text-[9px] tracking-wider uppercase animate-pulse">CRITICAL ALERT</span>
                      <button onClick={() => triggerAlert("INFO", "Collaborate link generated.")} className="px-3.5 py-2 border border-slate-800 rounded text-[10px] font-bold text-slate-400 hover:text-white transition bg-slate-900/40 flex items-center gap-1.5 uppercase cursor-pointer"><Share2 className="w-3.5 h-3.5" /> Collaborate</button>
                      <button onClick={() => downloadPDFReport(selectedCase)} className="bg-[var(--accent-cyan)] text-[#07090e] px-4 py-2 rounded text-[10px] font-bold flex items-center gap-1.5 uppercase hover:bg-cyan-400 transition cursor-pointer animate-glow-cyan-pulse"><FileDown className="w-3.5 h-3.5" /> Generate PDF Report</button>
                    </div>
                  </div>

                  {/* Horizontal Pipeline tracker (Screenshot 2) */}
                  <div className="tactical-panel px-6 py-4 bg-[#0d1425]/40 border-slate-900 flex justify-between items-center text-xs font-bold font-mono tracking-wider overflow-x-auto animate-fade-in-up delay-1">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border border-slate-700 bg-slate-800 text-[9px] flex items-center justify-center text-slate-400">1</span>
                      <span className="text-slate-400">COMPLAINT</span>
                    </div>
                    <div className="flex-1 border-t border-slate-800 mx-4"></div>
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-[var(--accent-cyan)] text-[#07090e] text-[10px] flex items-center justify-center font-extrabold pulse-emergency">✓</span>
                      <span className="text-[var(--accent-cyan)] font-extrabold">FIR REGISTERED</span>
                    </div>
                    <div className="flex-1 border-t border-slate-800 mx-4"></div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border border-slate-800 text-[9px] flex items-center justify-center text-slate-500">3</span>
                      <span className="text-slate-500">EVIDENCE</span>
                    </div>
                    <div className="flex-1 border-t border-slate-800 mx-4"></div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border border-slate-800 text-[9px] flex items-center justify-center text-slate-500">4</span>
                      <span className="text-slate-500">ARREST</span>
                    </div>
                  </div>

                  {/* Split Pane view grid */}
                  <div className="grid grid-cols-5 gap-8 items-start animate-fade-in-up delay-2">
                    
                    {/* Left Pane Column (3/5 width): ORIGINAL DOCUMENT */}
                    <div className="col-span-3 space-y-4 animate-fade-in-up delay-1">
                      
                      <div className="flex justify-between items-center text-xs font-mono font-bold uppercase tracking-wider text-slate-400 animate-fade-in-up">
                        <span>📄 Original Document</span>
                        <div className="flex gap-2">
                          <button onClick={() => setDocZoom(prev => Math.max(prev - 10, 60))} className="p-1 hover:text-white transition"><ZoomOut className="w-4.5 h-4.5" /></button>
                          <button onClick={() => setDocZoom(prev => Math.min(prev + 10, 160))} className="p-1 hover:text-white transition"><ZoomIn className="w-4.5 h-4.5" /></button>
                          <button onClick={() => downloadPDFReport(selectedCase)} className="p-1 hover:text-white transition"><Printer className="w-4.5 h-4.5" /></button>
                        </div>
                      </div>

                      {/* Scanned paper sheet element */}
                      <div className="document-paper p-10 font-mono text-[var(--document-text)] shadow-2xl relative select-text animate-fade-in-up" style={{ fontSize: `${11 * (docZoom / 100)}px` }}>
                        
                        {/* Seal Watermark Overlay (faded center) */}
                        <div className="document-watermark opacity-[0.03] select-none pointer-events-none text-center">
                          KARNATAKA STATE POLICE
                        </div>

                        <div className="space-y-6 animate-fade-in-up">
                          
                          {/* Paper Head */}
                          <div className="text-center font-bold border-b border-slate-300 pb-4 space-y-1">
                            <h3 className="tracking-widest text-[12px]">KARNATAKA STATE POLICE</h3>
                            <p className="text-[10px] text-slate-500">First Information Report</p>
                            <p className="text-[9px] text-slate-400 font-normal italic">(Under Section 154 Cr.P.C.)</p>
                          </div>

                          {/* Scanned Fields */}
                          <div className="grid grid-cols-2 gap-y-2 border-b border-slate-200 pb-4 text-[10.5px] animate-fade-in-up">
                            <p><strong>1. District:</strong> {selectedCase.district}</p>
                            <p><strong>P.S.:</strong> {selectedCase.police_station}</p>
                            <p><strong>Year:</strong> {selectedCase.year}</p>
                            <p><strong>2. FIR No:</strong> {selectedCase.id}</p>
                            <p><strong>Date:</strong> 12/05/2024</p>
                            <p className="col-span-2"><strong>3. ACTS & SECTIONS:</strong> {selectedCase.bns_sections}</p>
                          </div>

                          {/* Occurrence text body with typewriter borders */}
                          <div className="flex animate-fade-in-up">
                            <div className="flex flex-col border-r border-slate-200 pr-3 mr-4 text-[9px] text-slate-400 font-mono text-right select-none space-y-1">
                              {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i}>{String(i + 1).padStart(2, '0')}</div>
                              ))}
                            </div>
                            
                            <div className="flex-1 space-y-4 leading-relaxed text-slate-800 text-justify font-mono">
                              <p><strong>4. OCCURRENCE OF OFFENSE:</strong></p>
                              <p>Date: 11/05/2024, Time: 23:45 HRS. Location: Vasanth Nagar Underpass area. Complainant states three individuals on a motorcycle approached...</p>
                              <p>
                                The victim, identified as {selectedCase.victim_name}, was returning from his late-night shift when he was intercepted near the underpass. 
                                According to the witness statements recorded at the scene, the perpetrators were wearing dark hooded jackets. A physical altercation ensued during which the victim sustained blunt force...
                              </p>
                            </div>
                          </div>

                        </div>

                        {/* Page footer */}
                        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 select-none">
                          <button disabled className="opacity-30">◀</button>
                          <span>Page 1 of 4</span>
                          <button disabled className="opacity-30">▶</button>
                        </div>

                      </div>

                    </div>

                    {/* Right Pane Column (2/5 width): AI EXTRACTION DETAILS */}
                    <div className="col-span-2 space-y-6 animate-fade-in-up delay-2">
                      
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono animate-fade-in-up">🤖 AI Intelligence Extraction</h4>

                      {/* Card 1: Identified Legal Sections */}
                      <div className="tactical-panel p-5 space-y-3.5 bg-[var(--card-bg)] border-slate-800 text-left animate-fade-in-up delay-1">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">IDENTIFIED LEGAL SECTIONS (BNS)</span>
                        
                        <div className="space-y-2 text-xs font-mono">
                          <div className="bg-[#05070c] border border-slate-900 p-2.5 rounded flex justify-between items-center">
                            <span className="text-[var(--accent-cyan)] font-bold">Section 304</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">CULPABLE HOMICIDE</span>
                          </div>
                          <div className="bg-[#05070c] border border-slate-900 p-2.5 rounded flex justify-between items-center">
                            <span className="text-[var(--accent-cyan)] font-bold">Section 115</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">ABETMENT</span>
                          </div>
                          <div className="bg-[#05070c] border border-slate-900 p-2.5 rounded flex justify-between items-center">
                            <span className="text-[var(--accent-cyan)] font-bold">Section 351(2)</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">CRIMINAL INTIMIDATION</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Victim Information */}
                      <div className="tactical-panel p-5 bg-[var(--card-bg)] border-slate-800 text-left space-y-3 animate-fade-in-up delay-2">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">VICTIM INFORMATION</span>
                        <div className="bg-[#05070c] border border-slate-900 p-4 rounded flex gap-4 items-start relative">
                          <User className="w-8 h-8 text-[var(--accent-cyan)] border border-cyan-950 p-1 bg-cyan-950/10 rounded" />
                          <div className="space-y-1.5 flex-1">
                            <h4 className="font-bold text-slate-200 text-xs font-mono">{selectedCase.victim_name}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">{selectedCase.victim_gender}, {selectedCase.victim_age} Years | {selectedCase.victim_profile}</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{selectedCase.victim_narrative}</p>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Accused Profile */}
                      <div className="tactical-panel p-5 bg-[var(--card-bg)] border-slate-800 text-left space-y-3 animate-fade-in-up delay-3">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">ACCUSED PROFILE</span>
                        <div className="bg-[#05070c] border border-red-950/20 p-4 rounded flex gap-4 items-start relative">
                          <UserCheck className="w-8 h-8 text-[var(--accent-red)] border border-red-950/40 p-1 bg-red-950/10 rounded" />
                          <div className="space-y-1.5 flex-1">
                            <h4 className="font-bold text-slate-200 text-xs font-mono">{selectedCase.accused_names}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">Age Group {selectedCase.accused_age_group}</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{selectedCase.accused_motive}</p>
                          </div>
                        </div>
                      </div>

                      {/* Card 4: Event Timeline */}
                      <div className="tactical-panel p-5 bg-[var(--card-bg)] border-slate-800 text-left space-y-4 animate-fade-in-up delay-4">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">EVIDENCE & EVENT TIMELINE</span>
                        
                        <div className="relative pl-5 border-l border-slate-800 space-y-4 text-xs font-mono">
                          {selectedCase.timeline.map((item, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-[var(--accent-cyan)] border border-slate-950 pulse-emergency"></span>
                              <div className="space-y-1 pl-2 animate-fade-in-up">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-slate-200 font-bold">{item.date}</span>
                                  <span className="text-slate-500 font-bold uppercase text-[8px] border border-slate-850 px-1 rounded bg-[#05070c]">{item.tag}</span>
                                </div>
                                <p className="text-slate-400 font-sans leading-normal text-[11px]">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* PAGE 5: CRIME HEATMAP VIEW (Screenshot 4) */}
              {/* ======================================= */}
              {activeTab === 'map' && (
                <div className="grid grid-cols-3 gap-8 h-[calc(100vh-10rem)] animate-fade-in-up">
                  
                  {/* Left Column (2/3 width): Dark Interactive Map */}
                  <div className="tactical-panel col-span-2 h-full relative overflow-hidden bg-[#07090e] border-slate-900 animate-fade-in-up delay-1">
                    
                    {/* Top Search Overlay */}
                    <div className="absolute top-4 left-4 z-10 w-80">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                          type="text" 
                          placeholder="Search or location..." 
                          className="w-full bg-[#0d1425]/90 border border-cyan-950/80 rounded px-9 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none backdrop-blur shadow-lg"
                        />
                      </div>
                    </div>

                    {/* Left Zoom Overlay Controls */}
                    <div className="absolute left-4 top-20 z-10 flex flex-col bg-[#0b1220] border border-cyan-950 rounded shadow-lg overflow-hidden text-slate-400 font-bold">
                      <button onClick={() => triggerAlert("INFO", "Zoom in initialized.")} className="p-2.5 border-b border-cyan-950/40 hover:bg-slate-900 hover:text-white text-center">+</button>
                      <button onClick={() => triggerAlert("INFO", "Zoom out initialized.")} className="p-2.5 border-b border-cyan-950/40 hover:bg-slate-900 hover:text-white text-center">-</button>
                      <button onClick={() => triggerAlert("INFO", "Recenter map spot.")} className="p-2.5 border-b border-cyan-950/40 hover:bg-slate-900 hover:text-white text-center">🎯</button>
                      <button onClick={() => triggerAlert("INFO", "Layers index overlays.")} className="p-2.5 hover:bg-slate-900 hover:text-white text-center">Layers</button>
                    </div>

                    {/* Bottom Category Filter Overlay */}
                    <div className="absolute bottom-4 left-4 z-10 flex gap-2 font-mono text-[9px] font-bold uppercase tracking-wider">
                      <span className="text-slate-400 px-2 py-1.5 flex items-center font-bold">CATEGORIES:</span>
                      <button className="px-3 py-1.5 rounded-full bg-[var(--accent-cyan)] text-[#07090e]">Robbery</button>
                      <button className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">Fraud</button>
                      <button className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">Assault</button>
                      <button onClick={() => triggerAlert("INFO", "Filters drawer active.")} className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5">All Filters</button>
                    </div>

                    {/* Bottom Range Slider Overlay */}
                    <div className="absolute bottom-4 right-4 z-10 w-72 bg-[#0b1220]/90 border border-cyan-950 p-3 rounded backdrop-blur font-mono text-[9.5px] leading-relaxed shadow-lg">
                      <div className="flex justify-between items-center text-slate-400 font-bold mb-1.5 uppercase">
                        <span>Time Range: Live</span>
                        <span className="text-[var(--accent-cyan)] animate-pulse">UPDATING...</span>
                      </div>
                      <input type="range" min="1" max="100" defaultValue="42" className="w-full accent-[#00f0ff] bg-slate-950" />
                      <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                        <span>00:00</span>
                        <span>12:00</span>
                        <span>24:00</span>
                      </div>
                    </div>

                    {/* Map Canvas div */}
                    <div ref={mapContainerRef} className="w-full h-full z-0"></div>
                  </div>

                  {/* Right Column (1/3 width): AI PREDICTIONS & DEPLOYMENT FEED (Screenshot 4) */}
                  <div className="tactical-panel col-span-1 h-full p-6 flex flex-col justify-between overflow-y-auto border-slate-800 bg-[var(--card-bg)] animate-fade-in-up delay-2">
                    
                    <div className="space-y-6">
                      
                      {/* AI Predictions */}
                      <div className="space-y-3.5 text-left font-mono animate-fade-in-up">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-900 pb-2 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[var(--accent-cyan)] animate-pulse" /> AI Predictions
                        </h4>
                        
                        <div className="bg-[#05070c] border border-red-950/40 p-4 rounded-md space-y-2 glow-red relative animate-glow-cyan-pulse">
                          <span className="text-[8px] text-[var(--accent-red)] font-bold block uppercase tracking-widest">HIGH PROBABILITY ALERT</span>
                          <h4 className="font-extrabold text-slate-200 text-sm">Next likely hotspot: Indiranagar</h4>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-900/60">
                            <span>Statistical Confidence</span>
                            <span className="text-[var(--accent-cyan)] font-bold">92% (ML-V4)</span>
                          </div>
                        </div>

                        {/* Forecast Index */}
                        <div className="bg-[#05070c] border border-slate-900 p-4 rounded-md space-y-2 animate-fade-in-up delay-1">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-slate-400 uppercase">CRIME TREND FORECAST</span>
                            <span className="text-[var(--accent-red)]">+15% Cybercrime</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans leading-normal">Projected growth next 72h based on temporal indices.</p>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden relative mt-1.5">
                            <div className="bg-[var(--accent-red)] h-full w-[70%] rounded-full"></div>
                          </div>
                        </div>

                      </div>

                      {/* Tactical Deployment */}
                      <div className="space-y-3 text-left font-mono animate-fade-in-up delay-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-900 pb-2">🛡️ Tactical Deployment</h4>
                        
                        <div className="space-y-2.5 text-[10.5px]">
                          
                          <div className="bg-[#05070c] border border-slate-900 p-3 rounded flex gap-3 items-center animate-fade-in-up delay-1">
                            <ShieldCheck className="w-6 h-6 text-[var(--accent-cyan)] flex-shrink-0" />
                            <div className="flex-1 leading-normal">
                              <h5 className="font-bold text-slate-200">Alpha-9 Unit Redirection</h5>
                              <p className="text-slate-500 text-[9.5px]">Deploy to Sector 4 (Indiranagar)</p>
                            </div>
                          </div>

                          <div className="bg-[#05070c] border border-slate-900 p-3 rounded flex gap-3 items-center animate-fade-in-up delay-2">
                            <Globe className="w-6 h-6 text-slate-400 flex-shrink-0" />
                            <div className="flex-1 leading-normal">
                              <h5 className="font-bold text-slate-200">UAV Surveillance</h5>
                              <p className="text-slate-500 text-[9.5px]">Scheduled for 22:00 IST</p>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Intelligence Feed */}
                      <div className="space-y-3.5 text-left font-mono animate-fade-in-up delay-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-900 pb-2">📡 Intelligence Feed</h4>
                        
                        <div className="space-y-2 text-[9.5px] animate-fade-in-up">
                          <p className="text-[var(--accent-red)] flex gap-2 items-start leading-relaxed animate-pulse">
                            <span className="font-bold">[21:44:12]</span>
                            <span>Anomaly detected in commercial txn patterns. Suspicious node active.</span>
                          </p>
                          <p className="text-[#00ff66] flex gap-2 items-start leading-relaxed">
                            <span className="font-bold">[21:40:05]</span>
                            <span>Precinct 4 reported zero active incidents. All beats nominal.</span>
                          </p>
                        </div>
                      </div>

                    </div>

                    <div className="border-t border-slate-950 pt-4 text-[9px] font-mono text-slate-650 text-center uppercase tracking-wider select-none">
                      AI SOURCE MATRIX: DEC COMPILER
                    </div>

                  </div>

                </div>
              )}

              {/* ======================================= */}
              {/* PAGE 6: CRIMINAL RELATION Graph VIEW */}
              {/* ======================================= */}
              {activeTab === 'network' && (
                <div className="grid grid-cols-4 gap-8 h-[calc(100vh-10rem)] animate-fade-in-up">
                  
                  {/* SVG Network Graph (Screenshot 5 visual style) */}
                  <div className="tactical-panel col-span-3 h-full relative bg-[#07090e] flex flex-col justify-between border-slate-900 animate-fade-in-up delay-1">
                    <div className="absolute top-4 left-4 z-10 bg-[#0b1220]/90 border border-cyan-950 p-3 rounded shadow-md text-xs font-mono font-bold backdrop-blur">
                      <h4 className="text-[#00f0ff] uppercase tracking-wider">Tactical Gang Hierarchy Graph</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Visualizing complex structures & relationship extraction trails.</p>
                    </div>

                    {/* Nodes graph mapping */}
                    <div className="flex-1 w-full flex items-center justify-center">
                      <svg viewBox="0 0 800 500" className="w-full h-full select-none">
                        {/* Links */}
                        <line x1="200" y1="150" x2="400" y2="250" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="600" y1="150" x2="400" y2="250" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="2" />
                        <line x1="450" y1="350" x2="400" y2="250" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1.5" />
                        <line x1="200" y1="150" x2="100" y2="100" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="1" />
                        <line x1="600" y1="150" x2="700" y2="100" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" />
                        
                        {/* ACCUSED 1 (CRITICAL) */}
                        <g transform="translate(200, 150)" className="cursor-pointer" onClick={() => setSelectedNode({ label: "Ramesh Nayak", type: "CRITICAL TARGET", details: "Mugshot active. Modus Operandi matches Pulsar two-wheeler chain snatching networks in Bengaluru South range.", threat: "92%" })}>
                          <circle r="22" fill="#ff2e2e" opacity="0.85" stroke="#07090e" strokeWidth="2" />
                          <circle r="30" fill="none" stroke="#ff2e2e" strokeWidth="1" strokeDasharray="4 4" className="animate-spin" style={{ animationDuration: '8s' }} />
                          <text y="38" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold" className="font-mono">Ramesh Nayak</text>
                        </g>

                        {/* ACCUSED 2 (HIGH) */}
                        <g transform="translate(600, 150)" className="cursor-pointer" onClick={() => setSelectedNode({ label: "Munna Alias Bullet", type: "ELEVATED TARGET", details: "Active gang ringleader in sand smuggling operations across Hassan beat grid.", threat: "74%" })}>
                          <circle r="18" fill="#ff8c00" opacity="0.85" stroke="#07090e" strokeWidth="1.5" />
                          <text y="34" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold" className="font-mono">Munna 'Bullet'</text>
                        </g>

                        {/* ACCUSED 3 (NORMAL) */}
                        <g transform="translate(450, 350)" className="cursor-pointer" onClick={() => setSelectedNode({ label: "Karthik Gowda", type: "ACTIVE TARGET", details: "Digital arrest extortion mule account provider linked to cyber cell 14.", threat: "42%" })}>
                          <circle r="14" fill="#00f0ff" opacity="0.85" stroke="#07090e" strokeWidth="1.5" />
                          <text y="28" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold" className="font-mono">Karthik Gowda</text>
                        </g>

                        {/* CASE NODE CENTRAL */}
                        <g transform="translate(400, 250)" className="cursor-pointer" onClick={() => setSelectedNode({ label: "Syndicate Hub", type: "CENTRAL LINK", details: "Co-pilot database isolated link endpoint linking Hebbal and Vasanth Nagar beats.", threat: "85%" })}>
                          <rect x="-18" y="-18" width="36" height="36" fill="#090f1d" stroke="#00f0ff" strokeWidth="2" rx="4" />
                          <text y="28" textAnchor="middle" fill="text-[var(--accent-cyan)]" fontSize="9" fontWeight="extrabold" className="font-mono">BLR-HUB</text>
                        </g>
                      </svg>
                    </div>

                    <div className="p-4 border-t border-slate-950 bg-[#090d16]/80 flex justify-center gap-6 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#ff2e2e]"></span> <span>Critical Accused (Recidivist)</span></div>
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#ff8c00]"></span> <span>Elevated Suspect</span></div>
                      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#00f0ff]"></span> <span>Active Suspect</span></div>
                    </div>
                  </div>

                  {/* Sidebar dossiers detail panel */}
                  <div className="tactical-panel col-span-1 h-full p-6 flex flex-col justify-between overflow-y-auto border-slate-800 bg-[var(--card-bg)] text-left animate-fade-in-up delay-2">
                    {selectedNode ? (
                      <div className="space-y-6">
                        <div className="border-b border-slate-900 pb-3">
                          <span className="text-[8px] border border-cyan-900 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-[var(--accent-cyan)] bg-cyan-950/20">
                            {selectedNode.type} INTERRUPT
                          </span>
                          <h3 className="text-xl font-bold font-mono text-slate-200 mt-2 uppercase tracking-wide">{selectedNode.label}</h3>
                        </div>

                        {/* Mugshot Scan effect panel (Screenshot 5 Mugshot layout) */}
                        <div className="w-full h-40 bg-[#05070c] border border-cyan-950/60 rounded-md flex items-center justify-center overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,240,255,0.06)] to-transparent pointer-events-none animate-bounce" style={{ height: '30%', animationDuration: '3s' }}></div>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <div className="w-full border-t border-[var(--accent-cyan)] border-dashed"></div>
                            <div className="h-full border-l border-[var(--accent-cyan)] border-dashed absolute"></div>
                          </div>
                          
                          <svg viewBox="0 0 64 64" className="w-20 h-20 text-slate-700 animate-pulse">
                            <circle cx="32" cy="20" r="10" fill="currentColor" opacity="0.6" />
                            <path d="M16 50 C16 38 22 34 32 34 C42 34 48 38 48 50 Z" fill="currentColor" opacity="0.8" />
                          </svg>

                          <span className="absolute bottom-2 right-2 text-[8px] bg-red-950/60 border border-red-900/60 text-[var(--accent-red)] px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-widest">
                            TARGET SCAN ACTIVE
                          </span>
                        </div>

                        <div className="space-y-2 text-xs leading-relaxed font-mono">
                          <p className="text-slate-500 font-bold uppercase text-[8px]">Intelligence File</p>
                          <p className="text-slate-350 bg-[#05070c] p-3 border border-slate-900 rounded font-sans text-[11px] leading-relaxed">{selectedNode.details}</p>
                        </div>

                        {/* SVG threat circular gauge */}
                        <div className="space-y-3.5 animate-fade-in-up">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Recidivism Index</p>
                          <div className="flex items-center gap-4 bg-[#05070c] p-3.5 border border-slate-900 rounded">
                            <div className="relative h-14 w-14 flex items-center justify-center flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-900" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="text-[var(--accent-red)]" strokeWidth="3" strokeDasharray={`${selectedNode.threat.replace('%', '')}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              </svg>
                              <span className="absolute text-[11px] font-bold font-mono text-slate-200">{selectedNode.threat}</span>
                            </div>
                            <div className="text-[10px] leading-normal font-sans text-slate-400">
                              <span className="text-[var(--accent-red)] font-bold uppercase block tracking-wider text-[9px] mb-0.5">CRITICAL RE-OFFENSE THREAT</span>
                              Algorithm forecast indicates high risk of immediate range boundaries shift.
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                        <GitMerge className="w-10 h-10 text-slate-700 animate-pulse" />
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">Select Node Profile</h3>
                          <p className="text-[10.5px] text-slate-500 mt-1.5 w-64 leading-relaxed font-sans">Tap any accused, gang, or hub node on the hierarchy map to load their structural intelligence files.</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ======================================= */}
              {/* PAGE 7: ANALYTICS CENTER VIEW */}
              {/* ======================================= */}
              {activeTab === 'analytics' && (
                <div className="tactical-panel w-full max-w-4xl mx-auto p-8 space-y-8 bg-[var(--card-bg)] border-slate-900 text-left animate-fade-in-up">
                  <div>
                    <h2 className="text-xl font-bold tracking-wider title-tactical border-b border-slate-950 pb-2 text-slate-250">Comparative Crime Trends & Analytics</h2>
                    <p className="text-xs text-slate-500 mt-1">Cross-analyzing historical KSP metrics loaded from 2024 vs 2025 comparative datasets.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 items-start animate-fade-in-up">
                    
                    {/* Bar Chart Representation */}
                    <div className="bg-[#05070c] border border-slate-900 p-6 rounded-lg space-y-4 font-mono animate-fade-in-up delay-1">
                      <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-900 pb-2">I. SLL / IPC Aggregated comparison</h4>
                      
                      <div className="space-y-4 pt-2 animate-fade-in-up">
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Cyber Crimes (extortions, phishing)</span>
                            <span className="text-[var(--accent-red)] font-bold">21,981 vs 16,370</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-[var(--accent-red)] h-full w-[80%] rounded-full animate-pulse"></div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Larceny / Theft (two-wheeler, gold snatching)</span>
                            <span className="text-[var(--accent-cyan)] font-bold">22,849 vs 20,531</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-[var(--accent-cyan)] h-full w-[70%] rounded-full animate-pulse"></div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Homicide / Murder (violent quarrel)</span>
                            <span className="text-orange-400 font-bold">1,209 vs 1,210</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-orange-400 h-full w-[45%] rounded-full animate-pulse"></div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* AI Observations Textbox */}
                    <div className="bg-[#05070c] border border-cyan-950 p-6 rounded-lg space-y-4 font-mono animate-fade-in-up delay-2">
                      <h4 className="text-[10px] text-[var(--accent-cyan)] font-bold uppercase tracking-wider border-b border-cyan-950/20 pb-2">II. AI Observational Spikes</h4>
                      <p className="text-[11px] leading-relaxed text-slate-400 font-sans">
                        Comparative CSV logs verify an exponential decline in typical larceny and physical cheating indices (-10.1% and -11.3% respectively). 
                        Conversely, advanced **online extortion layering networks** (digital arrests, part-time reviewer task systems, courier overlays) 
                        have spiked dramatically across Bengaluru and Mysuru urban divisions.
                      </p>
                      <div className="bg-cyan-950/10 border border-cyan-900/60 p-3 rounded text-[10px] text-slate-350 leading-relaxed font-sans animate-glow-cyan-pulse">
                        <strong>Deployment Advisory:</strong> Circle commanders are instructed to redirect personnel beats from physical intersections to cyber terminal cells.
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* PAGE 8B: TEAM VIEW */}
              {/* ======================================= */}
              {activeTab === 'team' && (
                <div className="space-y-8 animate-fade-in-up">

                  {/* Team header */}
                  <div className="text-center space-y-3 pb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] text-[10px] font-mono uppercase tracking-widest text-[var(--accent-cyan)] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-cyan)] animate-ping"></span>
                      DATATHON 2026 — TEAM PROFILE
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-wider title-tactical text-white">CrimeGPT KSP Team</h2>
                    <p className="text-slate-400 text-xs max-w-xl mx-auto font-sans leading-relaxed">
                      Building the next-generation Intelligent Conversational AI for Karnataka State Police Crime Database.
                    </p>
                  </div>

                  {/* Team name badge */}
                  <div className="tactical-panel max-w-2xl mx-auto p-5 bg-gradient-to-r from-cyan-950/30 via-[#0b1220] to-[#0b1220] border-cyan-900/50 glow-cyan flex items-center gap-5 animate-fade-in-up">
                    <AppLogo size="lg" />
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Team Name</p>
                      <h3 className="text-xl font-extrabold font-mono text-white tracking-wide">CrimeGPT KSP</h3>
                      <p className="text-xs text-[var(--accent-cyan)] font-mono mt-0.5">Intelligent Conversational AI for KSP Crime Database</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="px-3 py-1 rounded-full bg-[var(--accent-cyan)] text-[#07090e] text-[9px] font-extrabold uppercase tracking-widest">DATATHON 2026</span>
                    </div>
                  </div>

                  {/* Team members grid */}
                  <div className="grid grid-cols-3 gap-6 animate-fade-in-up delay-1">

                    {/* Member 1 - Ranjeet Kumar (Team Leader) */}
                    <div className="tactical-panel p-6 bg-[var(--card-bg)] border-cyan-900/40 space-y-4 hover:border-[var(--accent-cyan)] transition-all duration-300 animate-fade-in-up delay-1 group">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-[var(--accent-cyan)] flex items-center justify-center flex-shrink-0 group-hover:border-cyan-400 transition shadow-lg" style={{boxShadow:'0 0 15px rgba(0,240,255,0.2)'}}>
                          <span className="text-2xl font-black text-[var(--accent-cyan)] font-mono">R</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-sm text-slate-200 font-mono tracking-wide">Ranjeet Kumar</h4>
                            <Award className="w-4 h-4 text-yellow-400" title="Team Leader" />
                          </div>
                          <span className="inline-block px-2 py-0.5 mt-1 rounded bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)] text-[9px] font-bold uppercase tracking-wider">Team Leader</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-[11px] font-mono">
                        <div className="flex items-center gap-2 text-[var(--accent-cyan)]">
                          <Brain className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>AI/ML Development</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>System Architecture</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Star className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Presentation & Strategy</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-900 pt-3">
                        <a href="mailto:rajranjeet7680@gmail.com" className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-[var(--accent-cyan)] transition font-mono">
                          <Mail className="w-3.5 h-3.5" />
                          rajranjeet7680@gmail.com
                        </a>
                      </div>

                      <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                        AI Models · RAG Pipeline · NLP · Scikit-Learn
                      </div>
                    </div>

                    {/* Member 2 - Shashank H E */}
                    <div className="tactical-panel p-6 bg-[var(--card-bg)] border-slate-800 space-y-4 hover:border-[var(--accent-cyan)] transition-all duration-300 animate-fade-in-up delay-2 group">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-2 border-purple-500/40 flex items-center justify-center flex-shrink-0 group-hover:border-[var(--accent-cyan)] transition shadow-lg" style={{boxShadow:'0 0 15px rgba(139,92,246,0.15)'}}>
                          <span className="text-2xl font-black text-purple-400 font-mono">S</span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-200 font-mono tracking-wide">Shashank H E</h4>
                          <span className="inline-block px-2 py-0.5 mt-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-bold uppercase tracking-wider">Frontend Dev</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-[11px] font-mono">
                        <div className="flex items-center gap-2 text-purple-400">
                          <Code2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Frontend Development</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>UI/UX Design</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Dashboard & Visualizations</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-900 pt-3">
                        <a href="mailto:heshashank789@gmail.com" className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-[var(--accent-cyan)] transition font-mono">
                          <Mail className="w-3.5 h-3.5" />
                          heshashank789@gmail.com
                        </a>
                      </div>

                      <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                        React · Vite · CSS · Leaflet Maps
                      </div>
                    </div>

                    {/* Member 3 - Vivek Boini */}
                    <div className="tactical-panel p-6 bg-[var(--card-bg)] border-slate-800 space-y-4 hover:border-[var(--accent-cyan)] transition-all duration-300 animate-fade-in-up delay-3 group">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-2 border-emerald-500/40 flex items-center justify-center flex-shrink-0 group-hover:border-[var(--accent-cyan)] transition shadow-lg" style={{boxShadow:'0 0 15px rgba(16,185,129,0.15)'}}>
                          <span className="text-2xl font-black text-emerald-400 font-mono">V</span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-200 font-mono tracking-wide">Vivek Boini</h4>
                          <span className="inline-block px-2 py-0.5 mt-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">Backend Dev</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-[11px] font-mono">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Server className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Backend Development</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Database className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Database Management</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Security & Authentication</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-900 pt-3">
                        <a href="mailto:vivekboini15@gmail.com" className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-[var(--accent-cyan)] transition font-mono">
                          <Mail className="w-3.5 h-3.5" />
                          vivekboini15@gmail.com
                        </a>
                      </div>

                      <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                        FastAPI · SQLite · Python · REST APIs
                      </div>
                    </div>

                  </div>

                  {/* Contribution table */}
                  <div className="tactical-panel max-w-3xl mx-auto p-6 bg-[var(--card-bg)] border-slate-900 space-y-4 animate-fade-in-up delay-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono border-b border-slate-900 pb-2">📊 Team Contribution Matrix</h4>
                    <div className="space-y-3 text-[11px] font-mono">

                      <div className="grid grid-cols-3 gap-4 text-[9px] text-slate-500 font-bold uppercase tracking-wider pb-2 border-b border-slate-900">
                        <span>Member</span>
                        <span>Primary Role</span>
                        <span>Contribution Weight</span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-slate-900/60">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 flex items-center justify-center text-[var(--accent-cyan)] font-bold text-[9px]">R</span>
                          <span className="text-slate-200">Ranjeet Kumar</span>
                        </div>
                        <span className="text-[var(--accent-cyan)]">AI Models, RAG Pipeline, NLP</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[var(--accent-cyan)] h-full w-[85%] rounded-full"></div>
                          </div>
                          <span className="text-slate-400 text-[9px]">85%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-slate-900/60">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-[9px]">S</span>
                          <span className="text-slate-200">Shashank H E</span>
                        </div>
                        <span className="text-purple-400">React Frontend, UI/UX, Visualizations</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full w-[80%] rounded-full"></div>
                          </div>
                          <span className="text-slate-400 text-[9px]">80%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[9px]">V</span>
                          <span className="text-slate-200">Vivek Boini</span>
                        </div>
                        <span className="text-emerald-400">FastAPI Backend, Database, Security</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[75%] rounded-full"></div>
                          </div>
                          <span className="text-slate-400 text-[9px]">75%</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Tech stack */}
                  <div className="tactical-panel max-w-3xl mx-auto p-6 bg-[var(--card-bg)] border-slate-900 space-y-4 animate-fade-in-up delay-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono border-b border-slate-900 pb-2">🛠️ Technology Stack</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Python FastAPI', color: 'text-emerald-400', border: 'border-emerald-900/40' },
                        { label: 'React + Vite', color: 'text-[var(--accent-cyan)]', border: 'border-cyan-900/40' },
                        { label: 'SQLite FTS5', color: 'text-orange-400', border: 'border-orange-900/40' },
                        { label: 'Scikit-Learn', color: 'text-purple-400', border: 'border-purple-900/40' },
                        { label: 'Leaflet Maps', color: 'text-[#00ff66]', border: 'border-green-900/40' },
                        { label: 'Gemini AI', color: 'text-[var(--accent-cyan)]', border: 'border-cyan-900/40' },
                        { label: 'RAG Pipeline', color: 'text-orange-400', border: 'border-orange-900/40' },
                        { label: 'KSP Datasets', color: 'text-[var(--accent-red)]', border: 'border-red-900/40' },
                      ].map((tech, i) => (
                        <div key={i} className={`bg-[#05070c] border ${tech.border} rounded p-2.5 text-center`}>
                          <span className={`text-[10px] font-mono font-bold ${tech.color}`}>{tech.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================= */}
              {/* PAGE 8: REPORTS CENTER VIEW */}
              {/* ======================================= */}
              {activeTab === 'reports' && (
                <div className="tactical-panel w-full max-w-4xl mx-auto p-8 space-y-8 bg-[var(--card-bg)] border-slate-900 text-left animate-fade-in-up">
                  <div>
                    <h2 className="text-xl font-bold tracking-wider title-tactical border-b border-slate-950 pb-2 text-slate-200">Reports Compiler Center</h2>
                    <p className="text-xs text-slate-500 mt-1">One-click secure compiler generating confidential case briefs and trend spreadsheets.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 items-start animate-fade-in-up">
                    
                    <div className="space-y-6 font-mono text-xs animate-fade-in-up delay-1">
                      
                      <div className="space-y-2 animate-fade-in-up">
                        <label className="text-slate-455 uppercase font-bold text-[9px]">Select Export Focus</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button className="tactical-panel p-4 bg-[#0a101d] border-cyan-950 hover:border-[var(--accent-cyan)] text-slate-300 text-left space-y-1">
                            <span className="font-bold text-[var(--accent-cyan)] block text-[11px]">Hotspot Report</span>
                            <span className="text-[9px] text-slate-500 font-normal">Geospatial stats brief</span>
                          </button>
                          <button className="tactical-panel p-4 bg-slate-950 border-slate-900 hover:border-[var(--accent-cyan)] text-slate-300 text-left space-y-1">
                            <span className="font-bold text-slate-455 block text-[11px]">FIR Narrative</span>
                            <span className="text-[9px] text-slate-500 font-normal">Typewriter record brief</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 animate-fade-in-up delay-1">
                        <label className="text-slate-455 uppercase font-bold text-[9px]">Compiled Formats</label>
                        <div className="flex gap-4">
                          <button onClick={() => triggerAlert("INFO", "Exporting confidential PDF Briefing...")} className="bg-[var(--accent-cyan)] text-[#07090e] px-4 py-2.5 rounded font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 hover:bg-cyan-400 transition cursor-pointer animate-glow-cyan-pulse"><Download className="w-4 h-4" /> Download PDF</button>
                          <button onClick={() => triggerAlert("INFO", "Compiling CSV Excel spreadsheet...")} className="px-4 py-2.5 border border-slate-800 rounded bg-[#05070c] hover:bg-slate-950 hover:text-white transition text-[10px] font-bold flex items-center gap-1.5 uppercase cursor-pointer"><FileSpreadsheet className="w-4 h-4" /> Export CSV</button>
                        </div>
                      </div>

                    </div>

                    <div className="bg-[#05070c] border border-slate-900 rounded p-6 space-y-4 font-mono text-[10px] leading-relaxed text-slate-400 animate-fade-in-up delay-2">
                      <div className="text-center border-b border-slate-900 pb-3 space-y-0.5">
                        <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[11px]">Karnataka State Police</h4>
                        <p className="text-slate-650 text-[9px]">RESTRICTED ACCESS PORTFOLIO</p>
                      </div>
                      <p><strong>REPORT:</strong> DEC TACTICAL OVERVIEW</p>
                      <p><strong>GENERATED:</strong> {new Date().toLocaleDateString()}</p>
                      <p><strong>SECURITY AUDIT:</strong> SHA256-8A3F9C7D APPROVED</p>
                      <div className="h-1 border-t border-dashed border-slate-900 mt-2"></div>
                    </div>

                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* PAGE 9: CONFIG / SYSTEM SETTINGS VIEW */}
              {/* ======================================= */}
              {activeTab === 'settings' && (
                <div className="tactical-panel w-full max-w-xl mx-auto p-8 space-y-8 bg-[var(--card-bg)] border-slate-900 text-left animate-fade-in-up">
                  <div>
                    <h2 className="text-xl font-bold tracking-wider title-tactical border-b border-[var(--border-color)] pb-2 text-slate-200">Precinct Codex Config</h2>
                    <p className="text-xs text-slate-500 mt-1">Configure interface color profiles, sound synthesizers, and operational scales.</p>
                  </div>

                  <div className="space-y-6 text-xs font-mono animate-fade-in-up">
                    <div className="space-y-3">
                      <label className="text-slate-500 uppercase font-bold text-[9px] block">Console Interface Theme Codex</label>
                      <div className="flex flex-wrap gap-4 animate-fade-in-up">
                        <button 
                          onClick={() => setTheme('obsidian')} 
                          className={`px-4 py-2 border rounded font-bold transition cursor-pointer ${theme === 'obsidian' ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[#0d1425]/40' : 'border-slate-800 text-slate-500 bg-[#05070c]'}`}
                        >
                          Obsidian Onyx (Default Dark)
                        </button>
                        <button 
                          onClick={() => setTheme('cyber_blue')} 
                          className={`px-4 py-2 border rounded font-bold transition cursor-pointer ${theme === 'cyber_blue' ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[#0a1833]/40' : 'border-slate-800 text-slate-500 bg-[#05070c]'}`}
                        >
                          Cyber Cobalt (Neon Blue)
                        </button>
                        <button 
                          onClick={() => setTheme('day_mode')} 
                          className={`px-4 py-2 border rounded font-bold transition cursor-pointer ${theme === 'day_mode' ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-slate-100' : 'border-slate-850 text-slate-500 bg-[#05070c]'}`}
                        >
                          Tactical Day Mode (High Light)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-950 animate-fade-in-up">
                      <div className="space-y-2">
                        <label className="text-slate-500 uppercase font-bold text-[9px] block">Operational Language</label>
                        <select 
                          value={language} 
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-[#05070c] border border-slate-900 rounded px-3 py-2 text-slate-300 focus:outline-none"
                        >
                          <option value="English">English (India)</option>
                          <option value="Kannada">ಕನ್ನಡ (ಕರ್ನಾಟಕ)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-500 uppercase font-bold text-[9px] block">Speech synthesis feedback</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSpeechEnabled(true)} 
                            className={`flex-1 py-2 border rounded font-bold transition cursor-pointer ${speechEnabled ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-cyan-950/20' : 'border-slate-850 text-slate-500 bg-[#05070c]'}`}
                          >
                            ACTIVE
                          </button>
                          <button 
                            onClick={() => setSpeechEnabled(false)} 
                            className={`flex-1 py-2 border rounded font-bold transition cursor-pointer ${!speechEnabled ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-cyan-950/20' : 'border-slate-850 text-slate-500 bg-[#05070c]'}`}
                          >
                            MUTED
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>

        </div>
      )}

    </div>
  )
}

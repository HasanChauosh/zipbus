"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, ArrowLeftRight, ArrowRight, Clock, Shield, Zap, Phone, Mail, MessageCircle, Star, ChevronRight, Users, CheckCircle, Bell } from "lucide-react"

const CITIES = ["Koppal", "Hubli", "Hospet", "Bangalore", "Mysore", "Adoni", "Tirupati", "Hampi", "Bellary", "Davangere"]

const POPULAR_ROUTES = [
  { from: "Koppal", to: "Bangalore", duration: "7h 30m", from_price: "₹500", image: "/images/bangalore.jpg", buses: 3 },
  { from: "Hubli", to: "Bangalore", duration: "8h 15m", from_price: "₹700", image: "/images/hubli.jpg", buses: 5 },
  { from: "Hospet", to: "Bangalore", duration: "7h 45m", from_price: "₹900", image: "/images/hospet.jpg", buses: 4 },
  { from: "Bangalore", to: "Mysore", duration: "3h 00m", from_price: "₹350", image: "/images/mysore.jpg", buses: 8 },
]

const OPERATORS = [
  { name: "Greenline Travels", rating: 4.3, trips: "10K+", type: "AC Sleeper" },
  { name: "VRL Travels", rating: 4.5, trips: "25K+", type: "AC Sleeper" },
  { name: "Pooja Travels", rating: 4.1, trips: "8K+", type: "AC Seater" },
  { name: "KSRTC Karnataka", rating: 3.9, trips: "50K+", type: "Non-AC" },
]

const TESTIMONIALS = [
  { name: "Rahul M.", city: "Koppal", text: "Got a call exactly 30 minutes before my bus. Never missed a bus since I started using ZipBus.", rating: 5, route: "Koppal → Bangalore" },
  { name: "Priya S.", city: "Hubli", text: "The seat selection is so smooth. Booked for my parents and the reminder call made sure they didn't miss it.", rating: 5, route: "Hubli → Bangalore" },
  { name: "Kiran B.", city: "Bangalore", text: "Finally a bus app that actually reminds you. The automated call feature is a game changer.", rating: 5, route: "Bangalore → Mysore" },
]

const OFFERS = [
  { code: "FIRST100", desc: "₹100 off on your first booking", color: "#7C3AED", bg: "#EDE9FE", label: "New User" },
  { code: "WEEKEND50", desc: "₹50 off on weekend travel", color: "#0369A1", bg: "#E0F2FE", label: "Weekend" },
  { code: "RETURN150", desc: "₹150 off on return tickets", color: "#065F46", bg: "#D1FAE5", label: "Return" },
]

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, visible } = useScrollReveal()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = target / 40
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 30)
    return () => clearInterval(timer)
  }, [visible, target])
  return <span ref={ref}>{count}{suffix}</span>
}

export default function HomePage() {
  const router = useRouter()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState("")
  const [fromSug, setFromSug] = useState<string[]>([])
  const [toSug, setToSug] = useState<string[]>([])
  const [copied, setCopied] = useState("")
  const [scrolled, setScrolled] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const filter = (v: string) => CITIES.filter(c => c.toLowerCase().startsWith(v.toLowerCase()) && c !== v)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!from || !to || !date) return
    router.push(`/search?source=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&date=${date}`)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(""), 2000)
  }

  return (
    <main style={{ fontFamily: "var(--font-inter, sans-serif)", background: "#09090B", minHeight: "100vh", margin: 0, overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.4);opacity:0} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        .inp:focus { outline:none !important; border-color:#F97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.15) !important; }
        .inp::placeholder { color:#52525B; }
        .sug:hover { background:rgba(249,115,22,0.1) !important; color:#F97316 !important; }
        .swap:hover { background:#F97316 !important; color:#fff !important; border-color:#F97316 !important; }
        .sbtn:hover { background:#C2530A !important; box-shadow:0 0 30px rgba(249,115,22,0.4) !important; }
        .rcard:hover { transform:translateY(-6px) scale(1.02) !important; }
        .rcard:hover .roverlay { background:rgba(0,0,0,0.2) !important; }
        .opcard:hover { border-color:rgba(249,115,22,0.4) !important; background:rgba(249,115,22,0.04) !important; }
        .cpbtn:hover { background:#F97316 !important; color:#fff !important; border-color:#F97316 !important; }
        .footer-link:hover { color:#F97316 !important; }
        .nav-link:hover { color:#fff !important; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#09090B; } ::-webkit-scrollbar-thumb { background:#27272A; border-radius:3px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:68, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 3rem", background: scrolled ? "rgba(9,9,11,0.95)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none", transition:"all 0.3s ease" }}>
        <a href="/" style={{ fontFamily:"var(--font-syne, sans-serif)", fontWeight:800, fontSize:"1.5rem", color:"#F97316", letterSpacing:"-0.04em", textDecoration:"none" }}>
          zip<span style={{ color:"#fff" }}>bus</span>
        </a>
        <div style={{ display:"flex", gap:"2rem", alignItems:"center" }}>
          {[["Home", "/"], ["Routes", "/search?source=Koppal&destination=Bangalore&date=2026-06-17"], ["My Trips", "/dashboard"], ["Offers", "#offers"]].map(([label, href]) => (
            <a key={label} href={href} className="nav-link" style={{ color:"rgba(255,255,255,0.55)", textDecoration:"none", fontSize:"0.88rem", fontWeight:500, transition:"color 0.2s" }}>{label}</a>
          ))}
        </div>
        <div style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
          <a href="/sign-in" style={{ color:"rgba(255,255,255,0.6)", textDecoration:"none", fontSize:"0.88rem", fontWeight:500, padding:"0.4rem 1rem" }}>Login</a>
          <a href="/sign-up" style={{ background:"linear-gradient(135deg,#F97316,#EA580C)", color:"#fff", textDecoration:"none", padding:"0.5rem 1.25rem", borderRadius:"10px", fontSize:"0.88rem", fontWeight:700, boxShadow:"0 0 20px rgba(249,115,22,0.3)" }}>Get Started</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", background:"linear-gradient(160deg,#09090B 0%,#0f1729 40%,#0c1a3a 70%,#09090B 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 1.5rem 5rem", position:"relative", overflow:"hidden" }}>

        {/* Glow orbs */}
        <div style={{ position:"absolute", top:"20%", left:"15%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"10%", right:"10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.06) 0%,transparent 70%)", pointerEvents:"none" }} />

        {/* Grid pattern */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }} />

        <div style={{ textAlign:"center", maxWidth:860, animation:"fadeUp 0.6s ease forwards", position:"relative", zIndex:1 }}>

          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:"rgba(249,115,22,0.08)", border:"1px solid rgba(249,115,22,0.2)", borderRadius:999, padding:"0.35rem 1.1rem", marginBottom:"2rem" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#F97316", boxShadow:"0 0 8px #F97316", animation:"pulse-ring 2s infinite" }} />
            <span style={{ color:"#F97316", fontSize:"0.75rem", fontWeight:700, letterSpacing:"0.08em" }}>INDIA'S FIRST AUTOMATED BOARDING REMINDER PLATFORM</span>
          </div>

          <h1 style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"clamp(3rem,7vw,5.5rem)", fontWeight:800, color:"#fff", lineHeight:1.05, letterSpacing:"-0.04em", marginBottom:"1.5rem" }}>
            Bus tickets across<br />
            <span style={{ background:"linear-gradient(135deg,#F97316,#FB923C)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Karnataka,</span> simplified.
          </h1>

          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"1.1rem", lineHeight:1.8, maxWidth:500, margin:"0 auto 3rem" }}>
            Compare operators, pick your seat, and never miss a bus — we call you automatically before every departure.
          </p>
        </div>

        {/* SEARCH FORM */}
        <div style={{ width:"100%", maxWidth:780, position:"relative", zIndex:1, animation:"fadeUp 0.75s ease forwards" }}>
          <div style={{ position:"absolute", inset:-1, borderRadius:22, background:"linear-gradient(135deg,rgba(249,115,22,0.3),rgba(59,130,246,0.1),rgba(249,115,22,0.1))", filter:"blur(1px)" }} />
          <form onSubmit={handleSearch} style={{ position:"relative", background:"rgba(24,24,27,0.95)", backdropFilter:"blur(20px)", borderRadius:20, padding:"1.75rem", border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 44px 1fr 1fr", gap:"0.75rem", alignItems:"end", marginBottom:"1rem" }}>

              {/* FROM */}
              <div style={{ position:"relative" }}>
                <label style={{ fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:8 }}>From</label>
                <div style={{ position:"relative" }}>
                  <MapPin size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#F97316", pointerEvents:"none" }} />
                  <input className="inp" value={from} placeholder="Departure city"
                    onChange={e => { setFrom(e.target.value); setFromSug(filter(e.target.value)) }}
                    onBlur={() => setTimeout(() => setFromSug([]), 150)}
                    style={{ width:"100%", padding:"0.75rem 0.75rem 0.75rem 2rem", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, fontSize:"0.92rem", fontWeight:500, color:"#fff", transition:"all 0.2s" }} />
                  {fromSug.length > 0 && (
                    <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"#18181B", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, zIndex:20, overflow:"hidden", boxShadow:"0 20px 40px rgba(0,0,0,0.5)" }}>
                      {fromSug.map(c => <div key={c} className="sug" onMouseDown={() => { setFrom(c); setFromSug([]) }} style={{ padding:"0.65rem 1rem", cursor:"pointer", fontSize:"0.88rem", color:"rgba(255,255,255,0.7)", transition:"all 0.15s" }}>{c}</div>)}
                    </div>
                  )}
                </div>
              </div>

              {/* SWAP */}
              <button type="button" className="swap" onClick={() => { setFrom(to); setTo(from) }}
                style={{ padding:"0.75rem", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, background:"rgba(255,255,255,0.05)", cursor:"pointer", color:"rgba(255,255,255,0.4)", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", alignSelf:"flex-end" }}>
                <ArrowLeftRight size={15} />
              </button>

              {/* TO */}
              <div style={{ position:"relative" }}>
                <label style={{ fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:8 }}>To</label>
                <div style={{ position:"relative" }}>
                  <MapPin size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#F97316", pointerEvents:"none" }} />
                  <input className="inp" value={to} placeholder="Destination city"
                    onChange={e => { setTo(e.target.value); setToSug(filter(e.target.value)) }}
                    onBlur={() => setTimeout(() => setToSug([]), 150)}
                    style={{ width:"100%", padding:"0.75rem 0.75rem 0.75rem 2rem", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, fontSize:"0.92rem", fontWeight:500, color:"#fff", transition:"all 0.2s" }} />
                  {toSug.length > 0 && (
                    <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"#18181B", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, zIndex:20, overflow:"hidden", boxShadow:"0 20px 40px rgba(0,0,0,0.5)" }}>
                      {toSug.map(c => <div key={c} className="sug" onMouseDown={() => { setTo(c); setToSug([]) }} style={{ padding:"0.65rem 1rem", cursor:"pointer", fontSize:"0.88rem", color:"rgba(255,255,255,0.7)", transition:"all 0.15s" }}>{c}</div>)}
                    </div>
                  )}
                </div>
              </div>

              {/* DATE */}
              <div>
                <label style={{ fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Travel Date</label>
                <div style={{ position:"relative" }}>
                  <Calendar size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#F97316", pointerEvents:"none" }} />
                  <input type="date" className="inp" value={date} min={today} onChange={e => setDate(e.target.value)}
                    style={{ width:"100%", padding:"0.75rem 0.75rem 0.75rem 2rem", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, fontSize:"0.92rem", fontWeight:500, color:"#fff", transition:"all 0.2s", colorScheme:"dark" }} />
                </div>
              </div>
            </div>

            <button type="submit" className="sbtn" style={{ width:"100%", padding:"1rem", background:"linear-gradient(135deg,#F97316,#EA580C)", color:"#fff", border:"none", borderRadius:14, fontSize:"1rem", fontWeight:700, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", boxShadow:"0 0 20px rgba(249,115,22,0.25)" }}>
              Search Buses <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* STATS */}
        <div style={{ display:"flex", gap:"3rem", marginTop:"3rem", zIndex:1, animation:"fadeUp 0.9s ease forwards" }}>
          {[["15+", "Bus operators"], ["50+", "Daily routes"], ["₹0", "Booking fees"], ["2x", "Reminders per trip"]].map(([num, label]) => (
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"1.6rem", fontWeight:800, color:"#fff" }}>{num}</div>
              <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.3)", marginTop:3, letterSpacing:"0.04em" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background:"#09090B", padding:"6rem 2rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <RevealSection>
            <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#F97316", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8, textAlign:"center" }}>HOW IT WORKS</p>
            <h2 style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:800, color:"#fff", letterSpacing:"-0.03em", marginBottom:"3.5rem", textAlign:"center" }}>
              Three steps to your seat.
            </h2>
          </RevealSection>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
            {[
              { step:"01", icon:<MapPin size={24} color="#F97316" />, title:"Search your route", desc:"Enter source, destination and date. See all available buses with real-time seat availability." },
              { step:"02", icon:<CheckCircle size={24} color="#F97316" />, title:"Pick seat & pay", desc:"Choose your preferred seat — upper or lower berth. Seat is locked for 10 minutes while you pay." },
              { step:"03", icon:<Bell size={24} color="#F97316" />, title:"We remind you", desc:"Automatic voice call 30 minutes before departure and again at 15 minutes. Never miss your bus." },
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 120}>
                <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"2rem", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:"1rem", right:"1.25rem", fontFamily:"var(--font-mono, monospace)", fontSize:"3rem", fontWeight:800, color:"rgba(255,255,255,0.03)", lineHeight:1 }}>{item.step}</div>
                  <div style={{ width:52, height:52, borderRadius:14, background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem" }}>{item.icon}</div>
                  <h3 style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"1.05rem", fontWeight:800, color:"#fff", marginBottom:"0.6rem" }}>{item.title}</h3>
                  <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.88rem", lineHeight:1.75 }}>{item.desc}</p>
                  {i < 2 && <div style={{ position:"absolute", top:"2.5rem", right:"-1.5rem", width:50, height:1, background:"linear-gradient(to right,rgba(249,115,22,0.4),transparent)", display:"none" }} />}
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ── */}
      <section style={{ background:"#09090B", padding:"5rem 2rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <RevealSection>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"2rem" }}>
              <div>
                <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#F97316", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>POPULAR ROUTES</p>
                <h2 style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"clamp(1.8rem,3vw,2.4rem)", fontWeight:800, color:"#fff", letterSpacing:"-0.03em" }}>Where are you headed?</h2>
              </div>
              <a href="/search?source=Koppal&destination=Bangalore&date=2026-06-17" style={{ display:"flex", alignItems:"center", gap:"0.4rem", color:"#F97316", textDecoration:"none", fontSize:"0.85rem", fontWeight:600 }}>
                View all routes <ChevronRight size={15} />
              </a>
            </div>
          </RevealSection>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"1rem" }}>
            {POPULAR_ROUTES.map((r, i) => (
              <RevealSection key={i} delay={i * 80}>
                <button className="rcard"
                  onClick={() => { setFrom(r.from); setTo(r.to); window.scrollTo({ top:0, behavior:"smooth" }) }}
                  style={{ width:"100%", border:"none", borderRadius:18, overflow:"hidden", cursor:"pointer", textAlign:"left", padding:0, position:"relative", height:220, background:"#111", transition:"all 0.3s ease", boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
                  <div style={{ position:"absolute", inset:0, backgroundImage:`url(${r.image})`, backgroundSize:"cover", backgroundPosition:"center" }} />
                  <div className="roverlay" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", transition:"all 0.3s" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 60%)" }} />
                  <div style={{ position:"absolute", inset:0, padding:"1.25rem", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ background:"rgba(255,255,255,0.1)", backdropFilter:"blur(8px)", color:"#fff", fontSize:"0.7rem", fontWeight:700, padding:"0.25rem 0.65rem", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)" }}>{r.buses} buses</span>
                      <span style={{ fontFamily:"var(--font-mono, monospace)", fontSize:"1rem", fontWeight:700, color:"#FB923C", background:"rgba(0,0,0,0.4)", backdropFilter:"blur(8px)", padding:"0.2rem 0.6rem", borderRadius:8 }}>{r.from_price}</span>
                    </div>
                    <div>
                      <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.55)", marginBottom:3 }}>{r.from}</div>
                      <div style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"1.2rem", fontWeight:800, color:"#fff" }}>→ {r.to}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:4, color:"rgba(255,255,255,0.45)", fontSize:"0.75rem", marginTop:5 }}>
                        <Clock size={11} /> {r.duration}
                      </div>
                    </div>
                  </div>
                </button>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPERATORS ── */}
      <section style={{ background:"#0A0A0D", padding:"5rem 2rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <RevealSection>
            <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#F97316", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8, textAlign:"center" }}>TRUSTED OPERATORS</p>
            <h2 style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"clamp(1.8rem,3vw,2.4rem)", fontWeight:800, color:"#fff", letterSpacing:"-0.03em", marginBottom:"2.5rem", textAlign:"center" }}>Karnataka's top bus operators</h2>
          </RevealSection>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"1rem" }}>
            {OPERATORS.map((op, i) => (
              <RevealSection key={i} delay={i * 80}>
                <div className="opcard" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"1.5rem", transition:"all 0.25s", cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,rgba(249,115,22,0.2),rgba(249,115,22,0.05))", border:"1px solid rgba(249,115,22,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-syne, sans-serif)", fontWeight:800, fontSize:"0.9rem", color:"#F97316" }}>
                      {op.name.split(" ").map(w => w[0]).slice(0,2).join("")}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#F59E0B" }}>{op.rating}</span>
                    </div>
                  </div>
                  <h3 style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"0.95rem", fontWeight:800, color:"#fff", marginBottom:4 }}>{op.name}</h3>
                  <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.35)", marginBottom:"0.75rem" }}>{op.type}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Users size={11} color="rgba(255,255,255,0.3)" />
                    <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.3)" }}>{op.trips} trips completed</span>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── REMINDER FEATURE HIGHLIGHT ── */}
      <section style={{ background:"#09090B", padding:"6rem 2rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }}>
          <RevealSection>
            <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#F97316", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>THE ZIPBUS DIFFERENCE</p>
            <h2 style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:800, color:"#fff", letterSpacing:"-0.03em", lineHeight:1.15, marginBottom:"1.5rem" }}>
              We call every passenger.<br />
              <span style={{ background:"linear-gradient(135deg,#F97316,#FB923C)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Automatically.</span>
            </h2>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.95rem", lineHeight:1.8, marginBottom:"2rem" }}>
              Bus drivers spend 20 minutes before every departure manually calling passengers. We automate that entirely — every passenger gets a voice call at T-30 and T-15 minutes, powered by BullMQ job queues and Twilio.
            </p>
            {[
              "Automated voice call at 30 minutes before departure",
              "Follow-up call at 15 minutes for safety",
              "Email confirmation with ticket details",
              "Zero manual effort from operators",
            ].map((point, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.75rem" }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <CheckCircle size={11} color="#F97316" />
                </div>
                <span style={{ fontSize:"0.88rem", color:"rgba(255,255,255,0.6)" }}>{point}</span>
              </div>
            ))}
          </RevealSection>

          {/* Visual phone mockup */}
          <RevealSection delay={200}>
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:24, padding:"2rem", position:"relative" }}>
              <div style={{ position:"absolute", inset:-1, borderRadius:24, background:"linear-gradient(135deg,rgba(249,115,22,0.15),transparent,rgba(249,115,22,0.05))", pointerEvents:"none" }} />
              {[
                { time:"T - 30min", type:"Voice Call", msg:"Calling passenger...", status:"SENT", color:"#22C55E" },
                { time:"T - 15min", type:"Voice Call", msg:"Calling passenger...", status:"SENT", color:"#22C55E" },
                { time:"Booking", type:"Email", msg:"Ticket confirmation sent", status:"DELIVERED", color:"#3B82F6" },
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"1rem", background:"rgba(255,255,255,0.03)", borderRadius:12, marginBottom:"0.75rem", border:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width:40, height:40, borderRadius:10, background: i === 2 ? "rgba(59,130,246,0.1)" : "rgba(249,115,22,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {i === 2 ? <Mail size={16} color="#3B82F6" /> : <Phone size={16} color="#F97316" />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                      <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#fff" }}>{item.type}</span>
                      <span style={{ fontFamily:"var(--font-mono, monospace)", fontSize:"0.7rem", color:"rgba(255,255,255,0.3)" }}>{item.time}</span>
                    </div>
                    <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.4)" }}>{item.msg}</span>
                  </div>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:item.color, boxShadow:`0 0 8px ${item.color}`, flexShrink:0 }} />
                </div>
              ))}
              <div style={{ textAlign:"center", marginTop:"1rem", padding:"0.75rem", background:"rgba(34,197,94,0.05)", borderRadius:10, border:"1px solid rgba(34,197,94,0.15)" }}>
                <span style={{ fontSize:"0.8rem", color:"#22C55E", fontWeight:600 }}>✓ All passengers notified successfully</span>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── OFFERS ── */}
      <section id="offers" style={{ background:"#0A0A0D", padding:"5rem 2rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <RevealSection>
            <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#F97316", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8, textAlign:"center" }}>OFFERS & DISCOUNTS</p>
            <h2 style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"clamp(1.8rem,3vw,2.4rem)", fontWeight:800, color:"#fff", letterSpacing:"-0.03em", marginBottom:"2.5rem", textAlign:"center" }}>Save on your next trip</h2>
          </RevealSection>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1rem" }}>
            {OFFERS.map((o, i) => (
              <RevealSection key={i} delay={i * 80}>
                <div style={{ background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.1)", borderRadius:16, padding:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem" }}>
                  <div>
                    <span style={{ fontSize:"0.68rem", fontWeight:700, background:o.bg, color:o.color, padding:"0.2rem 0.6rem", borderRadius:6, letterSpacing:"0.06em", display:"inline-block", marginBottom:8 }}>{o.label}</span>
                    <div style={{ fontFamily:"var(--font-mono, monospace)", fontSize:"1.1rem", fontWeight:800, color:"#fff", marginBottom:4 }}>{o.code}</div>
                    <p style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.4)" }}>{o.desc}</p>
                  </div>
                  <button className="cpbtn" onClick={() => copyCode(o.code)}
                    style={{ flexShrink:0, padding:"0.5rem 1rem", border:`1px solid rgba(255,255,255,0.15)`, borderRadius:10, background:"transparent", color:"rgba(255,255,255,0.6)", fontSize:"0.78rem", fontWeight:700, cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}>
                    {copied === o.code ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background:"#09090B", padding:"5rem 2rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <RevealSection>
            <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#F97316", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8, textAlign:"center" }}>WHAT TRAVELERS SAY</p>
            <h2 style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"clamp(1.8rem,3vw,2.4rem)", fontWeight:800, color:"#fff", letterSpacing:"-0.03em", marginBottom:"2.5rem", textAlign:"center" }}>Real stories from real passengers</h2>
          </RevealSection>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1rem" }}>
            {TESTIMONIALS.map((t, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"1.75rem" }}>
                  <div style={{ display:"flex", gap:2, marginBottom:"1rem" }}>
                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={13} fill="#F59E0B" color="#F59E0B" />)}
                  </div>
                  <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"0.9rem", lineHeight:1.75, marginBottom:"1.25rem", fontStyle:"italic" }}>"{t.text}"</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:"0.85rem", fontWeight:700, color:"#fff" }}>{t.name}</div>
                      <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.3)" }}>{t.city}</div>
                    </div>
                    <span style={{ fontSize:"0.72rem", color:"#F97316", background:"rgba(249,115,22,0.08)", padding:"0.25rem 0.6rem", borderRadius:8, border:"1px solid rgba(249,115,22,0.15)" }}>{t.route}</span>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER ── */}
      <section style={{ background:"linear-gradient(135deg,rgba(249,115,22,0.06) 0%,rgba(9,9,11,1) 50%,rgba(59,130,246,0.04) 100%)", padding:"5rem 2rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"2rem", textAlign:"center" }}>
          {[
            { target:5000, suffix:"+", label:"Tickets Booked" },
            { target:15, suffix:"+", label:"Bus Operators" },
            { target:98, suffix:"%", label:"On-time Reminders" },
            { target:4, suffix:" cities", label:"Routes Available" },
          ].map((stat, i) => (
            <RevealSection key={i} delay={i * 100}>
              <div style={{ fontFamily:"var(--font-syne, sans-serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:800, color:"#fff", background:"linear-gradient(135deg,#F97316,#FB923C)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.35)", marginTop:6, fontWeight:500 }}>{stat.label}</div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#050507", padding:"4rem 2rem 2rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"3rem", marginBottom:"3rem" }}>

            {/* Brand */}
            <div>
              <span style={{ fontFamily:"var(--font-syne, sans-serif)", fontWeight:800, fontSize:"1.5rem", color:"#F97316", letterSpacing:"-0.04em" }}>zip<span style={{ color:"rgba(255,255,255,0.4)" }}>bus</span></span>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.85rem", lineHeight:1.75, margin:"1rem 0 1.5rem", maxWidth:280 }}>
                Karnataka's smartest bus booking platform. We remind you so you never miss your bus.
              </p>
              {/* Contact */}
              <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                <a href="tel:+916361096356" className="footer-link" style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"rgba(255,255,255,0.35)", textDecoration:"none", fontSize:"0.82rem", transition:"color 0.2s" }}>
                  <Phone size={13} /> +91 63610 96356
                </a>
                <a href="mailto:support@zipbus.in" className="footer-link" style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"rgba(255,255,255,0.35)", textDecoration:"none", fontSize:"0.82rem", transition:"color 0.2s" }}>
                  <Mail size={13} /> support@zipbus.in
                </a>
                <a href="https://wa.me/916361096356" className="footer-link" style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"rgba(255,255,255,0.35)", textDecoration:"none", fontSize:"0.82rem", transition:"color 0.2s" }}>
                  <MessageCircle size={13} /> WhatsApp Support
                </a>
              </div>
            </div>

            {/* Links */}
            {[
              ["Company", ["About Us", "Careers", "Press", "Blog"]],
              ["Support", ["Help Center", "Contact Us", "Refund Policy", "Terms"]],
              ["Routes", ["Koppal → Bangalore", "Hubli → Bangalore", "Hospet → Bangalore", "Bangalore → Mysore"]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <p style={{ fontSize:"0.72rem", fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"1rem" }}>{title as string}</p>
                {(links as string[]).map(l => (
                  <a key={l} href="#" className="footer-link" style={{ display:"block", color:"rgba(255,255,255,0.25)", fontSize:"0.83rem", textDecoration:"none", marginBottom:"0.6rem", transition:"color 0.2s" }}>{l}</a>
                ))}
              </div>
            ))}
          </div>

          {/* Calling feature highlight in footer */}
          <div style={{ background:"rgba(249,115,22,0.06)", border:"1px solid rgba(249,115,22,0.12)", borderRadius:16, padding:"1.25rem 1.75rem", marginBottom:"2rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"rgba(249,115,22,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Phone size={16} color="#F97316" />
              </div>
              <div>
                <div style={{ fontSize:"0.85rem", fontWeight:700, color:"#fff" }}>Automated boarding reminders</div>
                <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)" }}>Every passenger gets a voice call at T-30 and T-15 minutes before departure</div>
              </div>
            </div>
            <a href="/sign-up" style={{ background:"linear-gradient(135deg,#F97316,#EA580C)", color:"#fff", textDecoration:"none", padding:"0.5rem 1.25rem", borderRadius:10, fontSize:"0.82rem", fontWeight:700, whiteSpace:"nowrap" }}>
              Book now →
            </a>
          </div>

          <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
            <p style={{ color:"rgba(255,255,255,0.15)", fontSize:"0.78rem" }}>© 2026 ZipBus Technologies Pvt. Ltd. All rights reserved.</p>
            <p style={{ color:"rgba(255,255,255,0.15)", fontSize:"0.78rem" }}>Made with ❤️ in Karnataka 🇮🇳</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

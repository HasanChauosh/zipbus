"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowRight, Clock, Users, Star, ChevronDown, Filter, ArrowLeft } from "lucide-react"

interface Bus {
  id: string
  operator: { id: string; name: string; logoUrl: string; rating: number }
  route: { source: string; destination: string; distanceKm: number }
  departureTime: string
  arrivalTime: string
  busType: string
  totalSeats: number
  availableSeats: number
  minPrice: number
}

const BUS_TYPE_LABEL: Record<string, string> = {
  AC_SLEEPER: "AC Sleeper",
  NON_AC_SEATER: "Non-AC Seater",
  AC_SEATER: "AC Seater",
}

const BUS_TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  AC_SLEEPER: { bg: "#EDE9FE", color: "#7C3AED" },
  NON_AC_SEATER: { bg: "#FEF3C7", color: "#92400E" },
  AC_SEATER: { bg: "#DBEAFE", color: "#1E40AF" },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
}

function formatDuration(dep: string, arr: string) {
  const diff = new Date(arr).getTime() - new Date(dep).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.round((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

function SearchResults() {
  const params = useSearchParams()
  const router = useRouter()
  const source = params.get("source") || ""
  const destination = params.get("destination") || ""
  const date = params.get("date") || ""

  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("departure")
  const [filterType, setFilterType] = useState("ALL")
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    if (!source || !destination || !date) return
    setLoading(true)
    fetch(`/api/buses?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${date}`)
      .then(r => r.json())
      .then(d => { setBuses(d.buses || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [source, destination, date])

  const sorted = [...buses]
    .filter(b => filterType === "ALL" || b.busType === filterType)
    .sort((a, b) => {
      if (sortBy === "price") return a.minPrice - b.minPrice
      if (sortBy === "seats") return b.availableSeats - a.availableSeats
      if (sortBy === "rating") return b.operator.rating - a.operator.rating
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
    })

  const displayDate = date ? new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : ""

  return (
    <main style={{ fontFamily: "var(--font-inter, sans-serif)", background: "#F7F5F0", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .bus-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; transform: translateY(-2px); }
        .book-btn:hover { background: #C2530A !important; }
        .sort-btn:hover { border-color: #F97316 !important; color: #F97316 !important; }
        .filter-chip:hover { border-color: #F97316 !important; }
        .back-btn:hover { color: #F97316 !important; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ background: "#111827", padding: "0 2rem", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <button className="back-btn" onClick={() => router.push("/")}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", transition: "color 0.2s", padding: 0 }}>
            <ArrowLeft size={15} /> Home
          </button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: "1rem", color: "#fff" }}>{source}</span>
            <ArrowRight size={14} color="#F97316" />
            <span style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: "1rem", color: "#fff" }}>{destination}</span>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginLeft: "0.5rem" }}>{displayDate}</span>
          </div>
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", color: "#F97316", fontWeight: 600 }}>
            {loading ? "..." : `${sorted.length} buses`}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1.5rem 2rem" }}>

        {/* FILTERS ROW */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className="sort-btn" onClick={() => setShowFilter(!showFilter)}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 0.9rem", border: "1.5px solid #E5E2DC", borderRadius: 8, background: "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", color: "#374151", transition: "all 0.2s" }}>
            <Filter size={13} /> Filters <ChevronDown size={13} style={{ transform: showFilter ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {["ALL", "AC_SLEEPER", "AC_SEATER", "NON_AC_SEATER"].map(type => (
            <button key={type} className="filter-chip"
              onClick={() => setFilterType(type)}
              style={{ padding: "0.45rem 0.9rem", border: `1.5px solid ${filterType === type ? "#F97316" : "#E5E2DC"}`, borderRadius: 8, background: filterType === type ? "#FFF7ED" : "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", color: filterType === type ? "#F97316" : "#6B7280", transition: "all 0.2s" }}>
              {type === "ALL" ? "All Types" : BUS_TYPE_LABEL[type]}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#9CA3AF", fontWeight: 600 }}>Sort:</span>
            {[["departure", "Departure"], ["price", "Price"], ["seats", "Seats"], ["rating", "Rating"]].map(([val, label]) => (
              <button key={val} className="sort-btn"
                onClick={() => setSortBy(val)}
                style={{ padding: "0.4rem 0.75rem", border: `1.5px solid ${sortBy === val ? "#F97316" : "#E5E2DC"}`, borderRadius: 8, background: sortBy === val ? "#FFF7ED" : "#fff", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", color: sortBy === val ? "#F97316" : "#6B7280", transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 140, borderRadius: 16, background: "linear-gradient(90deg, #e5e2dc 25%, #f0ede8 50%, #e5e2dc 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite" }} />
            ))}
          </div>
        )}

        {/* NO RESULTS */}
        {!loading && sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚌</div>
            <h3 style={{ fontFamily: "var(--font-syne, sans-serif)", fontSize: "1.3rem", fontWeight: 800, color: "#111", marginBottom: "0.5rem" }}>No buses found</h3>
            <p style={{ color: "#9CA3AF", fontSize: "0.9rem" }}>Try a different date or route</p>
            <button onClick={() => router.push("/")} style={{ marginTop: "1.5rem", padding: "0.7rem 1.5rem", background: "#F97316", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
              Search Again
            </button>
          </div>
        )}

        {/* BUS CARDS */}
        {!loading && sorted.map((bus, i) => {
          const typeStyle = BUS_TYPE_COLOR[bus.busType] || { bg: "#F3F4F6", color: "#374151" }
          const depTime = formatTime(bus.departureTime)
          const arrTime = formatTime(bus.arrivalTime)
          const duration = formatDuration(bus.departureTime, bus.arrivalTime)
          const isLowSeats = bus.availableSeats <= 10
          const initials = bus.operator.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")

          return (
            <div key={bus.id} className="bus-card"
              style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", marginBottom: "1rem", border: "1.5px solid #E5E2DC", transition: "all 0.25s", animation: `fadeUp 0.4s ease ${i * 0.07}s both`, display: "flex", gap: "1.5rem", alignItems: "center" }}>

              {/* OPERATOR LOGO */}
              <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 12, background: "#F7F5F0", border: "1.5px solid #E5E2DC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {bus.operator.logoUrl && !bus.operator.logoUrl.includes("placehold") ? (
                  <img src={bus.operator.logoUrl} alt={bus.operator.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: "1rem", color: "#F97316" }}>{initials}</span>
                )}
              </div>

              {/* MAIN INFO */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: "0.95rem", color: "#111" }}>{bus.operator.name}</span>
                  <span style={{ background: typeStyle.bg, color: typeStyle.color, fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 6 }}>{BUS_TYPE_LABEL[bus.busType] || bus.busType}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <Star size={11} fill="#F59E0B" color="#F59E0B" />
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#92400E" }}>{bus.operator.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* TIME ROW */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.35rem", fontWeight: 700, color: "#111", lineHeight: 1 }}>{depTime}</div>
                    <div style={{ fontSize: "0.72rem", color: "#9CA3AF", marginTop: 2 }}>{bus.route.source}</div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: "0.72rem", color: "#9CA3AF", display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock size={10} /> {duration}
                    </span>
                    <div style={{ width: "100%", height: 1, background: "linear-gradient(to right, #E5E2DC, #F97316, #E5E2DC)", position: "relative" }}>
                      <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 6, height: 6, borderRadius: "50%", background: "#F97316" }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.35rem", fontWeight: 700, color: "#111", lineHeight: 1 }}>{arrTime}</div>
                    <div style={{ fontSize: "0.72rem", color: "#9CA3AF", marginTop: 2 }}>{bus.route.destination}</div>
                  </div>
                </div>
              </div>

              {/* SEATS + PRICE + BOOK */}
              <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Users size={12} color={isLowSeats ? "#EF4444" : "#9CA3AF"} />
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: isLowSeats ? "#EF4444" : "#9CA3AF" }}>
                    {isLowSeats ? `Only ${bus.availableSeats} left!` : `${bus.availableSeats} seats`}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#9CA3AF", textAlign: "right" }}>starts from</div>
                  <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.5rem", fontWeight: 800, color: "#111", lineHeight: 1 }}>₹{bus.minPrice}</div>
                </div>
                <button className="book-btn"
                  onClick={() => router.push(`/bus/${bus.id}/seats`)}
                  style={{ padding: "0.55rem 1.2rem", background: "#F97316", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.88rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  Select Seats <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"sans-serif", color:"#9CA3AF" }}>Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}

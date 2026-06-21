"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Clock, MapPin, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react"

interface Booking {
  id: string
  status: string
  totalAmount: number
  bookedAt: string
  bus: {
    departureTime: string
    arrivalTime: string
    busType: string
    operator: { name: string }
    route: { source: string; destination: string }
  }
  bookingSeats: { seat: { seatNumber: string; tier: string } }[]
  passenger: { name: string; phone: string; email: string } | null
}

const STATUS_CONFIG: Record<string, { icon: JSX.Element; color: string; bg: string; label: string }> = {
  CONFIRMED: { icon: <CheckCircle size={14} />, color: "#16A34A", bg: "#DCFCE7", label: "Confirmed" },
  PENDING: { icon: <AlertCircle size={14} />, color: "#D97706", bg: "#FEF3C7", label: "Pending" },
  CANCELLED: { icon: <XCircle size={14} />, color: "#DC2626", bg: "#FEE2E2", label: "Cancelled" },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/sign-in"); return }
    fetch("/api/bookings/my")
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isLoaded, user])

  return (
    <main style={{ fontFamily: "var(--font-inter, sans-serif)", background: "#F7F5F0", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .bcard:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important; transform: translateY(-1px); }
      `}</style>

      {/* NAV */}
      <nav style={{ background: "#111827", padding: "0 2rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: "1.3rem", color: "#F97316", textDecoration: "none", letterSpacing: "-0.03em" }}>
          zip<span style={{ color: "#fff" }}>bus</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
            {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </span>
          <a href="/" style={{ background: "#F97316", color: "#fff", textDecoration: "none", padding: "0.4rem 1rem", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600 }}>
            + New Booking
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#F97316", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>MY ACCOUNT</p>
          <h1 style={{ fontFamily: "var(--font-syne, sans-serif)", fontSize: "2rem", fontWeight: 800, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>My Bookings</h1>
        </div>

        {/* STATS */}
        {!loading && bookings.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Trips", value: bookings.length },
              { label: "Confirmed", value: bookings.filter(b => b.status === "CONFIRMED").length },
              { label: "Total Spent", value: `₹${bookings.filter(b => b.status === "CONFIRMED").reduce((s, b) => s + b.totalAmount, 0)}` },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1.5px solid #E5E2DC", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.6rem", fontWeight: 800, color: "#F97316" }}>{stat.value}</div>
                <div style={{ fontSize: "0.78rem", color: "#9CA3AF", fontWeight: 500, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2].map(i => (
              <div key={i} style={{ height: 160, borderRadius: 16, background: "linear-gradient(90deg,#e5e2dc 25%,#f0ede8 50%,#e5e2dc 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite" }} />
            ))}
            <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>
          </div>
        )}

        {/* EMPTY */}
        {!loading && bookings.length === 0 && (
          <div style={{ textAlign: "center", padding: "5rem 2rem", background: "#fff", borderRadius: 20, border: "1.5px solid #E5E2DC" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🚌</div>
            <h3 style={{ fontFamily: "var(--font-syne, sans-serif)", fontSize: "1.2rem", fontWeight: 800, color: "#111", margin: "0 0 0.5rem" }}>No trips yet</h3>
            <p style={{ color: "#9CA3AF", fontSize: "0.88rem", margin: "0 0 1.5rem" }}>Book your first bus ticket and it'll show up here</p>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.75rem 1.5rem", background: "#F97316", color: "#fff", textDecoration: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem" }}>
              Search Buses <ArrowRight size={15} />
            </a>
          </div>
        )}

        {/* BOOKING CARDS */}
        {!loading && bookings.map((booking, i) => {
          const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING
          const seats = booking.bookingSeats.map(bs => bs.seat.seatNumber).join(", ")
          const isPast = new Date(booking.bus.departureTime) < new Date()

          return (
            <div key={booking.id} className="bcard"
              style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", marginBottom: "1rem", border: "1.5px solid #E5E2DC", transition: "all 0.2s", animation: `fadeUp 0.4s ease ${i * 0.08}s both`, opacity: isPast ? 0.75 : 1 }}>

              {/* TOP ROW */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: "1rem", color: "#111", marginBottom: 4 }}>
                    {booking.bus.route.source} <ArrowRight size={13} style={{ display: "inline", verticalAlign: "middle", color: "#F97316" }} /> {booking.bus.route.destination}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>{booking.bus.operator.name} · {formatDate(booking.bus.departureTime)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: st.bg, color: st.color, padding: "0.3rem 0.7rem", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700 }}>
                  {st.icon} {st.label}
                </div>
              </div>

              {/* DIVIDER */}
              <div style={{ height: 1, background: "#F3F4F6", margin: "0 0 1rem" }} />

              {/* DETAILS ROW */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Departure</div>
                  <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{formatTime(booking.bus.departureTime)}</div>
                  <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: 2 }}>{booking.bus.route.source}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Seats</div>
                  <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem", fontWeight: 700, color: "#F97316" }}>{seats || "—"}</div>
                  <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: 2 }}>{booking.bus.busType.replace(/_/g, " ")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Paid</div>
                  <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.2rem", fontWeight: 800, color: "#111" }}>₹{booking.totalAmount}</div>
                  <div style={{ fontSize: "0.68rem", color: "#9CA3AF", fontFamily: "var(--font-mono, monospace)", marginTop: 2 }}>{booking.id.slice(-8).toUpperCase()}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

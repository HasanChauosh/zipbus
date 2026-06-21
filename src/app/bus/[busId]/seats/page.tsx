"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock, Star, Users, AlertCircle, CheckCircle } from "lucide-react"


interface Seat {
  id: string
  seatNumber: string
  tier: string
  price: number
  genderPref: string
  isAvailable: boolean
}

interface BusDetails {
  id: string
  operator: { name: string; logoUrl: string; rating: number }
  route: { source: string; destination: string }
  departureTime: string
  arrivalTime: string
  busType: string
  totalSeats: number
}

const GENDER_COLOR: Record<string, string> = {
  FEMALE_ONLY: "#EC4899",
  ANY: "#F97316",
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

export default function SeatsPage() {
  const { busId } = useParams<{ busId: string }>()
  const router = useRouter()

  const [bus, setBus] = useState<BusDetails | null>(null)
  const [upper, setUpper] = useState<Seat[]>([])
  const [lower, setLower] = useState<Seat[]>([])
  const [selected, setSelected] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [locking, setLocking] = useState<string | null>(null)
  const [step, setStep] = useState<"seats" | "passenger">("seats")
  const [passenger, setPassenger] = useState({ name: "", phone: "", email: "", gender: "MALE" })
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; finalAmount: number } | null>(null)
  const [couponError, setCouponError] = useState("")

  useEffect(() => {
    fetch(`/api/buses/${busId}/seats`)
      .then(r => r.json())
      .then(d => {
        setBus(d.bus)
        setUpper(d.seats.upper || [])
        setLower(d.seats.lower || [])
        setLoading(false)
      })
  }, [busId])

  const toggleSeat = async (seat: Seat) => {
    if (!seat.isAvailable) return
    const isSelected = selected.find(s => s.id === seat.id)

    if (isSelected) {
      // Unlock seat
      await fetch(`/api/buses/${busId}/seats/lock`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatId: seat.id }),
      })
      setSelected(prev => prev.filter(s => s.id !== seat.id))
      return
    }

    if (selected.length >= 6) {
      setError("Maximum 6 seats per booking")
      setTimeout(() => setError(""), 3000)
      return
    }

    setLocking(seat.id)
    setError("")

    const res = await fetch(`/api/buses/${busId}/seats/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatId: seat.id }),
    })

    const data = await res.json()
    setLocking(null)

    if (!res.ok) {
      setError(data.error || "Seat unavailable")
      setTimeout(() => setError(""), 3000)
      return
    }

    setSelected(prev => [...prev, seat])
  }


  const handleBook = async () => {
    if (!passenger.name || !passenger.phone || !passenger.email) {
      setError("Please fill all passenger details")
      return
    }
    setBooking(true)
    setError("")

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        busId,
        seatIds: selected.map(s => s.id),
        passengerDetails: passenger,
        couponCode: couponApplied?.code || null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Booking failed")
      setBooking(false)
      return
    }

    window.location.href = data.checkoutUrl
  }

  const SeatBox = ({ seat }: { seat: Seat }) => {
    const isSelected = !!selected.find(s => s.id === seat.id)
    const isLocking = locking === seat.id
    const isFemale = seat.genderPref === "FEMALE_ONLY"

    let bg = "#F7F5F0"
    let border = "#E5E2DC"
    let color = "#9CA3AF"
    let cursor = "not-allowed"

    if (!seat.isAvailable) {
      bg = "#F3F4F6"; border = "#E5E7EB"; color = "#D1D5DB"
    } else if (isSelected) {
      bg = "#FFF7ED"; border = "#F97316"; color = "#F97316"; cursor = "pointer"
    } else if (isFemale) {
      bg = "#FDF2F8"; border = "#FBCFE8"; color = "#EC4899"; cursor = "pointer"
    } else {
      bg = "#fff"; border = "#E5E2DC"; color = "#374151"; cursor = "pointer"
    }

    return (
      <button onClick={() => toggleSeat(seat)} disabled={!seat.isAvailable || !!locking}
        title={isFemale ? "Ladies only" : seat.seatNumber}
        style={{
          width: 56, height: 48, borderRadius: 8,
          border: `2px solid ${border}`,
          background: bg, color, cursor,
          fontSize: "0.7rem", fontWeight: 700,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 1, transition: "all 0.15s",
          opacity: isLocking ? 0.5 : 1,
          position: "relative"
        }}>
        {isSelected && <CheckCircle size={10} style={{ position: "absolute", top: 2, right: 2 }} />}
        <span style={{ fontSize: "0.65rem" }}>{seat.seatNumber}</span>
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem", color: isSelected ? "#F97316" : "#9CA3AF" }}>₹{seat.price}</span>
        {isFemale && <span style={{ fontSize: "0.55rem", color: "#EC4899" }}>♀</span>}
      </button>
    )
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E5E2DC", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
        <p style={{ color: "#9CA3AF", fontSize: "0.9rem" }}>Loading seats...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!bus) return <div style={{ padding: "2rem", textAlign: "center" }}>Bus not found</div>

  const total = selected.reduce((s, seat) => s + seat.price, 0)
    const applyCoupon = async () => {
    if (!couponCode) return
    setCouponError("")
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, amount: total }),
    })
    const data = await res.json()
    if (!res.ok || !data.valid) {
      setCouponError(data.error || "Invalid coupon")
      setCouponApplied(null)
      return
    }
    setCouponApplied(data)
  }
  const duration = formatDuration(bus.departureTime, bus.arrivalTime)

  return (
    <main style={{ fontFamily: "var(--font-inter, sans-serif)", background: "#F7F5F0", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .inp:focus { outline: none; border-color: #F97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.1) !important; }
        .proceed-btn:hover { background: #C2530A !important; }
        .back-link:hover { color: #F97316 !important; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ background: "#111827", padding: "0 2rem", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="back-link" onClick={() => router.back()}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", padding: 0, transition: "color 0.2s" }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>{bus.operator.name}</span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>·</span>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>{bus.route.source} → {bus.route.destination}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: 2 }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem", color: "#F97316" }}>{formatTime(bus.departureTime)}</span>
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} />{duration}</span>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>{formatTime(bus.arrivalTime)}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 4 }}>
                <Star size={10} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontSize: "0.75rem", color: "#F59E0B", fontWeight: 600 }}>{bus.operator.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {["Select Seats", "Passenger", "Payment"].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 && step === "seats" ? "#F97316" : i === 1 && step === "passenger" ? "#F97316" : i < (step === "passenger" ? 1 : 0) ? "#22C55E" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "#fff" }}>{i + 1}</div>
                <span style={{ fontSize: "0.72rem", color: i === 0 && step === "seats" ? "#fff" : i === 1 && step === "passenger" ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 500 }}>{s}</span>
                {i < 2 && <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.15)" }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1.5rem 2rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>

        {/* LEFT — SEAT MAP or PASSENGER FORM */}
        {step === "seats" ? (
          <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
            {/* LEGEND */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", border: "1.5px solid #E5E2DC" }}>
              {[
                { color: "#fff", border: "#E5E2DC", label: "Available" },
                { color: "#FFF7ED", border: "#F97316", label: "Selected" },
                { color: "#F3F4F6", border: "#E5E7EB", label: "Booked" },
                { color: "#FDF2F8", border: "#FBCFE8", label: "Ladies only" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: 20, height: 18, borderRadius: 4, background: item.color, border: `2px solid ${item.border}` }} />
                  <span style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Users size={13} color="#9CA3AF" />
                <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                  {upper.filter(s => s.isAvailable).length + lower.filter(s => s.isAvailable).length} available
                </span>
              </div>
            </div>

            {/* BUS LAYOUT */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E5E2DC", overflow: "hidden" }}>
              {/* Driver */}
              <div style={{ background: "#111827", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(249,115,22,0.15)", border: "2px solid rgba(249,115,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🚌</div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>DRIVER</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>Front of bus</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>← Aisle →</div>
              </div>

              {/* Upper Berths */}
              {upper.length > 0 && (
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Upper Berth</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {upper.map(seat => <SeatBox key={seat.id} seat={seat} />)}
                  </div>
                </div>
              )}

              {/* Lower Berths / Seats */}
              <div style={{ padding: "1.25rem 1.5rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  {bus.busType === "AC_SLEEPER" ? "Lower Berth" : "Seats"}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {lower.map(seat => <SeatBox key={seat.id} seat={seat} />)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PASSENGER FORM */
          <div style={{ background: "#fff", borderRadius: 16, padding: "1.75rem", border: "1.5px solid #E5E2DC", animation: "fadeUp 0.4s ease forwards" }}>
            <h3 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: "1.1rem", color: "#111", marginTop: 0, marginBottom: "1.5rem" }}>Passenger Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "As per ID card" },
                { label: "Phone Number", key: "phone", type: "tel", placeholder: "10-digit mobile number" },
                { label: "Email Address", key: "email", type: "email", placeholder: "For ticket confirmation" },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{field.label}</label>
                  <input className="inp" type={field.type} placeholder={field.placeholder}
                    value={passenger[field.key as keyof typeof passenger]}
                    onChange={e => setPassenger(p => ({ ...p, [field.key]: e.target.value }))}
                    style={{ width: "100%", padding: "0.7rem 1rem", border: "1.5px solid #E5E2DC", borderRadius: 10, fontSize: "0.92rem", color: "#111", background: "#FAFAFA", transition: "all 0.2s" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Gender</label>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {["MALE", "FEMALE", "OTHER"].map(g => (
                    <button key={g} onClick={() => setPassenger(p => ({ ...p, gender: g }))}
                      style={{ flex: 1, padding: "0.65rem", border: `1.5px solid ${passenger.gender === g ? "#F97316" : "#E5E2DC"}`, borderRadius: 10, background: passenger.gender === g ? "#FFF7ED" : "#FAFAFA", color: passenger.gender === g ? "#F97316" : "#6B7280", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s" }}>
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT — SUMMARY */}
        <div style={{ position: "sticky", top: 76 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", border: "1.5px solid #E5E2DC", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "var(--font-syne, sans-serif)", fontWeight: 800, fontSize: "0.95rem", color: "#111", margin: "0 0 1rem" }}>Booking Summary</h3>

            {selected.length === 0 ? (
              <p style={{ color: "#9CA3AF", fontSize: "0.85rem", textAlign: "center", padding: "1rem 0" }}>Select seats to continue</p>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
                  {selected.map(seat => (
                    <div key={seat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.8rem", background: "#FFF7ED", borderRadius: 8, border: "1px solid #FED7AA" }}>
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111" }}>Seat {seat.seatNumber}</span>
                        <span style={{ fontSize: "0.72rem", color: "#9CA3AF", marginLeft: 6 }}>{seat.tier}</span>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem", fontWeight: 700, color: "#F97316" }}>₹{seat.price}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", color: "#6B7280", fontWeight: 600 }}>Total ({selected.length} seat{selected.length > 1 ? "s" : ""})</span>
                  <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.3rem", fontWeight: 800, color: "#111" }}>₹{total}</span>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1.5px solid #E5E2DC", borderRadius: 8, fontSize: "0.82rem" }}
                    />
                    <button onClick={applyCoupon} style={{ padding: "0.5rem 1rem", background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                      Apply
                    </button>
                  </div>
                  {couponError && <p style={{ color: "#EF4444", fontSize: "0.75rem", marginTop: 6 }}>{couponError}</p>}
                  {couponApplied && (
                    <div style={{ marginTop: "0.75rem", padding: "0.6rem", background: "#DCFCE7", borderRadius: 8 }}>
                      <p style={{ fontSize: "0.78rem", color: "#16A34A", fontWeight: 600, margin: 0 }}>
                        ✓ {couponApplied.code} applied — saved ₹{couponApplied.discount}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={14} color="#EF4444" />
              <span style={{ fontSize: "0.82rem", color: "#EF4444", fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {step === "seats" ? (
            <button className="proceed-btn" disabled={selected.length === 0}
              onClick={() => setStep("passenger")}
              style={{ width: "100%", padding: "0.9rem", background: selected.length > 0 ? "#F97316" : "#E5E2DC", color: selected.length > 0 ? "#fff" : "#9CA3AF", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "0.92rem", cursor: selected.length > 0 ? "pointer" : "not-allowed", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button onClick={() => setStep("seats")}
                style={{ width: "100%", padding: "0.75rem", background: "#F7F5F0", color: "#374151", border: "1.5px solid #E5E2DC", borderRadius: 12, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <ArrowLeft size={14} /> Edit Seats
              </button>
              <button className="proceed-btn" onClick={handleBook} disabled={booking}
                style={{ width: "100%", padding: "0.9rem", background: "#F97316", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "0.92rem", cursor: booking ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", opacity: booking ? 0.7 : 1 }}>
                {booking ? "Redirecting to payment..." : "Proceed to Payment →"}
              </button>
            </div>
          )}

          <p style={{ fontSize: "0.72rem", color: "#9CA3AF", textAlign: "center", marginTop: "0.75rem" }}>
            🔒 Seats held for 10 minutes after selection
          </p>
        </div>
      </div>
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { CheckCircle, Clock, MapPin, User, Download } from "lucide-react"

export default function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  return (
    <main style={{ fontFamily: "var(--font-inter, sans-serif)", background: "#F7F5F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{ background: "#fff", borderRadius: 20, padding: "3rem 2.5rem", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", animation: "fadeUp 0.5s ease forwards", border: "1.5px solid #E5E2DC" }}>

        {status === "success" ? (
          <>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <CheckCircle size={36} color="#16A34A" />
            </div>
            <h1 style={{ fontFamily: "var(--font-syne, sans-serif)", fontSize: "1.6rem", fontWeight: 800, color: "#111", margin: "0 0 0.5rem" }}>Booking Confirmed!</h1>
            <p style={{ color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 2rem" }}>
              Your ticket has been sent to your email. You'll receive a reminder call before departure.
            </p>

            <div style={{ background: "#F7F5F0", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Booking ID</div>
              <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem", color: "#111", fontWeight: 600 }}>{id}</div>
            </div>

            <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "1rem", marginBottom: "2rem", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                <Clock size={14} color="#F97316" />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#92400E" }}>Boarding Reminders Set</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#92400E", margin: 0, lineHeight: 1.6 }}>
                You'll get an automated call 30 minutes and 15 minutes before your bus departs.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a href="/dashboard" style={{ flex: 1, padding: "0.8rem", background: "#F7F5F0", color: "#374151", textDecoration: "none", borderRadius: 10, fontWeight: 600, fontSize: "0.88rem", border: "1.5px solid #E5E2DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                My Bookings
              </a>
              <a href="/" style={{ flex: 1, padding: "0.8rem", background: "#F97316", color: "#fff", textDecoration: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Book Another
              </a>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <span style={{ fontSize: "2rem" }}>❌</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-syne, sans-serif)", fontSize: "1.4rem", fontWeight: 800, color: "#111", margin: "0 0 0.5rem" }}>Payment Cancelled</h1>
            <p style={{ color: "#6B7280", fontSize: "0.9rem", margin: "0 0 2rem" }}>Your seats have been released. You can try booking again.</p>
            <a href="/" style={{ display: "block", padding: "0.85rem", background: "#F97316", color: "#fff", textDecoration: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem" }}>Back to Home</a>
          </>
        )}
      </div>
    </main>
  )
}

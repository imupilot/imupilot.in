import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import IMUpilotSidebar from "../components/IMUpilotSidebar";
import UpgradeModal from "../components/UpgradeModal";
import { supabase } from "../supabaseClient";
import { isPro } from "../utils/planUtils";
import {
  Video,
  Calendar,
  Clock,
  FileText,
  Lock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Award,
  X,
  MessageCircle,
} from "lucide-react";

const TIME_SLOTS = ["10 AM", "11 AM", "12 PM", "2 PM", "3 PM", "4 PM", "5 PM"];

export default function MockInterview() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [interviewsUsed, setInterviewsUsed] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Booking Form State
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState("");
  const [feedbackViewModal, setFeedbackViewModal] = useState(null); // feedback object to view

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userId = user?.id;

  // Tomorrow as minimum date for booking
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  // ── 1. Fetch Profile & Interviews Count ─────────────────────────────────────
  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, plan, interviews_used")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        setInterviewsUsed(data.interviews_used || 0);
      } else {
        // Fallback to local user
        setProfile(user);
        setInterviewsUsed(user.interviews_used || 0);
      }
    } catch {
      setProfile(user);
      setInterviewsUsed(user.interviews_used || 0);
    }
  }, [userId]);

  // ── 2. Fetch User Bookings & Feedbacks ──────────────────────────────────────
  const loadBookings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const localKey = `imupilot_interview_bookings_${userId}`;

    try {
      // Fetch bookings from Supabase
      const { data: bData, error: bError } = await supabase
        .from("interview_bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!bError && bData) {
        setBookings(bData);
        localStorage.setItem(localKey, JSON.stringify(bData));
      } else {
        const cached = localStorage.getItem(localKey);
        if (cached) setBookings(JSON.parse(cached));
      }

      // Fetch feedbacks from Supabase
      const { data: fData } = await supabase
        .from("interview_feedback")
        .select("*")
        .eq("user_id", userId);

      if (fData) {
        setFeedbacks(fData);
      }
    } catch (e) {
      console.warn("Using offline bookings fallback:", e);
      const cached = localStorage.getItem(localKey);
      if (cached) setBookings(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
    loadBookings();
  }, [loadProfile, loadBookings]);

  // ── 3. Handle WhatsApp Booking ──────────────────────────────────────────────
  const handleBookInterview = async (e) => {
    e.preventDefault();
    if (!preferredDate) {
      alert("Please select a preferred date for your interview.");
      return;
    }
    if (interviewsUsed >= 10) {
      alert("You have already used all 10 complimentary interviews.");
      return;
    }

    setSubmitting(true);
    const newUsed = interviewsUsed + 1;
    const studentName = profile?.full_name || user?.name || "Student";
    const bookingNotes = notes.trim() || "None";

    const newBooking = {
      user_id: userId,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      notes: bookingNotes,
      status: "requested",
      created_at: new Date().toISOString(),
    };

    try {
      // 1. Insert to interview_bookings table
      const { data: inserted, error: bErr } = await supabase
        .from("interview_bookings")
        .insert([newBooking])
        .select()
        .single();

      if (!bErr && inserted) {
        setBookings((prev) => [inserted, ...prev]);
      } else {
        // Fallback optimistic update
        setBookings((prev) => [newBooking, ...prev]);
        const localKey = `imupilot_interview_bookings_${userId}`;
        const current = JSON.parse(localStorage.getItem(localKey) || "[]");
        localStorage.setItem(localKey, JSON.stringify([newBooking, ...current]));
      }

      // 2. Increment interviews_used in profiles
      await supabase
        .from("profiles")
        .update({ interviews_used: newUsed })
        .eq("id", userId);

      setInterviewsUsed(newUsed);

      // Update local storage user profile
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        u.interviews_used = newUsed;
        localStorage.setItem("user", JSON.stringify(u));
      } catch {}
    } catch (err) {
      console.warn("Saved booking locally:", err);
      setInterviewsUsed(newUsed);
    }

    // 3. Open WhatsApp link with pre-filled message
    const waMessage = `Hello! I'd like to book a Mock Interview.

Name: ${studentName}
Interview Number: ${newUsed} of 10
Preferred Date: ${preferredDate}
Preferred Time: ${preferredTime}
Notes: ${bookingNotes}

Please confirm my slot. Thank you!`;

    const waUrl = `https://wa.me/917606963299?text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, "_blank");

    // Reset form
    setNotes("");
    setPreferredDate("");
    setSubmitting(false);
  };

  const proUser = isPro(profile || user);
  const remainingInterviews = Math.max(0, 10 - interviewsUsed);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#0F172A",
      }}
    >
      <IMUpilotSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={true}
          onClose={() => setShowUpgradeModal(false)}
          userId={userId}
          title="Upgrade to Pro for Mock Interviews"
          subtitle="Get 10 complimentary 1-on-1 mock interview sessions with IMUCET captains & Chief Engineers"
        />
      )}

      {/* FEEDBACK DETAILS MODAL */}
      {feedbackViewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              maxWidth: 480,
              width: "100%",
              padding: "clamp(12px, 4vw, 28px)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: "#F1F5F9",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0F172A",
                  }}
                >
                  <Award size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0F172A" }}>
                  Interview Assessment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackViewModal(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 6,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {[
                { label: "Communication", val: feedbackViewModal.communication },
                { label: "Subject Knowledge", val: feedbackViewModal.subject_knowledge },
                { label: "Confidence", val: feedbackViewModal.confidence },
                { label: "Problem Solving", val: feedbackViewModal.problem_solving },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#F8FAFC",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>
                    {item.val ? `${item.val} / 10` : "—"}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#64748B",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4,
                }}
              >
                Overall Score
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A" }}>
                {feedbackViewModal.overall ? `${feedbackViewModal.overall} / 10` : "—"}
              </div>
            </div>

            {feedbackViewModal.remarks && (
              <div
                style={{
                  background: "#F8FAFC",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}
                >
                  Interviewer Remarks
                </div>
                <div style={{ fontSize: 13, color: "#0F172A", lineHeight: 1.5 }}>
                  "{feedbackViewModal.remarks}"
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setFeedbackViewModal(null)}
              style={{
                width: "100%",
                padding: "11px",
                background: "#0F172A",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 9,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflowX: 'hidden',
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Mobile topbar */}
        <div style={{
          display: 'none', // hidden on desktop via CSS
          position: 'sticky', top: 0, zIndex: 30,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="mobile-topbar">
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>IMUpilot</span>
          <button onClick={() => setMobileOpen(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#0F172A', fontSize: 22
          }}>☰</button>
        </div>

        {/* Top Header */}
        <div style={{ padding: "clamp(12px, 4vw, 28px)", paddingBottom: 0, flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0F172A",
                  }}
                >
                  <Video size={18} />
                </div>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    margin: 0,
                    color: "#0F172A",
                  }}
                >
                  Book a Mock Interview
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>
                Get feedback from our experts before the real IMUCET interview
              </p>
            </div>

            {/* Remaining Interviews Badge */}
            <div
              style={{
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Complimentary Slots
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
                  {remainingInterviews}{" "}
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#64748B" }}>
                    / 10 remaining
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: remainingInterviews > 0 ? "#0F172A" : "#FEE2E2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: remainingInterviews > 0 ? "#FFFFFF" : "#EF4444",
                }}
              >
                {remainingInterviews}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: "0 clamp(12px, 4vw, 36px) 36px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* ── SECTION 1: BOOKING SECTION ───────────────────────────────────── */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              padding: "clamp(12px, 4vw, 28px)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            {!proUser ? (
              /* LOCKED CARD FOR FREE MEMBERS */
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "#F1F5F9",
                    border: "1px solid #E2E8F0",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0F172A",
                    marginBottom: 16,
                  }}
                >
                  <Lock size={24} />
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    margin: "0 0 6px",
                    color: "#0F172A",
                  }}
                >
                  Available for Pro Members
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#64748B",
                    maxWidth: 460,
                    margin: "0 auto 20px",
                    lineHeight: 1.5,
                  }}
                >
                  Upgrade to IMUPilot Pro to unlock 10 complimentary 1-on-1 mock interview sessions
                  with veteran Chief Engineers and Captains, complete with rubric-based scorecards.
                </p>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  style={{
                    background: "#0F172A",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 10,
                    padding: "11px 24px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.15)",
                  }}
                >
                  <Sparkles size={16} /> Upgrade to Pro — ₹999
                </button>
              </div>
            ) : interviewsUsed >= 10 ? (
              /* ALL COMPLIMENTARY INTERVIEWS USED */
              <div style={{ textAlign: "center", padding: "28px 20px" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#FEE2E2",
                    border: "1px solid #FECACA",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#EF4444",
                    marginBottom: 12,
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    margin: "0 0 6px",
                    color: "#0F172A",
                  }}
                >
                  You’ve used all 10 complimentary interviews
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#64748B",
                    maxWidth: 440,
                    margin: "0 auto 16px",
                  }}
                >
                  You have completed your complimentary sessions! If you would like to arrange
                  additional custom mock rounds or mentorship, please message our support desk.
                </p>
                <a
                  href="https://wa.me/917606963299?text=Hello!%20I%20have%20completed%20my%2010%20complimentary%20interviews%20and%20would%20like%20to%20request%20additional%20slots."
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#F1F5F9",
                    color: "#0F172A",
                    textDecoration: "none",
                    padding: "9px 18px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <MessageCircle size={15} /> Contact Support for More Slots
                </a>
              </div>
            ) : (
              /* ACTIVE BOOKING FORM */
              <form onSubmit={handleBookInterview}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 18,
                    marginBottom: 16,
                  }}
                >
                  {/* Preferred Date */}
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#0F172A",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Calendar size={14} color="#64748B" /> Preferred Date
                    </label>
                    <input
                      type="date"
                      min={tomorrowStr}
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 9,
                        color: "#0F172A",
                        fontSize: 13,
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Preferred Time Slot */}
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#0F172A",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Clock size={14} color="#64748B" /> Preferred Time Slot
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 9,
                        color: "#0F172A",
                        fontSize: 13,
                        boxSizing: "border-box",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#0F172A",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <FileText size={14} color="#64748B" /> Notes or Focus Areas (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Focus on Merchant Navy sponsorship questions, DNS aptitude, or technical physics questions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: 9,
                      color: "#0F172A",
                      fontSize: 13,
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#64748B" }}>
                    Slot confirmation and Google Meet link will be coordinated via WhatsApp.
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: "#0F172A",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 10,
                      padding: "11px 22px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.15)",
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>{submitting ? "Booking..." : "Book via WhatsApp"}</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── SECTION 2: MY INTERVIEWS TABLE ─────────────────────────────────── */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              padding: "clamp(12px, 4vw, 28px)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    margin: "0 0 3px",
                    color: "#0F172A",
                  }}
                >
                  My Interviews
                </h3>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  Record of your requested and completed mock sessions
                </div>
              </div>
              <button
                type="button"
                onClick={loadBookings}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                ↺ Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 32, textAlign: "center", color: "#64748B", fontSize: 13 }}>
                Loading interview records...
              </div>
            ) : bookings.length === 0 ? (
              <div
                style={{
                  padding: "36px 20px",
                  textAlign: "center",
                  color: "#64748B",
                  fontSize: 13,
                  background: "#F8FAFC",
                  borderRadius: 12,
                  border: "1px dashed #E2E8F0",
                }}
              >
                No mock interviews booked yet. Use the form above to book your first session!
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <th
                        style={{
                          padding: "10px 12px",
                          color: "#64748B",
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        #
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          color: "#64748B",
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          color: "#64748B",
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Time
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          color: "#64748B",
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          color: "#64748B",
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Score / Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => {
                      const fb =
                        feedbacks.find((f) => f.booking_id === b.id) ||
                        (feedbacks.length > 0 && idx === 0 ? feedbacks[0] : null);
                      const isCompleted = b.status?.toLowerCase() === "completed";

                      // Status Badge configuration
                      let badgeBg = "#F1F5F9";
                      let badgeColor = "#64748B";
                      let badgeBorder = "#E2E8F0";

                      if (b.status?.toLowerCase() === "confirmed") {
                        badgeBg = "#EFF6FF";
                        badgeColor = "#1E40AF";
                        badgeBorder = "#BFDBFE";
                      } else if (b.status?.toLowerCase() === "completed") {
                        badgeBg = "#0F172A";
                        badgeColor = "#FFFFFF";
                        badgeBorder = "#0F172A";
                      } else if (b.status?.toLowerCase() === "cancelled") {
                        badgeBg = "#FEF2F2";
                        badgeColor = "#DC2626";
                        badgeBorder = "#FECACA";
                      }

                      return (
                        <tr
                          key={b.id || idx}
                          style={{ borderBottom: "1px solid #F1F5F9" }}
                        >
                          <td style={{ padding: "12px", color: "#64748B", fontWeight: 600 }}>
                            #{bookings.length - idx}
                          </td>
                          <td style={{ padding: "12px", color: "#0F172A", fontWeight: 500 }}>
                            {b.preferred_date
                              ? new Date(b.preferred_date).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td style={{ padding: "12px", color: "#64748B" }}>
                            {b.preferred_time || "—"}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "3px 10px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 600,
                                background: badgeBg,
                                color: badgeColor,
                                border: `1px solid ${badgeBorder}`,
                                textTransform: "capitalize",
                              }}
                            >
                              {b.status || "requested"}
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>
                            {isCompleted ? (
                              fb ? (
                                <button
                                  type="button"
                                  onClick={() => setFeedbackViewModal(fb)}
                                  style={{
                                    background: "#F1F5F9",
                                    border: "1px solid #E2E8F0",
                                    color: "#0F172A",
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                  }}
                                >
                                  <span>Score: {fb.overall ? `${fb.overall}/10` : "View"}</span>
                                  <span>→</span>
                                </button>
                              ) : (
                                <span style={{ color: "#64748B", fontSize: 12 }}>
                                  Feedback Pending
                                </span>
                              )
                            ) : (
                              <span style={{ color: "#94A3B8", fontSize: 12 }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

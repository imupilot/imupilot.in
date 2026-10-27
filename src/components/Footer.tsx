import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogoIcon } from "./Icons";
import { X, Shield, FileText, ExternalLink, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";

export const Footer = () => {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalType(null);
    };
    if (modalType) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalType]);

  return (
    <>
      <footer id="footer" className="border-t border-slate-200 bg-white pt-12">
        <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 py-10 text-center md:flex-row md:items-start md:justify-between">
          <div className="mx-auto max-w-xs md:mx-0">
            <a rel="noreferrer noopener" href="/" className="flex items-center justify-center text-xl font-semibold text-slate-900 md:justify-start">
              <LogoIcon />
              <span className="flex flex-col items-start">
                <span>IMUPilot</span>
                <span className="text-xs font-normal text-slate-500">Powered by TMM</span>
              </span>
            </a>
            <p className="mx-auto mt-4 text-sm text-slate-600">
              Premium preparation for IMUCET aspirants and DNS sponsorship readiness.
            </p>
          </div>

          <div className="grid w-full max-w-3xl gap-8 text-center sm:grid-cols-2 md:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Platform</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <a href="#mock-tests" className="block hover:text-slate-900 transition-colors">Mock Tests</a>
                <a href="#learn" className="block hover:text-slate-900 transition-colors">Learning</a>
                <a href="#analytics" className="block hover:text-slate-900 transition-colors">Analytics</a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Preparation</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <a href="/test" className="block hover:text-slate-900 transition-colors">IMUCET Preparation</a>
                <a href="#dns" className="block hover:text-slate-900 transition-colors">DNS Sponsorship</a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Legal</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <button
                  type="button"
                  onClick={() => setModalType("privacy")}
                  className="block w-full text-center md:text-left hover:text-slate-950 transition-colors font-medium text-slate-700 cursor-pointer"
                >
                  Privacy
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("terms")}
                  className="block w-full text-center md:text-left hover:text-slate-950 transition-colors font-medium text-slate-700 cursor-pointer"
                >
                  Terms
                </button>
                <Link
                  to="/contact"
                  className="block hover:text-slate-950 transition-colors font-medium text-slate-700"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-10 text-center text-sm text-slate-500">
          <p>© 2026 IMUPilot. Powered by TMM.</p>
        </section>
      </footer>

      {/* ── INTERACTIVE LEGAL MODAL ── */}
      {modalType && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setModalType(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(10, 15, 29, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "680px",
              maxHeight: "88vh",
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid #E2E8F0",
              fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F8FAFC",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    background: "#0F172A",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {modalType === "privacy" ? <Shield size={20} color="#60A5FA" /> : <FileText size={20} color="#60A5FA" />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0F172A" }}>
                    {modalType === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    IMUpilot • Effective October 2026
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalType(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "#E2E8F0",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div
              style={{
                padding: "24px",
                overflowY: "auto",
                fontSize: "14px",
                lineHeight: 1.65,
                color: "#334155",
              }}
            >
              {modalType === "privacy" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "12px 16px", color: "#1E40AF", fontSize: "13px" }}>
                    <strong>Privacy Commitment:</strong> We protect your exam history, personal details, and payments. We never sell personal data to third parties.
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 750, color: "#0F172A" }}>
                      1. Information We Collect
                    </h4>
                    <p style={{ margin: 0 }}>
                      We collect your name, email address, mobile number, mock test answers, timing analytics, and revision progress. For payments, we store only confirmation references (<code>razorpay_order_id</code> and <code>razorpay_payment_id</code>). We do <strong>not</strong> collect or store credit card numbers, CVVs, or net banking credentials.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 750, color: "#0F172A" }}>
                      2. Razorpay Payment Gateway
                    </h4>
                    <p style={{ margin: 0 }}>
                      All subscription payments (₹999 Pro plan) are securely processed through <strong>Razorpay Software Private Limited</strong>. Transactions are encrypted using bank-grade 256-bit SSL encryption under PCI-DSS Level 1 compliance.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 750, color: "#0F172A" }}>
                      3. CBT Exam Anti-Cheat Telemetry
                    </h4>
                    <p style={{ margin: 0 }}>
                      During full mock examinations, our test engine monitors browser visibility states and fullscreen mode to emulate the official Indian Maritime University exam environment. We do <strong>not</strong> record webcams, audio, or desktop background applications.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 750, color: "#0F172A" }}>
                      4. Data Storage &amp; Security
                    </h4>
                    <p style={{ margin: 0 }}>
                      Student profiles and test attempts are stored in cloud infrastructure secured with Supabase Row-Level Security (RLS). Only authenticated users can access their individual scores and analytics.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 750, color: "#0F172A" }}>
                      5. Your Rights &amp; Grievances
                    </h4>
                    <p style={{ margin: "0 0 8px" }}>
                      You have the right to review, update, or request deletion of your account and test attempts at any time.
                    </p>
                    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#475569" }}>
                      <div>📧 Email: <a href="mailto:imupilot@gmail.com" style={{ color: "#2563EB", fontWeight: 600 }}>imupilot@gmail.com</a></div>
                      <div>💬 WhatsApp: <a href="https://wa.me/917077664992" target="_blank" rel="noreferrer" style={{ color: "#16A34A", fontWeight: 600 }}>+91 70776 64992</a></div>
                      <div>📍 Location: India (Response within 24-48 hrs)</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "12px 16px", color: "#166534", fontSize: "13px" }}>
                    <strong>Terms of Use:</strong> By accessing IMUpilot, you agree to these exam preparation terms and fair-use guidelines.
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 750, color: "#0F172A" }}>
                      1. Educational Service
                    </h4>
                    <p style={{ margin: 0 }}>
                      IMUpilot provides preparatory Computer-Based Test (CBT) mock simulations, syllabus notes, and DNS sponsorship preparation materials for IMUCET candidates.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 750, color: "#0F172A" }}>
                      2. Pro Plan &amp; Payments
                    </h4>
                    <p style={{ margin: 0 }}>
                      The Pro plan provides full access to all 19 mock tests, chapter notes, and flashcard decks for a one-time payment of ₹999. Access is granted to the registered student account upon successful payment verification.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 750, color: "#0F172A" }}>
                      3. Intellectual Property &amp; Fair Use
                    </h4>
                    <p style={{ margin: 0 }}>
                      All question sets, explanations, blueprint chapters, and proprietary exam simulation software are the intellectual property of IMUpilot. Unauthorized reproduction, distribution, scraping, or commercial resale is strictly prohibited.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 750, color: "#0F172A" }}>
                      4. Examination Disclaimer
                    </h4>
                    <p style={{ margin: 0 }}>
                      IMUpilot is an independent educational training platform. While our test engine reflects the official pattern and syllabus, final ranks and admission depend on performance in the official Indian Maritime University examination.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F8FAFC",
              }}
            >
              {modalType === "privacy" ? (
                <Link
                  to="/privacy"
                  onClick={() => setModalType(null)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    color: "#2563EB",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <span>Open Full Page View</span>
                  <ExternalLink size={13} />
                </Link>
              ) : (
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  IMUpilot Educational Platform
                </span>
              )}

              <button
                type="button"
                onClick={() => setModalType(null)}
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

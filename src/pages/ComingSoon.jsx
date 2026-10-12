import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Sparkles, ExternalLink } from "lucide-react";
import { LogoIcon } from "../components/Icons";

export default function ComingSoon() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#FFFFFF",
      color: "#0f172a",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    }}>
      {/* Header matching landing page */}
      <header style={{
        height: 72,
        borderBottom: "1px solid #e2e8f0",
        background: "rgba(255, 255, 255, 0.95)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Link
            to="/"
            style={{
              color: "#0f172a",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.03em",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <span style={{ color: "#0f172a", display: "inline-flex" }}>
              <LogoIcon />
            </span>
            <span>IMUPilot</span>
          </Link>

          <Link
            to="/"
            style={{
              color: "#475569",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.15s ease"
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 20px"
      }}>
        <div style={{
          maxWidth: 640,
          width: "100%",
          textAlign: "center",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 28,
          padding: "clamp(32px, 6vw, 56px) clamp(24px, 5vw, 44px)",
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)"
        }}>
          {/* Eyebrow badge matching landing page */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#334155",
            borderRadius: 999,
            padding: "7px 16px",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 26
          }}>
            <Sparkles size={13} color="#0f172a" />
            <span>Early Access &amp; Public Launch</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(2.1rem, 5vw, 3rem)",
            fontWeight: 650,
            letterSpacing: "-0.045em",
            lineHeight: 1.15,
            margin: "0 0 16px",
            color: "#0f172a"
          }}>
            We're launching soon.
          </h1>

          {/* Subtitle / body text */}
          <p style={{
            color: "#475569",
            fontSize: 16,
            lineHeight: 1.65,
            margin: "0 auto 32px",
            maxWidth: 520
          }}>
            IMUPilot is finalizing its comprehensive question bank, full-length mock test engines, and sponsorship preparation modules. Public registrations will open shortly.
          </p>

          {/* Target launch card */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: "16px 22px",
            marginBottom: 36,
            color: "#334155",
            fontSize: 14,
            fontWeight: 500
          }}>
            <Clock size={18} color="#0f172a" style={{ flexShrink: 0 }} />
            <span>Target Launch: IMUCET 2027 &amp; DNS Sponsorship Batches</span>
          </div>

          {/* Call to Action: Early Access Registration */}
          <div style={{ marginBottom: 28 }}>
            <a
              href="https://forms.gle/r2gBFBgJ6e7AwAtP6"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#0f172a",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
                padding: "14px 34px",
                borderRadius: 999,
                boxShadow: "0 6px 20px rgba(15, 23, 42, 0.16)",
                transition: "background 0.15s ease, transform 0.15s ease"
              }}
            >
              <span>Register for Early Access</span>
              <ExternalLink size={16} />
            </a>
            <p style={{
              color: "#64748b",
              fontSize: 13,
              marginTop: 12,
              marginBottom: 0
            }}>
              Fill out the form and we'll contact you when IMUPilot opens.
            </p>
          </div>

          {/* Secondary Link to Home */}
          <div>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                color: "#475569",
                border: "1px solid #e2e8f0",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 13,
                padding: "10px 24px",
                borderRadius: 999,
                transition: "all 0.15s ease"
              }}
            >
              Explore Overview on Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer matching landing page */}
      <footer style={{
        padding: "24px 20px",
        textAlign: "center",
        borderTop: "1px solid #e2e8f0",
        color: "#94a3b8",
        fontSize: 13
      }}>
        © 2026 IMUPilot. All rights reserved.
      </footer>
    </div>
  );
}

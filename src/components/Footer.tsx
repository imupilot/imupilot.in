import React from "react";
import { Link } from "react-router-dom";
import { LogoIcon } from "./Icons";

export const Footer = () => {
  return (
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
                <Link
                  to="/privacy"
                  className="block hover:text-slate-900 transition-colors text-sm"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="block hover:text-slate-900 transition-colors text-sm"
                >
                  Terms
                </Link>
                <Link
                  to="/contact"
                  className="block hover:text-slate-900 transition-colors text-sm"
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
  );
};

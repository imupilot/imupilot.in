import { LogoIcon } from "./Icons";

export const Footer = () => {
  return (
    <footer id="footer" className="border-t border-slate-200 pt-12">
      <section className="container flex flex-col gap-10 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <a rel="noreferrer noopener" href="/" className="flex items-center text-xl font-semibold text-slate-900">
            <LogoIcon />
            IMUPilot
          </a>
          <p className="mt-4 text-sm text-slate-600">
            Premium preparation for IMUCET aspirants and DNS sponsorship readiness.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Platform</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a href="#mock-tests" className="block hover:text-slate-900">Mock Tests</a>
              <a href="#learn" className="block hover:text-slate-900">Learning</a>
              <a href="#analytics" className="block hover:text-slate-900">Analytics</a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Preparation</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a href="#" className="block hover:text-slate-900">IMUCET Preparation</a>
              <a href="#dns" className="block hover:text-slate-900">DNS Sponsorship</a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Legal</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a href="#" className="block hover:text-slate-900">Privacy</a>
              <a href="#" className="block hover:text-slate-900">Terms</a>
              <a href="#" className="block hover:text-slate-900">Contact</a>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-10 text-sm text-slate-500">
        <p>© 2026 IMUPilot.</p>
      </section>
    </footer>
  );
};

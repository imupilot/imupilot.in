import { LogoIcon } from "./Icons";

export const Footer = () => {
  return (
    <footer id="footer" className="border-t border-slate-200 pt-12">
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

      <section className="mx-auto w-full max-w-7xl px-4 pb-10 text-center text-sm text-slate-500">
        <p>© 2026 IMUPilot.</p>
      </section>
    </footer>
  );
};

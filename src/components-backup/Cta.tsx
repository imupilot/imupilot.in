import { ArrowRight, Compass } from "lucide-react";
import { Button } from "./ui/button";

const dnsModules = [
  {
    title: "Aptitude",
    description: "Quantitative & numerical ability",
  },
  {
    title: "Physics",
    description: "Core concepts & application",
  },
  {
    title: "Mathematics",
    description: "Speed, accuracy & problem solving",
  },
  {
    title: "English",
    description: "Grammar, vocabulary & comprehension",
  },
  {
    title: "Logical reasoning",
    description: "Patterns, logic & decision making",
  },
  {
    title: "Interview preparation",
    description: "HR & sponsorship interviews",
  },
];

export const Cta = () => {
  return (
    <section id="dns" className="relative overflow-hidden border-t border-slate-200 bg-slate-50 py-20 md:py-24">
      <div className="container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            DNS SPONSORSHIP PREPARATION
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
            Prepare for what comes after IMUCET.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            Prepare for DNS sponsorship with structured practice, reasoning, interview preparation and targeted revision — all in one place.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {dnsModules.map(({ title, description }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-slate-300 hover:shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-900">
                  <Compass className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">{title}</div>
                  <div className="mt-1 text-[11px] leading-5 text-slate-500">{description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-slate-300 hover:shadow-[0_10px_20px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            ROUTE TO READINESS
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">
            Know where you stand before sponsorship.
          </h3>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Practice with purpose. Understand your weaknesses. Improve before the interview.
          </p>
          <Button className="mt-6 rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800">
            Explore DNS Preparation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

import { Activity, Clock3, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Accuracy", value: "79%", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Time", value: "42s", icon: <Clock3 className="h-4 w-4" /> },
  { label: "Score", value: "84%", icon: <Activity className="h-4 w-4" /> },
];

const subjectPerformance = [
  { name: "Physics", score: 88 },
  { name: "Mathematics", score: 79 },
  { name: "English", score: 74 },
  { name: "Reasoning", score: 66 },
];

export const Newsletter = () => {
  return (
    <section id="analytics" className="container py-20 md:py-24">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Analytics
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
            Don’t just see your score.
            <span className="mt-2 block text-slate-700">Understand it.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 md:text-lg">
            Review accuracy, time spent, chapter weaknesses and subject patterns to build a sharper plan for the next revision cycle.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map(({ label, value, icon }) => (
              <div key={label} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-sm">{label}</span>
                  {icon}
                </div>
                <div className="mt-4 text-3xl font-bold text-slate-900">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
              <span className="font-medium text-slate-700">Subject performance</span>
              <span>This week</span>
            </div>

            <div className="space-y-4">
              {subjectPerformance.map(({ name, score }) => (
                <div key={name}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                    <span>{name}</span>
                    <span>{score}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-slate-900" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

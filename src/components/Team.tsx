import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const options = ["A. 24", "B. 28", "C. 32", "D. 36"];

export const Team = () => {
  return (
    <section id="mock-tests" className="mx-auto w-full max-w-7xl px-4 py-20 md:py-24">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Mock test experience
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
            Practice in an environment
            <span className="mt-2 block text-slate-700">that feels familiar on exam day.</span>
          </h2>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Question 12 of 40
            </p>
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white">
              18:42
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-slate-200 bg-slate-50 shadow-none">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  If the sum of the first 8 natural numbers is 36, what is the average value?
                </h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {options.map((option, index) => (
                  <button
                    key={option}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                      index === 2
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <span>{option}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="rounded-[1.3rem] border border-slate-200 bg-slate-100 p-3">
                <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Palette</p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex h-8 items-center justify-center rounded-lg text-[10px] font-medium ${
                        idx === 4
                          ? "bg-slate-900 text-white"
                          : idx % 2 === 0
                            ? "bg-slate-200 text-slate-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.3rem] border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <span>Progress</span>
                  <span>30%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[30%] rounded-full bg-slate-900" />
                </div>
              </div>

              <Button className="w-full rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800">
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

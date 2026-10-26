const valuePoints = [
  "10,000+ Questions",
  "Full-Length Mock Tests",
  "Chapter-wise Practice",
  "Performance Analytics",
];

export const Sponsors = () => {
  return (
    <section id="sponsors" className="container py-8 md:py-10">
      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center">
          {valuePoints.map((item) => (
            <div
              key={item}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

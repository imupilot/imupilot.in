const learningPath = [
  "Subject",
  "Chapter",
  "Topic",
  "Practice",
  "Revision",
];

export const Services = () => {
  return (
    <section id="learn" className="container py-20 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Learning
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
          A clearer way to study.
        </h2>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-5 md:items-start">
        {learningPath.map((label, index) => (
          <div key={label} className="flex items-center justify-center md:flex-col">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {label.slice(0, 2)}
            </div>
            <div className="ml-3 text-left text-sm font-medium text-slate-700 md:ml-0 md:mt-3 md:text-center">
              {label}
            </div>
            {index < learningPath.length - 1 && (
              <div className="ml-3 h-px w-8 bg-slate-200 md:mt-4 md:ml-0 md:w-px md:h-8" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

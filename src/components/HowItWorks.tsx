import { useEffect, useRef, useState } from "react";

const steps = [
  { number: "01", label: "Practice" },
  { number: "02", label: "Analyze" },
  { number: "03", label: "Identify Weaknesses" },
  { number: "04", label: "Revise" },
  { number: "05", label: "Improve" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const viewportHeight = window.innerHeight;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = section.getBoundingClientRect().height;
      const scrollRange = Math.max(sectionHeight - viewportHeight, 1);
      const nextProgress = clamp((window.scrollY - sectionTop) / scrollRange, 0, 1);

      setProgress(nextProgress);
    };

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(handleScroll);
    };

    handleScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const activeIndex = Math.min(Math.floor(progress * steps.length), steps.length - 1);

  return (
    <section ref={sectionRef} className="imupilot-method-section" aria-label="IMUPilot method section">
      <div className="imupilot-method-header">
        <p>THE IMUPILOT METHOD</p>
      </div>

      <div className="imupilot-method-scroller">
        <div className="imupilot-method-sticky">
          <div
            className="imupilot-method-rail"
            role="list"
            aria-label="IMUPilot method progress timeline"
          >
            <div className="imupilot-method-line" aria-hidden="true">
              <div
                className="imupilot-method-line-fill"
                style={{ width: `${Math.min(progress * 125, 100)}%` }}
              />
            </div>

            <div className="imupilot-method-steps">
              {steps.map((step, index) => {
                const isActive = index <= activeIndex;

                return (
                  <div
                    key={step.number}
                    className={`imupilot-method-step ${isActive ? "is-active" : ""}`}
                    role="listitem"
                    aria-current={index === activeIndex ? "step" : undefined}
                  >
                    <div className="imupilot-method-node">{step.number}</div>
                    <div className="imupilot-method-label">{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

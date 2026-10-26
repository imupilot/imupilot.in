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
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => setReducedMotion(motionQuery.matches);

    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => {
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const viewportHeight = window.innerHeight;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollRange = Math.max(sectionHeight - viewportHeight, 1);
      const nextProgress = clamp((window.scrollY - sectionTop) / scrollRange, 0, 1);

      setProgress(reducedMotion ? 1 : nextProgress);
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
  }, [reducedMotion]);

  const progressValue = reducedMotion ? 1 : progress;
  const totalSteps = steps.length - 1;
  const stepProgress = progressValue * totalSteps;
  const activeIndex = Math.round(stepProgress);

  return (
    <section ref={sectionRef} className="imupilot-method-section container" aria-label="IMUPilot method section">
      <div className="imupilot-method-header">
        <p>THE IMUPILOT METHOD</p>
      </div>

      <div className="imupilot-method-scroller">
        <div className="imupilot-method-sticky">
          <div className="imupilot-method-rail" aria-label="IMUPilot method progress timeline">
            <div className="imupilot-method-line" aria-hidden="true">
              <div className="imupilot-method-line-fill" style={{ width: `${progressValue * 100}%` }} />
            </div>

            <div className="imupilot-method-steps">
              {steps.map((step, index) => {
                const isComplete = index < activeIndex;
                const isActive = index === activeIndex;

                return (
                  <div
                    key={step.number}
                    className={`imupilot-method-step ${isComplete ? "is-complete" : ""} ${
                      isActive ? "is-active" : ""
                    }`}
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

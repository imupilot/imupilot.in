import { useEffect, useRef, useState } from "react";

const stages = [
  {
    number: "01",
    title: "REALISTIC IMUCET MOCK TESTS",
    description:
      "Practice in an exam-style environment designed to closely mirror the real IMUCET test-taking experience.",
    previewTitle: "Mock Test",
    previewLines: ["Physics", "Mathematics", "English", "Reasoning"],
  },
  {
    number: "02",
    title: "CHAPTER-WISE PRACTICE",
    description: "Focus on specific chapters instead of solving random questions.",
    previewTitle: "Physics",
    previewLines: [
      "Units & Measurements",
      "Kinematics",
      "Laws of Motion",
      "Work & Energy",
    ],
  },
  {
    number: "03",
    title: "PREVIOUS YEAR QUESTIONS",
    description:
      "Understand recurring concepts, question patterns and difficulty through previous papers.",
    previewTitle: "PYQ Tracker",
    previewLines: ["Aptitude", "Application", "Concept Recall", "High weightage"],
  },
  {
    number: "04",
    title: "PERFORMANCE ANALYTICS",
    description: "Understand your accuracy, speed, subject performance and weak areas.",
    previewTitle: "Analytics",
    previewLines: ["Accuracy", "Time per question", "Weak chapters", "Section score"],
  },
  {
    number: "05",
    title: "SMART REVISION",
    description: "Turn mistakes and weak topics into a focused revision plan.",
    previewTitle: "Revision Queue",
    previewLines: ["Redo mistakes", "Prioritize weak topics", "Timed recap", "Fast review"],
  },
  {
    number: "06",
    title: "FLASHCARDS",
    description: "Revise formulas, concepts and high-yield information quickly.",
    previewTitle: "Flashcards",
    previewLines: ["Formula recall", "Concept review", "Quick drills", "Active retention"],
  },
  {
    number: "07",
    title: "COLLEGE PREDICTOR",
    description: "Use your performance to understand possible college outcomes.",
    previewTitle: "Predictor",
    previewLines: ["Current trend", "Best-fit options", "Goal alignment", "Future planning"],
  },
  {
    number: "08",
    title: "DNS SPONSORSHIP PREPARATION",
    description:
      "Prepare for the next step with sponsorship-focused practice and resources.",
    previewTitle: "DNS Prep",
    previewLines: ["Aptitude", "Physics", "Reasoning", "Interview readiness"],
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const Features = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotion = () => setReducedMotion(motionQuery.matches);
    updateMotion();

    motionQuery.addEventListener("change", updateMotion);

    return () => {
      motionQuery.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    if (reducedMotion) {
      setProgress(1);
      setActiveIndex(stages.length - 1);
      return;
    }

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollRange = Math.max(sectionHeight - viewportHeight, 1);
      const currentScroll = window.scrollY;
      const rawProgress = (currentScroll - sectionTop) / scrollRange;
      const clampedProgress = clamp(rawProgress, 0, 1);
      const nextIndex = Math.min(7, Math.floor(clampedProgress * stages.length));

      setProgress(clampedProgress);
      setActiveIndex(nextIndex);
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

  const activeStage = stages[activeIndex];
  const progressPercent = Math.min(progress * 100, 100);

  return (
    <section id="features" ref={sectionRef} className="curved-path-section container">
      <div className="curved-path-header">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          8 core features
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
          Practice the way that matches where you are in your preparation.
        </h2>
      </div>

      <div className="curved-path-scroll" aria-label="IMUPilot feature journey">
        <div className="curved-path-sticky">
          <div className="curved-path-grid">
            <div className="curved-path-visual">
              <div
                className="progress-line-shell"
                style={{ ["--progress" as any]: `${progressPercent}%` }}
                aria-label="IMUPilot feature progress indicator"
              >
                <div className="progress-line-track" />

                <div className="progress-line-grid">
                  {stages.map((stage, index) => {
                    const isCompleted = index <= activeIndex;
                    const isActive = index === activeIndex;

                    return (
                      <div
                        key={stage.number}
                        className={`progress-node ${isCompleted ? "is-complete" : ""} ${
                          isActive ? "is-active" : ""
                        }`}
                      >
                        <span>{stage.number}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="curved-path-content-wrap">
              <div className="curved-path-content" key={activeStage.number}>
                <div className="curved-path-copy">
                  <div className="curved-path-stage-tag">{activeStage.number}</div>
                  <h3>{activeStage.title}</h3>
                  <p>{activeStage.description}</p>
                </div>

                <div className="curved-path-preview">
                  {activeStage.title === "REALISTIC IMUCET MOCK TESTS" && (
                    <div className="curved-path-preview-panel">
                      <div className="preview-header">
                        <span>Question 12 of 40</span>
                        <span>18:42</span>
                      </div>
                      <div className="preview-question">
                        If the sum of the first 8 natural numbers is 36, what is the average value?
                      </div>
                      <div className="preview-options">
                        <span className="selected">C. 32</span>
                        <span>A. 24</span>
                        <span>B. 28</span>
                        <span>D. 36</span>
                      </div>
                    </div>
                  )}

                  {activeStage.title === "CHAPTER-WISE PRACTICE" && (
                    <div className="curved-path-preview-panel chapter-panel">
                      <div className="chapter-header">Physics</div>
                      <ul>
                        {activeStage.previewLines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeStage.title === "PREVIOUS YEAR QUESTIONS" && (
                    <div className="curved-path-preview-panel pyq-panel">
                      <div className="chapter-header">PYQ Tracker</div>
                      <ul>
                        {activeStage.previewLines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeStage.title === "PERFORMANCE ANALYTICS" && (
                    <div className="curved-path-preview-panel analytics-panel">
                      <div className="mini-metrics">
                        <span>Accuracy 79%</span>
                        <span>Time 42s</span>
                        <span>Score 84%</span>
                      </div>
                      <div className="bars">
                        <div>
                          <label>Physics</label>
                          <span style={{ width: "88%" }} />
                        </div>
                        <div>
                          <label>Mathematics</label>
                          <span style={{ width: "79%" }} />
                        </div>
                        <div>
                          <label>English</label>
                          <span style={{ width: "74%" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStage.title === "SMART REVISION" && (
                    <div className="curved-path-preview-panel revision-panel">
                      <div className="chapter-header">Revision Queue</div>
                      <ul>
                        {activeStage.previewLines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeStage.title === "FLASHCARDS" && (
                    <div className="curved-path-preview-panel flashcard-panel">
                      <div className="card-front">Formula of Motion</div>
                      <div className="flashcard-grid">
                        <span>v = u + at</span>
                        <span>s = ut + 1/2 at²</span>
                      </div>
                    </div>
                  )}

                  {activeStage.title === "COLLEGE PREDICTOR" && (
                    <div className="curved-path-preview-panel predictor-panel">
                      <div className="chapter-header">Possibility Range</div>
                      <div className="predictor-boxes">
                        <span>Strong Fit</span>
                        <span>Likely</span>
                        <span>Stretch</span>
                      </div>
                    </div>
                  )}

                  {activeStage.title === "DNS SPONSORSHIP PREPARATION" && (
                    <div className="curved-path-preview-panel sponsorship-panel">
                      <div className="chapter-header">DNS Prep</div>
                      <ul>
                        {activeStage.previewLines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock3, ListTodo } from "lucide-react";
import { Button } from "./ui/button";

const demoQuestions = [
  {
    text: "If the sum of the first 8 natural numbers is 36, what is the average value?",
    options: ["A. 24", "B. 28", "C. 32", "D. 36"],
    correctIndex: 2,
  },
  {
    text: "A resistor of 6 Ω and a resistor of 12 Ω are connected in parallel. What is the equivalent resistance?",
    options: ["A. 2 Ω", "B. 4 Ω", "C. 6 Ω", "D. 18 Ω"],
    correctIndex: 1,
  },
  {
    text: "Choose the correct synonym for the word 'diligent'.",
    options: ["A. Careless", "B. Lazy", "C. Hardworking", "D. Quick"],
    correctIndex: 2,
  },
  {
    text: "A train travels 120 km in 2 hours. What is its average speed?",
    options: ["A. 40 km/h", "B. 50 km/h", "C. 60 km/h", "D. 80 km/h"],
    correctIndex: 2,
  },
  {
    text: "Which of the following is a scalar quantity?",
    options: ["A. Velocity", "B. Force", "C. Speed", "D. Acceleration"],
    correctIndex: 2,
  },
  {
    text: "Choose the correctly punctuated sentence.",
    options: [
      "A. The student said, I am ready for the exam.",
      "B. The student said, \"I am ready for the exam.\"",
      "C. The student said, \"I am ready for the exam\".",
      "D. The student said I am ready for the exam.",
    ],
    correctIndex: 1,
  },
  {
    text: "The velocity-time graph of a uniformly accelerated body is a straight line. What does its slope represent?",
    options: ["A. Displacement", "B. Acceleration", "C. Velocity", "D. Distance"],
    correctIndex: 1,
  },
  {
    text: "The sum of the interior angles of a hexagon is:",
    options: ["A. 360°", "B. 540°", "C. 720°", "D. 900°"],
    correctIndex: 2,
  },
  {
    text: "If x + 7 = 15, what is the value of x?",
    options: ["A. 6", "B. 7", "C. 8", "D. 9"],
    correctIndex: 2,
  },
  {
    text: "Which organ in the human body pumps blood throughout the body?",
    options: ["A. Lungs", "B. Brain", "C. Heart", "D. Kidney"],
    correctIndex: 2,
  },
];

export const Hero = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(18 * 60 + 42);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const advanceTimeoutRef = useRef<number | null>(null);

  const activeQuestion = demoQuestions[currentQuestion];
  const attemptedCount = Object.keys(selectedAnswers).length;
  const attemptedPercent = Math.round((attemptedCount / demoQuestions.length) * 100);
  const answeredCorrectly = demoQuestions.reduce((total, question, index) => {
    if (selectedAnswers[index] === question.correctIndex) {
      return total + 1;
    }
    return total;
  }, 0);
  const accuracyPercent = attemptedCount > 0 ? Math.round((answeredCorrectly / attemptedCount) * 100) : null;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
      if (advanceTimeoutRef.current !== null) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  const clearPendingAdvance = () => {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  };

  const handleResetDemo = () => {
    clearPendingAdvance();
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setIsTransitioning(false);
    setIsComplete(false);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (isTransitioning || isComplete) {
      return;
    }

    const currentIndex = currentQuestion;
    setSelectedAnswers((previous) => ({
      ...previous,
      [currentIndex]: optionIndex,
    }));
    setIsTransitioning(true);

    if (currentIndex === demoQuestions.length - 1) {
      advanceTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
        setIsComplete(true);
        advanceTimeoutRef.current = null;
      }, 180);
      return;
    }

    advanceTimeoutRef.current = window.setTimeout(() => {
      setCurrentQuestion((previous) => previous + 1);
      setIsTransitioning(false);
      advanceTimeoutRef.current = null;
    }, 180);
  };

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <section className="relative w-full overflow-hidden bg-slate-50 pt-6 pb-16 md:pt-10 md:pb-24">
      {/* Maritime Hero Background & Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat bg-right-top md:bg-center pointer-events-none opacity-85 transition-opacity duration-700"
        style={{ backgroundImage: "url('/maritime-hero.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95 md:from-white/90 md:via-white/70 md:to-white pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/75 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="home-hero-copy mx-auto max-w-4xl text-center">
          <div className="inline-flex rounded-full border border-sky-200/70 bg-sky-50/80 backdrop-blur-sm px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-950 shadow-sm">
            IMUCET + DNS SPONSORSHIP PREPARATION
          </div>

          <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-950">
            Prepare for IMUCET
            <span className="mt-1 block text-slate-700">with clarity.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-xl font-medium tracking-tight text-slate-700">
            Practice. Analyze. Improve.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild className="rounded-full bg-slate-950 px-7 py-6 text-base font-semibold text-white shadow-lg hover:bg-slate-800 transition">
              <Link to="/auth">
                Start Preparing Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link to="/test" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-slate-950">
              Explore Mock Tests
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-6 text-sm font-medium text-slate-500">Built for serious IMUCET aspirants.</p>
        </div>

        {/* Bottom Preview Panel matching reference image */}
        <div className="mx-auto mt-14 w-full max-w-5xl rounded-t-[2.5rem] sm:rounded-t-[3rem] border border-b-0 border-sky-100 bg-white/95 backdrop-blur-md pt-5 px-6 sm:px-10 pb-8 shadow-[0_-15px_40px_rgba(15,23,42,0.06)]">
          {/* Header Bar: 3 dots on left, 16:15 capsule on right */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-slate-900" />
              <span className="h-3 w-3 rounded-full bg-sky-200" />
              <span className="h-3 w-3 rounded-full bg-sky-200" />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-sky-50 border border-sky-100/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-sky-900">
              <Clock3 className="h-3.5 w-3.5 text-sky-700" />
              <span>16:15</span>
            </div>
          </div>

          {/* Interactive Question and Test Preview */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 sm:p-6 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {isComplete ? "Demo Complete" : `Question ${currentQuestion + 1} of ${demoQuestions.length}`}
                </span>
                <span className="text-xs font-medium text-slate-400">IMUCET Mock</span>
              </div>

              {isComplete ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-left">
                  <p className="text-base font-semibold text-slate-900">Your mock-test preview is complete.</p>
                  <p className="mt-1 text-sm text-slate-600">Start full preparation to access over 2,000+ curated questions.</p>
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="mt-4 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    Restart Preview
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="mt-3.5 text-lg sm:text-xl font-semibold leading-snug text-slate-900">
                    {activeQuestion.text}
                  </h2>

                  <div className="mt-5 space-y-2.5">
                    {activeQuestion.options.map((option, index) => {
                      const selectedIndex = selectedAnswers[currentQuestion];
                      const isSelected = selectedIndex === index;
                      const showSelectedState = isSelected && isTransitioning;

                      return (
                        <button
                          key={`${currentQuestion}-${option}`}
                          type="button"
                          onClick={() => handleSelectAnswer(index)}
                          disabled={isTransitioning}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                            showSelectedState || isSelected
                              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                              : "border-slate-200/80 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/50"
                          } ${isTransitioning ? "cursor-default" : "cursor-pointer"}`}
                        >
                          <span>{option}</span>
                          {(showSelectedState || isSelected) && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col justify-between gap-3.5">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <span>Question Navigator</span>
                  <span className="text-slate-400">{demoQuestions.length} Total</span>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {demoQuestions.map((_, index) => {
                    const isCurrent = index === currentQuestion;
                    const isAnswered = selectedAnswers[index] !== undefined;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (isTransitioning || isComplete) return;
                          setCurrentQuestion(index);
                        }}
                        disabled={isTransitioning || isComplete}
                        className={`flex h-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                          isCurrent
                            ? "bg-slate-900 text-white shadow-xs"
                            : isAnswered
                              ? "bg-sky-100 text-sky-900"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        } ${isTransitioning || isComplete ? "cursor-default" : "cursor-pointer"}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <span>Progress</span>
                  <span className="text-slate-900 font-bold">{attemptedPercent}%</span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-slate-900 transition-all duration-300" style={{ width: `${attemptedPercent}%` }} />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <span>Accuracy</span>
                  <ListTodo className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight">
                  {accuracyPercent === null ? "--" : `${accuracyPercent}%`}
                </div>
                <p className="mt-0.5 text-xs text-slate-400">Instant evaluation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

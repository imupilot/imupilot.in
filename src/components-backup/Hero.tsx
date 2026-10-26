import { useEffect, useRef, useState } from "react";
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
    <section className="container py-16 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
          IMUCET + DNS SPONSORSHIP PREPARATION
        </div>

        <h1 className="mt-7 text-4xl font-semibold tracking-[-0.05em] text-slate-900 md:text-6xl">
          Prepare for IMUCET
          <span className="mt-2 block text-slate-700">with clarity.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Practice. Analyze. Improve.
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
          A focused preparation platform for IMUCET aspirants — combining realistic
          mock tests, structured learning, previous year questions, performance
          analytics and revision.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button className="rounded-full bg-slate-900 px-6 py-5 text-base font-medium text-white hover:bg-slate-800">
            Start Preparing Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-900">
            Explore Mock Tests
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-6 text-sm text-slate-500">Built for serious IMUCET aspirants.</p>
      </div>

      <div className="mx-auto mt-14 max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
            <Clock3 className="h-3.5 w-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {isComplete ? "Demo complete" : `Question ${currentQuestion + 1} of ${demoQuestions.length}`}
            </p>

            {isComplete ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-left">
                <p className="text-sm font-medium text-slate-900">Your mock-test demo is complete.</p>
                <p className="mt-1 text-sm text-slate-600">You can restart the flow whenever you want.</p>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Restart Demo
                </button>
              </div>
            ) : (
              <>
                <h2 className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">
                  {activeQuestion.text}
                </h2>

                <div className="mt-4 space-y-2">
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
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition duration-200 ${
                          showSelectedState || isSelected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700"
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

          <div className="space-y-3">
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Palette</p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {demoQuestions.map((_, index) => {
                  const isCurrent = index === currentQuestion;
                  const isAnswered = selectedAnswers[index] !== undefined;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (isTransitioning || isComplete) {
                          return;
                        }
                        setCurrentQuestion(index);
                      }}
                      disabled={isTransitioning || isComplete}
                      className={`flex h-8 items-center justify-center rounded-lg text-[10px] font-medium transition duration-200 ${
                        isCurrent
                          ? "bg-slate-900 text-white"
                          : isAnswered
                            ? "bg-slate-200 text-slate-700"
                            : "bg-slate-100 text-slate-700"
                      } ${isTransitioning || isComplete ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-100 p-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <span>Attempted</span>
                <span>{attemptedPercent}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-900 transition-all duration-200" style={{ width: `${attemptedPercent}%` }} />
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-900 p-3 text-white">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-300">
                <span>Mark</span>
                <ListTodo className="h-3.5 w-3.5" />
              </div>
              <div className="mt-3 text-2xl font-bold">{accuracyPercent === null ? "--" : `${accuracyPercent}%`}</div>
              <p className="mt-1 text-[11px] text-slate-300">Current accuracy</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-xl text-center text-sm text-slate-500">
        Designed to mirror the real IMUCET test-taking experience.
      </p>
    </section>
  );
};

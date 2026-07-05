import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Target, TrendingUp, CheckCircle2, XCircle, MinusCircle, BookOpen, RotateCcw, Lightbulb } from 'lucide-react';

const SUBJECT_STYLE = {
  Physics:     { bar: 'bg-blue-600',   text: 'text-blue-700',   light: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800'   },
  Mathematics: { bar: 'bg-purple-600', text: 'text-purple-700', light: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' },
  Chemistry:   { bar: 'bg-green-600',  text: 'text-green-700',  light: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-800'  },
  English:     { bar: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
};

const DIFFICULTY_STYLE = {
  Easy:   'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard:   'bg-red-100 text-red-700',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function formatTimeTaken(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getRankInfo(accuracy) {
  if (accuracy > 80) return { label: 'Top 10%', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (accuracy > 60) return { label: 'Top 30%', className: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { label: 'Keep Practicing', className: 'text-red-700 bg-red-50 border-red-200' };
}

export default function TestResult() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('imupilot_last_result');
      if (raw) setResult(JSON.parse(raw));
    } catch {
      // corrupted storage — leave result as null
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Trophy className="text-gray-300" size={48} />
        <p className="text-gray-500 text-lg font-medium">No test result found.</p>
        <p className="text-gray-400 text-sm">Complete a mock test to see your results here.</p>
        <button
          onClick={() => navigate('/test')}
          className="mt-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          Take a Test
        </button>
      </div>
    );
  }

  const { score, totalQuestions, accuracy, subjectBreakdown, answers, questions, timeTakenSeconds } = result;
  const rank = getRankInfo(accuracy);

  const getQuestionStatus = (q) => {
    const selected = answers[q.id];
    if (selected === undefined || selected === null) return 'Skipped';
    return selected === q.correctAnswer ? 'Correct' : 'Incorrect';
  };

  const filteredQuestions = filter === 'All'
    ? questions
    : questions.filter(q => getQuestionStatus(q) === filter);

  const counts = {
    Correct:   questions.filter(q => getQuestionStatus(q) === 'Correct').length,
    Incorrect: questions.filter(q => getQuestionStatus(q) === 'Incorrect').length,
    Skipped:   questions.filter(q => getQuestionStatus(q) === 'Skipped').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* ── Section 1: Score Summary ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Test Results</h1>
        <p className="text-gray-500 text-sm">Detailed breakdown of your performance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Score */}
        <div className="col-span-2 md:col-span-1 bg-blue-900 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-200 text-sm font-semibold mb-3">
            <Trophy size={16} /> Score
          </div>
          <div>
            <span className="text-4xl font-extrabold">{score}</span>
            <span className="text-blue-300 text-lg font-medium"> / {totalQuestions}</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-3">
            <Target size={16} /> Accuracy
          </div>
          <div className={`text-3xl font-extrabold ${accuracy >= 70 ? 'text-emerald-600' : accuracy >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
            {accuracy}%
          </div>
        </div>

        {/* Time */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-3">
            <Clock size={16} /> Time Taken
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {formatTimeTaken(timeTakenSeconds)}
          </div>
        </div>

        {/* Rank */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-3">
            <TrendingUp size={16} /> Est. Rank
          </div>
          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-sm font-bold ${rank.className}`}>
            {rank.label}
          </div>
        </div>
      </div>

      {/* Question count strip */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Correct',   count: counts.Correct,   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Incorrect', count: counts.Incorrect, color: 'bg-red-50 text-red-700 border-red-200' },
          { label: 'Skipped',   count: counts.Skipped,   color: 'bg-gray-50 text-gray-600 border-gray-200' },
        ].map(item => (
          <div key={item.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${item.color}`}>
            <span className="text-xl font-extrabold">{item.count}</span> {item.label}
          </div>
        ))}
      </div>

      {/* ── Section 2: Subject Breakdown ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Subject Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(subjectBreakdown).map(([subject, data]) => {
            const style = SUBJECT_STYLE[subject] || SUBJECT_STYLE['Physics'];
            return (
              <div key={subject} className={`bg-white rounded-2xl border ${style.border} p-5 shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${style.badge}`}>{subject}</span>
                  <span className={`text-xl font-extrabold ${style.text}`}>{data.accuracy}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>{data.correct} correct of {data.total} attempted</span>
                  <span>{data.total - data.correct} wrong</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${style.bar} transition-all duration-500`}
                    style={{ width: `${data.accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Question Review ── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-gray-900">Question Review</h2>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {['All', 'Correct', 'Incorrect', 'Skipped'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f} {f !== 'All' && <span className="ml-1 text-xs opacity-70">({counts[f]})</span>}
              </button>
            ))}
          </div>
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-gray-400">No questions match this filter.</div>
        )}

        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const status = getQuestionStatus(q);
            const selectedIdx = answers[q.id];
            const subStyle = SUBJECT_STYLE[q.subject] || SUBJECT_STYLE['Physics'];

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Question Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-bold text-gray-700">Q{questions.indexOf(q) + 1}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${subStyle.badge}`}>{q.topic_tag}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${DIFFICULTY_STYLE[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>{q.difficulty}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${
                    status === 'Correct'   ? 'bg-emerald-100 text-emerald-700' :
                    status === 'Incorrect' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-500'
                  }`}>
                    {status === 'Correct'   && <CheckCircle2 size={15} />}
                    {status === 'Incorrect' && <XCircle size={15} />}
                    {status === 'Skipped'   && <MinusCircle size={15} />}
                    {status}
                  </div>
                </div>

                <div className="px-6 py-5">
                  {/* Question Text */}
                  <p className="text-gray-900 font-medium text-base leading-relaxed mb-5">{q.text}</p>

                  {/* Options */}
                  <div className="space-y-2.5 mb-6">
                    {q.options.map((optText, optIdx) => {
                      const isCorrectOpt = optIdx === q.correctAnswer;
                      const isSelectedOpt = optIdx === selectedIdx;
                      const isWrongSelected = isSelectedOpt && !isCorrectOpt;

                      let optClass = 'border rounded-xl px-4 py-3 flex items-start gap-3 ';
                      let labelClass = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ';

                      if (isCorrectOpt) {
                        optClass += 'bg-emerald-50 border-emerald-400';
                        labelClass += 'bg-emerald-500 text-white';
                      } else if (isWrongSelected) {
                        optClass += 'bg-red-50 border-red-400';
                        labelClass += 'bg-red-500 text-white';
                      } else {
                        optClass += 'bg-gray-50 border-gray-200';
                        labelClass += 'bg-gray-200 text-gray-600';
                      }

                      return (
                        <div key={optIdx} className={optClass}>
                          <div className={labelClass}>{OPTION_LABELS[optIdx]}</div>
                          <span className={`text-sm leading-relaxed ${
                            isCorrectOpt    ? 'text-emerald-800 font-medium' :
                            isWrongSelected ? 'text-red-800 font-medium' :
                                              'text-gray-600'
                          }`}>
                            {optText}
                          </span>
                          {isCorrectOpt && (
                            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5 ml-auto" />
                          )}
                          {isWrongSelected && (
                            <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5 ml-auto" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution Box */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                      <Lightbulb size={16} /> Solution
                    </div>

                    {q.concept && (
                      <div>
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Concept</span>
                        <p className="text-sm text-blue-900 mt-1 font-medium">{q.concept}</p>
                      </div>
                    )}

                    {q.solution_steps && (
                      <div>
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Steps</span>
                        <p className="text-sm text-blue-900 mt-1 whitespace-pre-line leading-relaxed">{q.solution_steps}</p>
                      </div>
                    )}

                    {q.exam_tip && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Exam Tip</span>
                        <p className="text-sm text-amber-900 mt-0.5">{q.exam_tip}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 4: Bottom Actions ── */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-8">
        <button
          onClick={() => navigate('/test')}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-900 text-white rounded-xl font-bold text-base hover:bg-blue-800 transition-colors"
        >
          <RotateCcw size={18} /> Take Another Test
        </button>
        <button
          onClick={() => navigate('/analytics')}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 text-gray-800 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors"
        >
          <BookOpen size={18} /> View Analytics
        </button>
      </div>

    </div>
  );
}

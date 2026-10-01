import React, { useEffect, useState } from 'react';
import { fetchPublicSurvey, submitSurveyResponse } from '../apiService';
import { PublicSurvey, SurveyAnswer } from '../types';

const RATING_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];

/** Public, mobile-first page a respondent opens from a shared link (#/s/<slug>). No login required. */
const SurveyPage: React.FC<{ slug: string }> = ({ slug }) => {
  const [survey, setSurvey] = useState<PublicSurvey | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'done'>('loading');
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPublicSurvey(slug)
      .then(s => {
        if (!s) { setState('missing'); return; }
        setSurvey(s);
        setAnswers(s.questions.map(() => null));
        setState('ready');
      })
      .catch(() => setState('missing'));
  }, [slug]);

  const setAnswer = (i: number, value: SurveyAnswer) => {
    setAnswers(prev => prev.map((a, idx) => (idx === i ? value : a)));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;
    const missing = answers.findIndex(a => a === null || (typeof a === 'string' && !a.trim()));
    if (missing !== -1) {
      setError(`Please answer question ${missing + 1}.`);
      return;
    }
    setSubmitting(true);
    try {
      await submitSurveyResponse(slug, answers);
      setState('done');
    } catch (err: any) {
      setError(err.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-xl mx-auto">
        <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-unidata-blue/50 mb-6">Unidata</p>
        {children}
      </div>
    </div>
  );

  if (state === 'loading') return shell(<p className="text-center text-gray-400 font-bold animate-pulse">Loading survey...</p>);
  if (state === 'missing') return shell(<p className="text-center text-gray-500 font-bold">This survey link is not valid.</p>);
  if (state === 'done') {
    return shell(
      <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-unidata-blue mb-3">Thank you!</h1>
        <p className="text-gray-500">Your response has been recorded.</p>
      </div>
    );
  }
  if (!survey) return null;
  if (survey.status !== 'open') {
    return shell(<p className="text-center text-gray-500 font-bold">This survey is no longer accepting responses.</p>);
  }

  return shell(
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-unidata-blue text-white rounded-3xl p-6">
        <h1 className="text-xl font-black leading-snug">{survey.title}</h1>
        <p className="text-blue-200 text-xs mt-2">{survey.questions.length} questions. Your answers are anonymous to the researcher.</p>
      </div>

      {survey.questions.map((q, i) => (
        <fieldset key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <legend className="sr-only">Question {i + 1}</legend>
          <p className="font-bold text-gray-800 mb-4"><span className="text-unidata-green mr-2">{i + 1}.</span>{q.question}</p>

          {q.type === 'multiple_choice' && (
            <div className="space-y-2">
              {(q.options || []).map(opt => (
                <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer text-sm ${answers[i] === opt ? 'border-unidata-blue bg-unidata-blue/5' : 'border-gray-100'}`}>
                  <input type="radio" name={`q${i}`} checked={answers[i] === opt} onChange={() => setAnswer(i, opt)} />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {q.type === 'rating' && (
            <div className="grid grid-cols-5 gap-2">
              {RATING_LABELS.map((label, idx) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setAnswer(i, idx + 1)}
                  aria-label={label}
                  className={`py-3 rounded-xl border-2 font-black text-sm ${answers[i] === idx + 1 ? 'border-unidata-blue bg-unidata-blue text-white' : 'border-gray-100 text-gray-500'}`}
                >
                  {idx + 1}
                </button>
              ))}
              <div className="col-span-5 flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span>{RATING_LABELS[0]}</span><span>{RATING_LABELS[4]}</span>
              </div>
            </div>
          )}

          {q.type === 'short_answer' && (
            <textarea
              rows={3}
              maxLength={1000}
              value={(answers[i] as string) ?? ''}
              onChange={(e) => setAnswer(i, e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-unidata-blue outline-none text-sm"
              placeholder="Type your answer"
            />
          )}
        </fieldset>
      ))}

      {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-unidata-green text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default SurveyPage;

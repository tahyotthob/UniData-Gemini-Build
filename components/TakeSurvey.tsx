import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { fetchSurveyById, submitSurveyResponse, hasRespondedToSurvey } from '../apiService';
import { SurveyCampaign } from '../types';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';

const TakeSurvey: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<SurveyCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    if (!surveyId || !user?.id) return;
    const load = async () => {
      const [s, done] = await Promise.all([
        fetchSurveyById(surveyId),
        hasRespondedToSurvey(surveyId, user.id!),
      ]);
      setSurvey(s);
      setAlreadyDone(done);
      setLoading(false);
    };
    load();
  }, [surveyId, user]);

  const handleAnswer = (questionIndex: number, value: string | number) => {
    setAnswers(prev => ({ ...prev, [String(questionIndex)]: value }));
  };

  const handleSubmit = async () => {
    if (!survey || !user?.id || !surveyId) return;
    // Validate all questions answered
    for (let i = 0; i < survey.questions.length; i++) {
      if (answers[String(i)] === undefined || answers[String(i)] === '') {
        toast.error(`Please answer question ${i + 1}`);
        setCurrentQ(i);
        return;
      }
    }
    setSubmitting(true);
    const result = await submitSurveyResponse(surveyId, user.id, answers);
    setSubmitting(false);
    if (result.success) {
      toast.success('Survey submitted! Thank you.');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Failed to submit survey');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-unidata-blue"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Survey not found.</p>
          <Link to="/dashboard" className="text-unidata-blue font-bold hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md shadow-lg">
          <div className="w-16 h-16 bg-unidata-lightGreen text-unidata-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-unidata-blue mb-2">Already Completed</h2>
          <p className="text-gray-400 mb-6">You've already submitted a response for this survey.</p>
          <Link to="/dashboard" className="text-unidata-blue font-bold hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const q = survey.questions[currentQ];
  const totalQ = survey.questions.length;
  const progress = ((currentQ + 1) / totalQ) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 flex justify-between items-center h-14">
          <Link to="/dashboard" className="text-unidata-blue font-bold text-sm hover:underline">&larr; Exit</Link>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {currentQ + 1} of {totalQ}
          </span>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="bg-gray-200 h-1">
        <div className="bg-unidata-green h-1 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-black text-unidata-blue mb-8">{DOMPurify.sanitize(survey.title)}</h1>

        {/* Question card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Question {currentQ + 1}
          </p>
          <p className="text-lg font-bold text-gray-800 mb-6">{DOMPurify.sanitize(q.question)}</p>

          {q.type === 'multiple_choice' && q.options && (
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQ, opt)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm ${
                    answers[String(currentQ)] === opt
                      ? 'border-unidata-blue bg-blue-50 text-unidata-blue'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {DOMPurify.sanitize(opt)}
                </button>
              ))}
            </div>
          )}

          {q.type === 'short_answer' && (
            <textarea
              className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-unidata-blue outline-none transition-all text-sm resize-none"
              rows={4}
              placeholder="Type your answer..."
              value={(answers[String(currentQ)] as string) || ''}
              onChange={e => handleAnswer(currentQ, e.target.value)}
            />
          )}

          {q.type === 'rating' && (
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => handleAnswer(currentQ, n)}
                  className={`w-14 h-14 rounded-2xl border-2 font-black text-lg transition-all ${
                    answers[String(currentQ)] === n
                      ? 'border-unidata-blue bg-unidata-blue text-white'
                      : 'border-gray-200 hover:border-unidata-blue text-gray-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-gray-100 text-gray-400 hover:border-unidata-blue hover:text-unidata-blue transition-all disabled:opacity-30"
          >
            Previous
          </button>
          {currentQ < totalQ - 1 ? (
            <button
              onClick={() => {
                if (answers[String(currentQ)] === undefined || answers[String(currentQ)] === '') {
                  toast.error('Please answer this question first');
                  return;
                }
                setCurrentQ(currentQ + 1);
              }}
              className="bg-unidata-blue text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-unidata-darkBlue transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-unidata-green text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Survey'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeSurvey;

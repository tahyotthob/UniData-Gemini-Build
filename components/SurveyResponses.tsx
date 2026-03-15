import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { fetchSurveyById, fetchSurveyResponses } from '../apiService';
import { SurveyCampaign, SurveyResponse } from '../types';
import DOMPurify from 'dompurify';

const escapeCSVValue = (value: unknown): string => {
  const str = String(value ?? '');
  if (str.match(/[,"\r\n]/) || str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@') || str.startsWith('\t')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const SurveyResponses: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { user } = useAuth();
  const [survey, setSurvey] = useState<SurveyCampaign | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  useEffect(() => {
    if (!surveyId) return;
    const load = async () => {
      const [s, r] = await Promise.all([
        fetchSurveyById(surveyId),
        fetchSurveyResponses(surveyId),
      ]);
      setSurvey(s);
      setResponses(r);
      setLoading(false);
    };
    load();
  }, [surveyId]);

  const exportCSV = () => {
    if (!survey || responses.length === 0) return;
    const headers = ['Response #', 'Date', ...survey.questions.map((q, i) => `Q${i + 1}: ${q.question}`)];
    const rows = responses.map((r, idx) => [
      String(idx + 1),
      r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
      ...survey.questions.map((_, i) => String(r.answers[String(i)] ?? '')),
    ]);
    const csv = [headers.map(escapeCSVValue).join(','), ...rows.map(row => row.map(escapeCSVValue).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${survey.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Aggregate stats for multiple choice and rating questions
  const getQuestionStats = (questionIndex: number) => {
    const q = survey!.questions[questionIndex];
    if (q.type === 'multiple_choice' && q.options) {
      const counts: Record<string, number> = {};
      q.options.forEach(opt => (counts[opt] = 0));
      responses.forEach(r => {
        const val = String(r.answers[String(questionIndex)] ?? '');
        if (val in counts) counts[val]++;
      });
      return { type: 'choices' as const, counts };
    }
    if (q.type === 'rating') {
      const values = responses
        .map(r => Number(r.answers[String(questionIndex)]))
        .filter(n => !isNaN(n));
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return { type: 'rating' as const, avg, count: values.length };
    }
    return { type: 'text' as const };
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center h-14">
          <Link to="/dashboard" className="text-unidata-blue font-bold text-sm hover:underline">&larr; Dashboard</Link>
          <button
            onClick={exportCSV}
            disabled={responses.length === 0}
            className="bg-unidata-green text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all disabled:opacity-30"
          >
            Export CSV
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-black text-unidata-blue mb-2">{DOMPurify.sanitize(survey.title)}</h1>
        <p className="text-gray-400 text-sm mb-8">
          {responses.length} response{responses.length !== 1 ? 's' : ''} &bull; {survey.questions.length} questions
        </p>

        {responses.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
            <p className="text-gray-400 font-bold">No responses yet. Share your survey to start collecting data.</p>
          </div>
        ) : (
          <>
            {/* Aggregate Stats */}
            <div className="mb-10">
              <h2 className="text-lg font-black text-unidata-blue uppercase tracking-tight mb-4">Summary</h2>
              <div className="space-y-4">
                {survey.questions.map((q, i) => {
                  const stats = getQuestionStats(i);
                  return (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Q{i + 1} &bull; {q.type.replace('_', ' ')}</p>
                      <p className="font-bold text-gray-800 mb-3">{DOMPurify.sanitize(q.question)}</p>
                      {stats.type === 'choices' && (
                        <div className="space-y-2">
                          {Object.entries(stats.counts).map(([opt, count]) => {
                            const pct = responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
                            return (
                              <div key={opt} className="flex items-center gap-3">
                                <span className="text-xs text-gray-600 w-40 truncate">{opt}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                  <div className="bg-unidata-blue h-4 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs font-bold text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {stats.type === 'rating' && (
                        <p className="text-2xl font-black text-unidata-green">{stats.avg.toFixed(1)} <span className="text-sm font-medium text-gray-400">/ 5 avg ({stats.count} ratings)</span></p>
                      )}
                      {stats.type === 'text' && (
                        <p className="text-xs text-gray-400">{responses.length} text responses</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Responses */}
            <h2 className="text-lg font-black text-unidata-blue uppercase tracking-tight mb-4">Individual Responses</h2>
            <div className="space-y-3">
              {responses.map((r, idx) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResponse(selectedResponse?.id === r.id ? null : r)}
                  className="w-full bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-unidata-blue text-sm">Response #{idx + 1}</span>
                    <span className="text-xs text-gray-400">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {selectedResponse?.id === r.id && (
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      {survey.questions.map((q, qi) => (
                        <div key={qi}>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Q{qi + 1}</p>
                          <p className="text-xs text-gray-600 mb-1">{DOMPurify.sanitize(q.question)}</p>
                          <p className="text-sm font-bold text-gray-800">{String(r.answers[String(qi)] ?? '—')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SurveyResponses;

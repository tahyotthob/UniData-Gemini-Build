
import React, { useState } from 'react';
import { generateSurveyQuestions } from '../geminiService';
import { SurveyQuestion } from '../types';

const AiDemo: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [demographics, setDemographics] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateSurveyQuestions(topic, keywords, demographics);
      setQuestions(result);
    } catch (err) {
      setError('Failed to generate questions. Please check your API key or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-demo" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-unidata-blue mb-4">Try Our AI Question Generator</h2>
          <p className="text-gray-600">Give us some context, and our AI will craft academic-grade questions optimized for Nigeria.</p>
        </div>

        <div className="bg-unidata-lightGreen rounded-3xl p-8 shadow-inner">
          <div className="space-y-6 mb-8">
            {/* Topic Input */}
            <div>
              <label htmlFor="topic" className="block text-sm font-semibold text-unidata-blue mb-2 ml-1">
                Research Topic <span className="text-red-500">*</span>
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Impact of FinTech on small businesses in Kano"
                className="w-full px-6 py-4 rounded-xl border-2 border-transparent focus:border-unidata-green outline-none text-lg shadow-sm"
              />
            </div>

            {/* Keywords & Demographics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="keywords" className="block text-sm font-semibold text-unidata-blue mb-2 ml-1">
                  Key Themes / Keywords
                </label>
                <input
                  id="keywords"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., accessibility, trust, mobile banking"
                  className="w-full px-5 py-3 rounded-xl border-2 border-transparent focus:border-unidata-green outline-none shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="demographics" className="block text-sm font-semibold text-unidata-blue mb-2 ml-1">
                  Target Demographics
                </label>
                <input
                  id="demographics"
                  type="text"
                  value={demographics}
                  onChange={(e) => setDemographics(e.target.value)}
                  placeholder="e.g., Market traders aged 25-45"
                  className="w-full px-5 py-3 rounded-xl border-2 border-transparent focus:border-unidata-green outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full bg-unidata-green text-white px-8 py-5 rounded-xl font-bold text-lg hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Your Survey...
                </>
              ) : 'Generate AI Questions'}
            </button>
          </div>

          {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}

          <div className="space-y-4">
            {questions.length > 0 ? (
              <div className="animate-fade-in">
                <h3 className="text-sm font-bold text-unidata-blue uppercase tracking-wider mb-4 text-center opacity-70">
                  AI Generated Questions
                </h3>
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4 transform transition-all hover:scale-[1.01]">
                    <div className="flex items-start">
                      <span className="w-8 h-8 bg-unidata-green/10 text-unidata-green rounded-lg flex items-center justify-center font-bold mr-4 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-full">
                        <p className="text-unidata-blue font-semibold mb-3 leading-snug">{q.question}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-unidata-lightGreen text-unidata-green rounded-full text-[10px] font-bold uppercase tracking-wide">
                            {q.type.replace('_', ' ')}
                          </span>
                          {q.options?.map((opt, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-full text-xs">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && (
              <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9.4-2.593 1.002l-.548-.547z" />
                </svg>
                Complete the details above to generate your smart survey.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiDemo;

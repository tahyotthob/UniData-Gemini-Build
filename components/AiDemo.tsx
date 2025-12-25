
import React, { useState, useRef } from 'react';
import { generateSurveyQuestions, analyzeResearchContext, refineSurveyQuestions } from '../geminiService';
import { SurveyQuestion } from '../types';

const AiDemo: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [demographics, setDemographics] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [types, setTypes] = useState<string[]>(['multiple_choice', 'short_answer']);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [refining, setRefining] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [copying, setCopying] = useState<number | 'all' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleType = (type: string) => {
    setTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setProposalText(content);
      // Auto-set a temporary topic if empty
      if (!topic) setTopic(`Research based on ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeContext = async () => {
    const input = proposalText || topic;
    if (!input) return;
    
    setAnalyzing(true);
    setError('');
    try {
      const { variables, demographics: suggestedDemographics } = await analyzeResearchContext(input);
      setKeywords(variables);
      setDemographics(suggestedDemographics);
    } catch (err) {
      setError('AI could not extract context automatically. Please fill fields manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please provide a research objective or topic.');
      return;
    }
    if (types.length === 0) {
      setError('Please select at least one question type.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const result = await generateSurveyQuestions(topic, keywords, demographics, types, proposalText);
      setQuestions(result);
    } catch (err) {
      setError('Failed to generate questions. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!feedback.trim() || questions.length === 0) return;
    setRefining(true);
    try {
      const result = await refineSurveyQuestions(questions, feedback);
      setQuestions(result);
      setFeedback('');
    } catch (err) {
      setError('Could not refine questions. Please try again.');
    } finally {
      setRefining(false);
    }
  };

  const copyToClipboard = (text: string, index: number | 'all') => {
    navigator.clipboard.writeText(text);
    setCopying(index);
    setTimeout(() => setCopying(null), 2000);
  };

  const formatAllQuestions = () => {
    return questions.map((q, i) => (
      `${i + 1}. ${q.question}\nType: ${q.type}\n${q.options ? `Options: ${q.options.join(', ')}\n` : ''}Rationale: ${q.rationale}\n`
    )).join('\n');
  };

  return (
    <section id="ai-demo" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-unidata-blue mb-4">AI Research Lab</h2>
          <p className="text-gray-600">Collaborate with our AI consultant to build a scientifically sound survey in minutes.</p>
        </div>

        <div className="bg-unidata-lightGreen rounded-3xl p-6 md:p-10 shadow-inner border border-unidata-green/10">
          <div className="space-y-8">
            {/* Step 1: Input & Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-grow space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-unidata-blue mb-2 uppercase tracking-tight">
                      1. Research Objective / Topic <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Evaluating the impact of digital literacy on SME productivity in Kano State..."
                      className="w-full px-5 py-4 rounded-xl border border-gray-100 focus:border-unidata-green outline-none text-lg shadow-sm min-h-[120px] transition-all"
                    />
                  </div>
                </div>
                <div className="w-full md:w-[220px]">
                  <label className="block text-sm font-bold text-unidata-blue mb-2 uppercase tracking-tight">
                    Project Proposal
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt,.doc,.docx"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${proposalText ? 'border-unidata-green bg-unidata-lightGreen/50' : 'border-unidata-blue/20 hover:border-unidata-blue/40'}`}
                  >
                    <svg className={`w-8 h-8 mb-2 ${proposalText ? 'text-unidata-green' : 'text-unidata-blue/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs font-bold text-unidata-blue">
                      {proposalText ? 'Proposal Ready' : 'Upload Research Proposal'}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">Supports .txt, .doc, .docx</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Extract Button */}
              <div className="mt-6 flex flex-col items-center border-t border-gray-50 pt-6">
                <button
                  onClick={handleAnalyzeContext}
                  disabled={analyzing || (!topic && !proposalText)}
                  className="group flex items-center gap-2 text-unidata-blue font-bold text-sm bg-blue-50/50 px-6 py-3 rounded-full border border-unidata-blue/10 hover:bg-unidata-blue hover:text-white transition-all disabled:opacity-50"
                >
                  {analyzing ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  Consult AI for Key Variables & Demographics
                </button>
                <p className="text-[10px] text-gray-400 mt-2">AI will help populate the fields below based on your input.</p>
              </div>
            </div>

            {/* Step 3: Editable Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/70 p-5 rounded-2xl border border-unidata-green/10 shadow-sm">
                <label className="block text-xs font-black text-unidata-blue mb-2 uppercase opacity-60 flex justify-between">
                  Key Variables / Themes
                  {analyzing && <span className="animate-pulse text-unidata-green">Extracting...</span>}
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., productivity, literacy, internet access"
                  className="w-full px-4 py-3 rounded-lg border border-gray-100 outline-none focus:border-unidata-blue shadow-inner bg-white/50"
                />
              </div>
              <div className="bg-white/70 p-5 rounded-2xl border border-unidata-green/10 shadow-sm">
                <label className="block text-xs font-black text-unidata-blue mb-2 uppercase opacity-60 flex justify-between">
                  Target Demographics
                  {analyzing && <span className="animate-pulse text-unidata-green">Extracting...</span>}
                </label>
                <input
                  type="text"
                  value={demographics}
                  onChange={(e) => setDemographics(e.target.value)}
                  placeholder="e.g., SME owners in Kano city, aged 25-50"
                  className="w-full px-4 py-3 rounded-lg border border-gray-100 outline-none focus:border-unidata-blue shadow-inner bg-white/50"
                />
              </div>
            </div>

            {/* Step 4: Question Types & Main Action */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-grow w-full">
                <p className="text-xs font-bold text-unidata-blue mb-3 uppercase tracking-wider opacity-60">Question Formats</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'multiple_choice', label: 'Multiple Choice' },
                    { id: 'short_answer', label: 'Short Answer' },
                    { id: 'rating', label: 'Rating (Likert)' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => toggleType(t.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                        types.includes(t.id) 
                          ? 'bg-unidata-blue border-unidata-blue text-white' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-unidata-blue hover:text-unidata-blue'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full md:w-auto bg-unidata-green text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-green-700 transition-all shadow-xl hover:shadow-green-200/50 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'Consultant is Drafting...' : 'Draft Research Survey'}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-center mt-6 font-bold">{error}</p>}

          {/* Results Area */}
          <div className="mt-12 space-y-6">
            {questions.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-unidata-blue uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-unidata-green rounded-full animate-pulse"></span>
                    Research Instrument Preview
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(formatAllQuestions(), 'all')}
                    className="text-xs text-unidata-blue font-bold hover:underline bg-white px-4 py-1.5 rounded-full border border-unidata-blue/10 shadow-sm"
                  >
                    {copying === 'all' ? 'Copied Full Draft!' : 'Copy Entire Survey'}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 group relative transition-all hover:shadow-md">
                      <div className="absolute top-4 right-4">
                         <button 
                           onClick={() => copyToClipboard(q.question, idx)} 
                           className="p-2 text-gray-300 hover:text-unidata-blue transition-colors rounded-lg hover:bg-gray-50"
                           title="Copy this question"
                         >
                           {copying === idx ? (
                             <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={2} /></svg>
                           ) : (
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeWidth={2} /></svg>
                           )}
                         </button>
                      </div>
                      
                      <div className="flex items-start gap-5 pr-8">
                        <span className="shrink-0 w-8 h-8 bg-unidata-blue text-white rounded-xl flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-unidata-blue font-bold text-lg mb-4 leading-relaxed">{q.question}</p>
                          
                          <div className="mb-5 bg-unidata-lightGreen/40 p-5 rounded-2xl border-l-4 border-unidata-green">
                            <p className="text-[10px] font-black text-unidata-green uppercase mb-2 tracking-widest">Consultant Rationale</p>
                            <p className="text-gray-600 text-sm italic leading-relaxed">
                              "{q.rationale}"
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide">
                              {q.type.replace('_', ' ')}
                            </span>
                            {q.options?.map((opt, i) => (
                              <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-500 rounded-lg text-xs font-medium">
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Refinement Interface */}
                <div className="mt-12 bg-unidata-blue p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth={2} /></svg>
                      </div>
                      <label className="text-white font-bold text-lg">Interactive Refinement</label>
                    </div>
                    <p className="text-white/70 text-sm mb-6 max-w-lg">
                      Not perfect? Tell the consultant what to fix. For example: "Make the questions more informal" or "Focus more on economic impact."
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Type your feedback here..."
                        className="flex-grow px-6 py-4 rounded-2xl border-none outline-none text-unidata-blue bg-white shadow-xl placeholder:text-gray-300"
                        onKeyPress={(e) => e.key === 'Enter' && handleRefine()}
                      />
                      <button 
                        onClick={handleRefine}
                        disabled={refining || !feedback.trim()}
                        className="bg-unidata-green text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 active:scale-95"
                      >
                        {refining ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : 'Update Survey'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!loading && questions.length === 0 && (
              <div className="text-center py-24 text-gray-400 border-4 border-dashed border-gray-100 rounded-[40px] bg-white/50">
                <div className="mb-4 inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full">
                  <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth={2} /></svg>
                </div>
                <p className="font-medium">Define your research framework above to begin.</p>
                <p className="text-xs mt-1 opacity-60">Your AI consultant will help you construct a valid research instrument.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiDemo;

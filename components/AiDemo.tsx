
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
      if (!topic) setTopic(`Research analysis based on: ${file.name}`);
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
      setError('AI could not extract context automatically. Please define your scope manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('A research objective or topic is needed for the consultant to help you.');
      return;
    }
    if (types.length === 0) {
      setError('Please select at least one question format (e.g., Multiple Choice).');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const result = await generateSurveyQuestions(topic, keywords, demographics, types, proposalText);
      setQuestions(result);
    } catch (err) {
      setError('Connection interrupted. Please try drafting the survey again.');
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
      setError('Could not refine. Try a different suggestion for the consultant.');
    } finally {
      setRefining(false);
    }
  };

  const copyToClipboard = (text: string, index: number | 'all') => {
    navigator.clipboard.writeText(text);
    setCopying(index);
    setTimeout(() => setCopying(null), 2000);
  };

  const formatAllForExport = () => {
    return questions.map((q, i) => (
      `Q${i + 1}: ${q.question}\nFormat: ${q.type.toUpperCase()}\n${q.options ? `Options: ${q.options.join(' | ')}\n` : ''}Consultant Note: ${q.rationale}\n`
    )).join('\n---\n\n');
  };

  return (
    <section id="ai-demo" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-unidata-blue mb-4">AI Research Lab</h2>
          <p className="text-gray-600">Collaborate with our Senior Research Consultant to build a methodologically sound study instrument.</p>
        </div>

        <div className="bg-unidata-lightGreen rounded-[40px] p-8 md:p-12 shadow-inner border border-unidata-green/10">
          <div className="space-y-10">
            {/* Phase 1: Context & Objective */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-grow space-y-5">
                  <div>
                    <label className="block text-xs font-black text-unidata-blue mb-3 uppercase tracking-widest opacity-70">
                      Research Objective or Hypothesis
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Analyzing the correlation between social media use and academic performance among students in Southwest Nigeria..."
                      className="w-full px-6 py-5 rounded-2xl border border-gray-100 focus:border-unidata-green outline-none text-lg shadow-sm min-h-[140px] transition-all bg-gray-50/30"
                    />
                  </div>
                </div>
                <div className="w-full md:w-[240px]">
                  <label className="block text-xs font-black text-unidata-blue mb-3 uppercase tracking-widest opacity-70">
                    Project Proposal (Optional)
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
                    className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${proposalText ? 'border-unidata-green bg-unidata-lightGreen/50' : 'border-unidata-blue/20 hover:border-unidata-blue/40'}`}
                  >
                    <svg className={`w-10 h-10 mb-3 ${proposalText ? 'text-unidata-green' : 'text-unidata-blue/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-[11px] font-black text-unidata-blue uppercase">
                      {proposalText ? 'Proposal Ready' : 'Upload Proposal'}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-2 italic">PDF/DOC support coming soon</p>
                  </div>
                </div>
              </div>

              {/* Consultation Trigger */}
              <div className="mt-10 flex flex-col items-center border-t border-gray-100 pt-8">
                <button
                  onClick={handleAnalyzeContext}
                  disabled={analyzing || (!topic && !proposalText)}
                  className="group flex items-center gap-3 text-unidata-blue font-black text-xs bg-unidata-blue/5 px-8 py-4 rounded-full border border-unidata-blue/10 hover:bg-unidata-blue hover:text-white transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  {analyzing ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  Consult AI for Variables & Demographics
                </button>
                <p className="text-[10px] text-gray-400 mt-3 font-medium">I'll help you extract key themes from your objective.</p>
              </div>
            </div>

            {/* Phase 2: Framework Refinement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/90 p-6 rounded-3xl border border-unidata-green/10 shadow-sm backdrop-blur-sm">
                <label className="block text-[10px] font-black text-unidata-blue mb-3 uppercase tracking-widest opacity-50 flex justify-between">
                  Key Variables & Themes
                  {analyzing && <span className="animate-pulse text-unidata-green">Extracting...</span>}
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., usage patterns, time spent, GPA"
                  className="w-full px-5 py-4 rounded-xl border border-gray-100 outline-none focus:border-unidata-blue shadow-inner bg-white/50 text-unidata-blue font-medium"
                />
              </div>
              <div className="bg-white/90 p-6 rounded-3xl border border-unidata-green/10 shadow-sm backdrop-blur-sm">
                <label className="block text-[10px] font-black text-unidata-blue mb-3 uppercase tracking-widest opacity-50 flex justify-between">
                  Target Demographics
                  {analyzing && <span className="animate-pulse text-unidata-green">Extracting...</span>}
                </label>
                <input
                  type="text"
                  value={demographics}
                  onChange={(e) => setDemographics(e.target.value)}
                  placeholder="e.g., Full-time students in Southwest universities"
                  className="w-full px-5 py-4 rounded-xl border border-gray-100 outline-none focus:border-unidata-blue shadow-inner bg-white/50 text-unidata-blue font-medium"
                />
              </div>
            </div>

            {/* Phase 3: Instrument Generation */}
            <div className="flex flex-col md:flex-row gap-8 items-center pt-4">
              <div className="flex-grow w-full">
                <p className="text-[10px] font-black text-unidata-blue mb-4 uppercase tracking-widest opacity-50">Select Preferred Question Types</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'multiple_choice', label: 'Multiple Choice' },
                    { id: 'short_answer', label: 'Short Answer' },
                    { id: 'rating', label: 'Rating (Likert Scale)' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => toggleType(t.id)}
                      className={`px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all ${
                        types.includes(t.id) 
                          ? 'bg-unidata-blue border-unidata-blue text-white shadow-lg' 
                          : 'bg-white border-gray-100 text-gray-500 hover:border-unidata-blue/30'
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
                className="w-full md:w-auto bg-unidata-green text-white px-12 py-5 rounded-[20px] font-black text-lg hover:bg-green-700 transition-all shadow-xl hover:shadow-green-200/50 disabled:opacity-50 flex items-center justify-center whitespace-nowrap active:scale-95"
              >
                {loading ? 'Consultant is Drafting...' : 'Draft Research Survey'}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-center mt-10 font-bold bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>}

          {/* Result Presentation */}
          <div className="mt-16 space-y-8">
            {questions.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-8 px-4">
                  <h3 className="text-xs font-black text-unidata-blue uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-unidata-green rounded-full animate-ping"></span>
                    Proposed Study Instrument
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(formatAllForExport(), 'all')}
                    className="text-[11px] text-unidata-blue font-black hover:underline bg-white px-6 py-2.5 rounded-full border border-unidata-blue/10 shadow-sm flex items-center gap-2 uppercase tracking-widest"
                  >
                    {copying === 'all' ? 'Copied Full Draft!' : 'Copy Entire Draft'}
                  </button>
                </div>
                
                <div className="space-y-6">
                  {questions.map((q, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-50 group relative transition-all hover:shadow-xl hover:-translate-y-1">
                      <div className="absolute top-6 right-6">
                         <button 
                           onClick={() => copyToClipboard(q.question, idx)} 
                           className="p-3 text-gray-200 hover:text-unidata-blue transition-all rounded-xl hover:bg-gray-50 bg-white"
                           title="Copy this question"
                         >
                           {copying === idx ? (
                             <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} /></svg>
                           ) : (
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeWidth={2.5} /></svg>
                           )}
                         </button>
                      </div>
                      
                      <div className="flex items-start gap-8">
                        <span className="shrink-0 w-10 h-10 bg-unidata-blue text-white rounded-[14px] flex items-center justify-center font-black text-sm shadow-lg">
                          {idx + 1}
                        </span>
                        <div className="flex-grow">
                          <p className="text-unidata-blue font-black text-xl mb-6 leading-relaxed pr-10">{q.question}</p>
                          
                          <div className="mb-6 bg-blue-50/40 p-6 rounded-2xl border-l-[6px] border-unidata-blue/20">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-unidata-blue" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
                              <p className="text-[11px] font-black text-unidata-blue uppercase tracking-widest">Consultant Rationale</p>
                            </div>
                            <p className="text-gray-600 text-sm italic leading-relaxed">
                              "{q.rationale}"
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-4">
                            <span className="px-4 py-1.5 bg-unidata-blue text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                              {q.type.replace('_', ' ')}
                            </span>
                            {q.options?.map((opt, i) => (
                              <span key={i} className="px-4 py-1.5 bg-white border border-gray-100 text-gray-500 rounded-lg text-xs font-bold shadow-sm">
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
                <div className="mt-16 bg-unidata-blue p-10 md:p-14 rounded-[50px] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-unidata-green/10 blur-[100px] rounded-full group-hover:bg-unidata-green/20 transition-all duration-700"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth={2.5} /></svg>
                      </div>
                      <div>
                        <label className="text-white font-black text-2xl">Refine with Your Consultant</label>
                        <p className="text-white/60 text-sm font-medium mt-1">Is the instrument ready? If not, let's adjust it together.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                      <input 
                        type="text"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="e.g., 'Use a more professional tone' or 'Add a question about household income'..."
                        className="flex-grow px-8 py-5 rounded-2xl border-none outline-none text-unidata-blue bg-white shadow-2xl placeholder:text-gray-300 font-medium text-lg"
                        onKeyPress={(e) => e.key === 'Enter' && handleRefine()}
                      />
                      <button 
                        onClick={handleRefine}
                        disabled={refining || !feedback.trim()}
                        className="bg-unidata-green text-white px-10 py-5 rounded-2xl font-black text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 active:scale-95 uppercase tracking-widest min-w-[200px]"
                      >
                        {refining ? (
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : 'Update Instrument'}
                      </button>
                    </div>
                    <div className="mt-6 flex gap-3 flex-wrap">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest self-center mr-2">Quick Tips:</span>
                      {["Academic Tone", "Add Likert Scale", "Make it Informal", "Focus on Economics"].map(tip => (
                        <button 
                          key={tip}
                          onClick={() => setFeedback(tip)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-white/70 text-[10px] font-bold transition-all uppercase tracking-wide"
                        >
                          {tip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!loading && questions.length === 0 && (
              <div className="text-center py-32 text-gray-400 border-[6px] border-dashed border-white/40 rounded-[60px] bg-white/30 backdrop-blur-sm">
                <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-white/60 rounded-3xl shadow-sm border border-white">
                  <svg className="w-12 h-12 opacity-20 text-unidata-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth={2} /></svg>
                </div>
                <h4 className="text-unidata-blue font-black text-xl mb-2">Ready to start?</h4>
                <p className="font-medium max-w-sm mx-auto">Define your research framework above. I'll help you construct a scientifically valid instrument.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiDemo;

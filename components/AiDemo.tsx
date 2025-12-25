
import React, { useState, useRef } from 'react';
import { generateSurveyQuestions, analyzeResearchContext, refineSurveyQuestions } from '../geminiService';
import { SurveyQuestion } from '../types';
import { useAuth } from './AuthContext';

const AiDemo: React.FC = () => {
  const { user, setShowAuthModal } = useAuth();
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [demographics, setDemographics] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [fileName, setFileName] = useState('');
  const [types, setTypes] = useState<string[]>(['multiple_choice', 'short_answer']);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setProposalText(content);
      // Auto-set topic if empty
      if (!topic) setTopic(`Analysis of: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeContext = async () => {
    const input = proposalText || topic;
    if (!input) {
      setError('Please provide an objective or upload a proposal first.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const { variables, demographics: suggestedDemographics } = await analyzeResearchContext(input);
      setKeywords(variables);
      setDemographics(suggestedDemographics);
    } catch (err) {
      setError('AI could not extract context automatically.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('A research objective or topic is needed.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await generateSurveyQuestions(topic, keywords, demographics, types, proposalText);
      setQuestions(result);
    } catch (err) {
      setError('Drafting failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFileName('');
    setProposalText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section id="ai-demo" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-unidata-blue mb-4 uppercase tracking-tight">AI Research Lab</h2>
          <p className="text-gray-600">Collaborate with our Senior Research Consultant to build a valid study instrument.</p>
        </div>

        <div className="relative">
          {/* Auth Gate Overlay */}
          {!user && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-8 bg-white/40 backdrop-blur-md rounded-[40px] border-4 border-dashed border-unidata-blue/10">
              <div className="bg-white p-10 rounded-[32px] shadow-2xl text-center max-w-sm border border-gray-100 animate-fade-in">
                <div className="w-16 h-16 bg-unidata-lightGreen rounded-2xl flex items-center justify-center mx-auto mb-6 text-unidata-green">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={2.5} /></svg>
                </div>
                <h3 className="text-xl font-black text-unidata-blue mb-3 uppercase tracking-tight">Unlock the Consultant</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Join Unidata to access our AI-powered survey laboratory and start collecting high-quality data.
                </p>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-unidata-blue text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-unidata-blue/20 transition-all active:scale-95"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          )}

          <div className={`bg-unidata-lightGreen rounded-[40px] p-8 md:p-12 shadow-inner border border-unidata-green/10 transition-all ${!user ? 'opacity-20 pointer-events-none grayscale blur-[2px]' : ''}`}>
            <div className="space-y-10">
              {/* Context & Objective */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
                <div className="flex flex-col gap-6">
                  <div className="flex-grow space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest opacity-70">Research Objective</label>
                      
                      {fileName ? (
                        <div className="flex items-center gap-2 bg-unidata-lightGreen px-3 py-1 rounded-full border border-unidata-green/20">
                          <span className="text-[10px] font-bold text-unidata-green truncate max-w-[150px]">{fileName}</span>
                          <button onClick={removeFile} className="text-red-400 hover:text-red-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 text-[10px] font-black text-unidata-blue/60 hover:text-unidata-blue transition-colors uppercase tracking-widest"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeWidth={2}/></svg>
                          Upload Proposal
                        </button>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".txt,.doc,.docx,.pdf"
                      />
                    </div>
                    
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Impact of fintech on student savings among university students in Nigeria..."
                      className="w-full px-6 py-5 rounded-2xl border border-gray-100 focus:border-unidata-green outline-none text-lg shadow-sm min-h-[140px] transition-all bg-gray-50/30"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col items-center border-t border-gray-100 pt-8">
                  <button
                    onClick={handleAnalyzeContext}
                    disabled={analyzing || (!topic && !proposalText)}
                    className="flex items-center gap-3 text-unidata-blue font-black text-[10px] bg-unidata-blue/5 px-8 py-4 rounded-full border border-unidata-blue/10 hover:bg-unidata-blue hover:text-white transition-all disabled:opacity-50 uppercase tracking-[0.2em]"
                  >
                    {analyzing ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : 'Consult AI for Research Variables'}
                  </button>
                </div>
              </div>

              {/* Variables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/90 p-6 rounded-3xl border border-unidata-green/10 shadow-sm">
                  <label className="block text-[10px] font-black text-unidata-blue mb-3 uppercase tracking-widest opacity-50">Extracted Variables</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Variables will appear here..."
                    className="w-full px-5 py-4 rounded-xl border border-gray-100 outline-none focus:border-unidata-blue bg-white/50 text-unidata-blue font-medium text-sm"
                  />
                </div>
                <div className="bg-white/90 p-6 rounded-3xl border border-unidata-green/10 shadow-sm">
                  <label className="block text-[10px] font-black text-unidata-blue mb-3 uppercase tracking-widest opacity-50">Target Demographics</label>
                  <input
                    type="text"
                    value={demographics}
                    onChange={(e) => setDemographics(e.target.value)}
                    placeholder="AI suggested audience..."
                    className="w-full px-5 py-4 rounded-xl border border-gray-100 outline-none focus:border-unidata-blue bg-white/50 text-unidata-blue font-medium text-sm"
                  />
                </div>
              </div>

              {/* Generation Button */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !topic.trim()}
                  className="w-full bg-unidata-green text-white px-12 py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.3em] hover:bg-green-700 transition-all shadow-[0_20px_40px_-10px_rgba(40,167,69,0.3)] disabled:opacity-50 active:scale-95"
                >
                  {loading ? 'Generating Validated Instrument...' : 'Draft Research Survey'}
                </button>
              </div>
            </div>

            {/* Questions Result Area */}
            {questions.length > 0 && (
              <div className="mt-16 space-y-6 animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px bg-gray-200 flex-grow"></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Research Output</span>
                  <div className="h-px bg-gray-200 flex-grow"></div>
                </div>
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-50 relative group hover:shadow-xl transition-all duration-500">
                    <p className="text-unidata-blue font-black text-xl mb-6 leading-tight">{q.question}</p>
                    <div className="mb-6 bg-blue-50/40 p-6 rounded-3xl border-l-[6px] border-unidata-blue/20">
                      <p className="text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Scientific Rationale</p>
                      <p className="text-gray-600 text-sm italic leading-relaxed">{q.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {error && <p className="mt-6 text-center text-red-500 text-xs font-bold animate-shake">{error}</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiDemo;

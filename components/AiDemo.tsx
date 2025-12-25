
import React, { useState, useRef } from 'react';
import { generateSurveyQuestions, analyzeResearchContext, analyzeQualityAndBias } from '../geminiService';
import { SurveyQuestion } from '../types';
import { useAuth } from './AuthContext';
import SurveyMatching from './SurveyMatching';
import ResearchChat from './ResearchChat';

// Respondent Preview Component - Mimics how the survey will look to participants
const QuestionPreview: React.FC<{ 
  question: SurveyQuestion; 
  index: number;
  onTypeChange: (type: SurveyQuestion['type']) => void;
}> = ({ question, index, onTypeChange }) => {
  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative group hover:shadow-md transition-all animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-unidata-blue text-white flex items-center justify-center font-black text-xs">
            {index + 1}
          </span>
          <span className="text-[10px] font-black text-unidata-blue/40 uppercase tracking-widest">Research Instrument Question</span>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
          {(['multiple_choice', 'short_answer', 'rating'] as const).map(t => (
            <button
              key={t}
              onClick={() => onTypeChange(t)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${question.type === t ? 'bg-white text-unidata-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      
      <p className="text-unidata-blue font-bold text-lg mb-8 leading-tight">{question.question}</p>
      
      {/* Mock Respondent UI Elements */}
      <div className="space-y-3 mb-10">
        {question.type === 'multiple_choice' && (
          <div className="grid grid-cols-1 gap-3">
            {(question.options || ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree']).map((opt, i) => (
              <div key={i} className="flex items-center p-4 rounded-2xl border border-gray-50 bg-gray-50/30 group-hover:border-unidata-blue/10 transition-colors cursor-pointer hover:bg-white">
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 mr-4 flex-shrink-0 group-hover:border-unidata-blue/30"></div>
                <span className="text-sm text-gray-600 font-medium">{opt}</span>
              </div>
            ))}
          </div>
        )}
        
        {question.type === 'short_answer' && (
          <div className="w-full">
            <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/20 flex flex-col items-center justify-center text-center p-6">
              <svg className="w-6 h-6 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth={2}/></svg>
              <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Text Response Field</span>
            </div>
          </div>
        )}
        
        {question.type === 'rating' && (
          <div className="flex flex-col items-center py-4 bg-gray-50/30 rounded-3xl border border-gray-50">
            <div className="flex gap-3 mb-3">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="w-12 h-12 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-400 font-black text-sm hover:border-unidata-blue hover:text-unidata-blue transition-all cursor-pointer">
                  {n}
                </div>
              ))}
            </div>
            <div className="flex justify-between w-full px-8 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span>Very Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-unidata-lightGreen/40 p-5 rounded-2xl border border-unidata-green/10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-unidata-green/10 flex items-center justify-center text-unidata-green shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9.4-2.593 1.002l-.548-.547z" strokeWidth={2}/></svg>
        </div>
        <div>
          <p className="text-[9px] font-black text-unidata-green uppercase tracking-widest mb-1.5 opacity-60">Expert Scientific Rationale</p>
          <p className="text-gray-500 text-xs italic leading-relaxed">{question.rationale || "Validating variables through direct inquiry."}</p>
        </div>
      </div>
    </div>
  );
};

const AiDemo: React.FC = () => {
  const { user, setShowAuthModal } = useAuth();
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [demographics, setDemographics] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingQuality, setAnalyzingQuality] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [qualityReport, setQualityReport] = useState<{ score: number, findings: string[], suggestions: string[] } | null>(null);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateQuestion = (index: number, updated: Partial<SurveyQuestion>) => {
    setQuestions(prev => {
      const newQuestions = [...prev];
      if (newQuestions[index]) {
        newQuestions[index] = { ...newQuestions[index], ...updated };
      }
      return newQuestions;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setProposalText(event.target?.result as string);
      if (!topic) setTopic(`Analysis of: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeContext = async () => {
    const input = proposalText || topic;
    if (!input) {
      setError('Please provide a research objective first.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const { variables, demographics: suggested } = await analyzeResearchContext(input);
      setKeywords(variables);
      setDemographics(suggested);
    } catch (err) {
      setError('AI context extraction failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Enter a topic to generate questions.');
      return;
    }
    setLoading(true);
    setError('');
    setQualityReport(null);
    try {
      const result = await generateSurveyQuestions(topic, keywords, demographics, ['multiple_choice', 'short_answer'], proposalText);
      setQuestions(result);
    } catch (err) {
      setError('Generation failed. Try refining your objective.');
    } finally {
      setLoading(false);
    }
  };

  const handleQualityCheck = async () => {
    if (questions.length === 0) return;
    setAnalyzingQuality(true);
    try {
      const report = await analyzeQualityAndBias(questions);
      setQualityReport(report);
    } catch (err) {
      setError('Bias detection audit failed.');
    } finally {
      setAnalyzingQuality(false);
    }
  };

  const resetAll = () => {
    setTopic('');
    setKeywords('');
    setDemographics('');
    setProposalText('');
    setFileName('');
    setQuestions([]);
    setQualityReport(null);
    setError('');
  };

  return (
    <section id="ai-demo" className="py-24 bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-unidata-blue/5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-unidata-blue animate-pulse"></span>
            <span className="text-[10px] font-black text-unidata-blue uppercase tracking-[0.2em]">Research Laboratory</span>
          </div>
          <h2 className="text-4xl font-black text-unidata-blue mb-4 uppercase tracking-tighter">AI Methodology Engine</h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Upload your proposal or describe your study. Our Senior AI Consultant will help you build, refine, and validate your survey instrument.
          </p>
        </div>

        <div className="relative">
          {!user && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-8 bg-white/40 backdrop-blur-md rounded-[48px] border-4 border-dashed border-unidata-blue/10">
              <div className="bg-white p-12 rounded-[40px] shadow-2xl text-center max-w-sm border border-gray-100 animate-fade-in">
                <div className="w-16 h-16 bg-unidata-lightGreen rounded-[24px] flex items-center justify-center mx-auto mb-8 text-unidata-green">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth={2.5}/></svg>
                </div>
                <h3 className="text-2xl font-black text-unidata-blue mb-4 uppercase tracking-tight">Access Locked</h3>
                <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">Join the Unidata network to access our AI-driven research methodology tools.</p>
                <button onClick={() => setShowAuthModal(true)} className="w-full bg-unidata-blue text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-unidata-darkBlue transition-all active:scale-95">Create Free Account</button>
              </div>
            </div>
          )}

          <div className={`bg-white rounded-[56px] p-8 md:p-14 shadow-sm border border-gray-100 transition-all duration-700 ${!user ? 'opacity-30 pointer-events-none grayscale blur-[2px] scale-95' : ''}`}>
            
            <div className="space-y-12">
              {/* Input Zone */}
              <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                  <label className="text-[11px] font-black text-unidata-blue uppercase tracking-[0.2em] opacity-50">Research Objective / Thesis</label>
                  {!fileName ? (
                    <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-unidata-blue/60 hover:text-unidata-blue transition-colors uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={2.5}/></svg> Upload File
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-unidata-lightGreen px-4 py-1.5 rounded-full border border-unidata-green/10">
                      <span className="text-[10px] font-bold text-unidata-green">{fileName}</span>
                      <button onClick={resetAll} className="text-unidata-green/60 hover:text-unidata-green font-black">×</button>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.doc,.docx,.pdf" />
                </div>
                <div className="relative group">
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe what you're studying in Nigeria (e.g., 'Factors influencing mobile banking adoption in rural Ogun State')..."
                    className="w-full px-8 py-8 rounded-[32px] border-2 border-gray-50 bg-gray-50/30 focus:bg-white focus:border-unidata-blue outline-none text-xl font-medium shadow-inner min-h-[160px] transition-all"
                  />
                  <div className="absolute bottom-6 right-8">
                    <button onClick={handleAnalyzeContext} disabled={analyzing || !topic} className="flex items-center gap-3 bg-unidata-blue text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-unidata-darkBlue transition-all shadow-lg disabled:opacity-50">
                      {analyzing ? <span className="animate-pulse">Analyzing...</span> : 'Expert Variables'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Variable Tunnels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-unidata-blue/40 px-2">Key Variables</label>
                  <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., trust, accessibility, cost" className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-white focus:border-unidata-blue outline-none text-sm font-bold text-unidata-blue"/>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-unidata-blue/40 px-2">Target Demographics</label>
                  <input type="text" value={demographics} onChange={(e) => setDemographics(e.target.value)} placeholder="e.g., Female entrepreneurs in Onitsha" className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-white focus:border-unidata-blue outline-none text-sm font-bold text-unidata-blue"/>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center pt-4">
                <button 
                  onClick={handleGenerate} 
                  disabled={loading || !topic} 
                  className="w-full md:w-auto min-w-[300px] bg-unidata-green text-white px-12 py-6 rounded-[28px] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(40,167,69,0.3)] hover:bg-green-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Designing instrument...
                    </div>
                  ) : 'Generate Validated Survey'}
                </button>
              </div>
            </div>

            {/* Generated Output */}
            {questions.length > 0 && (
              <div className="mt-24 space-y-12 animate-fade-in">
                <div className="flex items-center gap-6 px-4">
                  <div className="h-px bg-gray-100 flex-grow"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-unidata-blue/40 uppercase tracking-[0.3em]">Draft Preview</span>
                    <span className="text-xs font-bold text-unidata-blue mt-1 italic">Respondent's Viewpoint</span>
                  </div>
                  <div className="h-px bg-gray-100 flex-grow"></div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                  {questions.map((q, idx) => (
                    <QuestionPreview 
                      key={idx} 
                      question={q} 
                      index={idx} 
                      onTypeChange={(t) => handleUpdateQuestion(idx, { type: t })}
                    />
                  ))}
                </div>

                {/* Lab Controls */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-12 border-t border-gray-50">
                   <button 
                     onClick={handleQualityCheck} 
                     disabled={analyzingQuality} 
                     className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all"
                   >
                     {analyzingQuality ? <span className="animate-pulse">Auditing...</span> : 'Run Quality Audit'}
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth={2}/></svg>
                   </button>
                   
                   <button 
                    onClick={() => setIsChatOpen(true)} 
                    className="bg-unidata-blue text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-unidata-darkBlue transition-all"
                   >
                     Discuss with Dr. Unidata
                     <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-unidata-blue bg-unidata-green flex items-center justify-center text-[10px]">U</div>
                     </div>
                   </button>
                </div>

                {qualityReport && (
                  <div className="mt-8 bg-unidata-lightGreen/20 rounded-[48px] p-10 md:p-14 border border-unidata-green/10 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                       <div className="text-center">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Scientific Score</p>
                          <p className="text-5xl font-black text-unidata-green">{qualityReport.score}</p>
                       </div>
                    </div>
                    <h4 className="text-2xl font-black text-unidata-blue mb-10 uppercase tracking-tighter">Research Quality Audit</h4>
                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-1">Bias & Clarity Warnings</label>
                        <div className="space-y-4">
                          {qualityReport.findings.map((f, i) => (
                            <div key={i} className="flex gap-4 items-start bg-white/60 p-5 rounded-2xl border border-orange-100 shadow-sm">
                              <span className="text-orange-500 font-bold text-lg">!</span>
                              <p className="text-sm text-gray-600 font-medium leading-relaxed">{f}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-unidata-green uppercase tracking-widest px-1">Refinement Suggestions</label>
                        <div className="space-y-4">
                          {qualityReport.suggestions.map((s, i) => (
                            <div key={i} className="flex gap-4 items-start bg-unidata-green/10 p-5 rounded-2xl border border-unidata-green/10 shadow-sm">
                              <span className="text-unidata-green font-bold text-lg">✓</span>
                              <p className="text-sm text-unidata-blue font-medium leading-relaxed">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-20">
                  <SurveyMatching draftQuestions={questions} draftTitle={topic} />
                </div>
              </div>
            )}
            
            {error && <p className="mt-10 text-center text-red-500 font-black text-sm animate-shake">{error}</p>}
          </div>
        </div>
      </div>

      <ResearchChat 
        topic={topic} 
        variables={keywords} 
        demographics={demographics} 
        questions={questions} 
        onUpdateQuestion={handleUpdateQuestion}
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </section>
  );
};

export default AiDemo;

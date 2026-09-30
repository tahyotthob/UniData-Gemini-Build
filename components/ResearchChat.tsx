import React, { useState, useEffect, useRef } from 'react';
import { sendResearchChat, ChatMessage } from '../aiService';
import { SurveyQuestion } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ResearchChatProps {
  topic: string;
  variables: string;
  demographics: string;
  questions: SurveyQuestion[];
  onUpdateQuestion: (index: number, updated: Partial<SurveyQuestion>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SpeechRecognitionCtor: any =
  typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

const ResearchChat: React.FC<ResearchChatProps> = ({
  topic,
  variables,
  demographics,
  questions,
  onUpdateQuestion,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm Dr. Unidata. I'm monitoring your research draft. You can type or speak to me to refine your methodology!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcription, setTranscription] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceOnRef = useRef(false);
  const historyRef = useRef<ChatMessage[]>([]);
  const contextRef = useRef({ topic, variables, demographics, questions });
  contextRef.current = { topic, variables, demographics, questions };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, transcription]);

  useEffect(() => () => stopVoiceMode(), []);

  const sendText = async (userText: string) => {
    if (!userText.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    historyRef.current.push({ role: 'user', content: userText });
    setIsLoading(true);

    try {
      const result = await sendResearchChat(contextRef.current, historyRef.current);

      for (const call of result.toolCalls) {
        if (call.name === 'update_question' && typeof call.args.index === 'number') {
          const { index, questionText, type, options, rationale } = call.args;
          onUpdateQuestion(index, { question: questionText, type, options, rationale });
        }
      }

      const reply = result.text || "Applied changes to your survey draft.";
      historyRef.current.push({ role: 'assistant', content: reply });
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      if (voiceOnRef.current) speak(reply);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'model', text: error?.message || "Error syncing with AI. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-NG';
    window.speechSynthesis.speak(utterance);
  };

  // Voice uses the browser's built-in speech recognition/synthesis and the same text chat as typing.
  const toggleVoiceMode = () => {
    if (isVoiceActive) {
      stopVoiceMode();
      return;
    }
    if (!SpeechRecognitionCtor) {
      setMessages(prev => [...prev, { role: 'model', text: "Voice isn't supported in this browser. Please type, or try Chrome." }]);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-NG';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          setTranscription('');
          sendText(r[0].transcript);
        } else {
          interim += r[0].transcript;
        }
      }
      if (interim) setTranscription(interim);
    };
    recognition.onerror = () => stopVoiceMode();
    recognition.onend = () => {
      // Chrome ends sessions on silence; restart while voice mode is on.
      if (voiceOnRef.current) {
        try { recognition.start(); } catch { /* already started */ }
      } else {
        setIsVoiceActive(false);
      }
    };

    recognitionRef.current = recognition;
    voiceOnRef.current = true;
    setIsVoiceActive(true);
    setTranscription('Dr. Unidata is listening...');
    recognition.start();
  };

  function stopVoiceMode() {
    voiceOnRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsVoiceActive(false);
    setTranscription('');
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input;
    setInput('');
    await sendText(userText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-full max-w-md h-[600px] bg-white rounded-[32px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-unidata-blue p-6 flex justify-between items-center shadow-lg relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white relative overflow-hidden">
            {isVoiceActive ? (
              <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                <div className="w-1 h-4 bg-white animate-bounce"></div>
                <div className="w-1 h-6 bg-white animate-bounce delay-75"></div>
                <div className="w-1 h-3 bg-white animate-bounce delay-150"></div>
              </div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth={2}/></svg>
            )}
          </div>
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-tight">Dr. Unidata</h4>
            <span className="text-[10px] text-unidata-green font-bold uppercase tracking-widest">
              {isVoiceActive ? 'Listening...' : 'Live Sync Ready'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={toggleVoiceMode}
             className={`p-2 rounded-full transition-all ${isVoiceActive ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'}`}
             title={isVoiceActive ? 'Stop Voice' : 'Start Voice Conversation'}
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
           </button>
           <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5}/></svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-unidata-blue text-white rounded-tr-none shadow-md' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {transcription && (
          <div className="flex justify-end">
             <div className="bg-unidata-blue/50 text-white/80 p-3 rounded-2xl rounded-tr-none text-xs italic">
                {transcription}
             </div>
          </div>
        )}
        {isLoading && <div className="animate-pulse text-center text-[10px] text-gray-400 font-bold py-2 uppercase tracking-widest">Methodologist is thinking...</div>}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isVoiceActive}
            placeholder={isVoiceActive ? "Speak to Dr. Unidata..." : "e.g., 'Make Q1 a rating scale'"}
            className="w-full pl-6 pr-14 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-unidata-blue/10 transition-all text-sm font-medium outline-none disabled:opacity-50"
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading || isVoiceActive} 
            className="absolute right-2 top-2 w-10 h-10 bg-unidata-blue text-white rounded-xl flex items-center justify-center hover:bg-unidata-darkBlue transition-all disabled:opacity-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth={2}/></svg>
          </button>
        </div>
        <p className="text-[9px] text-gray-400 mt-3 text-center font-bold uppercase tracking-[0.2em] opacity-40">Conversational AI Engine Active</p>
      </div>
    </div>
  );
};

export default ResearchChat;

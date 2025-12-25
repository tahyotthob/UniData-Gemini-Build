
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createResearchChat, updateQuestionTool, DR_UNIDATA_SYSTEM_INSTRUCTION } from '../geminiService';
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

// Audio Utilities
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

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
  
  const chatRef = useRef<any>(null);
  const liveSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Refs
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = createResearchChat(topic, variables, demographics, questions);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, transcription]);

  const toggleVoiceMode = async () => {
    if (isVoiceActive) {
      stopVoiceMode();
      return;
    }

    try {
      setIsVoiceActive(true);
      setTranscription('Initializing voice connection...');

      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setTranscription('Dr. Unidata is listening...');
            const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current!.destination);
            liveSessionRef.current = { sessionPromise, stream, scriptProcessor };
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent?.inputTranscription?.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription('');
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioCtxRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtxRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioCtxRef.current, 24000, 1);
              const source = outputAudioCtxRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioCtxRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              activeSourcesRef.current.add(source);
              source.onended = () => activeSourcesRef.current.delete(source);
            }

            // Handle Function Calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'update_question') {
                  const { index, questionText, type, options, rationale } = fc.args as any;
                  onUpdateQuestion(index, { question: questionText, type, options, rationale });
                  
                  sessionPromise.then(session => session.sendToolResponse({
                    functionResponses: [{ id: fc.id, name: fc.name, response: { result: "Success: Form updated." } }]
                  }));
                  
                  setMessages(prev => [...prev, { role: 'model', text: `[VOICE EDIT] ${questionText}` }]);
                }
              }
            }

            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live Error", e),
          onclose: () => setIsVoiceActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          tools: [{ functionDeclarations: [updateQuestionTool] }],
          systemInstruction: DR_UNIDATA_SYSTEM_INSTRUCTION(topic, variables, demographics, questions),
        }
      });
    } catch (err) {
      console.error("Could not start voice mode", err);
      setIsVoiceActive(false);
    }
  };

  const stopVoiceMode = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.stream.getTracks().forEach((t: any) => t.stop());
      liveSessionRef.current.scriptProcessor.disconnect();
    }
    setIsVoiceActive(false);
    setTranscription('');
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userText });
      
      if (result.functionCalls) {
        for (const call of result.functionCalls) {
          if (call.name === 'update_question') {
            const { index, questionText, type, options, rationale } = call.args;
            onUpdateQuestion(index, { 
              question: questionText, 
              type: type as any, 
              options, 
              rationale 
            });
          }
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: result.text || "Applied changes to your survey draft." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error syncing with AI. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
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

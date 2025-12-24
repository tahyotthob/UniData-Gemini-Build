
import React, { useState, useEffect } from 'react';
import { subscribeToWaitlist } from '../apiService';
import { generateWelcomeDraft } from '../geminiService';

const Waitlist: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    const isJoined = localStorage.getItem('unidata_joined');
    const storedWelcome = localStorage.getItem('unidata_welcome');
    if (isJoined) {
      setSubmitted(true);
      if (storedWelcome) setWelcomeMessage(storedWelcome);
    }
  }, []);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // 1. Send data to Supabase
      await subscribeToWaitlist(email, role);
      
      // 2. Generate a personalized welcome message draft using Gemini
      const draft = await generateWelcomeDraft(role);
      
      // 3. Update UI and persist
      setWelcomeMessage(draft);
      localStorage.setItem('unidata_joined', 'true');
      localStorage.setItem('unidata_welcome', draft);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="py-24 bg-unidata-blue relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-unidata-green opacity-20 blur-3xl rounded-full"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-unidata-blue mb-4">Join the Data Revolution</h2>
          <p className="text-gray-600 mb-10">Get early access to our private beta and start collecting smarter data today.</p>
          
          {submitted ? (
            <div className="py-6 text-left">
              <div className="w-16 h-16 bg-green-100 text-unidata-green rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-unidata-blue text-center mb-4">You're on the list!</h3>
              
              <div className="bg-unidata-lightGreen/50 p-6 rounded-2xl border border-unidata-green/20">
                <p className="text-xs font-bold text-unidata-green uppercase tracking-widest mb-2">Personalized Welcome Note</p>
                <p className="text-gray-700 leading-relaxed italic">
                  {welcomeMessage}
                </p>
              </div>

              <div className="text-center mt-8">
                <button 
                  onClick={() => {
                    localStorage.removeItem('unidata_joined');
                    localStorage.removeItem('unidata_welcome');
                    setSubmitted(false);
                    setWelcomeMessage('');
                  }}
                  className="text-sm text-gray-400 hover:text-unidata-blue underline"
                >
                  Join with a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${role === 'student' ? 'bg-white text-unidata-blue shadow' : 'text-gray-500'}`}
                >
                  Researcher
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setRole('respondent')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${role === 'respondent' ? 'bg-white text-unidata-blue shadow' : 'text-gray-500'}`}
                >
                  Respondent
                </button>
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={role === 'student' ? "Enter your university email" : "Enter your email address"}
                  className={`w-full px-6 py-4 rounded-xl border-2 outline-none text-lg transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-unidata-blue'}`}
                />
                {error && <p className="text-red-500 text-xs mt-1 text-left ml-2 font-medium">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-unidata-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-unidata-darkBlue transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting to Database...
                  </>
                ) : 'Get Early Access'}
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Registration involves verification via our secure data pipeline.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Waitlist;

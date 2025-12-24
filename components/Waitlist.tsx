
import React, { useState } from 'react';

const Waitlist: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setSubmitted(true);
    // In a real app, send to backend
  };

  return (
    <section id="waitlist" className="py-24 bg-unidata-blue relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-unidata-green opacity-20 blur-3xl rounded-full"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-unidata-blue mb-4">Join the Data Revolution</h2>
          <p className="text-gray-600 mb-10">Get early access to our private beta and start collecting smarter data today.</p>
          
          {submitted ? (
            <div className="py-12 animate-bounce">
              <div className="w-20 h-20 bg-green-100 text-unidata-green rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-unidata-blue">You're on the list!</h3>
              <p className="text-gray-500 mt-2">We'll reach out to you as soon as we open the doors.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${role === 'student' ? 'bg-white text-unidata-blue shadow' : 'text-gray-500'}`}
                >
                  Researcher
                </button>
                <button
                  type="button"
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={role === 'student' ? "Enter your university email" : "Enter your email address"}
                  className={`w-full px-6 py-4 rounded-xl border-2 outline-none text-lg transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-unidata-blue'}`}
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1 text-left ml-2 font-medium animate-pulse">
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-unidata-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-unidata-darkBlue transition-all shadow-lg active:scale-95"
              >
                Get Early Access
              </button>
              <p className="text-xs text-gray-400 mt-4">
                By joining, you agree to our privacy policy and data protection standards.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Waitlist;


import React from 'react';
import { useAuth } from './AuthContext';

const Hero: React.FC = () => {
  const { setShowAuthModal, user } = useAuth();

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      const element = document.getElementById('ai-demo');
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-block py-1 px-3 mb-4 rounded-full bg-unidata-lightGreen text-unidata-green text-sm font-semibold tracking-wide animate-pulse">
              Join the 2,500+ Nigerian Researchers
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-unidata-blue mb-6 leading-tight">
              Collect Real Data. <br />
              <span className="text-unidata-green underline decoration-wavy">Powered by AI.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
              Unidata connects verified Nigerian respondents with researchers. Create validated surveys in minutes and get insights in days, not months.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
              <button 
                onClick={handleAction}
                className="bg-unidata-blue text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-unidata-darkBlue transition-all flex items-center justify-center transform hover:scale-105"
              >
                Create Account & Start
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-unidata-blue border-2 border-unidata-blue px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center"
              >
                Earn as Respondent
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-unidata-green opacity-10 rounded-full blur-3xl"></div>
            <div className="bg-white rounded-3xl shadow-2xl p-6 relative z-10 border border-gray-100 group transition-all duration-500 hover:rotate-1">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                alt="Research Platform" 
                className="rounded-2xl w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-gray-50 flex items-center space-x-4 animate-bounce">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-unidata-green">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Data Quality</p>
                  <p className="text-lg font-black text-unidata-blue">98.9% Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

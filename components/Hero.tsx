
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-block py-1 px-3 mb-4 rounded-full bg-unidata-lightGreen text-unidata-green text-sm font-semibold tracking-wide">
              Revolutionizing Research in Nigeria
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-unidata-blue mb-6 leading-tight">
              Collect Real Data. <br />
              <span className="text-unidata-green underline decoration-wavy">Powered by AI.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
              Unidata helps you generate better surveys, reach the right Nigerian respondents, and analyze results instantly. Built for students, researchers, and insight-seekers.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
              <a href="#ai-demo" className="bg-unidata-blue text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-unidata-darkBlue transition-all flex items-center justify-center">
                Create Survey with AI
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </a>
              <a href="#waitlist" className="bg-white text-unidata-blue border-2 border-unidata-blue px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center justify-center">
                Earn by Taking Surveys
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-unidata-green opacity-10 rounded-full blur-3xl"></div>
            <div className="bg-white rounded-3xl shadow-2xl p-6 relative z-10 border border-gray-100">
              <img 
                src="https://picsum.photos/seed/research/800/600" 
                alt="Research Platform" 
                className="rounded-2xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-unidata-green">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Verified Respondents</p>
                  <p className="text-lg font-bold text-unidata-blue">50,000+</p>
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

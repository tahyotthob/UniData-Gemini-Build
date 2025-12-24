
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-unidata-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="text-unidata-blue font-bold text-xl tracking-tight">Unidata</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-unidata-blue font-medium">How it Works</a>
            <a href="#features" className="text-gray-600 hover:text-unidata-blue font-medium">Features</a>
            <a href="#why-unidata" className="text-gray-600 hover:text-unidata-blue font-medium">Why Us</a>
            <button className="bg-unidata-blue text-white px-5 py-2 rounded-full font-medium hover:bg-unidata-darkBlue transition-colors">
              Get Early Access
            </button>
          </div>
          <div className="md:hidden">
            <button className="text-unidata-blue">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

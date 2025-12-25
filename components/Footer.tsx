
import React from 'react';

interface FooterProps {
  onAdminOpen?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminOpen }) => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-unidata-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">Unidata</span>
            </div>
            <p className="text-gray-400 max-w-sm mb-6">
              The premier AI-driven ecosystem for research and data collection in Nigeria. Empowering students and rewarding respondents.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-unidata-blue transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-unidata-blue transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#ai-demo" className="hover:text-white transition-colors">AI Generator</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
              <li><button onClick={onAdminOpen} className="hover:text-unidata-green transition-colors text-left">Admin View</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Research Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-gray-800 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Unidata Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-[10px] bg-gray-800 px-2 py-1 rounded">NNDP Compliant</span>
            <span className="text-[10px] bg-gray-800 px-2 py-1 rounded">SSL Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

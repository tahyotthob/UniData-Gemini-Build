
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import WhyUs from './components/WhyUs';
import AiDemo from './components/AiDemo';
import Waitlist from './components/Waitlist';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider } from './components/AuthContext';
import AuthModal from './components/AuthModal';
import { Testimonial } from './types';

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    "name": "Chidi O.",
    "role": "Final Year Student",
    "institution": "UNILAG",
    "content": "Unidata saved me 3 weeks of manual work. I got 200 verified responses for my Final Year Project in just 48 hours.",
    "color": "bg-blue-200"
  },
  {
    "name": "Dr. Ibrahim A.",
    "role": "Senior Lecturer",
    "institution": "University of Ibadan",
    "content": "As a lecturer, I recommend this to my students. The quality scoring tool ensures their methodology is sound before they even start.",
    "color": "bg-green-200"
  },
  {
    "name": "Favour E.",
    "role": "Verified Respondent",
    "institution": "Lagos State",
    "content": "Taking surveys on Unidata is easy and rewarding. I actually enjoy contributing to local research while earning extra cash.",
    "color": "bg-yellow-200"
  },
  {
    "name": "Sola W.",
    "role": "MSc Researcher",
    "institution": "OAU Ife",
    "content": "The AI question generator is a game changer. It helped me refine my survey variables into clear, measurable questions for my thesis.",
    "color": "bg-purple-200"
  }
];

const App: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Hero />
          
          <section className="py-12 bg-gray-50 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
              <p className="text-center text-gray-400 text-sm font-medium mb-8 uppercase tracking-widest">
                Trusted by Researchers from
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
                <span className="text-2xl font-bold text-gray-700">UNILAG</span>
                <span className="text-2xl font-bold text-gray-700">UI</span>
                <span className="text-2xl font-bold text-gray-700">OAU</span>
                <span className="text-2xl font-bold text-gray-700">COVENANT</span>
                <span className="text-2xl font-bold text-gray-700">LASU</span>
              </div>
            </div>
          </section>

          <HowItWorks />
          <AiDemo />
          <Features />
          <WhyUs />

          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-unidata-blue mb-4">What Our Users Say</h2>
                <p className="text-gray-500">Real impact stories from the Nigerian academic community.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TESTIMONIALS_DATA.map((t, index) => (
                  <div key={index} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all">
                    <p className="italic text-gray-600 mb-6">"{t.content}"</p>
                    <div className="mt-auto not-italic font-bold text-unidata-blue flex items-center">
                      <div className={`w-10 h-10 rounded-full ${t.color || 'bg-gray-200'} mr-3 flex items-center justify-center text-unidata-blue text-xs`}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.role}, {t.institution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Waitlist />
        </main>
        
        <Footer onAdminOpen={() => setIsAdminOpen(true)} />
        
        <AuthModal />
        
        {isAdminOpen && <AdminDashboard onClose={() => {
          setIsAdminOpen(false);
          window.location.hash = '';
        }} />}
      </div>
    </AuthProvider>
  );
};

export default App;

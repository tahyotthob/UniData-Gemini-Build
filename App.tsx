
import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import AiDemo from './components/AiDemo';
import Waitlist from './components/Waitlist';
import Footer from './components/Footer';
import { Testimonial } from './types';

const App: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch('./testimonials.json')
      .then(response => response.json())
      .then(data => setTestimonials(data))
      .catch(error => console.error('Error loading testimonials:', error));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        
        {/* Social Proof Bar */}
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

        {/* Testimonial Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-unidata-blue mb-4">What Our Users Say</h2>
              <p className="text-gray-500">Real impact stories from the Nigerian academic community.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, index) => (
                <div key={index} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all">
                  <p className="italic text-gray-600 mb-6">"{t.content}"</p>
                  <div className="mt-auto not-italic font-bold text-unidata-blue flex items-center">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${t.color || 'bg-gray-200'} mr-3 flex items-center justify-center text-unidata-blue text-xs`}>
                        {t.name.charAt(0)}
                      </div>
                    )}
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
      <Footer />
    </div>
  );
};

export default App;

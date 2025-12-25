
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const Waitlist: React.FC = () => {
  const { setShowAuthModal, user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    // Check if user is already logged in or has a join flag
    if (user || localStorage.getItem('unidata_joined')) {
      setIsJoined(true);
    }
  }, [user]);

  return (
    <section id="waitlist" className="py-24 bg-unidata-blue relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-unidata-green opacity-20 blur-3xl rounded-full"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-2xl text-center border border-white/20">
          <div className="max-w-xl mx-auto">
            <h2 className="text-4xl font-black text-unidata-blue mb-6 tracking-tight uppercase">Join the Data Ecosystem</h2>
            <p className="text-gray-500 mb-10 text-lg leading-relaxed">
              We are currently in private beta. Create your profile to secure your spot and start collecting or providing high-quality Nigerian data.
            </p>
            
            {isJoined ? (
              <div className="py-10 animate-fade-in">
                <div className="w-24 h-24 bg-unidata-lightGreen text-unidata-green rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-unidata-blue mb-3 uppercase tracking-tight">You are on the list!</h3>
                <p className="text-gray-400 font-medium">
                  Thank you for joining. We'll send your access key to {user?.email || 'your email'} shortly.
                </p>
                {user && (
                   <button 
                     onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                     className="mt-8 text-unidata-blue font-black text-xs uppercase tracking-widest hover:underline"
                   >
                     Explore the Lab
                   </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-unidata-blue text-white px-8 py-5 rounded-[25px] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(0,64,128,0.4)] hover:bg-unidata-darkBlue transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center"
                >
                  Request Early Access
                  <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] pt-4">
                  Secured with Bank-Grade Encryption & NNDP Compliant
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Waitlist;

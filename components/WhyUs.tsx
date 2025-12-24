
import React from 'react';

const WhyUs: React.FC = () => {
  const points = [
    {
      title: "Real Nigerian Data",
      desc: "No more bot responses. We use NIN-linked verification and academic email validation to ensure your data comes from real people.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Faster Research Timelines",
      desc: "Turn months into days. Automated distribution across Nigerian universities means your sample size is reached faster than traditional methods.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Supervisor-Ready Analytics",
      desc: "Export data directly in formats compatible with SPSS, Stata, and Excel, complete with AI-generated descriptive analysis drafts.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Mobile-First & Accessible",
      desc: "Optimized for low-bandwidth environments. Respondents can answer on any mobile device, even with unstable internet connections.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <section id="why-unidata" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-unidata-blue mb-6">
              Why Researchers Choose <span className="text-unidata-green">Unidata</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Traditional data collection in Nigeria is broken. Paper surveys are slow, expensive, and prone to manipulation. We built a platform that addresses the specific challenges of the Nigerian research landscape.
            </p>
            <div className="space-y-6">
              {points.map((point, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-unidata-lightGreen text-unidata-green rounded-lg flex items-center justify-center">
                    {point.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-unidata-blue">{point.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="bg-unidata-blue rounded-3xl p-8 text-white relative z-10">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <span className="font-bold text-xl">The Unidata Difference</span>
                <span className="bg-unidata-green px-3 py-1 rounded-full text-xs font-bold uppercase">Active</span>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span>Average Collection Time</span>
                  <span className="font-bold text-unidata-green">2.4 Days</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-unidata-green h-full w-[90%]"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Integrity Score</span>
                  <span className="font-bold text-unidata-green">98.5%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-unidata-green h-full w-[95%]"></div>
                </div>
                <div className="mt-8 bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-sm opacity-80 leading-relaxed italic">
                    "We migrated our entire departmental research workflow to Unidata. The speed of iteration has increased by 400%."
                  </p>
                  <p className="mt-2 text-xs font-bold">— Department of Sociology, UNILAG</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-full h-full bg-gray-100 -z-0 rounded-3xl translate-x-4 translate-y-4"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;

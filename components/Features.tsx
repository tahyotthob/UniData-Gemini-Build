
import React from 'react';

const features = [
  {
    title: "AI Question Generation",
    desc: "3–5 optimized questions generated from your core thesis or objective in seconds. Uses validated survey design patterns.",
    details: ["Likert Scaling", "Open-ended Optimization", "Validated Variables"],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9.4-2.593 1.002l-.548-.547z" />
      </svg>
    )
  },
  {
    title: "Quality & Bias Detection",
    desc: "AI scans your surveys for leading questions, cultural insensitivity, or technical bias before you launch to the public.",
    details: ["Cultural Context Scan", "Tone Analysis", "Flow Optimization"],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    title: "Smart Respondent Matching",
    desc: "Reach specific demographics across Nigeria effortlessly through our persona-based matching engine.",
    details: ["University Targeting", "NIN-Verified Users", "Niche Group Access"],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    title: "Automated Insights",
    desc: "Get ready-to-use charts and AI-written summaries perfect for your thesis submission or market report.",
    details: ["Real-time Visualization", "Thematic Coding", "Export to PDF/Excel"],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    )
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-unidata-blue mb-4">Powerful Features for Modern Research</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">We provide the end-to-end toolkit necessary to conduct world-class research within the local context.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col md:flex-row gap-6">
              <div className="w-16 h-16 bg-blue-50 text-unidata-blue rounded-2xl flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-unidata-blue mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {f.details.map((detail, idx) => (
                    <span key={idx} className="bg-unidata-lightGreen/50 text-unidata-green text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bonus Feature Callout */}
        <div className="mt-16 text-center p-12 bg-unidata-blue rounded-3xl text-white">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-4">Secure & Privacy First</h3>
              <p className="max-w-md text-blue-100 opacity-80">
                We use industry-standard encryption for all research data. Respondents' identities are protected, ensuring high participation rates and honest feedback.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-xl text-center backdrop-blur-sm border border-white/5">
                <p className="text-2xl font-bold">256-bit</p>
                <p className="text-xs opacity-70">Encryption</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl text-center backdrop-blur-sm border border-white/5">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs opacity-70">GDPR Compliant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

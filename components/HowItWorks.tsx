
import React from 'react';

const steps = [
  {
    num: "01",
    title: "Generate with AI",
    desc: "Tell our AI your research topic. It generates a perfectly balanced survey that meets academic standards."
  },
  {
    num: "02",
    title: "Match & Distribute",
    desc: "We push your survey to our network of verified Nigerian respondents that fit your exact target persona."
  },
  {
    num: "03",
    title: "Instant Analytics",
    desc: "Watch data roll in. Export auto-generated charts and AI summaries directly into your final report."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-unidata-blue mb-4">How Unidata Works</h2>
          <p className="text-gray-600">From concept to verified data in 3 simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 z-0"></div>
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-unidata-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 border-8 border-white">
                {s.num}
              </div>
              <h3 className="text-xl font-bold text-unidata-blue mb-4">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

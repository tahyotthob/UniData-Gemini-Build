
import React from 'react';

const steps = [
  {
    num: "01",
    title: "Draft with AI Intelligence",
    desc: "Input your research hypothesis or objectives. Our AI doesn't just write questions; it builds validated instruments with appropriate scales (Likert, semantic differential) tailored to Nigerian academic standards.",
    tag: "Design"
  },
  {
    num: "02",
    title: "Smart Network Distribution",
    desc: "Target your persona—be it Gen Z techies in Yaba or small-scale farmers in Benue. Our algorithm matches your survey with verified respondents from our extensive campus and community network.",
    tag: "Reach"
  },
  {
    num: "03",
    title: "Instant Insight Dashboard",
    desc: "Skip the manual coding. As responses come in, watch your dashboard populate with clean charts and AI-drafted thematic analysis that's ready to be dropped into Chapter 4 of your thesis.",
    tag: "Analysis"
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="text-unidata-green font-bold text-sm tracking-widest uppercase">Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-unidata-blue mt-2">Data Collection Made Simple</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4">Move from research design to final analysis faster than ever before with our streamlined digital workflow.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-1 bg-gradient-to-r from-unidata-blue/10 via-unidata-green/20 to-unidata-blue/10 rounded-full z-0"></div>
          
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 group">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-white border-4 border-unidata-blue text-unidata-blue rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg transform group-hover:-rotate-6 transition-transform">
                    {s.num}
                  </div>
                  <div className="absolute -top-3 -right-3 bg-unidata-green text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    {s.tag}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-unidata-blue mb-4">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm px-4">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-unidata-lightGreen/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between border border-unidata-green/10">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-unidata-green rounded-full flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-unidata-blue">Ready to start?</p>
              <p className="text-sm text-gray-500">Launch your first AI-assisted survey in minutes.</p>
            </div>
          </div>
          <button className="bg-unidata-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-unidata-darkBlue transition-colors shadow-lg">
            Create Free Account
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

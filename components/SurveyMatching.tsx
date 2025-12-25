
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { createCampaign, fetchMatchedSurveys } from '../apiService';
import { SurveyCampaign, SurveyQuestion } from '../types';

interface SurveyMatchingProps {
  draftQuestions?: SurveyQuestion[];
  draftTitle?: string;
}

const SurveyMatching: React.FC<SurveyMatchingProps> = ({ draftQuestions = [], draftTitle = "" }) => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<SurveyCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  // Target Filter States
  const [targets, setTargets] = useState({
    states: [] as string[],
    genders: [] as string[],
    ages: [] as string[]
  });

  useEffect(() => {
    if (user?.role === 'respondent') {
      const load = async () => {
        const matched = await fetchMatchedSurveys(user);
        setSurveys(matched);
        setLoading(false);
      };
      load();
    }
  }, [user]);

  const handleLaunch = async () => {
    if (!user) return;
    setIsLaunching(true);
    try {
      await createCampaign({
        title: draftTitle || "Untitled Research Study",
        questions: draftQuestions,
        target_states: targets.states,
        target_genders: targets.genders,
        target_age_ranges: targets.ages,
        reward: 500,
        researcher_id: user.id
      });
      setLaunchSuccess(true);
    } catch (e) {
      alert("Error launching campaign");
    } finally {
      setIsLaunching(false);
    }
  };

  const toggleTarget = (category: 'states' | 'genders' | 'ages', value: string) => {
    setTargets(prev => ({
      ...prev,
      [category]: prev[category].includes(value) 
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  if (!user) return null;

  return (
    <div className="mt-12 animate-fade-in">
      {user.role === 'researcher' ? (
        <div className="bg-unidata-blue text-white rounded-[40px] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter">Matching Engine</h3>
              <p className="text-blue-200 text-sm mt-1">Configure who should see your survey across Nigeria.</p>
            </div>
            {launchSuccess ? (
              <div className="bg-unidata-green px-6 py-3 rounded-2xl flex items-center gap-2 animate-bounce">
                <span className="font-black text-xs uppercase">Campaign Live!</span>
              </div>
            ) : (
              <button 
                onClick={handleLaunch}
                disabled={isLaunching || draftQuestions.length === 0}
                className="bg-unidata-green hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {isLaunching ? 'Processing...' : 'Deploy to Network'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Target Geography */}
            <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
              <label className="block text-[10px] font-black text-unidata-green uppercase tracking-widest mb-4">Target States</label>
              <div className="flex flex-wrap gap-2">
                {['Lagos', 'Abuja', 'Rivers', 'Kano', 'Oyo'].map(s => (
                  <button 
                    key={s}
                    onClick={() => toggleTarget('states', s)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${targets.states.includes(s) ? 'bg-unidata-green text-white' : 'bg-white/5 text-gray-400'}`}
                  >
                    {s}
                  </button>
                ))}
                <span className="text-[9px] opacity-40 italic mt-2 block w-full">+ 32 others available</span>
              </div>
            </div>

            {/* Target Demographics */}
            <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
              <label className="block text-[10px] font-black text-unidata-green uppercase tracking-widest mb-4">Target Gender</label>
              <div className="flex gap-2">
                {['Male', 'Female'].map(g => (
                  <button 
                    key={g}
                    onClick={() => toggleTarget('genders', g)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${targets.genders.includes(g) ? 'bg-unidata-green text-white' : 'bg-white/5 text-gray-400'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Age */}
            <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
              <label className="block text-[10px] font-black text-unidata-green uppercase tracking-widest mb-4">Target Age</label>
              <div className="flex flex-wrap gap-2">
                {['18-24', '25-34', '35-44', '45+'].map(a => (
                  <button 
                    key={a}
                    onClick={() => toggleTarget('ages', a)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${targets.ages.includes(a) ? 'bg-unidata-green text-white' : 'bg-white/5 text-gray-400'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-unidata-blue uppercase tracking-tight">Personalized Survey Feed</h3>
            <span className="text-[10px] font-black text-unidata-green bg-unidata-lightGreen px-3 py-1.5 rounded-full border border-unidata-green/10 uppercase tracking-widest">
              {surveys.length} Matches Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                Optimizing your feed...
              </div>
            ) : surveys.length === 0 ? (
              <div className="col-span-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-[40px] p-16 text-center">
                <p className="text-gray-400 font-bold">No exact matches yet. Complete more profile details!</p>
              </div>
            ) : (
              surveys.map(s => (
                <div key={s.id} className="group bg-white p-8 rounded-[40px] border border-gray-100 hover:border-unidata-green transition-all shadow-sm hover:shadow-xl cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-unidata-lightGreen text-unidata-green text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Verified Match
                    </span>
                    <span className="text-unidata-blue font-black text-lg">₦{s.reward}</span>
                  </div>
                  <h4 className="text-xl font-black text-unidata-blue mb-4 group-hover:text-unidata-green transition-colors">{s.title}</h4>
                  <p className="text-xs text-gray-500 mb-6 line-clamp-2">This study targets {s.target_states.join(', ') || 'Nationwide'} respondents.</p>
                  <div className="flex gap-4">
                    <button className="flex-grow bg-unidata-blue text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-unidata-darkBlue transition-all">
                      Start Survey
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 text-gray-400 hover:text-unidata-blue transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth={2}/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyMatching;

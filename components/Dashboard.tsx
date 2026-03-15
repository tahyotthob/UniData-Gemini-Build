import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import { fetchMatchedSurveys, fetchResearcherSurveys, fetchSurveyResponses } from '../apiService';
import { SurveyCampaign } from '../types';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [surveys, setSurveys] = useState<SurveyCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseCountMap, setResponseCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      if (user.role === 'researcher') {
        const data = await fetchResearcherSurveys(user.id!);
        setSurveys(data);
        // Fetch response counts for each survey
        const counts: Record<string, number> = {};
        for (const s of data) {
          const responses = await fetchSurveyResponses(s.id);
          counts[s.id] = responses.length;
        }
        setResponseCountMap(counts);
      } else {
        const data = await fetchMatchedSurveys(user);
        setSurveys(data);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-unidata-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="text-unidata-blue font-bold text-xl tracking-tight">Unidata</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-unidata-blue bg-unidata-lightGreen px-3 py-1.5 rounded-full">
              {user.name || user.email}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {user.role}
            </span>
            <button onClick={signOut} className="text-xs text-red-400 hover:text-red-600 font-bold">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-unidata-blue uppercase tracking-tighter">
            {user.role === 'researcher' ? 'Researcher Dashboard' : 'My Survey Feed'}
          </h1>
          <p className="text-gray-400 mt-1">
            {user.role === 'researcher'
              ? 'Manage your surveys, view responses, and create new research.'
              : 'Browse and complete surveys matched to your profile.'}
          </p>
        </div>

        {user.role === 'researcher' ? (
          /* RESEARCHER VIEW */
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Surveys</p>
                <p className="text-3xl font-black text-unidata-blue">{surveys.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Responses</p>
                <p className="text-3xl font-black text-unidata-green">{Object.values(responseCountMap).reduce((a, b) => a + b, 0)}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100">
                <Link to="/" className="block">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">AI Lab</p>
                  <p className="text-sm font-bold text-unidata-blue hover:underline">Go to AI Survey Generator</p>
                </Link>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-unidata-blue uppercase tracking-tight">Your Surveys</h2>
              <Link to="/" className="bg-unidata-blue text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-unidata-darkBlue transition-all">
                Create Survey (AI Lab)
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-unidata-blue mx-auto"></div>
              </div>
            ) : surveys.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                <p className="text-gray-400 font-bold mb-4">No surveys yet. Use the AI Lab to create your first survey!</p>
                <Link to="/" className="text-unidata-blue font-bold hover:underline text-sm">Open AI Lab</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {surveys.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-unidata-blue">{s.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {s.questions.length} questions &bull; {s.target_states.length > 0 ? s.target_states.join(', ') : 'Nationwide'} &bull; {responseCountMap[s.id] || 0} responses
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/survey/${s.id}/responses`}
                          className="bg-unidata-lightGreen text-unidata-green px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-unidata-green hover:text-white transition-all"
                        >
                          View Responses
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* RESPONDENT VIEW */
          <>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-unidata-green bg-unidata-lightGreen px-3 py-1.5 rounded-full border border-unidata-green/10 uppercase tracking-widest">
                {surveys.length} Matches Found
              </span>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-unidata-blue mx-auto"></div>
              </div>
            ) : surveys.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                <p className="text-gray-400 font-bold">No surveys matched to your profile yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {surveys.map(s => (
                  <div key={s.id} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-unidata-green transition-all shadow-sm hover:shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-unidata-lightGreen text-unidata-green text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Matched
                      </span>
                      <span className="text-unidata-blue font-black text-lg">₦{s.reward}</span>
                    </div>
                    <h4 className="text-xl font-black text-unidata-blue mb-3">{s.title}</h4>
                    <p className="text-xs text-gray-500 mb-6">
                      {s.questions.length} questions &bull; {s.target_states.join(', ') || 'Nationwide'}
                    </p>
                    <Link
                      to={`/dashboard/survey/${s.id}/take`}
                      className="block w-full bg-unidata-blue text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-unidata-darkBlue transition-all text-center"
                    >
                      Start Survey
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

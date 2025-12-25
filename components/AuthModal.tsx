
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { registerUser } from '../apiService';
import { UserRole } from '../types';

const AuthModal: React.FC = () => {
  const { login, showAuthModal, setShowAuthModal } = useAuth();
  const [role, setRole] = useState<UserRole>('researcher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    course: '',
    university: '',
    ageRange: '',
    gender: '',
    state: '',
    education: '',
    employment: ''
  });

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for Step 1
    if (step === 1 && !formData.email) {
      setError("Email is required to continue.");
      return;
    }

    if (step === 1) {
      setStep(2);
      setError('');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const profile = { ...formData, role };
      await registerUser(profile);
      
      // PERSISTENCE FIX: Set the waitlist flag in local storage
      localStorage.setItem('unidata_joined', 'true');
      
      login(profile);
      setStep(1); // Reset for next time
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const statesOfNigeria = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", 
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-unidata-blue/80 backdrop-blur-md transition-opacity" 
        onClick={() => {
           setShowAuthModal(false);
           setStep(1);
        }}
      ></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-fade-in border border-white/20">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-unidata-blue uppercase tracking-tight">
                {step === 1 ? 'Step 1: Account' : 'Step 2: Profile'}
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                {role === 'researcher' ? 'Researcher Portal' : 'Respondent Network'}
              </p>
            </div>
            <button 
              onClick={() => {
                setShowAuthModal(false);
                setStep(1);
              }} 
              className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-unidata-blue transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex p-1.5 bg-gray-100 rounded-[20px] mb-10">
            <button 
              onClick={() => { setRole('researcher'); setStep(1); }}
              className={`flex-1 py-3.5 rounded-[15px] font-black text-[10px] uppercase tracking-widest transition-all ${role === 'researcher' ? 'bg-white text-unidata-blue shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              I am a Researcher
            </button>
            <button 
              onClick={() => { setRole('respondent'); setStep(1); }}
              className={`flex-1 py-3.5 rounded-[15px] font-black text-[10px] uppercase tracking-widest transition-all ${role === 'respondent' ? 'bg-white text-unidata-blue shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              I am a Respondent
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Primary Email Address</label>
                <input 
                  required
                  type="email"
                  placeholder={role === 'researcher' ? "Use your .edu.ng email if possible" : "Enter your active email"}
                  className="w-full px-6 py-5 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-3 italic">
                  We'll use this to notify you about {role === 'researcher' ? 'responses' : 'survey rewards'}.
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar text-unidata-blue">
                {role === 'researcher' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Full Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="Dr./Mr./Ms. Name"
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">University</label>
                        <input 
                          required
                          type="text"
                          placeholder="e.g., UNILAG"
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium"
                          value={formData.university}
                          onChange={(e) => updateField('university', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Department/Course</label>
                        <input 
                          required
                          type="text"
                          placeholder="e.g., Sociology"
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium"
                          value={formData.course}
                          onChange={(e) => updateField('course', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Age Bracket</label>
                        <select 
                          required
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium appearance-none"
                          value={formData.ageRange}
                          onChange={(e) => updateField('ageRange', e.target.value)}
                        >
                          <option value="">Select Age</option>
                          <option value="18-24">18-24</option>
                          <option value="25-34">25-34</option>
                          <option value="35-44">35-44</option>
                          <option value="45+">45+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Gender Identity</label>
                        <select 
                          required
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium appearance-none"
                          value={formData.gender}
                          onChange={(e) => updateField('gender', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Prefer not to say">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Current State (Residing In)</label>
                      <select 
                        required
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium appearance-none"
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                      >
                        <option value="">Select State</option>
                        {statesOfNigeria.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Highest Education</label>
                      <select 
                        required
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium appearance-none"
                        value={formData.education}
                        onChange={(e) => updateField('education', e.target.value)}
                      >
                        <option value="">Select Level</option>
                        <option value="Secondary">Secondary School</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Postgraduate">Postgraduate</option>
                        <option value="Vocational">Vocational</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Job Title / Employment</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Student, Graphic Designer, Banker"
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium"
                        value={formData.employment}
                        onChange={(e) => updateField('employment', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {error && <p className="text-red-500 text-[11px] font-bold text-center animate-shake">{error}</p>}

            <div className="flex gap-4 pt-4">
               {step === 2 && (
                 <button
                   type="button"
                   onClick={() => setStep(1)}
                   className="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-gray-100 text-gray-400 hover:border-unidata-blue hover:text-unidata-blue transition-all"
                 >
                   Back
                 </button>
               )}
               <button
                type="submit"
                disabled={loading}
                className="flex-grow bg-unidata-blue text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-unidata-darkBlue transition-all shadow-[0_15px_30px_-10px_rgba(0,64,128,0.4)] active:scale-95 flex items-center justify-center"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (step === 1 ? 'Next: Build Profile' : 'Confirm Registration')}
              </button>
            </div>
          </form>
          
          <div className="mt-8 flex items-center justify-center gap-2 opacity-30 group cursor-default">
             <div className="w-1.5 h-1.5 rounded-full bg-unidata-blue transition-all group-hover:scale-150"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-unidata-blue transition-all group-hover:scale-150 delay-75"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-unidata-blue transition-all group-hover:scale-150 delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

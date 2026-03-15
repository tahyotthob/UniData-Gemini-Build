import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';

const STATES_OF_NIGERIA = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

type AuthMode = 'signin' | 'signup';

const AuthModal: React.FC = () => {
  const { signIn, signUp, resetPassword, showAuthModal, setShowAuthModal } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<UserRole>('researcher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', course: '', university: '', ageRange: '', gender: '', state: '', education: '', employment: '' });
    setStep(1);
    setError('');
    setSuccessMsg('');
  };

  const handleClose = () => {
    setShowAuthModal(false);
    resetForm();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await signIn(formData.email, formData.password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      handleClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!formData.email || !formData.password) {
        setError('Email and password are required.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setStep(2);
      setError('');
      return;
    }

    setError('');
    setLoading(true);

    const result = await signUp(formData.email, formData.password, {
      role,
      name: formData.name,
      course: formData.course,
      university: formData.university,
      ageRange: formData.ageRange,
      gender: formData.gender,
      state: formData.state,
      education: formData.education,
      employment: formData.employment,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccessMsg('Account created! Check your email for a confirmation link.');
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Enter your email first.');
      return;
    }
    setLoading(true);
    const result = await resetPassword(formData.email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccessMsg('Password reset email sent. Check your inbox.');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (successMsg) setSuccessMsg('');
  };

  const inputClass = "w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium";

  if (successMsg) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-unidata-blue/80 backdrop-blur-md" onClick={handleClose}></div>
        <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-fade-in border border-white/20 p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-unidata-lightGreen text-unidata-green rounded-[25px] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">{successMsg}</p>
          <button onClick={handleClose} className="bg-unidata-blue text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-unidata-darkBlue transition-all">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-unidata-blue/80 backdrop-blur-md transition-opacity" onClick={handleClose}></div>

      <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-fade-in border border-white/20">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-unidata-blue uppercase tracking-tight">
                {mode === 'signin' ? 'Sign In' : step === 1 ? 'Step 1: Account' : 'Step 2: Profile'}
              </h2>
              {mode === 'signup' && (
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                  {role === 'researcher' ? 'Researcher Portal' : 'Respondent Network'}
                </p>
              )}
            </div>
            <button onClick={handleClose} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-unidata-blue transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {mode === 'signup' && step === 1 && (
            <div className="flex p-1.5 bg-gray-100 rounded-[20px] mb-10">
              <button
                onClick={() => setRole('researcher')}
                className={`flex-1 py-3.5 rounded-[15px] font-black text-[10px] uppercase tracking-widest transition-all ${role === 'researcher' ? 'bg-white text-unidata-blue shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                I am a Researcher
              </button>
              <button
                onClick={() => setRole('respondent')}
                className={`flex-1 py-3.5 rounded-[15px] font-black text-[10px] uppercase tracking-widest transition-all ${role === 'respondent' ? 'bg-white text-unidata-blue shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                I am a Respondent
              </button>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Email Address</label>
                <input required type="email" placeholder="Enter your email" className={inputClass} value={formData.email} onChange={e => updateField('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Password</label>
                <input required type="password" placeholder="Enter your password" className={inputClass} value={formData.password} onChange={e => updateField('password', e.target.value)} />
              </div>

              {error && <p className="text-red-500 text-[11px] font-bold text-center">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-unidata-blue text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-unidata-darkBlue transition-all shadow-[0_15px_30px_-10px_rgba(0,64,128,0.4)] active:scale-95 flex items-center justify-center">
                {loading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Sign In'}
              </button>

              <div className="text-center space-y-2 pt-2">
                <button type="button" onClick={handleForgotPassword} className="text-xs text-gray-400 hover:text-unidata-blue transition-colors">
                  Forgot password?
                </button>
                <p className="text-xs text-gray-400">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); resetForm(); }} className="text-unidata-blue font-bold hover:underline">
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
              {step === 1 ? (
                <div className="animate-fade-in space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Email Address</label>
                    <input required type="email" placeholder={role === 'researcher' ? "Use your .edu.ng email if possible" : "Enter your active email"} className={inputClass} value={formData.email} onChange={e => updateField('email', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Password</label>
                    <input required type="password" placeholder="Min. 6 characters" className={inputClass} value={formData.password} onChange={e => updateField('password', e.target.value)} minLength={6} />
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-fade-in max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar text-unidata-blue">
                  {role === 'researcher' ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Full Name</label>
                        <input required type="text" placeholder="Dr./Mr./Ms. Name" className={inputClass} value={formData.name} onChange={e => updateField('name', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">University</label>
                          <input required type="text" placeholder="e.g., UNILAG" className={inputClass} value={formData.university} onChange={e => updateField('university', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Department/Course</label>
                          <input required type="text" placeholder="e.g., Sociology" className={inputClass} value={formData.course} onChange={e => updateField('course', e.target.value)} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Age Bracket</label>
                          <select required className={`${inputClass} appearance-none`} value={formData.ageRange} onChange={e => updateField('ageRange', e.target.value)}>
                            <option value="">Select Age</option>
                            <option value="18-24">18-24</option>
                            <option value="25-34">25-34</option>
                            <option value="35-44">35-44</option>
                            <option value="45+">45+</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Gender Identity</label>
                          <select required className={`${inputClass} appearance-none`} value={formData.gender} onChange={e => updateField('gender', e.target.value)}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Prefer not to say">Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Current State</label>
                        <select required className={`${inputClass} appearance-none`} value={formData.state} onChange={e => updateField('state', e.target.value)}>
                          <option value="">Select State</option>
                          {STATES_OF_NIGERIA.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Highest Education</label>
                        <select required className={`${inputClass} appearance-none`} value={formData.education} onChange={e => updateField('education', e.target.value)}>
                          <option value="">Select Level</option>
                          <option value="Secondary">Secondary School</option>
                          <option value="Undergraduate">Undergraduate</option>
                          <option value="Postgraduate">Postgraduate</option>
                          <option value="Vocational">Vocational</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Job Title / Employment</label>
                        <input required type="text" placeholder="e.g. Student, Graphic Designer, Banker" className={inputClass} value={formData.employment} onChange={e => updateField('employment', e.target.value)} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {error && <p className="text-red-500 text-[11px] font-bold text-center">{error}</p>}

              <div className="flex gap-4 pt-4">
                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-gray-100 text-gray-400 hover:border-unidata-blue hover:text-unidata-blue transition-all">
                    Back
                  </button>
                )}
                <button type="submit" disabled={loading} className="flex-grow bg-unidata-blue text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-unidata-darkBlue transition-all shadow-[0_15px_30px_-10px_rgba(0,64,128,0.4)] active:scale-95 flex items-center justify-center">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (step === 1 ? 'Next: Build Profile' : 'Create Account')}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 pt-2">
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('signin'); resetForm(); }} className="text-unidata-blue font-bold hover:underline">
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

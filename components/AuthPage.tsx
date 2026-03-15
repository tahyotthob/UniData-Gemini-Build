import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const AuthPage: React.FC = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<UserRole>('researcher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', course: '', university: '',
    ageRange: '', gender: '', state: '', education: '', employment: ''
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', course: '', university: '', ageRange: '', gender: '', state: '', education: '', employment: '' });
    setStep(1);
    setError('');
    setSuccessMsg('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { setError('Email and password are required.'); return; }
    setError('');
    setLoading(true);
    const result = await signIn(formData.email, formData.password);
    setLoading(false);
    if (result.error) { setError(result.error); } else { navigate('/dashboard'); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.email || !formData.password) { setError('Email and password are required.'); return; }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      setStep(2);
      setError('');
      return;
    }
    setError('');
    setLoading(true);
    const result = await signUp(formData.email, formData.password, {
      role, name: formData.name, course: formData.course, university: formData.university,
      ageRange: formData.ageRange, gender: formData.gender, state: formData.state,
      education: formData.education, employment: formData.employment,
    });
    setLoading(false);
    if (result.error) { setError(result.error); } else { setSuccessMsg('Account created! Check your email for a confirmation link.'); }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (successMsg) setSuccessMsg('');
  };

  const inputClass = "w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-xl p-8 md:p-12">
        {successMsg ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-unidata-lightGreen text-unidata-green rounded-[25px] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">{successMsg}</p>
            <button onClick={() => { resetForm(); setMode('signin'); }} className="bg-unidata-blue text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-unidata-darkBlue transition-all">
              Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Link to="/" className="text-unidata-blue font-bold text-sm hover:underline">&larr; Back to Home</Link>
            </div>

            <h2 className="text-3xl font-black text-unidata-blue uppercase tracking-tight mb-2">
              {mode === 'signin' ? 'Sign In' : step === 1 ? 'Step 1: Account' : 'Step 2: Profile'}
            </h2>
            {mode === 'signup' && (
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">
                {role === 'researcher' ? 'Researcher Portal' : 'Respondent Network'}
              </p>
            )}

            {mode === 'signup' && step === 1 && (
              <div className="flex p-1.5 bg-gray-100 rounded-[20px] mb-8">
                <button onClick={() => setRole('researcher')} className={`flex-1 py-3.5 rounded-[15px] font-black text-[10px] uppercase tracking-widest transition-all ${role === 'researcher' ? 'bg-white text-unidata-blue shadow-lg' : 'text-gray-400'}`}>
                  I am a Researcher
                </button>
                <button onClick={() => setRole('respondent')} className={`flex-1 py-3.5 rounded-[15px] font-black text-[10px] uppercase tracking-widest transition-all ${role === 'respondent' ? 'bg-white text-unidata-blue shadow-lg' : 'text-gray-400'}`}>
                  I am a Respondent
                </button>
              </div>
            )}

            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-6 mt-6">
                <div>
                  <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Email</label>
                  <input required type="email" className={inputClass} value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Password</label>
                  <input required type="password" className={inputClass} value={formData.password} onChange={e => updateField('password', e.target.value)} placeholder="Your password" />
                </div>
                {error && <p className="text-red-500 text-[11px] font-bold text-center">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-unidata-blue text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-unidata-darkBlue transition-all active:scale-95">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <div className="text-center space-y-2 pt-2">
                  <Link to="/forgot-password" className="block text-xs text-gray-400 hover:text-unidata-blue transition-colors">Forgot password?</Link>
                  <p className="text-xs text-gray-400">Don't have an account? <button type="button" onClick={() => { setMode('signup'); resetForm(); }} className="text-unidata-blue font-bold hover:underline">Sign Up</button></p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-6">
                {step === 1 ? (
                  <div className="space-y-5">
                    <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Email</label><input required type="email" className={inputClass} value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder={role === 'researcher' ? "Use your .edu.ng email if possible" : "Enter your email"} /></div>
                    <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Password</label><input required type="password" className={inputClass} value={formData.password} onChange={e => updateField('password', e.target.value)} placeholder="Min. 6 characters" minLength={6} /></div>
                  </div>
                ) : (
                  <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {role === 'researcher' ? (
                      <>
                        <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Full Name</label><input required type="text" className={inputClass} value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Dr./Mr./Ms. Name" /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">University</label><input required type="text" className={inputClass} value={formData.university} onChange={e => updateField('university', e.target.value)} placeholder="e.g., UNILAG" /></div>
                          <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Department</label><input required type="text" className={inputClass} value={formData.course} onChange={e => updateField('course', e.target.value)} placeholder="e.g., Sociology" /></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Age Bracket</label><select required className={`${inputClass} appearance-none`} value={formData.ageRange} onChange={e => updateField('ageRange', e.target.value)}><option value="">Select Age</option><option value="18-24">18-24</option><option value="25-34">25-34</option><option value="35-44">35-44</option><option value="45+">45+</option></select></div>
                          <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Gender</label><select required className={`${inputClass} appearance-none`} value={formData.gender} onChange={e => updateField('gender', e.target.value)}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Prefer not to say">Other</option></select></div>
                        </div>
                        <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">State</label><select required className={`${inputClass} appearance-none`} value={formData.state} onChange={e => updateField('state', e.target.value)}><option value="">Select State</option>{STATES_OF_NIGERIA.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                        <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Education</label><select required className={`${inputClass} appearance-none`} value={formData.education} onChange={e => updateField('education', e.target.value)}><option value="">Select Level</option><option value="Secondary">Secondary School</option><option value="Undergraduate">Undergraduate</option><option value="Postgraduate">Postgraduate</option><option value="Vocational">Vocational</option></select></div>
                        <div><label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-1.5 opacity-60">Employment</label><input required type="text" className={inputClass} value={formData.employment} onChange={e => updateField('employment', e.target.value)} placeholder="e.g. Student, Designer" /></div>
                      </>
                    )}
                  </div>
                )}
                {error && <p className="text-red-500 text-[11px] font-bold text-center">{error}</p>}
                <div className="flex gap-4 pt-4">
                  {step === 2 && <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-gray-100 text-gray-400 hover:border-unidata-blue hover:text-unidata-blue transition-all">Back</button>}
                  <button type="submit" disabled={loading} className="flex-grow bg-unidata-blue text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-unidata-darkBlue transition-all active:scale-95">
                    {loading ? 'Processing...' : step === 1 ? 'Next: Build Profile' : 'Create Account'}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 pt-2">Already have an account? <button type="button" onClick={() => { setMode('signin'); resetForm(); }} className="text-unidata-blue font-bold hover:underline">Sign In</button></p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;

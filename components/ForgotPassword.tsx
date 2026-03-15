import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required.'); return; }
    setLoading(true);
    setError('');
    const result = await resetPassword(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-xl p-8 md:p-12">
        {sent ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-unidata-lightGreen text-unidata-green rounded-[25px] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-unidata-blue uppercase tracking-tight mb-4">Check Your Email</h2>
            <p className="text-gray-500 mb-6">We've sent a password reset link to <strong>{email}</strong>.</p>
            <Link to="/auth" className="text-unidata-blue font-bold text-sm hover:underline">Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-black text-unidata-blue uppercase tracking-tight mb-2">Forgot Password</h2>
            <p className="text-gray-400 text-sm mb-8">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                />
              </div>
              {error && <p className="text-red-500 text-[11px] font-bold text-center">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-unidata-blue text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-unidata-darkBlue transition-all active:scale-95">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="text-center text-xs text-gray-400">
                <Link to="/auth" className="text-unidata-blue font-bold hover:underline">Back to Sign In</Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

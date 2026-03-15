import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-xl p-8 md:p-12">
        <h2 className="text-3xl font-black text-unidata-blue uppercase tracking-tight mb-2">Set New Password</h2>
        <p className="text-gray-400 text-sm mb-8">Choose a strong password for your account.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-unidata-blue uppercase tracking-widest mb-2 opacity-60">Confirm Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-5 py-4 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-unidata-blue outline-none transition-all text-sm font-medium"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="Re-enter password"
            />
          </div>
          {error && <p className="text-red-500 text-[11px] font-bold text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-unidata-blue text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-unidata-darkBlue transition-all active:scale-95">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

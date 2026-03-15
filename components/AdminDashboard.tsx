import React, { useEffect, useState } from 'react';
import { fetchAllProfiles } from '../apiService';
import { UserProfile } from '../types';
import { useAuth } from './AuthContext';

const escapeCSVValue = (value: unknown): string => {
  const str = String(value ?? '');
  if (str.match(/[,"\r\n]/) || str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@') || str.startsWith('\t')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'researcher' | 'respondent'>('all');

  useEffect(() => {
    const load = async () => {
      const data = await fetchAllProfiles();
      setProfiles(data);
      setLoading(false);
    };
    load();
  }, []);

  // Gate: only allow admin users
  if (!user || user.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-[200] bg-gray-900/95 backdrop-blur-xl flex items-center justify-center p-4 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-8">You do not have admin privileges to view this page.</p>
          <button onClick={onClose} className="bg-unidata-blue text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-unidata-darkBlue transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const filteredProfiles = profiles.filter(p => filter === 'all' || p.role === filter);

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900/95 backdrop-blur-xl flex flex-col p-4 md:p-10 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">Waitlist Command Center</h2>
            <p className="text-unidata-green font-bold text-sm tracking-widest uppercase mt-1">
              Total Signups: {profiles.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all group"
          >
            <svg className="w-8 h-8 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          {(['all', 'researcher', 'respondent'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${filter === f ? 'bg-unidata-blue text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              {f}s ({profiles.filter(p => f === 'all' || p.role === f).length})
            </button>
          ))}
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar rounded-3xl bg-white/5 border border-white/10">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-unidata-green"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-900 border-b border-white/10">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-50">User</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-50">Role</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-50">Institution / Loc</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-50">Context</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-lg">{p.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.role === 'researcher' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="p-6">
                      {p.role === 'researcher' ? (
                        <div>
                          <p className="text-sm font-bold">{p.university}</p>
                          <p className="text-[10px] text-gray-400">{p.course}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold">{p.state}, Nigeria</p>
                          <p className="text-[10px] text-gray-400">{p.gender}, {p.ageRange}</p>
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      <p className="text-xs text-gray-300">
                        {p.role === 'researcher' ? 'Academic Researcher' : `${p.employment} • ${p.education}`}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
          <p>Confidential Unidata Founder Access</p>
          <button
            onClick={() => {
              const headers = ['Name', 'Email', 'Role', 'University', 'Course', 'Age Range', 'Gender', 'State', 'Education', 'Employment'];
              const rows = profiles.map(p => [
                p.name, p.email, p.role, p.university, p.course, p.ageRange, p.gender, p.state, p.education, p.employment
              ].map(escapeCSVValue).join(','));
              const csv = [headers.join(','), ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.setAttribute('href', url);
              a.setAttribute('download', 'unidata_waitlist.csv');
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="text-unidata-green hover:underline"
          >
            Export to CSV (Excel)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

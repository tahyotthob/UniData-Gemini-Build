import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { fetchMyCampaigns, fetchMyCampaignQuestions, fetchResponses, setCampaignStatus } from '../apiService';
import { SurveyCampaign } from '../types';

export const surveyUrl = (slug: string) => `${window.location.origin}${window.location.pathname}#/s/${slug}`;

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const QrImage: React.FC<{ url: string }> = ({ url }) => {
  const [src, setSrc] = useState('');
  useEffect(() => { QRCode.toDataURL(url, { margin: 1, width: 192 }).then(setSrc).catch(() => setSrc('')); }, [url]);
  return src ? <img src={src} alt="QR code for survey link" className="w-24 h-24 rounded-lg bg-white p-1" /> : null;
};

/** Researcher's list of published surveys: share link, QR, response count, CSV export, open/close. */
const MyCampaigns: React.FC<{ refreshKey?: number }> = ({ refreshKey = 0 }) => {
  const [campaigns, setCampaigns] = useState<SurveyCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const load = async () => {
    try {
      setCampaigns(await fetchMyCampaigns());
      setError('');
    } catch (e: any) {
      setError(e.message || 'Could not load your surveys.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [refreshKey]);

  const copy = async (slug: string) => {
    try { await navigator.clipboard.writeText(surveyUrl(slug)); setCopied(slug); setTimeout(() => setCopied(''), 1500); } catch { /* ignore */ }
  };

  const toggle = async (c: SurveyCampaign) => {
    try { await setCampaignStatus(c.id, c.status === 'closed' ? 'open' : 'closed'); await load(); }
    catch (e: any) { setError(e.message); }
  };

  const exportCsv = async (c: SurveyCampaign) => {
    try {
      const full = await fetchMyCampaignQuestions(c.id);
      const rows = await fetchResponses(c.id);
      const header = ['Submitted at', ...full.map((q, i) => `Q${i + 1}: ${q}`)];
      const body = rows.map(r => [r.created_at, ...full.map((_, i) => r.answers[i] ?? '')]);
      const csv = [header, ...body].map(row => row.map(csvCell).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
      a.download = `${c.title.replace(/[^a-z0-9]+/gi, '_').slice(0, 40) || 'survey'}_responses.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) { setError(e.message || 'Export failed.'); }
  };

  if (loading) return null;
  if (campaigns.length === 0 && !error) return null;

  return (
    <div className="mt-10">
      <h4 className="text-lg font-black text-unidata-blue uppercase tracking-tight mb-4">My Surveys</h4>
      {error && <p className="text-red-500 text-xs font-bold mb-3">{error}</p>}
      <div className="space-y-4">
        {campaigns.map(c => (
          <div key={c.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-5 md:items-center">
            {c.share_slug && <QrImage url={surveyUrl(c.share_slug)} />}
            <div className="flex-grow min-w-0">
              <p className="font-black text-unidata-blue truncate">{c.title}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                {c.response_count ?? 0} responses · {c.status === 'closed' ? 'Closed' : 'Open'}
              </p>
              {c.share_slug && <p className="text-xs text-gray-500 mt-2 break-all">{surveyUrl(c.share_slug)}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {c.share_slug && <button onClick={() => copy(c.share_slug!)} className="px-4 py-2 rounded-xl bg-unidata-blue text-white text-[10px] font-black uppercase tracking-widest">{copied === c.share_slug ? 'Copied!' : 'Copy link'}</button>}
              <button onClick={() => exportCsv(c)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest">Export CSV</button>
              <button onClick={() => toggle(c)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest">{c.status === 'closed' ? 'Reopen' : 'Close'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCampaigns;

"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Loader2, Trophy, Upload, CheckCircle, XCircle, Clock,
  AlertCircle, FileImage, ChevronRight, Star
} from 'lucide-react';
import Link from 'next/link';

interface Winning {
  id: string;
  matchType: number;
  prizeAmount: number;
  status: string;
  proofUrl: string | null;
  draw: { month: string; winningNumbers: string };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; Icon: any }> = {
    pending:   { label: 'Pending Claim',    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',   Icon: Clock },
    submitted: { label: 'Under Review',     className: 'bg-blue-500/20  text-blue-400  border-blue-500/30',    Icon: AlertCircle },
    paid:      { label: 'Prize Paid ✓',     className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', Icon: CheckCircle },
    rejected:  { label: 'Rejected',         className: 'bg-red-500/20   text-red-400   border-red-500/30',     Icon: XCircle },
  };
  const cfg = map[status] ?? map.pending;
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.className}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function ClaimForm({ winning, onSuccess }: { winning: Winning; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select a file.'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('proof', file);
      await axios.post(`/api/user/winnings/${winning.id}/claim`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-slate-950/60 border border-slate-700 rounded-xl space-y-4">
      <p className="text-sm text-slate-300 font-medium">Upload Proof of Play</p>
      <p className="text-xs text-slate-500">
        Submit a screenshot or document proving you played the game on the dates listed. Max 5MB (JPG, PNG, WebP, PDF).
      </p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
      >
        <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain mb-2" />
        ) : (
          <FileImage size={32} className="mx-auto text-slate-600 group-hover:text-indigo-400 transition-colors mb-2" />
        )}
        <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
          {file ? file.name : 'Click to browse or drag & drop'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || uploading}
        className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
      >
        {uploading ? <Loader2 className="animate-spin" size={18} /> : <><Upload size={16} /> Submit Claim</>}
      </button>
    </div>
  );
}

export default function WinningsPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  const fetchWinnings = async () => {
    try {
      const { data } = await axios.get('/api/user/winnings');
      setWinnings(data.winnings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWinnings();
  }, [user]);

  const handleClaimSuccess = () => {
    setExpandedId(null);
    fetchWinnings();
  };

  if (isLoading || !user) return null;

  const totalWon = winnings.filter(w => w.status === 'paid').reduce((s, w) => s + w.prizeAmount, 0);
  const pendingCount = winnings.filter(w => w.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-12 px-4 relative overflow-hidden">
      {/* Gradients */}
      <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-yellow-500/6 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-600/8 blur-[140px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Trophy size={22} />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-400">
                My Winnings
              </span>
            </h1>
            <p className="text-slate-400 mt-2">Claim your prizes by uploading proof of play.</p>
          </div>
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
            &larr; Dashboard
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Winnings', value: winnings.length, icon: Star, color: 'yellow' },
            { label: 'Prizes Paid', value: `$${totalWon.toFixed(2)}`, icon: CheckCircle, color: 'emerald' },
            { label: 'Pending Claims', value: pendingCount, icon: Clock, color: 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 text-${color}-400 flex items-center justify-center mx-auto mb-2`}>
                <Icon size={16} />
              </div>
              <p className="text-xl font-extrabold text-white">{value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Winnings List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-yellow-500" size={36} /></div>
        ) : winnings.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl">
            <Trophy size={48} className="mx-auto text-slate-700 mb-4 opacity-40" />
            <h3 className="text-slate-400 font-semibold mb-2">No winnings yet</h3>
            <p className="text-slate-600 text-sm">Make sure you have 5 scores logged and an active subscription before the next draw.</p>
            <Link href="/scores" className="mt-4 inline-flex items-center gap-1 text-indigo-400 text-sm font-medium hover:text-indigo-300">
              Manage Scores <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {winnings.map(winning => {
              const isExpanded = expandedId === winning.id;
              const canClaim = winning.status === 'pending';

              return (
                <div
                  key={winning.id}
                  className={`rounded-2xl border transition-all ${isExpanded ? 'border-indigo-500/40 bg-slate-900' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                >
                  {/* Main Row */}
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold border ${
                        winning.matchType === 5 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                        winning.matchType === 4 ? 'bg-slate-300/10 border-slate-600 text-slate-300' :
                        'bg-orange-500/10 border-orange-500/30 text-orange-400'
                      }`}>
                        <span className="text-xl leading-none">{winning.matchType}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">Match</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{winning.draw.month} Draw</span>
                          <StatusBadge status={winning.status} />
                        </div>
                        <div className="flex gap-1.5">
                          {winning.draw.winningNumbers.split(',').map((n, i) => (
                            <span key={i} className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold flex items-center justify-center border border-rose-500/20">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-2xl font-extrabold text-emerald-400">${winning.prizeAmount.toFixed(2)}</span>
                      {canClaim && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : winning.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors flex items-center gap-1"
                        >
                          <Upload size={12} />
                          {isExpanded ? 'Cancel' : 'Claim Prize'}
                        </button>
                      )}
                      {winning.status === 'submitted' && winning.proofUrl && (
                        <a href={winning.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                          <FileImage size={11} /> View Proof
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Claim Form (expandable) */}
                  {isExpanded && canClaim && (
                    <div className="px-5 pb-5">
                      <ClaimForm winning={winning} onSuccess={handleClaimSuccess} />
                    </div>
                  )}

                  {/* Submitted state info */}
                  {winning.status === 'submitted' && (
                    <div className="px-5 pb-5">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs flex items-start gap-2">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                        Your proof has been submitted and is under admin review. You'll be notified once processed.
                      </div>
                    </div>
                  )}

                  {winning.status === 'rejected' && (
                    <div className="px-5 pb-5">
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs flex items-start gap-2">
                        <XCircle size={14} className="mt-0.5 flex-shrink-0" />
                        Your claim was rejected. Please contact support if you believe this is an error.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Loader2, Play, Trophy, Users, AlertTriangle,
  DollarSign, Heart, CheckCircle, XCircle, RefreshCw,
  Crown, LogOut, FileImage, Clock
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalDraws: number;
  totalWinners: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const { user, isLoading, setUser } = useAuthStore();
  const router = useRouter();

  const [draws, setDraws] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [allWinners, setAllWinners] = useState<any[]>([]);
  const [loadingDraws, setLoadingDraws] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingWinners, setLoadingWinners] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [seedMsg, setSeedMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'draws' | 'users' | 'verify'>('draws');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else if (user.role !== 'admin') router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const fetchDraws = async () => {
    try {
      const { data } = await axios.get('/api/admin/draw');
      setDraws(data.draws);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDraws(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/stats');
      setStats(data.stats);
      setRecentUsers(data.recentUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchWinners = async () => {
    try {
      const { data } = await axios.get('/api/admin/winners');
      setAllWinners(data.winners);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWinners(false);
    }
  };

  const handleVerify = async (winnerId: string, action: 'approve' | 'reject') => {
    setActionLoading(winnerId);
    try {
      await axios.patch('/api/admin/winners', { winnerId, action });
      await fetchWinners();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDraws();
      fetchStats();
      fetchWinners();
    }
  }, [user]);

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
    router.push('/login');
  };

  const handleRunDraw = async () => {
    if (!confirm('Run the monthly draw? This cannot be undone.')) return;
    setError('');
    setRunLoading(true);
    try {
      const { data } = await axios.post('/api/admin/draw');
      await Promise.all([fetchDraws(), fetchStats()]);
      alert(`✅ Draw executed! ${data.winnersCount} winner(s) found.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to run draw');
    } finally {
      setRunLoading(false);
    }
  };

  const handleSeedCharities = async () => {
    setSeedLoading(true);
    setSeedMsg('');
    try {
      const { data } = await axios.post('/api/admin/charities/seed');
      setSeedMsg(data.message);
    } catch {
      setSeedMsg('Failed to seed charities.');
    } finally {
      setSeedLoading(false);
    }
  };

  if (isLoading || !user || user.role !== 'admin') return null;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'blue', suffix: '' },
    { label: 'Active Subscribers', value: stats?.activeSubscriptions ?? '—', icon: Crown, color: 'purple', suffix: '' },
    { label: 'Monthly Revenue', value: stats ? `$${stats.monthlyRevenue.toFixed(0)}` : '—', icon: DollarSign, color: 'emerald', suffix: '' },
    { label: 'Total Winners', value: stats?.totalWinners ?? '—', icon: Trophy, color: 'yellow', suffix: '' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-rose-600/8 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full bg-orange-600/5 blur-[140px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <ShieldIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base text-white">Admin Center</span>
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 rounded border border-rose-500/30">RESTRICTED</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg font-medium transition-colors">
                User View
              </Link>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Control Center</h1>
          <p className="text-slate-400 mt-1">Manage draws, monitor users, and seed platform data.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`} />
              <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center text-${color}-400 mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-extrabold text-white">{loadingStats ? <Loader2 className="animate-spin" size={20} /> : value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Controls */}
          <div className="space-y-5">

            {/* Run Draw */}
            <div className="p-6 bg-slate-900 border border-rose-500/30 rounded-2xl">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-rose-400">
                <Play size={18} /> Execute Monthly Draw
              </h2>
              <p className="text-slate-400 text-sm mb-5">
                Generates 5 random winning numbers (1-45), evaluates all active subscribers, and distributes prizes.
              </p>
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
                  <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" /> {error}
                </div>
              )}
              <button
                onClick={handleRunDraw}
                disabled={runLoading}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
              >
                {runLoading ? <Loader2 className="animate-spin" size={18} /> : <><Trophy size={16} /> Run Draw</>}
              </button>
            </div>

            {/* Refresh */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-slate-300">
                <RefreshCw size={16} /> Refresh Stats
              </h2>
              <button
                onClick={() => { fetchStats(); fetchDraws(); fetchWinners(); }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Refresh Data
              </button>
            </div>

            {/* Seed Charities */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <h2 className="text-base font-bold mb-2 flex items-center gap-2 text-slate-300">
                <Heart size={16} className="text-pink-400" /> Seed Charities
              </h2>
              <p className="text-xs text-slate-500 mb-4">Populate the database with the default 5 charities.</p>
              {seedMsg && (
                <p className="text-xs text-emerald-400 mb-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">{seedMsg}</p>
              )}
              <button
                onClick={handleSeedCharities}
                disabled={seedLoading}
                className="w-full py-2.5 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                {seedLoading ? <Loader2 className="animate-spin" size={16} /> : <><Heart size={14} /> Seed Now</>}
              </button>
            </div>

          </div>

          {/* Right: Tabbed Content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                {[
                  { id: 'draws', label: `Draw History (${draws.length})` },
                  { id: 'verify', label: `Verify Claims (${allWinners.filter(w => w.status === 'submitted').length})` },
                  { id: 'users', label: `Users (${recentUsers.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === tab.id ? 'text-white border-b-2 border-rose-500 bg-rose-500/5' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Draw History Tab */}
                {activeTab === 'draws' && (
                  loadingDraws ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-rose-500" size={32} /></div>
                  ) : draws.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      No draws executed yet. Run your first draw!
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {draws.map(draw => (
                        <div key={draw.id} className="p-5 border border-slate-700 bg-slate-950/50 rounded-xl">
                          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Draw Period</span>
                              <h3 className="text-lg font-bold text-white">{draw.month}</h3>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">Winning Numbers</span>
                              <div className="flex gap-1.5">
                                {draw.winningNumbers.split(',').map((num: string, i: number) => (
                                  <span key={i} className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
                                    {num}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Prize Pools */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                              { label: '5-Match Pool', val: draw.pool5, color: 'yellow' },
                              { label: '4-Match Pool', val: draw.pool4, color: 'slate' },
                              { label: '3-Match Pool', val: draw.pool3, color: 'orange' },
                            ].map(({ label, val, color }) => (
                              <div key={label} className="bg-slate-900 rounded-lg p-3 text-center">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{label}</p>
                                <p className={`text-base font-bold text-${color}-400`}>${val.toFixed(0)}</p>
                              </div>
                            ))}
                          </div>

                          {/* Winners */}
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Users size={12} /> {draw.winners.length} Winner(s)
                          </h4>
                          {draw.winners.length === 0 ? (
                            <p className="text-sm text-slate-600 italic">No winners this draw.</p>
                          ) : (
                            <div className="space-y-2">
                              {draw.winners.map((w: any) => (
                                <div key={w.id} className="flex items-center justify-between text-sm p-3 bg-slate-900 rounded-lg">
                                  <div>
                                    <span className="font-semibold text-slate-200">{w.user.name}</span>
                                    <span className="text-slate-500 text-xs ml-2">{w.user.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-emerald-400">${w.prizeAmount.toFixed(2)}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.matchType === 5 ? 'bg-yellow-500/20 text-yellow-400' : w.matchType === 4 ? 'bg-slate-300/10 text-slate-300' : 'bg-orange-500/20 text-orange-400'}`}>
                                      {w.matchType}×
                                    </span>
                                    {w.status === 'paid'
                                      ? <CheckCircle size={14} className="text-green-400" />
                                      : <XCircle size={14} className="text-amber-400" />}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Verify Tab */}
                {activeTab === 'verify' && (
                  loadingWinners ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>
                  ) : allWinners.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      No winner records found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allWinners.map((w: any) => (
                        <div key={w.id} className={`p-4 rounded-xl border ${w.status === 'submitted' ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-700 bg-slate-950/50'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                w.matchType === 5 ? 'bg-yellow-500/20 text-yellow-400' :
                                w.matchType === 4 ? 'bg-slate-300/10 text-slate-300' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {w.matchType}×
                              </div>
                              <div>
                                <p className="font-semibold text-slate-200 text-sm">{w.user.name}</p>
                                <p className="text-xs text-slate-500">{w.user.email} &bull; {w.draw.month}</p>
                                <p className="text-emerald-400 font-bold text-sm mt-0.5">${w.prizeAmount.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                w.status === 'submitted' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                w.status === 'paid'      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                w.status === 'rejected'  ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}>
                                {w.status}
                              </span>
                              {w.proofUrl && (
                                <a href={w.proofUrl} target="_blank" rel="noreferrer"
                                  className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                                  <FileImage size={11} /> View Proof
                                </a>
                              )}
                              {w.status === 'submitted' && (
                                <div className="flex gap-2 mt-1">
                                  <button
                                    onClick={() => handleVerify(w.id, 'approve')}
                                    disabled={actionLoading === w.id}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center gap-1 disabled:opacity-50"
                                  >
                                    {actionLoading === w.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} Approve
                                  </button>
                                  <button
                                    onClick={() => handleVerify(w.id, 'reject')}
                                    disabled={actionLoading === w.id}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-all flex items-center gap-1 disabled:opacity-50"
                                  >
                                    {actionLoading === w.id ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />} Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {!w.proofUrl && w.status === 'pending' && (
                            <p className="mt-3 text-[11px] text-slate-600 flex items-center gap-1">
                              <Clock size={11} /> Winner has not submitted proof yet.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  loadingStats ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                  ) : recentUsers.length === 0 ? (
                    <p className="text-center text-slate-500 py-12">No users found.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentUsers.map((u: any) => {
                        const sub = u.subscriptions?.[0];
                        const isActive = sub?.status === 'active' && new Date(sub?.expiryDate) > new Date();
                        return (
                          <div key={u.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-slate-200 text-sm">{u.name}</p>
                                  {u.role === 'admin' && <span className="text-[9px] font-bold bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">ADMIN</span>}
                                </div>
                                <p className="text-xs text-slate-500">{u.email}</p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                {isActive ? `${sub.plan} active` : 'inactive'}
                              </span>
                              {u.charity && <span className="text-[10px] text-pink-400">❤ {u.charity.name}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ShieldIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

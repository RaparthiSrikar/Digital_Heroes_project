"use client";

import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import {
  LogOut, Crown, Target, Heart, Trophy, Zap, TrendingUp,
  Calendar, CheckCircle, Clock, Shield, ChevronRight, Star
} from 'lucide-react';
import Link from 'next/link';

interface Score { id: string; score: number; date: string; }
interface Winning { id: string; matchType: number; prizeAmount: number; status: string; draw: { month: string; winningNumbers: string }; }

function DashboardContent() {
  const { user, isLoading, setUser, refreshUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [scores, setScores] = useState<Score[]>([]);
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (searchParams.get('success') === 'true') {
      refreshUser();
      router.replace('/dashboard');
    }
  }, [user, isLoading, router, searchParams, refreshUser]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [scoresRes, winningsRes] = await Promise.all([
          axios.get('/api/scores'),
          axios.get('/api/user/winnings'),
        ]);
        setScores(scoresRes.data.scores);
        setWinnings(winningsRes.data.winnings);
      } catch (e) {
        console.error(e);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalWon = winnings.reduce((sum, w) => sum + w.prizeAmount, 0);
  const pendingWinnings = winnings.filter(w => w.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/8 blur-[140px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Crown size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Digital Heroes</span>
            </div>

            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Link href="/admin" className="px-3 py-1.5 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 transition-all flex items-center gap-1">
                  <Shield size={13} /> Admin Panel
                </Link>
              )}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-300 font-medium">{user.name}</span>
                {user.isSubscribed && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">PRO</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{user.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's your performance overview for this month.</p>
        </div>

        {/* Subscription Banner (if not subscribed) */}
        {!user.isSubscribed && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 mt-0.5">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-indigo-300">You're not subscribed yet</h3>
                <p className="text-sm text-slate-400 mt-0.5">Subscribe to enter the monthly prize draw and support a charity.</p>
              </div>
            </div>
            <Link href="/pricing" className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20">
              View Plans
            </Link>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Scores Logged', value: scores.length, max: '/5', icon: Target, color: 'indigo' },
            { label: 'Total Won', value: `$${totalWon.toFixed(2)}`, icon: Trophy, color: 'yellow' },
            { label: 'Pending Prizes', value: pendingWinnings.length, icon: Clock, color: 'amber' },
            { label: 'Charity Impact', value: user.charity ? `${Math.round((user.charityPercentage ?? 0.1) * 100)}%` : '—', icon: Heart, color: 'pink' },
          ].map(({ label, value, max, icon: Icon, color }) => (
            <div key={label} className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-${color}-500/30 transition-all`}>
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-${color}-500/5 blur-2xl group-hover:bg-${color}-500/15 transition-all`} />
              <div className={`w-9 h-9 rounded-xl bg-${color}-500/20 flex items-center justify-center text-${color}-400 mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-extrabold text-white">{value}<span className="text-sm font-normal text-slate-500">{max}</span></p>
              <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Scores Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><Target size={20} /></div>
                  <h2 className="font-bold text-lg">Your Latest Scores</h2>
                </div>
                <Link href="/scores" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                  Manage <ChevronRight size={14} />
                </Link>
              </div>

              {dataLoading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>
              ) : scores.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">
                  <Target size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-slate-500 text-sm">No scores logged yet.</p>
                  <Link href="/scores" className="mt-3 inline-flex items-center gap-1 text-indigo-400 text-sm font-medium hover:text-indigo-300">
                    Add your first score <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {scores.map((score, i) => (
                    <div key={score.id} className={`flex flex-col items-center p-3 rounded-xl border ${i === 0 ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-slate-950/50 border-slate-800'}`}>
                      <span className={`text-2xl font-extrabold ${i === 0 ? 'text-indigo-400' : 'text-slate-300'}`}>{score.score}</span>
                      <span className="text-[10px] text-slate-500 mt-1 text-center">{new Date(score.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      {i === 0 && <span className="mt-1 text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Latest</span>}
                    </div>
                  ))}
                  {Array.from({ length: 5 - scores.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex flex-col items-center p-3 rounded-xl border border-dashed border-slate-800 opacity-40">
                      <span className="text-2xl font-extrabold text-slate-700">—</span>
                      <span className="text-[10px] text-slate-600 mt-1">Empty</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Winnings Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-400"><Trophy size={20} /></div>
                  <h2 className="font-bold text-lg">Prize Winnings</h2>
                </div>
                <Link href="/winnings" className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors">
                  Claim Prizes <ChevronRight size={14} />
                </Link>
              </div>

              {dataLoading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" /></div>
              ) : winnings.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">
                  <Trophy size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-slate-500 text-sm">No winnings yet. Keep playing!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {winnings.map(w => (
                    <div key={w.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${w.matchType === 5 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : w.matchType === 4 ? 'bg-slate-300/10 text-slate-300 border border-slate-600' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                          {w.matchType}x
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{w.draw.month} Draw</p>
                          <p className="text-xs text-slate-500">{w.matchType} numbers matched</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400 text-lg">${w.prizeAmount.toFixed(2)}</p>
                        <span className={`text-xs font-bold uppercase ${w.status === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                          {w.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Subscription Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400"><Crown size={20} /></div>
                <h2 className="font-bold text-lg">Subscription</h2>
              </div>
              {user.isSubscribed ? (
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold text-emerald-400">Active</span>
                    <span className="text-sm text-slate-300 capitalize">{user.subscription?.plan} plan</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-5">
                    <Calendar size={11} className="inline mr-1" />
                    Expires {new Date(user.subscription?.expiryDate).toLocaleDateString()}
                  </p>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                    <CheckCircle size={18} className="mx-auto text-emerald-400 mb-1" />
                    <p className="text-xs font-medium text-emerald-300">Entered into next draw</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-5">Subscribe to join the monthly prize draw.</p>
                  <Link href="/pricing" className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-purple-500 hover:to-indigo-500 transition-all">
                    <Zap size={16} /> Subscribe Now
                  </Link>
                </>
              )}
            </div>

            {/* Charity Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="p-2 bg-pink-500/20 rounded-xl text-pink-400"><Heart size={20} /></div>
                <h2 className="font-bold text-lg">Charity Impact</h2>
              </div>
              {user.charity ? (
                <div className="relative">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Supporting</p>
                  <p className="text-base font-bold text-pink-400 mb-3">{user.charity.name}</p>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-slate-400">Your contribution</span>
                    <span className="font-bold text-white">{Math.round((user.charityPercentage ?? 0.1) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all" style={{ width: `${Math.round((user.charityPercentage ?? 0.1) * 100)}%` }} />
                  </div>
                  <Link href="/charities" className="text-xs font-semibold text-slate-400 hover:text-slate-300 flex items-center gap-1 transition-colors">
                    Update preferences <ChevronRight size={12} />
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-5">Choose a charity and make an impact with your subscription.</p>
                  <Link href="/charities" className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-pink-500 hover:to-rose-500 transition-all">
                    <Heart size={16} /> Choose Charity
                  </Link>
                </>
              )}
            </div>

            {/* How It Works */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400"><Star size={20} /></div>
                <h2 className="font-bold text-lg">How to Win</h2>
              </div>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Subscribe to a plan', done: !!user.isSubscribed },
                  { step: '2', text: 'Log exactly 5 scores (1–45)', done: scores.length === 5 },
                  { step: '3', text: 'Pick a charity', done: !!user.charity },
                  { step: '4', text: 'Wait for the monthly draw!', done: winnings.length > 0 },
                ].map(({ step, text, done }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {done ? <CheckCircle size={14} /> : step}
                    </div>
                    <span className={`text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-300'}`}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

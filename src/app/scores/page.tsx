"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, Calendar, Target, Plus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface Score {
  id: string;
  score: number;
  date: string;
}

export default function ScoresPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  
  const [scores, setScores] = useState<Score[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);
  
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchScores = async () => {
    try {
      const { data } = await axios.get('/api/scores');
      setScores(data.scores);
    } catch (err) {
      console.error('Failed to fetch scores', err);
    } finally {
      setLoadingScores(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchScores();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      await axios.post('/api/scores', { score: newScore, date: newDate });
      setNewScore('');
      setNewDate('');
      await fetchScores();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit score');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-12 px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-pink-600/10 blur-[120px]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Your Performance
            </h1>
            <p className="text-slate-400 mt-2">Manage your latest 5 scores for the monthly draw.</p>
          </div>
          <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>

        {!user.isSubscribed && (
          <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-4">
            <ShieldAlert className="text-orange-400 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-orange-400">Subscription Required for Draws</h3>
              <p className="text-sm text-slate-300 mt-1">You can log scores, but you must have an active subscription to be entered into the monthly prize draw. <Link href="/pricing" className="underline font-medium">Subscribe now.</Link></p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Score Form */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl backdrop-blur-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus size={20} className="text-indigo-400" /> Log Score
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Score (1-45)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Target size={18} />
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-950/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="e.g. 42"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Date Played
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-950/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg flex justify-center items-center disabled:opacity-50"
                >
                  {submitLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Score'}
                </button>
              </form>
            </div>
          </div>

          {/* Scores List */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl backdrop-blur-xl h-full">
              <h2 className="text-xl font-bold mb-6">Latest 5 Scores</h2>
              
              {loadingScores ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
              ) : scores.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                  <Target size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
                  <p className="text-slate-400">No scores logged yet.</p>
                  <p className="text-sm text-slate-500 mt-1">Add your first score to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scores.map((score, index) => (
                    <div 
                      key={score.id} 
                      className={`flex items-center justify-between p-4 rounded-2xl border ${index === 0 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-950/50 border-slate-800'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${index === 0 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-300'}`}>
                          {score.score}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">
                            {new Date(score.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          {index === 0 && <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Latest Entry</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {scores.length === 5 && (
                    <p className="text-center text-sm text-slate-500 mt-6 italic">
                      Maximum 5 scores reached. Adding a new score will replace the oldest one.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

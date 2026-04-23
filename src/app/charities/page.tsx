"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, Heart, CheckCircle2, Sliders } from 'lucide-react';
import Link from 'next/link';

interface Charity {
  id: string;
  name: string;
  description: string;
}

export default function CharitiesPage() {
  const { user, isLoading, refreshUser } = useAuthStore();
  const router = useRouter();

  const [charities, setCharities] = useState<Charity[]>([]);
  const [loadingCharities, setLoadingCharities] = useState(true);
  
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number>(10); // Default 10%
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      if (user.charityId) setSelectedCharityId(user.charityId);
      if (user.charityPercentage) setPercentage(Math.round(user.charityPercentage * 100));
    }
  }, [user, isLoading, router]);

  const fetchCharities = async () => {
    try {
      const { data } = await axios.get('/api/charities');
      setCharities(data.charities);
    } catch (err) {
      console.error('Failed to fetch charities', err);
    } finally {
      setLoadingCharities(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCharityId) {
      setError('Please select a charity first.');
      return;
    }

    setError('');
    setSuccess(false);
    setSubmitLoading(true);

    try {
      await axios.post('/api/user/charity', {
        charityId: selectedCharityId,
        charityPercentage: percentage / 100
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update charity preferences');
    } finally {
      setSubmitLoading(false);
    }
  };

  const estimatedMonthlyDonation = user?.subscription?.plan === 'monthly'
    ? 15 * (percentage / 100)
    : user?.subscription?.plan === 'yearly'
    ? 144 * (percentage / 100) / 12
    : 15 * (percentage / 100); // Default estimate based on monthly plan

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400 flex items-center gap-3">
              <Heart className="text-pink-500" /> Your Impact
            </h1>
            <p className="text-slate-400 mt-2">Choose where your subscription contribution goes.</p>
          </div>
          <Link href="/dashboard" className="text-sm text-pink-400 hover:text-pink-300 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charities List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">Select a Cause</h2>
            
            {loadingCharities ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-pink-500" size={32} /></div>
            ) : (
              <div className="space-y-4">
                {charities.map(charity => {
                  const isSelected = selectedCharityId === charity.id;
                  return (
                    <div 
                      key={charity.id}
                      onClick={() => setSelectedCharityId(charity.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-pink-500/10 border-pink-500/50 shadow-lg shadow-pink-500/10' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-bold text-lg ${isSelected ? 'text-pink-400' : 'text-slate-200'}`}>
                            {charity.name}
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">{charity.description}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="text-pink-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl backdrop-blur-xl sticky top-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sliders size={20} className="text-pink-400" /> Contribution
              </h2>
              
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400 font-medium">Percentage</span>
                  <span className="font-bold text-pink-400">{percentage}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="5"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Minimum: 10%</span>
                  <span>Max: 100%</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 mb-8 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Estimated Impact</p>
                <p className="text-3xl font-extrabold text-emerald-400">${estimatedMonthlyDonation.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">per month</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center font-medium">
                  Preferences updated successfully!
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitLoading || !selectedCharityId}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg flex justify-center items-center disabled:opacity-50"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Preferences'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

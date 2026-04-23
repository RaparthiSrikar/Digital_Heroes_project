"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Check, Shield, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function PricingPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoadingPlan(plan);
    try {
      // Simulate Stripe Checkout
      await axios.post('/api/subscriptions/checkout', { plan });
      router.push('/dashboard?success=true');
    } catch (error) {
      console.error('Subscription failed', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-20 px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
      
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
            Join the Draw, Change the World
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Choose a plan to enter your scores, participate in the monthly prize pool, and give back to the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 relative group flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-2xl font-bold mb-2">Monthly Entry</h3>
            <p className="text-slate-400 mb-6 flex-grow">Flexible monthly participation.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold">$15</span>
              <span className="text-slate-500">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 text-left text-slate-300">
              <li className="flex items-center gap-3"><Check size={18} className="text-indigo-400" /> Enter 5 scores monthly</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-indigo-400" /> Monthly prize pool entry</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-indigo-400" /> 10% to charity of choice</li>
            </ul>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loadingPlan === 'monthly'}
              className="w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700 flex justify-center items-center"
            >
              {loadingPlan === 'monthly' ? <Loader2 className="animate-spin" size={20} /> : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-purple-500/50 relative group flex flex-col transform md:-translate-y-4 shadow-2xl shadow-purple-900/20">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-t-3xl" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider">
              Most Popular
            </div>

            <h3 className="text-2xl font-bold mb-2 mt-4">Yearly Champion</h3>
            <p className="text-slate-400 mb-6 flex-grow">Save 20% and never miss a draw.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold">$144</span>
              <span className="text-slate-500">/yr</span>
            </div>
            
            <ul className="space-y-4 mb-8 text-left text-slate-300">
              <li className="flex items-center gap-3"><Check size={18} className="text-purple-400" /> Enter 5 scores monthly</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-purple-400" /> Monthly prize pool entry</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-purple-400" /> 10% to charity of choice</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-purple-400" /> Exclusive Champion Badge</li>
            </ul>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loadingPlan === 'yearly'}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-500/25 flex justify-center items-center"
            >
              {loadingPlan === 'yearly' ? <Loader2 className="animate-spin" size={20} /> : 'Subscribe Yearly'}
            </button>
          </div>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Shield size={16} /> Secure payments powered by Stripe (Mocked for Demo)
        </div>
      </div>
    </div>
  );
}

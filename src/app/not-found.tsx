"use client";

import Link from "next/link";
import { Crown, Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Glow bg */}
      <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Crown size={24} className="text-white" />
          </div>
        </div>

        <p className="text-8xl font-black gradient-text mb-4">404</p>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-10 max-w-sm mx-auto">
          Looks like this page went off the board. Let's get you back to the game.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={16} /> Back to Home
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold transition-all bg-slate-900/40 text-sm">
            Go to Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

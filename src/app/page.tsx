"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Crown, Target, Trophy, Heart, ArrowRight, Zap,
  Star, CheckCircle, ChevronRight, Play, Shield
} from "lucide-react";

/* ── Animated lottery number ── */
function LotteryBall({ number, delay = 0 }: { number: number; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`lottery-ball transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
    >
      {number}
    </div>
  );
}

/* ── Counter animation ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Feature card ── */
function FeatureCard({
  icon: Icon, title, description, gradient, delay
}: {
  icon: any; title: string; description: string; gradient: string; delay: number;
}) {
  return (
    <div
      className={`card-hover p-7 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden group opacity-0 animate-fade-in-up delay-${delay}`}
    >
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${gradient} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
      <div className={`w-14 h-14 rounded-2xl ${gradient} bg-opacity-20 flex items-center justify-center mb-5 border border-white/10`}>
        <Icon size={26} className="text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

/* ── Step card ── */
function HowStep({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex gap-5 items-start">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-lg flex-shrink-0 shadow-lg shadow-indigo-500/30">
        {step}
      </div>
      <div>
        <h4 className="font-bold text-white text-lg mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const winningNumbers = [7, 14, 23, 36, 42];

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-50 overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 shadow-xl shadow-black/20" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Crown size={18} className="text-white" />
              </div>
              <span className="font-black text-lg tracking-tight gradient-text">Digital Heroes</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {["Features", "How It Works", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm !py-2 !px-5">
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-dvh flex items-center justify-center px-4 pt-16 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[120px]" />
          <div className="absolute top-[40%] right-[20%] w-[250px] h-[250px] rounded-full bg-pink-600/10 blur-[100px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(rgba(99,102,241,0.08) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-8 animate-fade-in-up">
            <Zap size={14} className="text-indigo-400" />
            Next draw in <span className="text-white font-black">12 days</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-in-up delay-100">
            Play. Win.{" "}
            <span className="gradient-text">Change Lives.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            Log your 5 scores, enter the monthly prize draw, and direct a portion of your subscription 
            to causes you believe in. <span className="text-slate-300 font-medium">It's gaming with purpose.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
            <Link href="/register" className="btn-primary text-base w-full sm:w-auto">
              Start Winning Today <ArrowRight size={18} />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold px-6 py-3.5 rounded-2xl border border-slate-700 hover:border-slate-500 transition-all bg-slate-900/40 backdrop-blur w-full sm:w-auto justify-center"
            >
              <Play size={16} className="text-indigo-400" /> View Plans
            </Link>
          </div>

          {/* Live draw preview */}
          <div className="animate-fade-in-up delay-400">
            <p className="text-xs uppercase tracking-widest text-slate-600 font-bold mb-4">Last Month's Winning Numbers</p>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {winningNumbers.map((n, i) => (
                <LotteryBall key={n} number={n} delay={i * 120} />
              ))}
            </div>
          </div>
        </div>

        {/* Floating orbs */}
        <div className="absolute top-[25%] left-[8%] w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/20 blur-sm animate-float hidden lg:block" />
        <div className="absolute bottom-[30%] right-[8%] w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-500/20 blur-sm animate-float hidden lg:block" style={{ animationDelay: "2s" }} />
      </section>

      {/* ── STATS STRIP ── */}
      <section className="py-12 border-y border-slate-800/50 bg-slate-900/30 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Members",   value: 3240,  suffix: "+" },
              { label: "Total Paid Out",   value: 82000, suffix: "$" },
              { label: "Charities Backed", value: 5,     suffix: "" },
              { label: "Draws Completed",  value: 18,    suffix: "" },
            ].map(({ label, value, suffix }) => (
              <div key={label}>
                <p className="text-3xl font-black gradient-text">
                  {suffix === "$" && "$"}
                  <AnimatedCounter target={value} />
                  {suffix !== "$" && suffix}
                </p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-3">Why Digital Heroes</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Gaming meets <span className="gradient-text">giving back</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">A platform built at the intersection of excitement, community, and social impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target,  title: "Track 5 Scores",          gradient: "bg-indigo-500",  delay: 100, description: "Log your latest 5 scores between 1 and 45. The system enforces uniqueness and automatically rolls over your oldest entry." },
              { icon: Trophy,  title: "Monthly Prize Draws",      gradient: "bg-yellow-500",  delay: 200, description: "Five winning numbers are drawn each month. Match 3, 4, or 5 to win a share of the prize pool — up to 40% of total revenue." },
              { icon: Heart,   title: "Charity Contributions",    gradient: "bg-pink-500",    delay: 300, description: "Choose from curated charities and set your contribution percentage (10%–100%) of your monthly subscription." },
              { icon: Shield,  title: "Secure & Transparent",     gradient: "bg-emerald-500", delay: 400, description: "Fully verifiable prize draws with proof-of-play upload system. Every winner goes through admin verification before payout." },
              { icon: Crown,   title: "Flexible Subscriptions",   gradient: "bg-purple-500",  delay: 500, description: "Choose a monthly plan at $15/mo or save with a yearly plan at $144/yr. Cancel or pause anytime." },
              { icon: Zap,     title: "Real-time Dashboard",      gradient: "bg-cyan-500",    delay: 600, description: "A beautiful personal dashboard showing your scores, winnings history, charity impact, and subscription status at a glance." },
            ].map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-3">Simple Process</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-12">
                Four steps to <span className="gradient-text">your first win</span>
              </h2>
              <div className="space-y-8">
                <HowStep step="1" title="Create Your Account" description="Sign up in under 60 seconds. No credit card required to explore." />
                <HowStep step="2" title="Subscribe to a Plan" description="Choose monthly or yearly. Your subscription funds the prize pool and your chosen charity." />
                <HowStep step="3" title="Log Your 5 Scores" description="Enter your scores (1–45) with their dates. No duplicates allowed — keep it honest!" />
                <HowStep step="4" title="Win & Verify" description="If your numbers match the draw, upload proof of play and claim your prize. Admin verifies within 48 hours." />
              </div>
            </div>

            {/* Visual panel */}
            <div className="relative">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 glass relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-indigo-600/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-purple-600/10 blur-3xl" />

                {/* Mock score card */}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Your Scores This Month</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[42, 17, 36, 9, 28].map((s, i) => (
                      <div key={i} className={`rounded-xl p-3 text-center border ${i === 0 ? "bg-indigo-500/20 border-indigo-500/40" : "bg-slate-800/60 border-slate-700/50"}`}>
                        <p className={`text-xl font-black ${i === 0 ? "text-indigo-400" : "text-slate-300"}`}>{s}</p>
                        <p className="text-[9px] text-slate-600 mt-0.5">Apr {22 - i * 3}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-800 my-5" />

                {/* Mock draw result */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Draw Result</p>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">WINNER!</span>
                  </div>
                  <div className="flex gap-2 mb-5">
                    {[7, 17, 28, 36, 43].map((n) => (
                      <div key={n} className={`lottery-ball !w-10 !h-10 !text-sm ${[17, 28, 36].includes(n) ? "shadow-lg shadow-indigo-500/40" : "opacity-50"}`}>
                        {n}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">3 numbers matched</p>
                      <p className="font-black text-emerald-400 text-xl">$187.50</p>
                    </div>
                    <CheckCircle className="text-emerald-400" size={28} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section id="pricing" className="py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-3">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="text-slate-400 mb-14 max-w-lg mx-auto">100% of your subscription goes into the prize pool and charity fund. No hidden fees.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              { plan: "Monthly", price: "$15", period: "/month", features: ["Enter monthly draw", "5 score slots", "Charity contribution", "Winner dashboard"], popular: false },
              { plan: "Yearly",  price: "$144", period: "/year", badge: "Save 20%", features: ["Everything in Monthly", "Priority claim review", "Yearly prize bonus", "Dedicated support"], popular: true },
            ].map(({ plan, price, period, badge, features, popular }) => (
              <div key={plan} className={`p-8 rounded-3xl text-left relative overflow-hidden card-hover ${popular ? "gradient-border bg-slate-900" : "bg-slate-900 border border-slate-800"}`}>
                {popular && (
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black rounded-bl-2xl">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  {badge && <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-3 inline-block">{badge}</span>}
                  <p className="text-slate-400 font-medium mb-2">{plan}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-white">{price}</span>
                    <span className="text-slate-500 mb-1.5">{period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-slate-300 text-sm">
                      <CheckCircle size={16} className="text-indigo-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block text-center py-3.5 rounded-xl font-bold transition-all ${popular ? "btn-primary" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}>
                  Get Started <ArrowRight size={16} className="inline ml-1" />
                </Link>
              </div>
            ))}
          </div>

          <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold inline-flex items-center gap-1 transition-colors">
            See full pricing details <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/50 via-purple-950/50 to-indigo-950/50" />
          <div className="absolute top-0 left-[20%] w-[60%] h-full rounded-full bg-indigo-600/10 blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">
            Ready to become a<br /><span className="gradient-text">Digital Hero?</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10">Join thousands of players already winning prizes and funding the causes they love.</p>
          <Link href="/register" className="btn-primary text-lg !py-4 !px-8 inline-flex">
            Create Free Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800/60 bg-slate-900/30 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Crown size={16} className="text-white" />
                </div>
                <span className="font-black text-lg gradient-text">Digital Heroes</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs">The world's most exciting subscription-based prize draw platform with a heart.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8">
              {[
                { heading: "Platform", links: [{ label: "Features", href: "#features" }, { label: "How It Works", href: "#how-it-works" }, { label: "Pricing", href: "#pricing" }] },
                { heading: "Account", links: [{ label: "Sign In", href: "/login" }, { label: "Register", href: "/register" }, { label: "Dashboard", href: "/dashboard" }] },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">{heading}</p>
                  <ul className="space-y-2">
                    {links.map(({ label, href }) => (
                      <li key={label}><Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px bg-slate-800/50 my-8" />
          <p className="text-slate-600 text-xs text-center">
            © {new Date().getFullYear()} Digital Heroes. All rights reserved. Play responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}

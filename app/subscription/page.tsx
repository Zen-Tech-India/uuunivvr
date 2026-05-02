"use client";

import React, { useState } from "react";
import { 
  Check, Shield, Zap, CreditCard, MonitorPlay, 
  Film, Star, TrendingUp, Building2, Crown, Globe, AlertTriangle
} from "lucide-react";
import Swal from "sweetalert2";

export default function SubscriptionPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isYearly, setIsYearly] = useState(true); 

  // Fix: Explicitly type 'planName' as a string
  const handleSubscribe = async (planName: string) => {
    setIsProcessing(true);
    const billingCycle = isYearly ? "Yearly" : "Monthly";
    
    Swal.fire({
      title: `Initializing ${planName} Gateway...`,
      text: `Securing your ${billingCycle} allocation via Encrypted Gateway...`,
      background: '#0a0a0a',
      color: '#ffffff',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
    });

    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Gateway Locked',
        text: 'Redirecting to secure payment processing...',
        background: '#0a0a0a', color: '#ffffff',
        confirmButtonColor: '#dc2626'
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-4 md:p-10 relative overflow-hidden py-20 font-sans">
      
      {/* Premium Cinematic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-[500px] bg-red-600/10 blur-[150px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-900/10 blur-[180px] pointer-events-none rounded-full"></div>

      <div className="relative z-10 w-full max-w-[1500px] flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-4">
          <MonitorPlay className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" size={48} />
          <span className="text-4xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            UU<span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">UNIV</span>VR
          </span>
        </div>

        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-center mb-6 leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
          Choose Your Access Level
        </h1>
        <p className="text-zinc-400 text-center max-w-3xl mb-12 text-lg md:text-xl font-light">
          From casual viewing to global film distribution—select the gateway that powers your cinematic journey.
        </p>

        {/* Sleek Pricing Toggle */}
        <div className="flex items-center justify-center gap-6 mb-16 bg-[#111] p-2 rounded-full border border-white/5 backdrop-blur-md shadow-2xl">
          <span className={`text-sm font-bold uppercase tracking-widest transition-all ${!isYearly ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-zinc-600'}`}>
            Monthly
          </span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="w-20 h-10 bg-[#0a0a0a] rounded-full p-1.5 relative border border-white/10 focus:outline-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
          >
            <div className={`w-7 h-7 bg-gradient-to-br from-red-500 to-red-700 rounded-full absolute top-1.5 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.6)] ${isYearly ? 'left-[calc(100%-2.25rem)]' : 'left-1.5'}`}></div>
          </button>
          <span className={`text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${isYearly ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-zinc-600'}`}>
            Yearly <span className="bg-red-600/20 text-red-500 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-sm">SAVE 20%</span>
          </span>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          
          {/* 1. STANDARD VIEWER */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 hover:border-red-500/30 transition-all duration-500 p-8 rounded-3xl flex flex-col relative group">
            {!isYearly && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter whitespace-nowrap">Starts at ₹7 for 1st User</div>}
            
            <div className="mb-6 flex items-center gap-3">
              <Film className="text-zinc-500 group-hover:text-red-500 transition-colors" size={26} />
              <h2 className="text-2xl font-bold uppercase tracking-wide text-zinc-200">Viewer</h2>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black text-white">{isYearly ? '₹949' : '₹99'}</span>
              <span className="text-zinc-500 font-medium">{isYearly ? '/yr' : '/mo'}</span>
            </div>
            <div className="space-y-4 mb-10 flex-grow text-sm">
              {[
                "Stream all short and feature films.",
                "Ad-free cinematic experience.",
                "Write detailed reviews & ratings.",
                "Earn commissions on referrals.",
                "Seamless mobile, TV, and web sync.",
                "Early access to weekend premieres.",
                "Offline viewing for short-form gems.",
                "Participation in community polls."
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  <Check className="text-red-600 mt-0.5 shrink-0" size={16} /> <span>{text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => handleSubscribe('Viewer')} className="w-full bg-[#111] border border-white/10 hover:border-red-500/50 hover:bg-red-600/10 text-white font-bold py-4 rounded-xl transition-all uppercase text-xs tracking-widest">Start Watching</button>
            <button onClick={() => window.location.href='/rules'} className="mt-4 text-[10px] text-zinc-600 hover:text-zinc-400 text-center underline transition-colors">Terms & Services apply</button>
          </div>

          {/* 2. CREATOR PLAN */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 hover:border-red-500/30 transition-all duration-500 p-8 rounded-3xl flex flex-col relative group">
            <div className="mb-6 flex items-center gap-3">
              <Star className="text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" size={26} />
              <h2 className="text-2xl font-bold uppercase tracking-wide text-zinc-200">Creator</h2>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black text-white">{isYearly ? '₹2,870' : '₹299'}</span>
              <span className="text-zinc-500 font-medium">{isYearly ? '/yr' : '/mo'}</span>
            </div>
            <div className="space-y-4 mb-6 flex-grow text-sm">
              {[
                "Perfect for student filmmakers.",
                "Dedicated showcase portfolio.",
                "1080p Full HD video hosting.",
                "Advanced watch-time analytics.",
                "Direct fan tip monetization.",
                "Emerging Creator spotlight pool.",
                "Custom portfolio QR codes.",
                "Standard revenue split model."
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  <Check className="text-red-500 mt-0.5 shrink-0" size={16} /> <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Disclaimer Box */}
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 mb-6 flex gap-2 items-start">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] md:text-xs text-red-200/70 leading-relaxed">
                <span className="font-bold text-red-400">DISCLAIMER:</span> A valid Production House Partner is required to publish films. Please review the terms before purchasing.
              </p>
            </div>

            <button onClick={() => handleSubscribe('Creator')} className="w-full bg-zinc-900 border border-zinc-700 hover:bg-red-700 hover:border-red-600 text-white font-bold py-4 rounded-xl transition-all uppercase text-xs tracking-widest">Start Creating</button>
            <button onClick={() => window.location.href='/rules'} className="mt-4 text-[10px] text-zinc-600 hover:text-zinc-400 text-center underline transition-colors">Terms & Services apply</button>
          </div>

          {/* 3. PRO CREATOR (The Masterpiece Tier) */}
          <div className="bg-gradient-to-b from-[#2a0808]/90 to-[#0a0a0a]/90 backdrop-blur-2xl border border-red-500/50 p-8 rounded-3xl flex flex-col relative transform lg:-translate-y-6 shadow-[0_0_50px_-12px_rgba(220,38,38,0.4)] group z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-500 text-white text-[11px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.8)] whitespace-nowrap">
              Most Popular
            </div>
            
            <div className="mb-6 flex items-center gap-3 mt-2">
              <TrendingUp className="text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]" size={30} />
              <h2 className="text-2xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Pro Creator</h2>
            </div>
            
            <div className="mb-8">
              <span className="text-6xl font-black text-white">{isYearly ? '₹9,590' : '₹999'}</span>
              <span className="text-red-200/50 font-medium">{isYearly ? '/yr' : '/mo'}</span>
              <div className="text-red-400 text-[10px] font-black mt-2 bg-red-950/50 border border-red-900/50 w-fit px-3 py-1 rounded shadow-inner">PRO FEATURES UNLOCKED</div>
            </div>
            
            <div className="space-y-4 mb-6 flex-grow text-sm">
              {[
                "Unlimited 4K/8K HDR uploads.",
                "3 Multi-user Team Seats.",
                "Priority algorithmic boost.",
                "Advanced AI drop-off analytics.",
                "Enhanced 80/20 revenue split.",
                "Auto-gen vertical marketing teasers.",
                "Custom merch storefront links.",
                "Guaranteed curation pool entry.",
                "24/7 Priority chat support."
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 text-white font-medium drop-shadow-md">
                  <Check className="text-red-500 mt-0.5 shrink-0" size={16} /> <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Disclaimer Box */}
            <div className="bg-black/40 border border-red-500/30 rounded-lg p-3 mb-6 flex gap-2 items-start">
              <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] md:text-xs text-red-100/70 leading-relaxed">
                <span className="font-bold text-red-400">DISCLAIMER:</span> A valid Production House Partner is required to publish films. Please review the terms before purchasing.
              </p>
            </div>
            
            <button onClick={() => handleSubscribe('Pro Creator')} className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-black py-5 rounded-xl transition-all uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.7)] hover:-translate-y-1">
              Go Pro Now
            </button>
            <button onClick={() => window.location.href='/rules'} className="mt-4 text-[10px] text-red-200/40 hover:text-red-200/80 text-center underline transition-colors">Terms & Services apply</button>
          </div>

          {/* 4. PRODUCTION HOUSE / STUDIO */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 hover:border-zinc-700 transition-all duration-500 p-8 rounded-3xl flex flex-col relative group">
            <div className="mb-6 flex items-center gap-3">
              <Crown className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" size={26} />
              <h2 className="text-2xl font-bold uppercase tracking-wide text-zinc-200">Studio</h2>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black text-white">{isYearly ? '₹47,990' : '₹4,999'}</span>
              <span className="text-zinc-500 font-medium">{isYearly ? '/yr' : '/mo'}</span>
            </div>
            <div className="space-y-4 mb-10 flex-grow text-sm">
              {[
                "Full Studio Channel Branding.",
                "Advanced Metadata & Crew tagging.",
                "Institutional API & Dashboards.",
                "Advanced DRM Anti-Piracy Shield.",
                "24/7 technical/marketing team.",
                "Priority 4K HDR Encoding.",
                "Bulk content ingestion tools.",
                "Dedicated Account Manager.",
                "White-label corporate branding."
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  <Check className="text-red-600 mt-0.5 shrink-0" size={16} /> <span>{text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => handleSubscribe('Production House')} className="w-full bg-[#111] border border-white/10 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all uppercase text-xs tracking-widest">Launch Studio</button>
            <button onClick={() => window.location.href='/rules'} className="mt-4 text-[10px] text-zinc-600 hover:text-zinc-400 text-center underline transition-colors">Terms & Services apply</button>
          </div>
        </div>

        {/* Security Footer - Sleek and minimal */}
        <div className="mt-20 flex flex-col items-center gap-6 text-zinc-500 text-[12px] md:text-sm font-medium tracking-wide">
          <div className="flex flex-wrap justify-center items-center gap-10">
            <span className="flex items-center gap-2"><Shield size={18} className="text-zinc-600"/> AES-256 SECURE GATEWAY</span>
            <span className="flex items-center gap-2"><CreditCard size={18} className="text-zinc-600"/> AUTO-PAY ENABLED</span>
            <span className="flex items-center gap-2"><Globe size={18} className="text-zinc-600"/> GLOBAL DISTRIBUTION</span>
          </div>
        </div>
      </div>
    </main>
  );
}

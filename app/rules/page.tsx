"use client";

import React, { useEffect } from "react";
import { 
  ArrowLeft, Film, Music, ShieldAlert, Wallet, 
  CheckCircle2, XCircle, AlertOctagon, Users, Sparkles, LockKeyhole, Scale
} from "lucide-react";

export default function CompliancePage() {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-900 selection:text-white flex justify-center">
      
      {/* GRID CONTAINER */}
      <div className="w-full max-w-[1600px] grid grid-cols-1 md:grid-cols-12 relative">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="col-span-1 md:col-span-4 lg:col-span-3 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-white/5 md:sticky md:top-0 md:h-screen flex flex-col justify-between p-6 lg:p-8 z-20 overflow-y-auto overflow-x-hidden custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.8)]">
          
          <div>
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit mb-8 md:mb-12 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs uppercase tracking-widest font-bold">Back to Portal</span>
            </button>

            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6 break-words text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              Platform <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                Rules
              </span>
            </h1>
            
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-8 md:mb-12 pr-2 font-light">
              We keep things simple. No confusing legal jargon or hidden traps. Just the clear, straightforward rules you need to follow to create, publish, and earn on UUUNIVVR.
            </p>

            {/* Navigation Links */}
            <div className="hidden md:flex flex-col gap-5 text-xs lg:text-sm font-bold uppercase tracking-widest text-zinc-600">
              <a href="#publishing" className="hover:text-white transition-colors flex items-center gap-3"><span className="text-red-600">01.</span> Publishing Rule</a>
              <a href="#music" className="hover:text-white transition-colors flex items-center gap-3"><span className="text-red-600">02.</span> Music & Audio</a>
              <a href="#stealing" className="hover:text-white transition-colors flex items-center gap-3"><span className="text-red-600">03.</span> No Stealing</a>
              <a href="#money" className="hover:text-white transition-colors flex items-center gap-3"><span className="text-red-600">04.</span> Earnings & Payouts</a>
              <a href="#community" className="hover:text-white transition-colors flex items-center gap-3"><span className="text-red-600">05.</span> Community Respect</a>
              <a href="#quality" className="hover:text-white transition-colors flex items-center gap-3"><span className="text-red-600">06.</span> Quality Standards</a>
              <a href="#legal" className="hover:text-white transition-colors flex items-center gap-3"><span className="text-red-600">07.</span> Simple Legal Terms</a>
            </div>
          </div>

          <div className="mt-12 text-[10px] md:text-xs text-zinc-600 uppercase tracking-widest border-t border-white/5 pt-6 font-medium">
            Effective Date: May 2026<br/>
            Legally Binding Agreement
          </div>
        </aside>

        {/* ================= RIGHT MAIN CONTENT ================= */}
        <main className="col-span-1 md:col-span-8 lg:col-span-9 bg-[#050505] p-6 md:p-10 lg:p-16 xl:p-24 relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

          <div className="max-w-4xl mx-auto space-y-16 lg:space-y-24 relative z-10">

            {/* SECTION 1: PUBLISHING (THE MOST IMPORTANT RULE) */}
            <section id="publishing" className="scroll-mt-24 pt-4 md:pt-0">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="p-3 md:p-4 bg-gradient-to-br from-red-600 to-red-900 rounded-full text-white shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                  <Film className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">The Publishing Rule</h2>
              </div>
              
              <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-red-500/30 p-6 md:p-8 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.05)]">
                <p className="text-base md:text-lg text-white mb-6 leading-relaxed font-medium">
                  To maintain the premium quality of UUUNIVVR, independent creators <span className="text-red-500 font-bold underline">cannot</span> upload films directly without an official studio partner. 
                </p>
                
                <div className="bg-red-950/30 border border-red-900/50 p-5 rounded-xl mb-6">
                  <h3 className="text-red-500 font-black uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                    <ShieldAlert size={16} /> Strict Ecosystem Policy
                  </h3>
                  <p className="text-sm md:text-base text-red-200/80 leading-relaxed">
                    You MUST partner with a Production House that is <strong>already active and registered inside the UUUNIVVR ecosystem</strong>. External studios, outside collaborations, or production houses that do not have an active UUUNIVVR Studio account are strictly prohibited. 
                  </p>
                </div>

                <ul className="space-y-4 md:space-y-6">
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-1 w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-sm md:text-base lg:text-lg text-zinc-300"><strong>Find an Internal Partner:</strong> Connect with an existing UUUNIVVR Studio to sponsor and publish your film.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <XCircle className="text-red-500 shrink-0 mt-1 w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-sm md:text-base lg:text-lg text-zinc-300"><strong>No Outside Studios:</strong> If your studio partner is not on our platform, they cannot publish your film here. No exceptions.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-1 w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-sm md:text-base lg:text-lg text-zinc-300"><strong>Use Our In-House Team:</strong> Don't have a partner? You can submit your film directly to our official in-house team at <strong>Zenteku Film Production</strong>. If approved, they will publish it for you.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* SECTION 2: MUSIC */}
            <section id="music" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="p-3 md:p-4 bg-[#111] rounded-full text-white shrink-0 border border-white/10">
                  <Music className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">Music & Audio</h2>
              </div>

              <div className="bg-[#0a0a0a]/60 border border-white/5 p-6 md:p-8 rounded-2xl">
                <p className="text-base md:text-lg text-zinc-300 mb-6 leading-relaxed">
                  Our system automatically scans every second of your audio. You are completely responsible for the sounds, sound effects, and background tracks in your film.
                </p>
                <ul className="space-y-4 md:space-y-6 mb-8">
                  <li className="flex items-start gap-4">
                    <XCircle className="text-red-500 shrink-0 mt-1 w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-sm md:text-base lg:text-lg text-zinc-300">If you do not own the song, or did not buy a license for it, <strong>do not use it.</strong> Giving "credit to the artist" in the description does not protect you from a ban.</span>
                  </li>
                </ul>

                <div className="bg-gradient-to-r from-zinc-900 to-black border border-white/10 p-5 md:p-6 rounded-xl flex flex-col sm:flex-row gap-4 md:gap-6 items-start sm:items-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                    <Music className="text-zinc-400 w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg md:text-xl mb-2">Need Safe Music? Use Taalkosha Studio</h3>
                    <p className="text-sm md:text-base text-zinc-400">
                      To avoid copyright strikes entirely, work with our official partner, <strong>Taalkosha Music Studio</strong>. They create original, 100% platform-safe music for your films (standard studio charges apply).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: STEALING POLICY */}
            <section id="stealing" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="p-3 md:p-4 bg-red-950/50 rounded-full text-red-500 shrink-0 border border-red-900">
                  <AlertOctagon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">The "No Stealing" Rule</h2>
              </div>

              <div className="bg-red-950/10 border border-red-900/40 p-6 md:p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
                
                <p className="text-lg md:text-xl text-red-200 font-medium mb-6 leading-relaxed">
                  Everything you upload must be 100% made by you. We have a strict zero-tolerance policy for copying, pirating, or stealing other people's hard work.
                </p>
                
                <p className="text-base md:text-lg text-zinc-300 mb-6">If we catch you uploading a movie, short film, or using a script/song that belongs to someone else without explicit written permission:</p>
                
                <ul className="space-y-4 md:space-y-6">
                  <li className="flex items-start gap-4">
                    <ShieldAlert className="text-red-500 shrink-0 mt-1 w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-sm md:text-base lg:text-lg text-zinc-200"><strong>Instant Ban:</strong> Your account and your Studio Partner's account will be investigated and locked immediately.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <ShieldAlert className="text-red-500 shrink-0 mt-1 w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-sm md:text-base lg:text-lg text-zinc-200"><strong>No Excuses:</strong> We will not accept apologies or claims that it was "an accident." The decision is final.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <ShieldAlert className="text-red-500 shrink-0 mt-1 w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-sm md:text-base lg:text-lg text-zinc-200"><strong>Permanent Block:</strong> You will never be allowed to create an account with UUUNIVVR again.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* SECTION 4: MONEY */}
            <section id="money" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="p-3 md:p-4 bg-[#111] rounded-full text-green-500 shrink-0 border border-green-500/20">
                  <Wallet className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">Earnings & Payouts</h2>
              </div>

              <div className="bg-[#0a0a0a]/60 border border-white/5 p-6 md:p-8 rounded-2xl">
                <p className="text-base md:text-lg text-zinc-300 mb-6 leading-relaxed">
                  We want you to get rich making movies. You can earn money through fan tips, commissions, and ad-revenue splits. However, your money is directly tied to your good behavior.
                </p>
                
                <ul className="space-y-4 md:space-y-6 mb-8">
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-1 w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-sm md:text-base lg:text-lg text-zinc-300">Payouts happen on the 1st of every month, provided you meet the minimum withdrawal limit.</span>
                  </li>
                </ul>

                <div className="bg-black border border-red-900/30 p-5 md:p-6 rounded-xl mt-6 shadow-inner">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <AlertOctagon className="text-red-500 w-5 h-5 md:w-6 md:h-6" />
                    The Earnings Freeze
                  </h3>
                  <p className="text-sm md:text-base lg:text-lg text-zinc-400 leading-relaxed">
                    If your account is banned for stealing content, spamming, or breaking the rules, <strong>you lose all the money in your account.</strong> 
                    <br/><br/>
                    We will permanently freeze your digital wallet. You cannot withdraw those funds. We will use that money to compensate the real owners of the stolen content or absorb it as a platform penalty. By using UUUNIVVR, you agree that you cannot sue us to get this money back.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 5: COMMUNITY & QUALITY (Combined for flow) */}
            <section id="community" className="scroll-mt-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Community Respect */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-[#111] rounded-full text-white shrink-0 border border-white/5">
                      <Users className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Community</h2>
                  </div>
                  <div className="bg-[#0a0a0a]/60 border border-white/5 p-6 rounded-2xl h-full">
                    <p className="text-sm md:text-base text-zinc-400 mb-6">
                      UUUNIVVR is a professional space. We do not tolerate toxic behavior.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <XCircle className="text-red-500 shrink-0 mt-0.5 w-4 h-4" />
                        <span className="text-sm text-zinc-300"><strong>No Hate Speech:</strong> Racism, sexism, or slurs equal an instant ban.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="text-red-500 shrink-0 mt-0.5 w-4 h-4" />
                        <span className="text-sm text-zinc-300"><strong>No Fake Engagement:</strong> Buying fake views, bot comments, or fake ratings will get your channel deleted.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Quality Standards */}
                <div id="quality" className="scroll-mt-24">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-[#111] rounded-full text-white shrink-0 border border-white/5">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Quality</h2>
                  </div>
                  <div className="bg-[#0a0a0a]/60 border border-white/5 p-6 rounded-2xl h-full">
                    <p className="text-sm md:text-base text-zinc-400 mb-6">
                      We are a cinema platform, not a social media dump.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <XCircle className="text-red-500 shrink-0 mt-0.5 w-4 h-4" />
                        <span className="text-sm text-zinc-300"><strong>No Spam Uploads:</strong> Do not upload the same video multiple times to trick the algorithm.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="text-red-500 shrink-0 mt-0.5 w-4 h-4" />
                        <span className="text-sm text-zinc-300"><strong>No Clickbait:</strong> Your title and poster must accurately match the film.</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </section>

            {/* SECTION 6: SIMPLE LEGAL TERMS */}
            <section id="legal" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="p-3 md:p-4 bg-zinc-900 rounded-full text-white shrink-0">
                  <Scale className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight">Plain English Legal Terms</h2>
              </div>

              <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl">
                <p className="text-base md:text-lg text-zinc-300 mb-8 leading-relaxed">
                  When you use UUUNIVVR, you are agreeing to a contract. Here is what that contract means in simple English:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm">1. You Own Your Film</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">We do not steal your ownership. By uploading, you are simply giving us the permission (a license) to show your movie to the world, run ads on it, and promote it on our platform.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm">2. We Can Remove Things</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">If we believe a video is harmful, illegal, or breaks these rules, we have the right to take it down immediately without asking you first.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm">3. Platform Changes</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">We might update the website, change how the algorithm works, or alter the payout structures. We will try to warn you, but we are allowed to make these changes to keep the business running.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm">4. No Guarantees</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">If the website goes down for maintenance, or if an error causes your video to lose views, we do not owe you money for "lost potential earnings." The platform is provided as-is.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* BOTTOM ACKNOWLEDGEMENT */}
            <div className="pt-12 md:pt-16 pb-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <p className="text-xs md:text-sm text-zinc-400 max-w-xl text-center md:text-left leading-relaxed">
                By purchasing a subscription, creating an account, or uploading any film, you legally agree that you have read these rules, understand them in plain English, and promise to follow them.
              </p>
              <button 
                onClick={() => window.history.back()}
                className="w-full md:w-auto bg-white text-black hover:bg-zinc-200 font-black py-4 px-8 md:px-12 rounded-xl transition-all uppercase tracking-widest text-xs md:text-sm whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              >
                I Understand & Agree
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
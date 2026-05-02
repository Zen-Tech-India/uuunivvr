"use client";

import React, { useState } from "react";
import { Mail, Lock, LogIn, MonitorPlay, Clapperboard } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import Swal from "sweetalert2";

export default function Login() {
  const supabase = createClient();
  
  // State for manual login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // --- MANUAL EMAIL/PASSWORD LOGIN ---
  // Fix: Explicitly type 'e' as 'any'
  const handleManualLogin = async (e: any) => {
    e.preventDefault();
    
    if (!email || !password) {
      return Swal.fire({
        icon: 'error',
        title: 'Missing Credentials',
        text: 'Please enter both your team email and passcode.',
        background: '#0a0a0a', color: '#ffffff', confirmButtonColor: '#dc2626'
      });
    }

    setIsProcessing(true);
    Swal.fire({
      title: 'Authenticating...',
      text: 'Verifying credentials with secure mainframe...',
      background: '#0a0a0a', color: '#ffffff',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
    });

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setIsProcessing(false);
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: error.message, // Usually says "Invalid login credentials"
        background: '#0a0a0a', color: '#ffffff', confirmButtonColor: '#dc2626'
      });
    } else {
      // Success! The auth state change listener in the Dashboard will pick this up
      Swal.fire({
        icon: 'success',
        title: 'Access Granted',
        text: 'Redirecting to Dashboard...',
        background: '#0a0a0a', color: '#ffffff',
        showConfirmButton: false, timer: 1500
      }).then(() => {
        window.location.href = '/dashboard';
      });
    }
  };

  // --- GOOGLE OAUTH LOGIN ---
  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/dashboard` 
      }
    });

    if (error) {
      setIsProcessing(false);
      Swal.fire({
        icon: 'error',
        title: 'OAuth Error',
        text: error.message,
        background: '#0a0a0a', color: '#ffffff', confirmButtonColor: '#dc2626'
      });
    }
  };

  // Fix: Explicitly type arrays to prevent any strict mode inference issues
  const posters: string[] = [
    "https://image2url.com/images/1762967507553-b462ecc0-4322-4dde-b962-60d613562a90.jpeg",
    "https://image2url.com/images/1762966618615-b0343b69-12e5-4a49-a806-53adaf806e91.jpeg",
    "https://zenteku.vercel.app/assets/error-404-banner.png",
    "https://image2url.com/images/1762966869721-75b80871-0e1d-4eab-b83f-3d95b0694bab.jpeg",
    "https://image2url.com/images/1762967030449-00bb03f3-25af-4171-a8fc-f11b0b8ab9b4.jpeg",
    "https://image2url.com/images/1762967097834-956de445-a729-448e-84db-5e0cbd2683b4.jpeg",
  ];

  const scrollList: string[] = [...posters, ...posters, ...posters];

  return (
    <main suppressHydrationWarning className="h-[100dvh] w-screen flex overflow-hidden bg-[#050505] font-sans relative">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes scrollDown { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
        .animate-scroll-up { animation: scrollUp 40s linear infinite; }
        .animate-scroll-down { animation: scrollDown 40s linear infinite; }
      `}} />

      {/* LEFT SIDE: POSTER SCROLL (Desktop Only) */}
      <div className="hidden lg:flex w-[70%] h-full relative overflow-hidden bg-[#0a0a0a] p-4 gap-4">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none"></div>

        <div className="w-full h-full flex gap-4 overflow-hidden z-0">
          <div className="flex-1 relative h-[200%]"><div className="flex flex-col gap-4 animate-scroll-down w-full absolute top-0">{scrollList.map((src: string, i: number) => (<div key={`c1-${i}`} className="w-full aspect-[2/3] rounded-md overflow-hidden relative border border-white/5"><img src={src} alt="Poster" className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity duration-500" /></div>))}</div></div>
          <div className="flex-1 relative h-[200%]"><div className="flex flex-col gap-4 animate-scroll-up w-full absolute top-0">{[...scrollList].reverse().map((src: string, i: number) => (<div key={`c2-${i}`} className="w-full aspect-[2/3] rounded-md overflow-hidden relative border border-white/5"><img src={src} alt="Poster" className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity duration-500" /></div>))}</div></div>
          <div className="flex-1 relative h-[200%]"><div className="flex flex-col gap-4 animate-scroll-down w-full absolute top-0">{scrollList.map((src: string, i: number) => (<div key={`c3-${i}`} className="w-full aspect-[2/3] rounded-md overflow-hidden relative border border-white/5"><img src={src} alt="Poster" className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity duration-500" /></div>))}</div></div>
          <div className="flex-1 relative h-[200%]"><div className="flex flex-col gap-4 animate-scroll-up w-full absolute top-0">{[...scrollList].reverse().map((src: string, i: number) => (<div key={`c4-${i}`} className="w-full aspect-[2/3] rounded-md overflow-hidden relative border border-white/5"><img src={src} alt="Poster" className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity duration-500" /></div>))}</div></div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent z-10 pointer-events-none flex items-end p-10">
           <p className="text-white/80 text-xs font-bold tracking-[0.4em] uppercase flex items-center gap-3 drop-shadow-[0_0_10px_rgba(0,0,0,1)]">
              <MonitorPlay className="text-red-600" size={18} />
              UUUNIVVR is a streaming platform under Zen-Tech
           </p>
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN PANEL */}
      <div className="w-full lg:w-[30%] h-full bg-[#050505] border-l border-white/5 flex flex-col justify-center px-8 relative z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-[340px] mx-auto flex flex-col relative z-10">
          <div className="mb-8 text-left">
            <p className="text-red-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-3 flex items-center gap-2">
              <Clapperboard size={14} /> ZEN-TECH CREATIVE
            </p>
            <h1 className="text-5xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              UU<span className="text-red-600">UNIV</span>VR
            </h1>
            <p className="text-zinc-500 text-xs mt-3 font-medium leading-relaxed">
              Director's Cut. Internal Use Only.<br /> Authentication Required.
            </p>
          </div>

          <form onSubmit={handleManualLogin} className="w-full flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Team Credential</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="credential@tservice.in" 
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded py-3 pl-11 pr-4 text-white text-sm outline-none focus:border-red-600 focus:bg-black transition-all placeholder:text-zinc-700 shadow-inner" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Passcode</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={16} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded py-3 pl-11 pr-4 text-white text-sm outline-none focus:border-red-600 focus:bg-black transition-all placeholder:text-zinc-700 shadow-inner" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="mt-2 w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 border border-red-500/50 text-white rounded py-3.5 font-bold tracking-widest transition-all flex items-center justify-center gap-3 uppercase text-xs shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] disabled:opacity-50"
            >
              <LogIn size={16} /> Enter Theater
            </button>

            <div className="flex items-center gap-3 my-1 opacity-60">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">Or</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              type="button" 
              disabled={isProcessing}
              className="w-full bg-zinc-100 text-black hover:bg-white rounded py-3.5 font-bold tracking-widest transition-all flex items-center justify-center gap-3 uppercase text-xs shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
              </svg>
              Sign in with Google
            </button>
            
            <a href="#" className="text-center text-[10px] text-zinc-600 hover:text-red-500 font-medium transition-colors mt-1">
              Lost Access / Trouble Logging In?
            </a>
          </form>
        </div>
        
        <div className="absolute bottom-6 left-0 w-full text-center">
           <p className="text-[10px] text-zinc-700 font-bold tracking-widest uppercase">
              © 2026 T-Service Group
           </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  Play, Plus, Star, ChevronLeft, VolumeX, Volume2, 
  Download, ListVideo, Pause, RotateCcw, RotateCw, 
  Maximize, Minimize, Settings, X, Check
} from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import Hls from "hls.js";

export default function FilmDetails({ params }) {
  const supabase = createClient();
  const [slug, setSlug] = useState("");
  const [film, setFilm] = useState(null);
  const [similarFilms, setSimilarFilms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Background Trailer State
  const [isBgMuted, setIsBgMuted] = useState(true);
  const bgVideoRef = useRef(null);

  // Fullscreen Feature Player State
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Controls & UI State
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // HLS Quality State
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 is Auto

  // Refs
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // 1. Unwrap URL Params safely
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    resolveParams();
  }, [params]);

  // 2. Fetch Film Data
  useEffect(() => {
    if (!slug) return;

    const fetchFilm = async () => {
      setIsLoading(true);
      const { data } = await supabase.from("uuunivvr_films").select("*").eq("slug", slug).single();
      
      if (data) {
        setFilm(data);
        const { data: similars } = await supabase.from("uuunivvr_films").select("*").neq("id", data.id).limit(8);
        setSimilarFilms(similars || []);
      }
      setIsLoading(false);
    };
    fetchFilm();
  }, [slug]);

  // 3. Attach HLS to Background Trailer
  useEffect(() => {
    if (film?.trailer_url && bgVideoRef.current && !showPlayer) {
      if (Hls.isSupported() && film.trailer_url.includes('.m3u8')) {
        const hls = new Hls();
        hls.loadSource(film.trailer_url);
        hls.attachMedia(bgVideoRef.current);
        return () => hls.destroy();
      } else {
        bgVideoRef.current.src = film.trailer_url;
      }
    }
  }, [film, showPlayer]);

  // 4. Attach HLS to Full Screen Player & Extract Qualities
  useEffect(() => {
    if (showPlayer && film?.movie_url && videoRef.current) {
      if (Hls.isSupported() && film.movie_url.includes('.m3u8')) {
        const hls = new Hls();
        hlsRef.current = hls; // Save to ref for quality switching
        
        hls.loadSource(film.movie_url);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          // Extract available quality levels (e.g., 1080p, 720p)
          setQualities(data.levels);
          videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
          setIsPlaying(true);
        });

        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else {
        videoRef.current.src = film.movie_url;
        videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
        setIsPlaying(true);
      }
    }
  }, [showPlayer, film]);


  // --- FULLSCREEN & UI LOGIC ---
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Listen for escape key or native exit of fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Hide controls when mouse stops moving (No Interruptions)
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false); // Close settings if left open
      }
    }, 3500); // Hide after 3.5 seconds of inactivity
  };


  // --- VIDEO CONTROLS LOGIC ---
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const skipTime = (amount) => {
    if (videoRef.current) videoRef.current.currentTime += amount;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const changeQuality = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowSettings(false);
    }
  };

  const launchFeatureFilm = () => {
    setShowPlayer(true);
  };

  const closeFeatureFilm = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    if (videoRef.current) videoRef.current.pause();
    setShowPlayer(false);
    setIsPlaying(false);
  };

  // --- RENDERS ---

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-600 animate-pulse font-black tracking-widest uppercase">Loading Film Data...</div>;
  if (!film) return <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center"><h1 className="text-4xl font-black mb-4 text-neutral-600">404 - FILM NOT FOUND</h1></div>;

  // --- RENDER: FULL SCREEN CINEMATIC PLAYER ---
  if (showPlayer) {
    return (
      <div 
        ref={playerContainerRef}
        onMouseMove={handleMouseMove}
        onClick={() => { if (!showControls) handleMouseMove(); }}
        className={`fixed inset-0 z-[500] bg-black flex items-center justify-center transition-all ${showControls ? 'cursor-default' : 'cursor-none'}`}
      >
        <video 
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
        
        {/* Cinematic Controls Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 transition-opacity duration-500 flex flex-col justify-between ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          
          {/* Top Bar */}
          <div className="p-6 md:p-10 flex items-center justify-between">
            <button onClick={closeFeatureFilm} className="text-white hover:text-red-500 transition-colors flex items-center gap-2 font-bold tracking-widest uppercase text-sm drop-shadow-md">
              <ChevronLeft size={24} /> Back
            </button>
            <h2 className="text-white font-black tracking-widest uppercase text-lg md:text-xl drop-shadow-md">{film.title}</h2>
            <div className="w-24"></div>
          </div>

          {/* Bottom Bar */}
          <div className="p-6 md:p-10 w-full mx-auto flex flex-col gap-6">
            
            {/* Timeline Scrub */}
            <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative hover:h-2 transition-all group" onClick={handleSeek}>
              <div className="h-full bg-red-600 rounded-full relative transition-all" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(220,38,38,1)] scale-0 group-hover:scale-100 transition-transform"></div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              
              {/* Left Controls */}
              <div className="flex items-center gap-6">
                <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
                  {isPlaying ? <Pause fill="currentColor" size={36} /> : <Play fill="currentColor" size={36} />}
                </button>
                <button onClick={() => skipTime(-10)} className="text-white hover:text-red-500 transition-colors"><RotateCcw size={26} /></button>
                <button onClick={() => skipTime(10)} className="text-white hover:text-red-500 transition-colors"><RotateCw size={26} /></button>
                <div className="hidden md:flex items-center gap-3 ml-4 group">
                  <Volume2 size={24} className="text-white group-hover:text-red-500 transition-colors" />
                  <div className="w-24 h-1.5 bg-white/20 rounded-full cursor-pointer"><div className="w-3/4 h-full bg-white group-hover:bg-red-500 rounded-full transition-colors"></div></div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-6 relative">
                
                {/* SETTINGS MENU */}
                <div className="relative">
                  <button onClick={() => setShowSettings(!showSettings)} className={`text-white hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${showSettings ? 'text-red-500' : ''}`}>
                    <Settings size={22} className={showSettings ? 'animate-spin-slow' : ''} /> 
                    <span className="hidden md:block">Quality</span>
                  </button>

                  {/* Quality Dropdown Popover */}
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-4 bg-black/90 border border-white/10 backdrop-blur-xl rounded-xl p-2 min-w-[160px] shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-[10px] text-neutral-500 font-black tracking-widest uppercase px-3 py-2 border-b border-white/5 mb-1">Playback Settings</p>
                      
                      <button onClick={() => changeQuality(-1)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center justify-between transition-colors ${currentQuality === -1 ? 'bg-red-900/30 text-red-500' : 'text-white hover:bg-white/10'}`}>
                        Auto {currentQuality === -1 && <Check size={16} />}
                      </button>
                      
                      {qualities.map((q, index) => (
                        <button 
                          key={index} 
                          onClick={() => changeQuality(index)} 
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center justify-between transition-colors ${currentQuality === index ? 'bg-red-900/30 text-red-500' : 'text-white hover:bg-white/10'}`}
                        >
                          {q.height}p {currentQuality === index && <Check size={16} />}
                        </button>
                      )).reverse()}
                    </div>
                  )}
                </div>

                {/* FULLSCREEN TOGGLE */}
                <button onClick={toggleFullScreen} className="text-white hover:text-red-500 transition-colors">
                  {isFullScreen ? <Minimize size={26} /> : <Maximize size={26} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: STANDARD FILM PAGE (Remains exactly the same as before) ---
  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center">
        <button onClick={() => window.location.href='/dashboard'} className="w-12 h-12 bg-[#111]/80 hover:bg-[#222] backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10 text-neutral-300 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => setIsBgMuted(!isBgMuted)} className="w-12 h-12 bg-[#111]/80 hover:bg-[#222] backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10 text-neutral-300 hover:text-white">
          {isBgMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <div className="relative w-full h-[75vh] flex flex-col justify-end px-8 md:px-20 pb-16">
        <div className="absolute inset-0 z-0">
          {film.trailer_url ? (
            <video ref={bgVideoRef} autoPlay loop muted={isBgMuted} playsInline className="w-full h-full object-cover object-center opacity-70" />
          ) : (
            <img src={film.banner_url || film.poster_url} className="w-full h-full object-cover object-top opacity-60" alt={film.title} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          {film.logo_url ? (
            <img src={film.logo_url} alt={film.title} className="w-[80%] max-w-[400px] mb-6 drop-shadow-2xl" />
          ) : (
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] mb-6 leading-none">{film.title}</h1>
          )}
          <div className="flex items-center gap-4 text-xs font-bold text-neutral-300 tracking-widest mb-6 uppercase drop-shadow-md">
            <span className="flex items-center gap-1 text-red-500"><Star size={14} fill="currentColor"/> {film.rating || "TBD"}</span>
            <span>•</span><span>{film.release_year || "2026"}</span><span>•</span><span>{film.genre || "Film"}</span>
          </div>
          <p className="text-neutral-300 text-sm md:text-base font-medium leading-relaxed max-w-xl mb-10 drop-shadow-lg">{film.description}</p>
          <div className="flex items-center gap-3">
            <button onClick={launchFeatureFilm} className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-black hover:bg-neutral-200 transition-colors uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Play fill="currentColor" size={18} /> Play
            </button>
            <button className="w-12 h-12 bg-[#1a1a1a]/80 hover:bg-[#333] border border-white/10 rounded-full flex items-center justify-center transition-colors">
              <Plus size={20} className="text-white" />
            </button>
            <button className="flex items-center gap-2 bg-[#1a1a1a]/80 hover:bg-[#333] border border-white/10 px-6 py-3 rounded-full font-bold transition-colors uppercase tracking-widest text-sm">
              <Download size={16} /> Download
            </button>
            <button className="flex items-center gap-2 bg-[#1a1a1a]/80 hover:bg-[#333] border border-white/10 px-6 py-3 rounded-full font-bold transition-colors uppercase tracking-widest text-sm">
              <ListVideo size={16} /> Similars
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="px-8 md:px-20 py-10 max-w-[1600px] mx-auto space-y-16">
        {film.cast_crew && film.cast_crew.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-red-600 rounded"></div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-white">Actors</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {film.cast_crew.map((member, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-[#0a0a0a] border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-neutral-900 overflow-hidden flex-shrink-0 border border-neutral-800">
                    {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-500 font-bold">{member.name.charAt(0)}</div>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white tracking-wide">{member.name}</span>
                    <span className="text-xs text-neutral-500 tracking-wide">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
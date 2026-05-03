"use client";

import React, { useState, useEffect } from "react";
import { 
  Play, Search, MonitorPlay, ChevronRight, 
  LogOut, User, CheckCircle, X, Eye, MessageSquare, 
  Film, Users, ShieldCheck, TrendingUp, Star, Edit3, Lock, Check
} from "lucide-react";
import Swal from "sweetalert2";
import { createClient } from "../../utils/supabase/client"; 

// STAFF BYPASS & PRIVACY LIST
const STAFF_EMAILS = ["admin@zenteku.in", "kunal@zenteku.in", "ganesh@zenteku.in"];

export default function Dashboard() {
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Added <any> to prevent strict mode from throwing "Object is of type 'unknown'"
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [activeTab, setActiveTab] = useState("activity"); 

  // Added <any[]> to prevent strict mode from assuming 'never[]'
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [films, setFilms] = useState<any[]>([]);
  const [watchHistory, setWatchHistory] = useState<any[]>([]); 

  // --- NEW STATES FOR PRODUCTION HOUSES ---
  const [publicStudioView, setPublicStudioView] = useState<any>(null); // Controls the full-screen studio popup
  const [studioEditForm, setStudioEditForm] = useState({ name: "", avatar: "" });
  const [newKeyPerson, setNewKeyPerson] = useState({ name: "", role: "" });

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", avatar: "", gender: "" });

  const generateProfileId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'U-';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const isNewFilm = (dateString: string) => {
    if (!dateString) return false;
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));  
    return diffDays <= 7;
  };

  const matchesSearch = (film: any, query: string) => {
    const q = query.toLowerCase();
    const matchesTitle = film.title?.toLowerCase().includes(q);
    const matchesHouse = film.production_house_name?.toLowerCase().includes(q);
    return matchesTitle || matchesHouse;
  };

  // --- CORE LOGIC & AUTH ---
  useEffect(() => {
    let isMounted = true;
    // Explicitly typed as 'any' to bypass strict null checks
    let realtimeSubscription: any = null;

    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        setIsLoading(false);
        Swal.fire({ icon: 'warning', title: 'Connection Hiccup', text: 'The connection stalled. Try logging in again.', background: '#030303', color: '#ffffff' });
      }
    }, 8000);

    // Typed userEmail
    const setupRealtimeListener = (userEmail: string) => {
      if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);
      realtimeSubscription = supabase.channel(`user_status_${userEmail}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'zen_tech_users', filter: `email=eq.${userEmail}` }, (payload: any) => {
            if (payload.new.is_subscribed === false && payload.new.is_staff === false) window.location.href = '/subscription';
        }).subscribe();
    };

    const fetchDashboardData = async () => {
      const { data: filmsData } = await supabase.from("uuunivvr_films").select("*").order('created_at', { ascending: false });
      if (filmsData && filmsData.length > 0 && isMounted) {
        setFilms(filmsData);
        setWatchHistory(filmsData.slice(0, 2)); 
      }
      
      const { data: usersData } = await supabase.from("zen_tech_users").select("profile_id, full_name, avatar_url, account_tier, key_people");
      if (usersData && isMounted) setAllUsers(usersData);
    };

    // Typed session
    const processUser = async (session: any) => {
      try {
        if (!session?.user?.email) throw new Error("No user email found.");
        const email = session.user.email;
        const googleName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "User";
        const googleAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "";
        const isStaff = STAFF_EMAILS.includes(email.toLowerCase());
        
        if (isMounted) {
          setFormData(prev => ({ ...prev, email: email, name: googleName, avatar: googleAvatar }));
          setIsEmailLocked(true);
        }

        const { data, error } = await supabase.from("zen_tech_users").select("*").ilike("email", email).maybeSingle(); 
        if (error) throw error; 

        if (isMounted) {
          if (data) {
            if (!data.is_subscribed && !data.is_staff && !isStaff) { window.location.href = '/subscription'; return; }
            setCurrentUser({
              ...data,
              name: data.full_name || googleName, email: data.email, phone: data.phone_number, avatar: data.avatar_url || googleAvatar, gender: data.gender,
              profile_id: data.profile_id, account_tier: data.account_tier || 'viewer', is_verified: data.is_verified || isStaff, is_staff: data.is_staff || isStaff,
              key_people: data.key_people || []
            });
            setStudioEditForm({ name: data.full_name || googleName, avatar: data.avatar_url || googleAvatar });
            setShowIntro(false); setupRealtimeListener(email); fetchDashboardData();
          } else { setShowIntro(true); }
          clearTimeout(safetyTimeout); setIsLoading(false); 
          if (window.location.href.includes("code=") || window.location.href.includes("access_token=")) window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err: any) {
        // Typed err as any to prevent err.message failure
        if (isMounted) { clearTimeout(safetyTimeout); setIsLoading(false); Swal.fire({ icon: 'error', title: 'Sync Failed', text: err.message, background: '#030303', color: '#ffffff' }); }
      }
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        if (!window.location.href.includes("code=") && !window.location.href.includes("access_token=") && isMounted) window.location.href = '/';
      } else processUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) processUser(session);
    });

    // Typed e
    const handleKeyDown = (e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
      if (e.key === 'Escape') { setShowSearch(false); setPublicStudioView(null); }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => { isMounted = false; clearTimeout(safetyTimeout); subscription.unsubscribe(); window.removeEventListener('keydown', handleKeyDown); if (realtimeSubscription) supabase.removeChannel(realtimeSubscription); };
  }, []); 

  // Typed e
  const handleCompleteIntro = async (e: any) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.gender) return Swal.fire({ icon: 'error', title: 'Error', text: 'Fill all fields.', background: '#030303', color: '#ffffff' });
    Swal.fire({ title: 'Encrypting...', background: '#030303', color: '#ffffff', allowOutsideClick: false, didOpen: () => { Swal.showLoading() }});

    const isStaff = STAFF_EMAILS.includes(formData.email.toLowerCase());
    const { error } = await supabase.from("zen_tech_users").insert([{ 
        email: formData.email, full_name: formData.name, phone_number: formData.phone, avatar_url: formData.avatar, gender: formData.gender, is_first_login: false,
        is_subscribed: isStaff, is_staff: isStaff, profile_id: generateProfileId(), account_tier: isStaff ? 'staff' : 'viewer', is_verified: isStaff
    }]);

    // Typed error as any
    if (error) { (error as any).code === '23505' ? window.location.reload() : Swal.fire({ icon: 'error', title: 'DB Error', text: error.message, background: '#030303', color: '#ffffff' }); } 
    else { Swal.close(); !isStaff ? window.location.href = '/subscription' : window.location.reload(); }
  };

  const handleLogout = () => {
    Swal.fire({ title: 'Logging out', icon: 'info', background: '#030303', color: '#ffffff', showConfirmButton: false, timer: 1500 }).then(async () => {
      await supabase.auth.signOut(); window.location.href = '/';
    });
  };

  // --- PRODUCTION HOUSE ACTIONS ---
  const handleLockProfile = async () => {
    if (!studioEditForm.name || !studioEditForm.avatar) return;
    
    Swal.fire({
      title: 'Are you absolutely sure?',
      text: "You can only update your Studio Name and Logo ONCE. This action is permanent.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#262626',
      confirmButtonText: 'Yes, lock it in!',
      background: '#030303', color: '#ffffff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase.from('zen_tech_users').update({
          full_name: studioEditForm.name,
          avatar_url: studioEditForm.avatar,
          profile_locked: true 
        }).eq('email', currentUser.email);

        if (!error) {
          setCurrentUser({...currentUser, name: studioEditForm.name, avatar: studioEditForm.avatar, profile_locked: true});
          Swal.fire({ title: 'Locked!', text: 'Your studio identity is now permanent.', icon: 'success', background: '#030303', color: '#ffffff' });
        }
      }
    });
  };

  const handleAddKeyPerson = async () => {
    if (!newKeyPerson.name || !newKeyPerson.role) return;
    const updatedPeople = [...(currentUser.key_people || []), newKeyPerson];
    
    const { error } = await supabase.from('zen_tech_users').update({ key_people: updatedPeople }).eq('email', currentUser.email);
    if (!error) {
      setCurrentUser({...currentUser, key_people: updatedPeople});
      setNewKeyPerson({ name: "", role: "" });
    }
  };

  if (isLoading) return <main className="min-h-screen bg-[#000] flex flex-col items-center justify-center"><div className="w-8 h-8 border-t-2 border-red-600 rounded-full animate-spin mb-4"></div><p className="text-neutral-500 text-[9px] uppercase tracking-[0.3em]">Connecting</p></main>;

  return (
    <main className="min-h-screen bg-[#000] text-white font-sans overflow-x-hidden flex flex-col selection:bg-red-900/40">
      <style dangerouslySetInnerHTML={{__html: ` .custom-scrollbar::-webkit-scrollbar { width: 2px; height: 2px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); } `}} />

      {/* --- HYPER-MINIMAL NAVBAR --- */}
      <nav className="fixed top-0 w-full z-[100] px-8 py-5 flex items-center justify-between bg-gradient-to-b from-black via-black/80 to-transparent backdrop-blur-2xl border-b border-white/[0.02]">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2 cursor-pointer">
            <MonitorPlay className="text-red-600" size={16} />
            <h1 className="text-[14px] font-black tracking-tighter text-white uppercase italic">UU<span className="text-red-600">UNIV</span>VR</h1>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            <a href="#" className="text-white hover:text-white transition-colors">Home</a>
            {currentUser?.account_tier === 'production' || currentUser?.is_staff ? (
              <a href="/upload" className="hover:text-red-500 transition-colors flex items-center gap-1.5 text-red-600/80">
                Studio <ShieldCheck size={10}/>
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div onClick={() => setShowSearch(true)} className="hidden lg:flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] px-4 py-1.5 rounded-full cursor-pointer hover:bg-white/[0.05] transition-colors">
            <Search size={12} className="text-neutral-500" />
            <span className="text-[9px] font-bold tracking-[0.15em] w-32 text-neutral-500">SEARCH...</span>
            <span className="text-[8px] bg-white/[0.05] px-1.5 py-0.5 rounded text-neutral-400 font-black tracking-widest border border-white/[0.02]">⌘K</span>
          </div>
          
          <div className="flex items-center gap-4 pl-6 border-l border-white/[0.05]">
            <div className="text-right hidden sm:block cursor-pointer" onClick={() => setShowProfile(true)}>
              <p className="text-[10px] font-bold tracking-widest text-neutral-300 uppercase">{currentUser?.name.split(' ')[0]}</p>
              <p className="text-[7px] font-black text-red-600/80 tracking-[0.2em] uppercase mt-0.5">{currentUser?.account_tier}</p>
            </div>
            <div onClick={() => setShowProfile(true)} className="w-7 h-7 rounded-full bg-[#050505] border border-white/10 overflow-hidden cursor-pointer hover:border-red-500/50 transition-colors">
              {currentUser?.avatar ? <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-full h-full p-1.5 text-neutral-600" />}
            </div>
            <button onClick={handleLogout} className="text-neutral-600 hover:text-red-500 transition-colors ml-1"><LogOut size={12} /></button>
          </div>
        </div>
      </nav>

      {/* --- CTRL+K ADVANCED SEARCH MODAL --- */}
      {showSearch && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-3xl flex justify-center pt-[15vh] px-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl flex flex-col h-max max-h-[70vh]">
            <div className="flex items-center px-4 py-4 border-b border-white/[0.05]">
              <Search className="text-neutral-500 mr-4" size={16} />
              <input autoFocus type="text" placeholder="SEARCH TITLE, STUDIO, OR CREATOR..." className="bg-transparent flex-1 outline-none text-[11px] font-black tracking-[0.2em] uppercase text-white placeholder:text-neutral-700" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button onClick={() => setShowSearch(false)} className="text-[9px] px-2 py-1 text-neutral-500 hover:text-white font-bold tracking-widest uppercase transition-colors">Close</button>
            </div>
            <div className="py-6 overflow-y-auto custom-scrollbar">
              {searchQuery.trim() === "" ? (
                <div className="py-10 text-center text-[9px] font-black tracking-[0.2em] uppercase text-neutral-700">Awaiting Input...</div>
              ) : (
                <div className="space-y-8">
                  
                  {/* PRODUCTION HOUSES MATCHES */}
                  {allUsers.filter(u => u.account_tier === 'production' && u.full_name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div>
                      <p className="text-[8px] text-red-600 font-black tracking-[0.2em] uppercase mb-4 px-4">Studios & Production Houses</p>
                      <div className="flex flex-col">
                        {allUsers.filter(u => u.account_tier === 'production' && u.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map((user: any) => (
                          <div key={user.profile_id} onClick={() => { setPublicStudioView(user); setShowSearch(false); }} className="flex items-center gap-4 px-4 py-2 hover:bg-white/[0.02] cursor-pointer transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/5 overflow-hidden"><img src={user.avatar_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" /></div>
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2">{user.full_name} <CheckCircle size={10} className="text-blue-500" /></h4>
                              <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.1em] mt-1">Verified Studio</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FILM MATCHES */}
                  {films.filter(f => matchesSearch(f, searchQuery)).length > 0 && (
                    <div>
                      <p className="text-[8px] text-neutral-600 font-black tracking-[0.2em] uppercase mb-4 px-4">Film Assets</p>
                      <div className="flex flex-col">
                        {films.filter(f => matchesSearch(f, searchQuery)).map((film: any) => (
                          <div key={film.id} onClick={() => window.location.href=`/film/${film.slug}`} className="flex items-center gap-4 px-4 py-2 hover:bg-white/[0.02] cursor-pointer transition-colors">
                            <div className="w-16 h-9 bg-neutral-900 rounded-sm overflow-hidden flex-shrink-0"><img src={film.poster_url} className="w-full h-full object-cover opacity-70" /></div>
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-200">{film.title}</h4>
                              <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.1em] mt-1">{film.genre || "Cinematic"} • {film.production_house_name || "Indie"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- PUBLIC STUDIO PROFILE POPUP --- */}
      {publicStudioView && (
        <div className="fixed inset-0 z-[400] bg-[#000]/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-4xl h-[80vh] bg-[#030303] border border-white/[0.05] rounded-2xl flex flex-col relative overflow-hidden shadow-2xl shadow-red-900/10">
            <button onClick={() => setPublicStudioView(null)} className="absolute top-6 right-6 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-white/10 transition-colors"><X size={16} /></button>
            
            {/* Studio Header Cover */}
            <div className="h-48 w-full relative bg-neutral-900 border-b border-white/[0.02]">
               <div className="absolute inset-0 bg-gradient-to-t from-[#030303] to-transparent z-10"></div>
               <img src={publicStudioView.avatar_url} className="w-full h-full object-cover opacity-20 blur-xl" />
               
               <div className="absolute bottom-[-30px] left-12 z-20 flex items-end gap-6">
                 <div className="w-24 h-24 rounded-xl border-2 border-[#030303] bg-black overflow-hidden shadow-xl">
                   <img src={publicStudioView.avatar_url} className="w-full h-full object-cover" />
                 </div>
                 <div className="mb-2">
                   <h1 className="text-3xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                     {publicStudioView.full_name} <CheckCircle size={18} className="text-blue-500" />
                   </h1>
                   <p className="text-[9px] text-red-500 font-black tracking-[0.3em] uppercase mt-1">Official Production House</p>
                 </div>
               </div>
            </div>

            <div className="flex-1 p-12 pt-16 flex gap-12 overflow-y-auto custom-scrollbar">
              <div className="w-1/3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-6 border-b border-white/5 pb-2">Key Executives</h3>
                {publicStudioView.key_people && publicStudioView.key_people.length > 0 ? (
                  <div className="space-y-4">
                    {publicStudioView.key_people.slice(0, 3).map((person: any, idx: number) => (
                      <div key={idx} className="flex flex-col bg-white/[0.02] p-3 rounded border border-white/5">
                        <span className="text-[11px] font-bold tracking-widest text-white uppercase">{person.name}</span>
                        <span className="text-[8px] font-black tracking-[0.2em] text-red-500 uppercase mt-1">{person.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest">Classified.</p>
                )}
              </div>

              <div className="w-2/3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-6 border-b border-white/5 pb-2">Cinematic Universe</h3>
                <div className="grid grid-cols-2 gap-4">
                   {films.filter(f => f.production_house_name === publicStudioView.full_name).map(film => (
                      <div key={film.id} onClick={() => window.location.href=`/film/${film.slug}`} className="cursor-pointer group relative rounded border border-white/[0.05] overflow-hidden bg-black aspect-video">
                        <img src={film.poster_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <h4 className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest text-white">{film.title}</h4>
                      </div>
                   ))}
                   {films.filter(f => f.production_house_name === publicStudioView.full_name).length === 0 && (
                     <p className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest">No assets found for this studio.</p>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FULL SCREEN OS-STYLE PROFILE MODAL --- */}
      {showProfile && currentUser && (
        <div className="fixed inset-0 z-[200] bg-[#000]/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-5xl h-[85vh] bg-[#030303] border border-white/[0.03] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 z-50 text-neutral-600 hover:text-white transition-colors"><X size={16} /></button>
            
            {/* Header */}
            <div className="h-[30%] bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.02] flex items-center px-12">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-full bg-[#050505] border border-white/5 overflow-hidden relative">
                  {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover opacity-80" /> : <User className="w-full h-full p-6 text-neutral-800" />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-neutral-200">{currentUser.name}</h1>
                    {currentUser.is_verified && <CheckCircle className="text-blue-500/80" size={14} />}
                  </div>
                  <div className="flex items-center gap-4 text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">
                    <span>ID: {currentUser.profile_id}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-800"></span>
                    <span className="text-red-500/80">{currentUser.account_tier}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="h-[70%] flex bg-[#000]">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/[0.02] p-8 flex flex-col gap-6">
                <button onClick={() => setActiveTab('activity')} className={`text-[9px] font-black uppercase tracking-[0.2em] text-left transition-colors ${activeTab === 'activity' ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'}`}>History & Activity</button>
                
                {currentUser.account_tier === 'production' && (
                  <>
                    <button onClick={() => setActiveTab('studio_films')} className={`text-[9px] font-black uppercase tracking-[0.2em] text-left transition-colors ${activeTab === 'studio_films' ? 'text-red-500' : 'text-neutral-600 hover:text-neutral-400'}`}>Your Films</button>
                    <button onClick={() => setActiveTab('studio_settings')} className={`text-[9px] font-black uppercase tracking-[0.2em] text-left transition-colors ${activeTab === 'studio_settings' ? 'text-red-500' : 'text-neutral-600 hover:text-neutral-400'}`}>Studio Settings</button>
                  </>
                )}

                {(currentUser.account_tier === 'production' || currentUser.account_tier === 'staff') && (
                  <button onClick={() => window.location.href='/upload'} className={`text-[9px] font-black uppercase tracking-[0.2em] text-left transition-colors flex items-center gap-2 text-neutral-600 hover:text-white mt-4`}>Upload Master <ShieldCheck size={10}/></button>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                
                {/* 1. HISTORY TAB */}
                {activeTab === 'activity' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 bg-white/[0.01] border border-white/[0.02] rounded-xl p-8 flex flex-col">
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase text-neutral-500 flex items-center gap-2 mb-6"><Eye size={12}/> Live Watch History</span>
                      {watchHistory.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4">
                          {watchHistory.map((histFilm: any) => (
                             <div key={histFilm.id} onClick={() => window.location.href=`/film/${histFilm.slug}`} className="min-w-[200px] cursor-pointer group">
                               <div className="w-full aspect-video rounded border border-white/[0.03] overflow-hidden mb-3 relative bg-[#030303]">
                                 <img src={histFilm.poster_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                 <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                                 <div className="absolute bottom-0 left-0 h-1 bg-red-600" style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}></div>
                               </div>
                               <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 truncate">{histFilm.title}</h4>
                             </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-800 text-[10px] uppercase font-bold tracking-widest">No logs found.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. YOUR FILMS TAB (Production Only) */}
                {activeTab === 'studio_films' && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                       <span className="text-[12px] font-black tracking-[0.2em] uppercase text-white flex items-center gap-2"><Film size={14} className="text-red-500"/> Published Universe</span>
                       <button onClick={() => window.location.href='/upload'} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-colors">Publish New</button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                      {films.filter(f => f.production_house_name === currentUser.name).map((film) => (
                         <div key={film.id} className="group relative rounded border border-white/[0.05] overflow-hidden bg-black p-4 flex flex-col justify-between">
                            <div className="w-full aspect-video rounded overflow-hidden mb-4 relative">
                              <img src={film.poster_url} className="w-full h-full object-cover opacity-50" />
                            </div>
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-4">{film.title}</h4>
                            <div className="flex gap-2 w-full">
                              <button onClick={() => window.location.href=`/film/${film.slug}`} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded text-[8px] font-black uppercase tracking-widest transition-colors text-center">View</button>
                              <button onClick={() => window.location.href=`/upload?edit=${film.id}`} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-500 py-2 rounded text-[8px] font-black uppercase tracking-widest transition-colors text-center flex items-center justify-center gap-1"><Edit3 size={10}/> Edit</button>
                            </div>
                         </div>
                      ))}
                      {films.filter(f => f.production_house_name === currentUser.name).length === 0 && (
                        <p className="col-span-3 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 py-10">No films published yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. STUDIO SETTINGS TAB (Production Only) */}
                {activeTab === 'studio_settings' && (
                  <div className="flex flex-col gap-10 max-w-2xl">
                    
                    {/* SECTION: PERMANENT BRANDING */}
                    <div>
                      <h3 className="text-[12px] font-black tracking-[0.2em] uppercase text-white mb-2 flex items-center gap-2">Studio Identity <Lock size={12} className="text-red-500"/></h3>
                      <p className="text-[9px] font-bold tracking-widest text-neutral-500 mb-6 uppercase">Warning: Name and Logo can only be updated once.</p>
                      
                      <div className="bg-white/[0.01] border border-white/[0.02] p-6 rounded-xl flex flex-col gap-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Studio Name</label>
                        <input type="text" value={studioEditForm.name} onChange={(e) => setStudioEditForm({...studioEditForm, name: e.target.value})} disabled={currentUser.profile_locked} className="bg-black border border-white/10 rounded p-3 text-[10px] font-bold text-white outline-none disabled:opacity-50" />
                        
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mt-2">Avatar / Logo URL</label>
                        <input type="text" value={studioEditForm.avatar} onChange={(e) => setStudioEditForm({...studioEditForm, avatar: e.target.value})} disabled={currentUser.profile_locked} className="bg-black border border-white/10 rounded p-3 text-[10px] font-bold text-white outline-none disabled:opacity-50" />

                        {currentUser.profile_locked ? (
                          <div className="mt-4 p-3 bg-green-900/10 border border-green-900/30 rounded flex items-center gap-2 text-green-500">
                             <Check size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Profile Permanently Locked</span>
                          </div>
                        ) : (
                          <button onClick={handleLockProfile} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-black text-[9px] uppercase tracking-widest py-3 rounded transition-colors flex items-center justify-center gap-2">Save Permanently <Lock size={10}/></button>
                        )}
                      </div>
                    </div>

                    {/* SECTION: KEY PEOPLE */}
                    <div>
                      <h3 className="text-[12px] font-black tracking-[0.2em] uppercase text-white mb-2 flex items-center gap-2">Key Executives <Users size={12} className="text-red-500"/></h3>
                      <p className="text-[9px] font-bold tracking-widest text-neutral-500 mb-6 uppercase">List Directors, Producers, and Executives.</p>
                      
                      <div className="space-y-3 mb-6">
                        {currentUser.key_people && currentUser.key_people.map((person: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white">{person.name}</span>
                             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500">{person.role}</span>
                           </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input type="text" placeholder="Name (e.g. John Doe)" value={newKeyPerson.name} onChange={e => setNewKeyPerson({...newKeyPerson, name: e.target.value})} className="flex-1 bg-black border border-white/10 rounded p-3 text-[9px] font-bold tracking-widest text-white outline-none uppercase placeholder:text-neutral-700" />
                        <input type="text" placeholder="Role (e.g. Director)" value={newKeyPerson.role} onChange={e => setNewKeyPerson({...newKeyPerson, role: e.target.value})} className="flex-1 bg-black border border-white/10 rounded p-3 text-[9px] font-bold tracking-widest text-white outline-none uppercase placeholder:text-neutral-700" />
                        <button onClick={handleAddKeyPerson} className="bg-white text-black px-6 rounded text-[9px] font-black uppercase tracking-widest hover:bg-neutral-300 transition-colors">Add</button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- INITIAL ONBOARDING MODAL --- */}
      {showIntro && (
        <div className="fixed inset-0 z-[400] bg-[#000]/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-[#030303] border border-white/[0.03] p-10 rounded-2xl w-full max-w-sm">
            <h2 className="text-[11px] font-black tracking-[0.3em] mb-8 text-center text-neutral-400 uppercase">Initialize</h2>
            <form onSubmit={handleCompleteIntro} className="flex flex-col gap-4">
              <input type="text" placeholder="NAME" required className="bg-white/[0.02] border border-white/[0.05] rounded-md p-3 text-[9px] font-bold tracking-[0.2em] uppercase text-white focus:border-white/20 outline-none transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="EMAIL" required readOnly={isEmailLocked} className={`bg-white/[0.02] border border-white/[0.05] rounded-md p-3 text-[9px] font-bold tracking-[0.2em] uppercase text-white outline-none ${isEmailLocked ? 'opacity-30' : ''}`} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input type="tel" placeholder="PHONE" required className="bg-white/[0.02] border border-white/[0.05] rounded-md p-3 text-[9px] font-bold tracking-[0.2em] uppercase text-white focus:border-white/20 outline-none transition-colors" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <select required className="bg-white/[0.02] border border-white/[0.05] rounded-md p-3 text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-500 focus:border-white/20 outline-none appearance-none" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                <option value="" disabled>GENDER</option><option value="Male">MALE</option><option value="Female">FEMALE</option><option value="Other">OTHER</option>
              </select>
              <button type="submit" className="mt-6 bg-white text-black hover:bg-neutral-300 font-black py-3.5 rounded-md transition-colors text-[9px] tracking-[0.3em] uppercase">Connect</button>
            </form>
          </div>
        </div>
      )}

      {/* --- HERO CINEMATIC SECTION --- */}
      <section className="relative w-full h-[80vh] flex flex-col justify-end px-12 md:px-24 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={films[0]?.banner_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000"} className="w-full h-full object-cover opacity-40 scale-[1.02]" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-[#000]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#000] via-[#000]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl animate-in fade-in duration-1000">
          <p className="text-[9px] font-black tracking-[0.4em] uppercase text-red-600/80 mb-4 flex items-center gap-2">
            <TrendingUp size={10} /> Now Streaming
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-widest leading-[0.9] mb-6 text-neutral-100">
            {films[0]?.title || "A JOURNEY TO SERVE"}
          </h2>
          <p className="text-neutral-500 text-[10px] md:text-[11px] font-medium tracking-[0.1em] leading-relaxed max-w-lg mb-8">
            {films[0]?.description || "A gripping tale of a young network engineer navigating the complex and highly secured world of corporate server mainframes."}
          </p>
          
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href=`/film/${films[0]?.slug}`} className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-sm font-black uppercase tracking-[0.2em] text-[9px] hover:bg-neutral-200 transition-colors">
              <Play fill="black" size={10} /> Play Movie
            </button>
            <button className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] text-white px-6 py-3 rounded-sm font-black uppercase tracking-[0.2em] text-[9px] hover:bg-white/[0.08] transition-colors">
              Details
            </button>
          </div>
        </div>
      </section>

      {/* --- LANDSCAPE CONTENT GRIDS --- */}
      <div className="px-12 md:px-24 relative z-20 pb-32 flex-grow">
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-white/[0.02] pb-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400">Library</h3>
            <button className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-600 hover:text-white transition-colors">View All</button>
          </div>

          {films.length === 0 ? (
            <div className="w-full py-24 flex flex-col items-center justify-center border border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600">No assets detected.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {films.map((film: any) => (
                <div key={film.id} onClick={() => window.location.href=`/film/${film.slug}`} className="group cursor-pointer">
                  {/* CHANGED: aspect-video (16:9 YouTube Thumbnail ratio) instead of portrait */}
                  <div className="relative aspect-video rounded-md overflow-hidden bg-[#030303] border border-white/[0.02] group-hover:border-white/10 transition-colors shadow-lg">
                    <img src={film.poster_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={film.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                    
                    {isNewFilm(film.created_at) && <span className="absolute top-2 right-2 text-red-500 text-[7px] font-black uppercase tracking-widest bg-red-950/50 px-1.5 py-0.5 rounded-sm">New</span>}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end">
                      <button className="w-full bg-white/10 backdrop-blur-md border border-white/10 text-white py-2 rounded-sm font-black uppercase text-[8px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors">
                        <Play size={10} fill="currentColor" /> Play
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 group-hover:text-white transition-colors truncate">{film.title}</h4>
                    <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.15em] mt-1">{film.genre || "Cinematic"} • {film.production_house_name || "Indie"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* --- REFINED MINIMAL FOOTER --- */}
      <footer className="border-t border-white/[0.02] py-8 px-12 md:px-24 flex flex-col md:flex-row items-center justify-between gap-6">
        <h1 className="text-[10px] font-black tracking-[0.2em] text-neutral-600 uppercase italic">UUUNIVVR</h1>
        
        {/* CENTER PURE WHITE SHINY COPYRIGHT */}
        <p className="text-[10px] font-black text-white tracking-[0.2em] uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] text-center">
          © 2026 ZEN-TECH INTERNATIONAL. ALL RIGHTS RESERVED.
        </p>
        
        {/* RIGHT ALIGNED TERMS BUTTON */}
        <div className="flex gap-8 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-600">
          <a href="/rules" className="hover:text-white transition-colors">Terms and Services</a>
        </div>
      </footer>
    </main>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, Film, AlertTriangle, ChevronLeft, 
  Play, Plus, X, User, CheckCircle2, ShieldCheck, 
  Info, ShieldAlert
} from "lucide-react";
import Swal from "sweetalert2";
import { createClient } from "../../utils/supabase/client";

// STAFF BYPASS IDENTIFIERS
const STAFF_EMAILS = ["admin@zenteku.in", "kunal@zenteku.in", "ganesh@zenteku.in"];

// BUNNY.NET CONFIGURATION (PULLED SECURELY FROM .env.local)
const BUNNY_API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
const BUNNY_PULL_ZONE = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE;

export default function UploadStudio() {
  const supabase = createClient();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [studioInfo, setStudioInfo] = useState({ name: "", logo: "", isStaff: false });

  // Upload States - Typed with <any> to prevent strict null assignment errors
  const [featureFile, setFeatureFile] = useState<any>(null);
  const [trailerFile, setTrailerFile] = useState<any>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<any>(null);
  const [previewTrailerUrl, setPreviewTrailerUrl] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");

  // Refs - Typed with <any>
  const featureInputRef = useRef<any>(null);
  const trailerInputRef = useRef<any>(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cast: [{ name: "", role: "" }]
  });

  // --- 1. AUTHORIZATION & SETUP ---
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }

      const email = session.user.email;
      // THE FIX: Added || "" so TypeScript knows it will absolutely be a string
      const { data: userData } = await supabase.from("zen_tech_users").select("*").ilike("email", email || "").maybeSingle();

      if (userData) {
        if (userData.account_tier === 'staff' || userData.account_tier === 'production') {
          setIsAuthorized(true);
          const isStaff = STAFF_EMAILS.includes((email || "").toLowerCase());
          
          setStudioInfo({
            name: isStaff ? "Zenteku Films" : (userData.full_name || "Independent Studio"),
            logo: isStaff ? "https://teju0051.github.io/Assets/tt.jpg" : (userData.avatar_url || ""),
            isStaff: isStaff
          });
        } else {
          Swal.fire({
            icon: 'error', title: 'Restricted Area', text: 'Only verified Production Houses can access the upload mainframe.',
            background: '#0a0a0a', color: '#ffffff'
          }).then(() => window.location.href = '/dashboard');
        }
      }
      setIsLoadingAuth(false);
    };
    checkAuth();
  }, []);

  // --- 2. VIDEO VALIDATION ---
  // Explicitly type 'file'
  const validateVideoFile = (file: any, isTrailer = false) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        Swal.fire({ icon: 'error', title: 'Invalid Format', text: 'Images and GIFs are strictly prohibited. Please upload a valid video file (.mp4, .mov).', background: '#0a0a0a', color: '#ffffff' });
        return resolve(false);
      }

      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';

      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        
        if (videoElement.videoHeight >= videoElement.videoWidth) {
          Swal.fire({ icon: 'error', title: 'Vertical Video Detected', text: 'Only cinematic landscape mode is supported. Please upload a horizontal video.', background: '#0a0a0a', color: '#ffffff' });
          return resolve(false);
        }

        if (isTrailer && videoElement.duration > 61) {
          Swal.fire({ icon: 'error', title: 'Trailer Too Long', text: 'The promotional trailer must not exceed 60 seconds.', background: '#0a0a0a', color: '#ffffff' });
          return resolve(false);
        }

        resolve(true);
      };

      videoElement.src = URL.createObjectURL(file);
    });
  };

  // Explicitly type 'e'
  const handleFeatureUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = await validateVideoFile(file, false);
      if (isValid) {
        setFeatureFile(file);
        setPreviewVideoUrl(URL.createObjectURL(file));
      } else {
        e.target.value = null; 
      }
    }
  };

  // Explicitly type 'e'
  const handleTrailerUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = await validateVideoFile(file, true);
      if (isValid) {
        setTrailerFile(file);
        setPreviewTrailerUrl(URL.createObjectURL(file));
      } else {
        e.target.value = null;
      }
    }
  };

  // Explicitly type index, field, and value
  const handleCastChange = (index: number, field: string, value: string) => {
    const newCast: any[] = [...formData.cast];
    newCast[index][field] = value;
    setFormData({ ...formData, cast: newCast });
  };
  const addCastMember = () => setFormData({ ...formData, cast: [...formData.cast, { name: "", role: "" }] });
  const removeCastMember = (index: number) => {
    const newCast = [...formData.cast];
    newCast.splice(index, 1);
    setFormData({ ...formData, cast: newCast });
  };

  // --- 3. BUNNY.NET REAL UPLOAD LOGIC ---
  // Explicitly type file and title
  const uploadToBunny = async (file: any, title: string, isTrailer = false) => {
    if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
      throw new Error("Bunny.net API keys are missing. Please check your .env.local file.");
    }

    const createRes = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
      method: 'POST',
      headers: { 
        'AccessKey': BUNNY_API_KEY, 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ title: title })
    });
    
    if (!createRes.ok) throw new Error("Failed to create video entry in Bunny CDN.");
    const { guid } = await createRes.json();

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${guid}`, true);
      xhr.setRequestHeader("AccessKey", BUNNY_API_KEY);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      if (!isTrailer) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(true);
        else reject(new Error(`Upload failed with status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Network connection lost during upload."));
      xhr.send(file);
    });

    return {
      videoUrl: `https://${BUNNY_PULL_ZONE}/${guid}/playlist.m3u8`,
      thumbnailUrl: `https://${BUNNY_PULL_ZONE}/${guid}/thumbnail.jpg`
    };
  };

  // --- 4. MASTER SUBMIT TO BUNNY & SUPABASE ---
  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      return Swal.fire({ icon: 'error', title: 'Missing Details', text: 'Film Title and Description are required.', background: '#0a0a0a', color: '#ffffff' });
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setUploadStatusText("Transmitting Master Film to CDN...");
      const featureData = await uploadToBunny(featureFile, `${formData.title} - Main Feature`, false);
      
      let trailerUrl = null;
      if (trailerFile) {
        setUploadStatusText("Transmitting Promotional Trailer...");
        const trailerData = await uploadToBunny(trailerFile, `${formData.title} - Trailer`, true);
        trailerUrl = trailerData.videoUrl;
      }

      setUploadStatusText("Syncing with Supabase Mainframe...");

      const generatedSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const { error } = await supabase.from('uuunivvr_films').insert([{
        title: formData.title,
        slug: generatedSlug,
        description: formData.description,
        production_house_name: studioInfo.name,
        production_house_logo: studioInfo.logo,
        cast_crew: formData.cast,
        movie_url: featureData.videoUrl, 
        trailer_url: trailerUrl || featureData.videoUrl, 
        poster_url: featureData.thumbnailUrl, 
        banner_url: featureData.thumbnailUrl
      }]);

      if (error) throw error;

      Swal.fire({
        icon: 'success', title: 'Distribution Successful', text: 'Your film is now streaming globally.',
        background: '#0a0a0a', color: '#ffffff', confirmButtonColor: '#dc2626'
      }).then(() => {
        window.location.href = `/film/${generatedSlug}`;
      });

    } catch (err: any) { // Explicitly typed error
      setIsUploading(false);
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message, background: '#0a0a0a', color: '#ffffff' });
    }
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Film className="text-red-600 animate-pulse" size={56} /></div>;
  if (!isAuthorized) return null;

  // --- UI: FULL SCREEN UPLOAD PROMPT ---
  if (!featureFile) {
    return (
      <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <button onClick={() => window.location.href='/dashboard'} className="absolute top-8 left-8 text-neutral-400 hover:text-white flex items-center gap-2 font-bold tracking-widest uppercase text-sm transition-colors z-20">
          <ChevronLeft size={20} /> Abort
        </button>
        
        <div className="absolute inset-0 bg-red-900/5 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="z-10 flex flex-col items-center text-center max-w-2xl">
          <ShieldCheck className="text-red-600 mb-6" size={64} />
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">UUUNIVVR Secure Distribution</h1>
          <p className="text-neutral-400 mb-10 text-sm md:text-base font-medium">Upload your master cinematic file. Only high-fidelity landscape video formats (.mp4, .mov) are accepted. Images, GIFs, and portrait orientations will be automatically rejected by the mainframe.</p>
          
          <input type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" ref={featureInputRef} onChange={handleFeatureUpload} />
          
          <button onClick={() => featureInputRef.current.click()} className="group relative bg-[#0a0a0a] border border-red-900/50 hover:border-red-500 w-full max-w-md h-64 rounded-2xl flex flex-col items-center justify-center transition-all shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div className="w-20 h-20 bg-red-950/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="text-red-500" size={32} />
            </div>
            <span className="text-white font-black tracking-widest uppercase text-lg">Select Master File</span>
            <span className="text-neutral-500 text-xs tracking-widest uppercase mt-2">Click anywhere to browse</span>
          </button>
        </div>
      </main>
    );
  }

  // --- UI: 50/50 SPLIT (File Selected, Fill Details) ---
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans">
      
      {/* LEFT SIDE: LIVE PREVIEW */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/5 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none"></div>
        
        {/* Main Video Preview */}
        <div className="w-full h-[60%] relative bg-black">
          <video src={previewVideoUrl} autoPlay loop muted className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        </div>

        {/* Live Data Render */}
        <div className="relative z-20 flex flex-col px-8 md:px-12 -mt-20 flex-grow overflow-y-auto custom-scrollbar pb-10">
          {studioInfo.isStaff && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-black overflow-hidden"><img src={studioInfo.logo} className="w-full h-full object-cover" /></div>
              <span className="text-xs text-red-500 font-black uppercase tracking-widest flex items-center gap-1">Zenteku Films <CheckCircle2 size={12}/></span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white drop-shadow-lg leading-none">
            {formData.title || "Film Title Placeholder"}
          </h1>
          <p className="text-neutral-400 text-sm md:text-base font-medium leading-relaxed max-w-lg mb-8 line-clamp-4">
            {formData.description || "The cinematic description of your masterpiece will appear here. Build intrigue."}
          </p>

          <div className="flex items-center gap-3 mb-8">
             <button className="bg-white text-black px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2"><Play size={14} fill="black"/> Watch</button>
          </div>

          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Cast & Crew</h3>
          <div className="flex flex-wrap gap-4">
            {formData.cast.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-[#111] p-2 pr-4 rounded-full border border-white/5">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 font-bold text-xs">
                  {c.name ? c.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{c.name || "Actor Name"}</span>
                  <span className="text-[9px] text-red-500 uppercase tracking-widest">{c.role || "Role"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: DATA ENTRY FORM */}
      <div className="w-full md:w-1/2 min-h-screen p-8 md:p-16 flex flex-col overflow-y-auto custom-scrollbar relative">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <Film className="text-red-600" /> Distribution Data
          </h2>
          <button onClick={() => window.location.href='/dashboard'} className="text-neutral-500 hover:text-white font-bold tracking-widest uppercase text-xs transition-colors bg-[#111] px-4 py-2 rounded">Exit</button>
        </div>

        <form className="flex flex-col gap-8 w-full max-w-xl mx-auto">
          
          {/* Locked Production House */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">Production House (Locked)</label>
            <div className="flex items-center gap-3 bg-[#111] border border-white/5 p-4 rounded-xl cursor-not-allowed opacity-80">
              {studioInfo.logo ? (
                <img src={studioInfo.logo} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center"><ShieldCheck size={16} className="text-red-500"/></div>
              )}
              <span className="text-white font-bold tracking-wide">{studioInfo.name}</span>
              {studioInfo.isStaff && <CheckCircle2 size={16} className="text-blue-500 ml-auto" />}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">Master Title</label>
            <input type="text" placeholder="e.g. Udaan: A Journey to Server" className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-red-600 outline-none transition-colors shadow-inner text-lg font-bold" value={formData.title} onChange={(e: any) => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">Cinematic Synopsis</label>
            <textarea rows={4} placeholder="Describe the plot..." className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-red-600 outline-none transition-colors shadow-inner resize-none" value={formData.description} onChange={(e: any) => setFormData({...formData, description: e.target.value})} />
          </div>

          {/* Trailer Upload (Max 60s) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">Promotional Trailer (Max 60s)</label>
              {previewTrailerUrl && <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10}/> Attached</span>}
            </div>
            <input type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" ref={trailerInputRef} onChange={handleTrailerUpload} />
            <button type="button" onClick={() => trailerInputRef.current.click()} className="bg-[#0a0a0a] border border-white/10 border-dashed hover:border-red-500 rounded-xl p-6 text-white transition-colors flex flex-col items-center justify-center gap-2">
              <UploadCloud size={24} className={previewTrailerUrl ? "text-green-500" : "text-neutral-500"} />
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{previewTrailerUrl ? "Replace Trailer" : "Upload Trailer File"}</span>
            </button>
          </div>

          {/* Dynamic Cast Array */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <label className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">Cast & Crew Roster</label>
              <button type="button" onClick={addCastMember} className="text-red-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><Plus size={12}/> Add Member</button>
            </div>
            
            {formData.cast.map((member: any, index: number) => (
              <div key={index} className="flex items-center gap-3 bg-[#0a0a0a] p-2 rounded-xl border border-white/5">
                <input type="text" placeholder="Full Name" className="bg-transparent border-none text-white text-sm outline-none flex-1 px-2" value={member.name} onChange={(e: any) => handleCastChange(index, "name", e.target.value)} />
                <div className="w-px h-6 bg-white/10"></div>
                <input type="text" placeholder="Role / Character" className="bg-transparent border-none text-white text-sm outline-none flex-1 px-2" value={member.role} onChange={(e: any) => handleCastChange(index, "role", e.target.value)} />
                {index > 0 && (
                  <button type="button" onClick={() => removeCastMember(index)} className="text-neutral-600 hover:text-red-500 p-2 transition-colors"><X size={16}/></button>
                )}
              </div>
            ))}
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-4 bg-red-950/20 border border-red-900/30 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
              <span className="text-red-400 font-bold uppercase tracking-widest">Copyright Notice:</span> Ensure all audio, visual, and narrative elements belong to your studio. Fraudulent claims or copyright strikes will result in immediate termination of the Production House account. <br/>
              <button type="button" onClick={() => window.location.href='/rules'} className="text-white hover:text-red-400 font-bold underline mt-1 transition-colors">Review Terms of Service</button>
            </p>
          </div>

          {/* Submit Action */}
          <div className="mt-4 pb-12">
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isUploading}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-5 rounded-xl transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-wait relative overflow-hidden"
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center gap-1 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{uploadStatusText}</span>
                  </div>
                  <span className="text-[10px] opacity-80">{uploadProgress}% Complete</span>
                </div>
              ) : (
                <span className="relative z-10">Push to Mainframe</span>
              )}
              
              {/* Progress Bar Background */}
              {isUploading && (
                <div className="absolute top-0 left-0 h-full bg-red-900/50 transition-all duration-200 ease-out" style={{ width: `${uploadProgress}%` }}></div>
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

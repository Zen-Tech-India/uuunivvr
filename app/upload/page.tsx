"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, Film, AlertTriangle, ChevronLeft, 
  Play, Plus, X, User, CheckCircle2, ShieldCheck, 
  Info, ShieldAlert, Edit3, Loader2, Image as ImageIcon
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

  // Upload States - Typed with <any>
  const [featureFile, setFeatureFile] = useState<any>(null);
  const [trailerFile, setTrailerFile] = useState<any>(null);
  const [thumbnailFile, setThumbnailFile] = useState<any>(null);

  const [previewVideoUrl, setPreviewVideoUrl] = useState<any>(null);
  const [previewTrailerUrl, setPreviewTrailerUrl] = useState<any>(null);
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<any>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editingFilmId, setEditingFilmId] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studioFilms, setStudioFilms] = useState<any[]>([]);
  const [isLoadingFilms, setIsLoadingFilms] = useState(false);
  
  // Storage for existing URLs
  const [existingFeatureUrl, setExistingFeatureUrl] = useState<any>(null);
  const [existingTrailerUrl, setExistingTrailerUrl] = useState<any>(null);
  const [existingPosterUrl, setExistingPosterUrl] = useState<any>(null);

  // Refs
  const featureInputRef = useRef<any>(null);
  const trailerInputRef = useRef<any>(null);
  const thumbnailInputRef = useRef<any>(null);

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

  // --- 1.5. FETCH FILMS FOR EDIT MODAL ---
  useEffect(() => {
    if (showEditModal && studioInfo.name) {
      const fetchFilms = async () => {
        setIsLoadingFilms(true);
        const { data, error } = await supabase
          .from('uuunivvr_films')
          .select('*')
          .eq('production_house_name', studioInfo.name);

        if (data && !error) {
          setStudioFilms(data);
        }
        setIsLoadingFilms(false);
      };
      fetchFilms();
    }
  }, [showEditModal, studioInfo.name]);

  // --- 2. VALIDATION & HANDLERS ---
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

  const handleThumbnailUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        Swal.fire({ icon: 'error', title: 'Invalid Format', text: 'Only PNG, JPG, and JPEG files are allowed for posters.', background: '#0a0a0a', color: '#ffffff' });
        e.target.value = null;
        return;
      }
      setThumbnailFile(file);
      setPreviewThumbnailUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectFilmToEdit = (film: any) => {
    setIsEditing(true);
    setEditingFilmId(film.id);
    setFormData({
      title: film.title || "",
      description: film.description || "",
      cast: (film.cast_crew && film.cast_crew.length > 0) ? film.cast_crew : [{ name: "", role: "" }]
    });
    setPreviewVideoUrl(film.movie_url);
    setPreviewTrailerUrl(film.trailer_url !== film.movie_url ? film.trailer_url : null);
    setPreviewThumbnailUrl(film.poster_url);
    
    setExistingFeatureUrl(film.movie_url);
    setExistingTrailerUrl(film.trailer_url);
    setExistingPosterUrl(film.poster_url);
    
    setShowEditModal(false);
  };

  const resetState = () => window.location.reload();

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

  // --- 3. UPLOAD LOGIC (BUNNY CDN & SUPABASE STORAGE) ---
  const uploadToBunny = async (file: any, title: string, isTrailer = false) => {
    if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) throw new Error("Bunny.net API keys are missing.");

    const createRes = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
      method: 'POST',
      headers: { 'AccessKey': BUNNY_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
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

  const uploadThumbnailToSupabase = async (file: any) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `posters/${fileName}`;
    
    const { error } = await supabase.storage.from('film_assets').upload(filePath, file);
    if (error) throw new Error("Failed to upload poster image to storage.");
    
    const { data } = supabase.storage.from('film_assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // --- 4. MASTER SUBMIT ---
  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      return Swal.fire({ icon: 'error', title: 'Missing Details', text: 'Film Title and Description are required.', background: '#0a0a0a', color: '#ffffff' });
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let finalFeatureUrl = existingFeatureUrl;
      let finalTrailerUrl = existingTrailerUrl;
      let finalPosterUrl = existingPosterUrl;

      // 1. Upload Custom Thumbnail (Highest Priority for Poster)
      if (thumbnailFile) {
        setUploadStatusText("Transmitting Poster Art...");
        finalPosterUrl = await uploadThumbnailToSupabase(thumbnailFile);
      }

      // 2. Upload Main Feature
      if (featureFile) {
        setUploadStatusText("Transmitting Master Film to CDN...");
        const featureData = await uploadToBunny(featureFile, `${formData.title} - Main Feature`, false);
        finalFeatureUrl = featureData.videoUrl;
        
        // Fallback to Bunny thumbnail ONLY if no custom thumbnail exists and wasn't just uploaded
        if (!finalPosterUrl) {
          finalPosterUrl = featureData.thumbnailUrl;
        }
      }

      // 3. Upload Trailer
      if (trailerFile) {
        setUploadStatusText("Transmitting Promotional Trailer...");
        const trailerData = await uploadToBunny(trailerFile, `${formData.title} - Trailer`, true);
        finalTrailerUrl = trailerData.videoUrl;
      }

      setUploadStatusText("Syncing with Supabase Mainframe...");
      const generatedSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      if (isEditing) {
        const { error } = await supabase.from('uuunivvr_films').update({
          title: formData.title,
          slug: generatedSlug,
          description: formData.description,
          cast_crew: formData.cast,
          movie_url: finalFeatureUrl, 
          trailer_url: finalTrailerUrl || finalFeatureUrl, 
          poster_url: finalPosterUrl, 
          banner_url: finalPosterUrl
        }).eq('id', editingFilmId);

        if (error) throw error;

        Swal.fire({
          icon: 'success', title: 'Update Successful', text: 'Your masterpiece details have been updated.',
          background: '#0a0a0a', color: '#ffffff', confirmButtonColor: '#dc2626'
        }).then(() => window.location.href = `/film/${generatedSlug}`);

      } else {
        const { error } = await supabase.from('uuunivvr_films').insert([{
          title: formData.title,
          slug: generatedSlug,
          description: formData.description,
          production_house_name: studioInfo.name,
          production_house_logo: studioInfo.logo,
          cast_crew: formData.cast,
          movie_url: finalFeatureUrl, 
          trailer_url: finalTrailerUrl || finalFeatureUrl, 
          poster_url: finalPosterUrl, 
          banner_url: finalPosterUrl
        }]);

        if (error) throw error;

        Swal.fire({
          icon: 'success', title: 'Distribution Successful', text: 'Your film is now streaming globally.',
          background: '#0a0a0a', color: '#ffffff', confirmButtonColor: '#dc2626'
        }).then(() => window.location.href = `/film/${generatedSlug}`);
      }

    } catch (err: any) { 
      setIsUploading(false);
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message, background: '#0a0a0a', color: '#ffffff' });
    }
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Film className="text-red-600 animate-pulse" size={56} /></div>;
  if (!isAuthorized) return null;

  // --- UI: FULL SCREEN UPLOAD OR EDIT PROMPT ---
  if (!featureFile && !isEditing) {
    return (
      <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <button onClick={() => window.location.href='/dashboard'} className="absolute top-8 left-8 text-neutral-400 hover:text-white flex items-center gap-2 font-bold tracking-widest uppercase text-sm transition-colors z-20">
          <ChevronLeft size={20} /> Abort
        </button>
        
        <div className="absolute inset-0 bg-red-900/5 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="z-10 flex flex-col items-center text-center max-w-4xl w-full">
          <ShieldCheck className="text-red-600 mb-6" size={64} />
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">UUUNIVVR Secure Distribution</h1>
          <p className="text-neutral-400 mb-10 text-sm md:text-base font-medium max-w-2xl">Upload your master cinematic file or modify an existing masterpiece. Only high-fidelity landscape video formats (.mp4, .mov) are accepted by the mainframe.</p>
          
          <input type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" ref={featureInputRef} onChange={handleFeatureUpload} />
          
          <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
            {/* UPLOAD NEW BUTTON */}
            <button onClick={() => featureInputRef.current.click()} className="group relative bg-[#0a0a0a] border border-red-900/50 hover:border-red-500 w-full max-w-sm h-64 rounded-2xl flex flex-col items-center justify-center transition-all shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:shadow-[0_0_50px_rgba(220,38,38,0.2)]">
              <div className="w-20 h-20 bg-red-950/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="text-red-500" size={32} />
              </div>
              <span className="text-white font-black tracking-widest uppercase text-lg">New Master File</span>
              <span className="text-neutral-500 text-xs tracking-widest uppercase mt-2">Publish a new film</span>
            </button>

            {/* EDIT EXISTING BUTTON */}
            <button onClick={() => setShowEditModal(true)} className="group relative bg-[#0a0a0a] border border-white/10 hover:border-red-500/50 w-full max-w-sm h-64 rounded-2xl flex flex-col items-center justify-center transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.1)]">
              <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Edit3 className="text-red-500" size={32} />
              </div>
              <span className="text-white font-black tracking-widest uppercase text-lg">Edit Existing Film</span>
              <span className="text-neutral-500 text-xs tracking-widest uppercase mt-2">Modify details & assets</span>
            </button>
          </div>
        </div>

        {/* MODAL FOR SELECTING A FILM TO EDIT */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a0a] border border-red-900/30 w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden max-h-[80vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Select Title to Edit</h2>
                <button onClick={() => setShowEditModal(false)} className="text-neutral-500 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                {isLoadingFilms ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-500">
                    <Loader2 size={32} className="animate-spin text-red-600" />
                    <span className="text-sm font-bold tracking-widest uppercase text-red-500/80">Fetching Vault Records...</span>
                  </div>
                ) : studioFilms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-500">
                    <Film size={32} />
                    <span className="text-sm font-bold tracking-widest uppercase">No films found in your vault.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studioFilms.map((film) => (
                      <button 
                        key={film.id} 
                        onClick={() => handleSelectFilmToEdit(film)}
                        className="bg-[#111] hover:bg-[#1a1a1a] border border-white/5 hover:border-red-500/50 p-4 rounded-xl flex items-center gap-4 transition-all text-left"
                      >
                        <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0">
                          {film.poster_url ? (
                            <img src={film.poster_url} className="w-full h-full object-cover" alt={film.title}/>
                          ) : (
                            <Film className="w-full h-full p-4 text-neutral-700" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold line-clamp-1">{film.title}</span>
                          <span className="text-[10px] text-red-500 uppercase tracking-widest mt-1">Click to Modify</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // --- UI: 50/50 SPLIT (File Selected or Editing Mode) ---
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
             <button className="bg-red-700 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-colors"><Play size={14} fill="currentColor"/> Watch</button>
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
            {isEditing ? <Edit3 className="text-red-600" /> : <Film className="text-red-600" />} 
            {isEditing ? "Modify Data" : "Distribution Data"}
          </h2>
          <button onClick={resetState} className="text-neutral-500 hover:text-red-500 font-bold tracking-widest uppercase text-xs transition-colors bg-[#111] px-4 py-2 rounded">
            {isEditing ? "Cancel Edit" : "Exit"}
          </button>
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
              {studioInfo.isStaff && <CheckCircle2 size={16} className="text-red-500 ml-auto" />}
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

          {/* Thumbnail / Poster Upload */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">Cinematic Poster / Banner (PNG, JPG)</label>
              {previewThumbnailUrl && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10}/> Attached</span>}
            </div>
            <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" ref={thumbnailInputRef} onChange={handleThumbnailUpload} />
            <button type="button" onClick={() => thumbnailInputRef.current.click()} className="bg-[#0a0a0a] border border-white/10 border-dashed hover:border-red-500 rounded-xl p-6 text-white transition-colors flex flex-col items-center justify-center gap-2 relative overflow-hidden min-h-[120px]">
              {previewThumbnailUrl ? (
                <>
                  <div className="absolute inset-0 opacity-30"><img src={previewThumbnailUrl} className="w-full h-full object-cover blur-sm"/></div>
                  <ImageIcon size={24} className="text-white relative z-10" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest relative z-10">Replace Poster Art</span>
                </>
              ) : (
                <>
                  <ImageIcon size={24} className="text-neutral-500" />
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Upload Custom Poster</span>
                </>
              )}
            </button>
          </div>

          {/* Feature File Replace (Only visible in EDIT mode) */}
          {isEditing && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">Main Feature Film (Optional Replacement)</label>
              <input type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" ref={featureInputRef} onChange={handleFeatureUpload} />
              <button type="button" onClick={() => featureInputRef.current.click()} className="bg-[#0a0a0a] border border-white/10 border-dashed hover:border-red-500 rounded-xl p-6 text-white transition-colors flex flex-col items-center justify-center gap-2">
                <UploadCloud size={24} className={featureFile ? "text-red-500" : "text-neutral-500"} />
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  {featureFile ? "New Master File Queued" : "Replace Existing Master File"}
                </span>
              </button>
            </div>
          )}

          {/* Trailer Upload (Max 60s) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">Promotional Trailer (Max 60s)</label>
              {previewTrailerUrl && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10}/> Attached</span>}
            </div>
            <input type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" ref={trailerInputRef} onChange={handleTrailerUpload} />
            <button type="button" onClick={() => trailerInputRef.current.click()} className="bg-[#0a0a0a] border border-white/10 border-dashed hover:border-red-500 rounded-xl p-6 text-white transition-colors flex flex-col items-center justify-center gap-2">
              <UploadCloud size={24} className={previewTrailerUrl ? "text-white" : "text-neutral-500"} />
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                {previewTrailerUrl ? (isEditing ? "Replace Current Trailer" : "Replace Trailer") : "Upload Trailer File"}
              </span>
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
              className={`w-full text-white font-black py-5 rounded-xl transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-wait relative overflow-hidden bg-red-700 hover:bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center gap-1 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{uploadStatusText}</span>
                  </div>
                  {(featureFile || trailerFile) && <span className="text-[10px] opacity-80">{uploadProgress}% Complete</span>}
                </div>
              ) : (
                <span className="relative z-10">{isEditing ? "Update Mainframe" : "Push to Mainframe"}</span>
              )}
              
              {/* Progress Bar Background */}
              {isUploading && (featureFile || trailerFile) && (
                <div className="absolute top-0 left-0 h-full transition-all duration-200 ease-out bg-red-950/80" style={{ width: `${uploadProgress}%` }}></div>
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Phone, Camera, Upload,
    RefreshCw, CheckCircle2, X, Edit3, Save,
    Activity, Wallet, Code2, Calendar, Fingerprint, Copy, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { useCustomer } from "../hooks/useCustomer";
import Navbar from "./Navbar"; // ← reusable navbar

const showToast = (msg, type = "info") =>
    toast.custom((t) => (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#0a0a0a", color: "#fff", fontFamily: "Urbanist, sans-serif",
            fontSize: "13px", padding: "12px 16px", borderRadius: "16px",
            boxShadow: type === "success"
                ? "0 0 0 1px rgba(255,59,142,0.3), 0 8px 32px rgba(255,59,142,0.12)"
                : type === "error"
                    ? "0 0 0 1px rgba(239,68,68,0.3), 0 8px 32px rgba(239,68,68,0.12)"
                    : "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)",
            maxWidth: "360px", opacity: t.visible ? 1 : 0,
            transform: t.visible ? "translateY(0)" : "translateY(-8px)", transition: "all 0.2s ease",
        }}>
            {type === "success" && (
                <span style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#FF3B8E", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                }}>
                    <CheckCircle2 size={12} color="#fff" strokeWidth={3} />
                </span>
            )}
            <span style={{ flex: 1 }}>{msg}</span>
            <button onClick={() => toast.dismiss(t.id)} style={{
                background: "none", border: "none", color: "#888",
                cursor: "pointer", padding: "2px", display: "flex",
            }}><X size={13} /></button>
        </div>
    ), { duration: 3000 });

// ─── Avatar Picker ────────────────────────────────────────────────────────────
function AvatarPicker({ value, onChange }) {
    const fileRef   = useRef();
    const videoRef  = useRef();
    const canvasRef = useRef();
    const streamRef = useRef(null);
    const [mode,  setMode]  = useState("idle");
    const [error, setError] = useState("");

    const startCamera = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
            streamRef.current = stream; setMode("camera");
            setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } }, 100);
        } catch { setError("Camera access denied."); }
    };
    const stopCamera = () => {
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        setMode("idle");
    };
    const capture = () => {
        const v = videoRef.current, c = canvasRef.current; if (!v || !c) return;
        c.width = v.videoWidth || 320; c.height = v.videoHeight || 240;
        c.getContext("2d").drawImage(v, 0, 0);
        onChange(c.toDataURL("image/jpeg", 0.85)); stopCamera(); setMode("preview");
    };
    const handleFile = (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!file.type.startsWith("image/")) { setError("Please select an image."); return; }
        if (file.size > 5 * 1024 * 1024) { setError("Max 5MB allowed."); return; }
        const r = new FileReader();
        r.onload = (ev) => { onChange(ev.target.result); setMode("preview"); };
        r.readAsDataURL(file);
    };
    const reset = () => { onChange(null); setMode("idle"); stopCamera(); setError(""); };

    if (mode === "preview" && value) {
        return (
            <div className="flex items-center gap-4">
                <div className="relative">
                    <img src={value} alt="avatar" className="w-20 h-20 rounded-2xl object-cover border-2"
                        style={{ borderColor: "rgba(255,59,142,0.4)" }} />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: "linear-gradient(135deg, #FF3B8E, #8E44AD)" }}>
                        <CheckCircle2 size={12} color="#fff" strokeWidth={3} />
                    </div>
                </div>
                <div>
                    <p className="text-sm font-black text-white mb-1">Photo ready!</p>
                    <button onClick={reset} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors">
                        <RefreshCw size={10} /> Change photo
                    </button>
                </div>
            </div>
        );
    }

    if (mode === "camera") {
        return (
            <div className="rounded-2xl overflow-hidden relative" style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-44 object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    <button onClick={capture}
                        className="flex items-center gap-1.5 font-black text-xs px-4 py-2 rounded-full text-white shadow-lg"
                        style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}>
                        <Camera size={12} /> Capture
                    </button>
                    <button onClick={stopCamera}
                        className="flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-full text-red-400"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <X size={12} /> Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-3">
            <button type="button" onClick={() => fileRef.current?.click()}
                className="group flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all"
                style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,59,142,0.25)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)" }}>
                    <Upload size={15} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                    <p className="text-xs font-black text-slate-400 group-hover:text-white transition-colors">Upload</p>
                    <p className="text-[9px] text-slate-600">JPG, PNG</p>
                </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button type="button" onClick={startCamera}
                className="group flex items-center gap-3 flex-1 p-3 rounded-2xl transition-all"
                style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,59,142,0.25)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)" }}>
                    <Camera size={15} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                    <p className="text-xs font-black text-slate-400 group-hover:text-white transition-colors">Camera</p>
                    <p className="text-[9px] text-slate-600">Take selfie</p>
                </div>
            </button>
            {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
        </div>
    );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function Profile() {
    const navigate = useNavigate();
    const { fetchUserProfile, updateUserProfile } = useCustomer();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const isAdmin    = storedUser?.role === "admin";

    const [profile,  setProfile]  = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [avatar,   setAvatar]   = useState(null);
    const [form,     setForm]     = useState({ name: "", email: "", phone: "", client_id: "" });

    useEffect(() => {
        if (!storedUser) { navigate("/login"); return; }
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await fetchUserProfile(storedUser.id || storedUser._id);
            setProfile(data);
            setForm({
                name:      data.name || "",
                email:     data.email || "",
                phone:     data.phone || "",
                client_id: data.client_id || (isAdmin ? "SYSTEM_ADMIN" : "PENDING"),
            });
            if (data.avatar) setAvatar(data.avatar);
        } catch {
            setProfile(storedUser);
            setForm({
                name:      storedUser.name || "",
                email:     storedUser.email || "",
                phone:     storedUser.phone || "",
                client_id: storedUser.client_id || "N/A",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (form.phone.length !== 10) {
            showToast("Phone number must be exactly 10 digits!", "error");
            return;
        }
        try {
            setSaving(true);
            const res = await updateUserProfile(storedUser.id || storedUser._id, {
                name:   form.name,
                phone:  form.phone,
                avatar: avatar || profile?.avatar || null,
            });
            const updated = res.data || res;
            setProfile(updated);
            localStorage.setItem("user", JSON.stringify({ ...storedUser, ...updated }));
            setEditMode(false);
            showToast("Profile updated!", "success");
        } catch {
            showToast("Update failed!", "error");
        } finally {
            setSaving(false);
        }
    };

    const copyId = () => {
        navigator.clipboard.writeText(form.client_id);
        showToast("ID Copied", "success");
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const initials = profile?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const joinDate  = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
        : "—";

    const stats = isAdmin ? [
        { icon: <ShieldCheck size={16} />, label: "Access Level", value: "Full Admin", color: "#FF3B8E",  glow: "rgba(255,59,142,0.12)" },
        { icon: <Calendar size={16} />,    label: "Joined On",    value: joinDate,     color: "#A78BFA",  glow: "rgba(167,139,250,0.12)" },
    ] : [
        { icon: <Activity size={16} />, label: "API Calls", value: profile?.totalApiCalls || 0,          color: "#FF3B8E", glow: "rgba(255,59,142,0.12)" },
        { icon: <Wallet size={16} />,   label: "Balance",   value: `₹${profile?.balance || 0}`,          color: "#A78BFA", glow: "rgba(167,139,250,0.12)" },
        { icon: <Code2 size={16} />,    label: "APIs Used", value: profile?.selectedApis?.length || 0,   color: "#818CF8", glow: "rgba(99,102,241,0.12)" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-x-hidden">

            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            {/* ─── REUSABLE NAVBAR ─── */}
            <Navbar
                showBack
                badge="Profile"
                badgeIcon={<User size={12} />}
                onLogout={handleLogout}
            />

            <main className="relative z-10 max-w-2xl mx-auto px-6 pt-24 pb-16">
                {loading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="w-8 h-8 border-2 border-white/5 border-t-[#FF3B8E] rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-5">

                        {/* ─── Profile Card ─── */}
                        <div className="rounded-[2rem] p-7"
                            style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.07)" }}>

                            {/* Header */}
                            <div className="flex items-start justify-between mb-8 pb-6"
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        {avatar || profile?.avatar ? (
                                            <img src={avatar || profile?.avatar} alt="pfp"
                                                className="w-20 h-20 rounded-2xl object-cover border-2 shadow-xl"
                                                style={{ borderColor: "rgba(255,59,142,0.3)" }} />
                                        ) : (
                                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                                style={{ background: "rgba(255,59,142,0.08)", border: "2px dashed rgba(255,59,142,0.2)" }}>
                                                <span className="text-2xl font-black text-[#FF3B8E]">{initials}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 rounded-2xl pointer-events-none"
                                            style={{ boxShadow: "0 0 20px rgba(255,59,142,0.15)" }} />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black text-white mb-1">{profile?.name}</h1>
                                        <p className="text-sm text-slate-500 mb-2" style={{ fontFamily: "monospace" }}>{profile?.email}</p>
                                        <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase"
                                            style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.25)", color: "#FF3B8E" }}>
                                            {profile?.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Edit / Save button */}
                                <button onClick={() => editMode ? handleSave() : setEditMode(true)} disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase transition-all active:scale-95"
                                    style={editMode
                                        ? { background: "linear-gradient(to right, #FF3B8E, #8E44AD)", color: "#fff", boxShadow: "0 4px 16px rgba(255,59,142,0.2)" }
                                        : { border: "1px solid rgba(255,59,142,0.3)", color: "#FF3B8E", background: "rgba(255,59,142,0.06)" }}>
                                    {saving ? "..." : editMode ? <><Save size={13} /> Save</> : <><Edit3 size={13} /> Edit</>}
                                </button>
                            </div>

                            {/* Stats */}
                            <div className={`grid grid-cols-${stats.length} gap-3 mb-8`}>
                                {stats.map((s, i) => (
                                    <div key={i} className="rounded-2xl p-4 group relative overflow-hidden transition-all"
                                        style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.05)" }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = `${s.color}30`}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}>
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                                            style={{ background: s.glow, border: `1px solid ${s.color}30` }}>
                                            <span style={{ color: s.color }}>{s.icon}</span>
                                        </div>
                                        <p className="text-lg font-black mb-0.5" style={{ color: s.color }}>{s.value}</p>
                                        <p className="text-[9px] text-slate-600 uppercase font-bold tracking-wider">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Form */}
                            <div className="space-y-5">

                                {/* Avatar picker in edit mode */}
                                {editMode && (
                                    <div className="pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-3">Update Photo</label>
                                        <AvatarPicker value={avatar} onChange={setAvatar} />
                                    </div>
                                )}

                                {/* Unique ID */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Unique ID</label>
                                    <div className="relative group">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <input type="text" value={form.client_id} disabled
                                            className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-sm text-slate-600 outline-none"
                                            style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "monospace" }} />
                                        <button onClick={copyId}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#FF3B8E] transition-colors">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <input type="text" value={form.name} disabled={!editMode}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all"
                                            style={{
                                                background: editMode ? "#080808" : "transparent",
                                                border: editMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.05)",
                                                color: editMode ? "#fff" : "#64748b",
                                                fontFamily: "monospace",
                                            }}
                                            onFocus={e => { if (editMode) e.target.style.borderColor = "rgba(255,59,142,0.4)"; }}
                                            onBlur={e => { if (editMode) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <input type="tel" value={form.phone} disabled={!editMode} maxLength={10}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, "");
                                                setForm({ ...form, phone: value });
                                            }}
                                            placeholder="10-digit number"
                                            className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all placeholder-slate-700"
                                            style={{
                                                background: editMode ? "#080808" : "transparent",
                                                border: editMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.05)",
                                                color: editMode ? "#fff" : "#64748b",
                                                fontFamily: "monospace",
                                            }}
                                            onFocus={e => { if (editMode) e.target.style.borderColor = "rgba(255,59,142,0.4)"; }}
                                            onBlur={e => { if (editMode) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                                        />
                                    </div>
                                    {editMode && form.phone.length > 0 && form.phone.length < 10 && (
                                        <p className="text-[9px] text-red-400 font-bold uppercase mt-1">
                                            Must be 10 digits (Current: {form.phone.length})
                                        </p>
                                    )}
                                </div>

                                {/* Cancel */}
                                {editMode && (
                                    <button
                                        onClick={() => { setEditMode(false); setAvatar(null); loadProfile(); }}
                                        className="w-full py-3 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all rounded-2xl"
                                        style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                                        Cancel Changes
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; }
                code, input, textarea { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
            `}</style>
        </div>
    );
}
/* eslint-disable react-hooks/purity */
/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    User, Mail, Lock, Phone, Zap, CheckCircle2, X,
    Eye, EyeOff, Rocket, Camera, Upload, RefreshCw
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// ─── Toast System ─────────────────────────────────────────────────────────────
const mkToast = (msg, shadow, iconBg) =>
    toast.custom((t) => (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#0d0d0d", color: "#fff", fontFamily: "Urbanist, sans-serif",
            fontSize: "13px", padding: "12px 16px", borderRadius: "16px",
            boxShadow: shadow, maxWidth: "400px",
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? "translateY(0)" : "translateY(-8px)",
            transition: "all 0.2s ease",
        }}>
            {iconBg && (
                <span style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: iconBg, display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0, color: "#fff",
                    fontWeight: "900", fontSize: "11px"
                }}>✓</span>
            )}
            <span style={{ flex: 1 }}>{msg}</span>
            <button onClick={() => toast.dismiss(t.id)} style={{
                background: "none", border: "none", color: "#888",
                cursor: "pointer", padding: "2px", display: "flex",
                alignItems: "center", flexShrink: 0
            }}><X size={13} /></button>
        </div>
    ), { duration: 3500 });

const successToast = (msg) => mkToast(msg, "0 0 0 1px #FF3B8E55, 0 8px 32px rgba(255,59,142,0.15)", "#FF3B8E");
const errorToast   = (msg) => mkToast(msg, "0 0 0 1px #ff4b4b55, 0 8px 32px rgba(255,75,75,0.12)", null);
const loadingToast = (msg) => toast.custom((t) => (
    <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: "#0d0d0d", color: "#fff", fontFamily: "Urbanist, sans-serif",
        fontSize: "13px", padding: "12px 16px", borderRadius: "16px",
        boxShadow: "0 0 0 1px #FF3B8E33, 0 8px 32px rgba(0,0,0,0.5)",
        maxWidth: "400px", opacity: t.visible ? 1 : 0, transition: "opacity 0.2s"
    }}>
        <div style={{
            width: "16px", height: "16px", border: "2px solid #333",
            borderTop: "2px solid #FF3B8E", borderRadius: "50%", flexShrink: 0,
            animation: "spin 0.7s linear infinite"
        }} />
        <span style={{ flex: 1 }}>{msg}</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
), { duration: Infinity, id: "loading-toast" });

// ─── Password Strength ────────────────────────────────────────────────────────
function getStrength(p) {
    if (!p) return { score: 0, label: "", color: "" };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const l = [
        { label: "",            color: "" },
        { label: "Very Weak",   color: "#ef4444" },
        { label: "Weak",        color: "#f97316" },
        { label: "Fair",        color: "#eab308" },
        { label: "Strong",      color: "#FF3B8E" },
        { label: "Very Strong", color: "#A78BFA" },
    ];
    return { score: s, ...l[s] };
}

const validatePassword = (p) => {
    if (!p)                       return "Password is required";
    if (p.length < 8)             return "Min 8 characters required";
    if (!/[A-Z]/.test(p))         return "At least 1 capital letter";
    if (!/[a-z]/.test(p))         return "At least 1 small letter";
    if (!/[0-9]/.test(p))         return "At least 1 number";
    if (!/[^A-Za-z0-9]/.test(p))  return "At least 1 special character";
    return "";
};

function PasswordReqs({ password }) {
    const reqs = [
        { label: "8+ characters",   met: password.length >= 8 },
        { label: "Capital (A–Z)",   met: /[A-Z]/.test(password) },
        { label: "Lowercase (a–z)", met: /[a-z]/.test(password) },
        { label: "Number (0–9)",    met: /[0-9]/.test(password) },
        { label: "Special char",    met: /[^A-Za-z0-9]/.test(password) },
    ];
    if (!password) return null;
    return (
        <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl mt-1"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {reqs.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                            background: r.met ? "rgba(255,59,142,0.15)" : "transparent",
                            border: `1px solid ${r.met ? "#FF3B8E" : "rgba(255,255,255,0.1)"}`,
                        }}>
                        <span style={{ fontSize: "7px", color: r.met ? "#FF3B8E" : "#374151", fontWeight: 900 }}>
                            {r.met ? "✓" : "·"}
                        </span>
                    </div>
                    <span className="text-[10px] transition-colors"
                        style={{ color: r.met ? "#FF3B8E" : "#374151" }}>
                        {r.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

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
            streamRef.current = stream;
            setMode("camera");
            setTimeout(() => {
                if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
            }, 100);
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
        onChange(c.toDataURL("image/jpeg", 0.85));
        stopCamera(); setMode("preview");
    };

    const handleFile = (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!file.type.startsWith("image/")) { setError("Please select an image."); return; }
        if (file.size > 5 * 1024 * 1024)    { setError("Max 5MB allowed."); return; }
        const r = new FileReader();
        r.onload = (ev) => { onChange(ev.target.result); setMode("preview"); };
        r.readAsDataURL(file);
    };

    const reset = () => { onChange(null); setMode("idle"); stopCamera(); setError(""); };

    if (mode === "preview" && value) {
        return (
            <div className="flex items-center gap-4 p-3 rounded-2xl"
                style={{ background: "rgba(255,59,142,0.05)", border: "1px solid rgba(255,59,142,0.2)" }}>
                <div className="relative flex-shrink-0">
                    <img src={value} alt="avatar" className="w-14 h-14 rounded-xl object-cover border-2"
                        style={{ borderColor: "rgba(255,59,142,0.4)" }} />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: "linear-gradient(135deg, #FF3B8E, #8E44AD)" }}>
                        <CheckCircle2 size={10} color="#fff" strokeWidth={3} />
                    </div>
                </div>
                <div>
                    <p className="text-xs font-black text-white mb-1">Photo ready!</p>
                    <button onClick={reset}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors">
                        <RefreshCw size={9} /> Change photo
                    </button>
                </div>
            </div>
        );
    }

    if (mode === "camera") {
        return (
            <div className="rounded-2xl overflow-hidden relative"
                style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-40 object-cover" />
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
        <div>
            <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => fileRef.current?.click()}
                    className="group flex items-center gap-3 p-3 rounded-2xl transition-all"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,59,142,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        <Upload size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-black text-slate-400 group-hover:text-white transition-colors">Upload</p>
                        <p className="text-[9px] text-slate-600">JPG, PNG</p>
                    </div>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

                <button type="button" onClick={startCamera}
                    className="group flex items-center gap-3 p-3 rounded-2xl transition-all"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,59,142,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        <Camera size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-black text-slate-400 group-hover:text-white transition-colors">Camera</p>
                        <p className="text-[9px] text-slate-600">Take selfie</p>
                    </div>
                </button>
            </div>
            {error && <p className="text-[10px] text-red-400 mt-1.5">⚠ {error}</p>}
        </div>
    );
}

// ─── Main Register Page ───────────────────────────────────────────────────────
export default function Register() {
    const navigate            = useNavigate();
    const { register, loading } = useAuth();

    const [form,        setForm]        = useState({ name:"", email:"", phone:"", password:"", confirm:"" });
    const [avatar,      setAvatar]      = useState(null);
    const [showPass,    setShowPass]    = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors,      setErrors]      = useState({});
    const [focused,     setFocused]     = useState("");

    const strength = getStrength(form.password);

    // ✅ Password valid hai ki nahi
    const isPasswordValid = validatePassword(form.password) === "";

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "email"    && value.length > 80) return;
        if ((name === "password" || name === "confirm") && value.length > 18) return;
        if (name === "phone"    && (!/^\d*$/.test(value) || value.length > 10)) return;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = {};

        if (!form.name.trim())  e2.name  = "Full name is required";
        if (!form.email.trim()) e2.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e2.email = "Invalid email format";
        if (!form.phone.trim()) e2.phone = "Phone number is required";
        else if (form.phone.length !== 10) e2.phone = "Enter valid 10-digit number";

        const pe = validatePassword(form.password);
        if (pe) e2.password = pe;

        if (!form.confirm) e2.confirm = "Please confirm your password";
        else if (form.password !== form.confirm) e2.confirm = "Passwords do not match";

        if (Object.keys(e2).length > 0) {
            setErrors(e2);
            // ✅ Pehli error toast me dikhao — specific error
            const firstError = Object.values(e2)[0];
            errorToast(firstError);
            return;
        }

        loadingToast("Creating your workspace...");
        try {
            await register({
                name:             form.name,
                email:            form.email,
                password:         form.password,
                confirm_password: form.confirm,
                phone:            form.phone,
                avatar:           avatar || null,
            });
            toast.dismiss("loading-toast");
            successToast("Account created! Redirecting...");
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            toast.dismiss("loading-toast");
            // ✅ Backend ka exact error
            errorToast(err.response?.data?.message || "Something went wrong!");
        }
    };

    const inputBase = (field, extra = "") => ({
        className: `w-full border rounded-2xl py-4 text-white text-sm placeholder-slate-700 outline-none transition-all ${extra}`,
        style: {
            background: "rgba(0,0,0,0.4)",
            borderColor: errors[field]
                ? "rgba(239,68,68,0.5)"
                : focused === field
                    ? "rgba(255,59,142,0.5)"
                    : "rgba(255,255,255,0.05)",
        },
    });

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans relative overflow-hidden flex items-center justify-center px-6 py-10">

            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[45%] h-[45%] bg-violet-900/20 blur-[130px] rounded-full z-0 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-rose-900/15 blur-[130px] rounded-full z-0 pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl">

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-6"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF3B8E] to-[#8E44AD] rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Zap size={18} className="text-white fill-current" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-white tracking-tight leading-tight">Create Account</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Sandbox<span className="text-[#FF3B8E]">Hub</span>
                                <span className="text-slate-600"> · API Playground</span>
                            </p>
                        </div>
                        <Link to="/login"
                            className="text-xs font-black text-[#FF3B8E] hover:opacity-80 transition-opacity uppercase tracking-tight">
                            Sign In →
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        {/* Avatar */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">
                                Profile Photo
                                <span className="text-slate-700 normal-case font-normal tracking-normal ml-1">— optional</span>
                            </label>
                            <AvatarPicker value={avatar} onChange={setAvatar} />
                        </div>

                        <div style={{ height:"1px", background:"linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />

                        {/* Name + Email + Phone */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={15}
                                        style={{ color: focused === "name" ? "#FF3B8E" : "#475569" }} />
                                    <input type="text" name="name" placeholder="Your name" value={form.name}
                                        onChange={handleChange}
                                        onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                                        {...inputBase("name", "pl-11 pr-4")} />
                                </div>
                                {errors.name && <p className="text-[9px] text-red-400 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={15}
                                        style={{ color: focused === "email" ? "#FF3B8E" : "#475569" }} />
                                    <input type="email" name="email" placeholder="name@co.com" value={form.email}
                                        onChange={handleChange} maxLength={80}
                                        onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                                        {...inputBase("email", "pl-11 pr-4")} />
                                </div>
                                {errors.email && <p className="text-[9px] text-red-400 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={15}
                                        style={{ color: focused === "phone" ? "#FF3B8E" : "#475569" }} />
                                    <input type="tel" name="phone" placeholder="10-digit" value={form.phone}
                                        onChange={handleChange} maxLength={10}
                                        onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                                        {...inputBase("phone", "pl-11 pr-14")} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold"
                                        style={{ color: form.phone.length === 10 ? "#FF3B8E" : "#374151" }}>
                                        {form.phone.length}/10
                                    </span>
                                </div>
                                {errors.phone && <p className="text-[9px] text-red-400 mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        <div style={{ height:"1px", background:"linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />

                        {/* Password + Confirm */}
                        <div className="grid grid-cols-2 gap-4">

                            {/* Password */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={15}
                                        style={{ color: focused === "password" ? "#FF3B8E" : "#475569" }} />
                                    <input type={showPass ? "text" : "password"} name="password"
                                        placeholder="Min 8 · Max 18" value={form.password}
                                        onChange={handleChange} maxLength={18}
                                        onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                                        {...inputBase("password", "pl-11 pr-11")} />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#FF3B8E] transition-colors">
                                        {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                                    </button>
                                </div>
                                {/* ✅ Error OR strength bar */}
                                {errors.password
                                    ? <p className="text-[9px] text-red-400 mt-1">{errors.password}</p>
                                    : form.password && (
                                        <div className="mt-1.5">
                                            <div className="flex gap-0.5 mb-1">
                                                {[1,2,3,4,5].map((i) => (
                                                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                                                        style={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,0.06)" }}/>
                                                ))}
                                            </div>
                                            <p className="text-[9px] font-black" style={{ color: strength.color }}>{strength.label}</p>
                                        </div>
                                    )
                                }
                            </div>

                            {/* Confirm */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Confirm</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={15}
                                        style={{ color: focused === "confirm" ? "#FF3B8E" : "#475569" }} />
                                    <input type={showConfirm ? "text" : "password"} name="confirm"
                                        placeholder="Re-enter password" value={form.confirm}
                                        onChange={handleChange} maxLength={18}
                                        onFocus={() => setFocused("confirm")} onBlur={() => setFocused("")}
                                        className="w-full border rounded-2xl py-4 pl-11 pr-11 text-white text-sm placeholder-slate-700 outline-none transition-all"
                                        style={{
                                            background: "rgba(0,0,0,0.4)",
                                            borderColor: errors.confirm
                                                ? "rgba(239,68,68,0.5)"
                                                : form.confirm && isPasswordValid && form.password === form.confirm
                                                    ? "rgba(255,59,142,0.4)"
                                                    : focused === "confirm"
                                                        ? "rgba(255,59,142,0.5)"
                                                        : "rgba(255,255,255,0.05)",
                                        }} />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#FF3B8E] transition-colors">
                                        {showConfirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                                    </button>
                                </div>

                                {/* ✅ Match sirf tab dikhao jab password bhi valid ho */}
                                {errors.confirm
                                    ? <p className="text-[9px] text-red-400 mt-1">{errors.confirm}</p>
                                    : form.confirm && isPasswordValid && form.password === form.confirm
                                        ? <p className="text-[9px] text-[#FF3B8E] font-bold mt-1 flex items-center gap-1">
                                            <CheckCircle2 size={9}/> Match
                                          </p>
                                        : form.confirm && form.password !== form.confirm
                                            ? <p className="text-[9px] text-red-400 mt-1 flex items-center gap-1">
                                                <X size={9}/> No match
                                              </p>
                                            : null
                                }
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <PasswordReqs password={form.password} />

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF3B8E] to-[#8E44AD] text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-pink-500/10 active:scale-95 transition-all mt-2 disabled:opacity-60">
                            {loading
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                : <><Rocket size={16}/> Create Account</>
                            }
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                body { font-family: 'Urbanist', sans-serif; }
            `}</style>
        </div>
    );
}
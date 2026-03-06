/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Zap, Mail, Lock, ChevronRight, ArrowLeft, Send, Eye, EyeOff, Key, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// --- CUSTOM TOAST SYSTEM (from original) ---
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
), { duration: Infinity, id: "loading" });

export default function AuthPage() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // useAuth hook se login, forgotPassword, resetPassword
    const { login, forgotPassword, resetPassword, loading: authLoading } = useAuth();

    // "login" | "forgot" | "reset"
    const [mode, setMode] = useState("login");

    const [showPassword, setShowPassword] = useState(false);
    const [showTempPassword, setShowTempPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
        tempPassword: "",
        newPassword: "",
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // --- Background Animation ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const particles = Array.from({ length: 35 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            r: Math.random() * 2 + 0.5,
        }));

        let animId;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = mode !== "login"
                    ? "rgba(142, 68, 173, 0.2)"
                    : "rgba(255, 59, 142, 0.2)";
                ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, [mode]);

    // 1. Normal Login
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!form.email.trim() || !form.password.trim()) {
            errorToast("All credentials required.");
            return;
        }
        loadingToast("Authenticating...");
        try {
            const res = await login({ email: form.email, password: form.password });
            toast.dismiss("loading");
            const user = res.data.user;
            successToast(user.role === "admin" ? "Welcome, Admin! 🛡️" : "Welcome back! 👋");
            setTimeout(() => navigate(user.role === "admin" ? "/admin" : "/dashboard"), 800);
        } catch (err) {
            toast.dismiss("loading");
            errorToast(err.response?.data?.message || "Invalid credentials!");
        }
    };

    // 2. Request Temp Password (Forgot)
    const handleRequestCode = async (e) => {
        e.preventDefault();
        if (!form.email.trim()) {
            errorToast("Please enter your email address.");
            return;
        }
        loadingToast("Dispatching security code...");
        try {
            await forgotPassword(form.email);
            toast.dismiss("loading");
            successToast("Security code sent to your inbox!");
            setMode("reset");
        } catch (err) {
            toast.dismiss("loading");
            errorToast(err.response?.data?.message || "Could not send code.");
        }
    };

    // 3. Reset Password
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (!form.email.trim() || !form.tempPassword.trim() || !form.newPassword.trim()) {
            errorToast("All security fields are mandatory.");
            return;
        }
        loadingToast("Rewriting security keys...");
        try {
            await resetPassword({
                email: form.email,
                tempPassword: form.tempPassword,
                newPassword: form.newPassword,
            });
            toast.dismiss("loading");
            successToast("Password updated successfully! ✅");
            setMode("login");
        } catch (err) {
            toast.dismiss("loading");
            errorToast(err.response?.data?.message || "Verification failed.");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans relative overflow-hidden flex items-center justify-center px-6">
            {/* Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[45%] h-[45%] bg-violet-900/20 blur-[130px] rounded-full z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-rose-900/15 blur-[130px] rounded-full z-0" />
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">


                <AnimatePresence mode="wait">

                    {/* ========== LOGIN FORM ========== */}
                    {mode === "login" && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl"
                        >
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-2 text-center">
                                Hello <span className="text-[#FF3B8E]">Again.</span>
                            </h2>
                            <p className="text-slate-500 text-sm font-medium text-center mb-8">Enter your credentials to continue</p>

                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF3B8E] transition-colors" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#FF3B8E]/50 transition-all"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 block">Password</label>
                                        <button
                                            type="button"
                                            onClick={() => setMode("forgot")}
                                            className="text-[10px] font-black text-[#FF3B8E] uppercase tracking-tighter hover:opacity-80"
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF3B8E] transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-[#FF3B8E]/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#FF3B8E] transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={authLoading}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF3B8E] to-[#8E44AD] text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-pink-500/10 active:scale-95 transition-all mt-4 disabled:opacity-60"
                                >
                                    {authLoading
                                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <> SIGN IN <ChevronRight size={20} /> </>
                                    }
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                                New here?{" "}
                                <button onClick={() => navigate("/register")} className="text-white font-bold hover:text-[#FF3B8E]">
                                    Create Account
                                </button>
                            </p>
                        </motion.div>
                    )}

                    {/* ========== FORGOT PASSWORD FORM ========== */}
                    {mode === "forgot" && (
                        <motion.div
                            key="forgot"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl"
                        >
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-2 text-center">
                                Reset <span className="text-[#8E44AD]">Key.</span>
                            </h2>
                            <p className="text-slate-500 text-sm font-medium text-center mb-8 px-4">
                                We'll send a temporary security code to your inbox.
                            </p>

                            <form onSubmit={handleRequestCode} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block">Registered Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8E44AD] transition-colors" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#8E44AD]/50 transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={authLoading}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8E44AD] to-[#6366F1] text-white font-black text-base flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-60"
                                >
                                    {authLoading
                                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <> SEND CODE <Send size={18} /> </>
                                    }
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMode("login")}
                                    className="flex items-center justify-center gap-2 w-full text-xs font-bold text-slate-500 hover:text-white transition-colors pt-2"
                                >
                                    <ArrowLeft size={14} /> Back to Sign In
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* ========== RESET PASSWORD FORM ========== */}
                    {mode === "reset" && (
                        <motion.div
                            key="reset"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl"
                        >
                            <p className="text-slate-500 text-sm font-medium text-center mb-8">
                                Enter the code from your email and set a new password.
                            </p>

                            <form onSubmit={handleResetSubmit} className="space-y-5">
                                {/* Verify Email */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block">Verify Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8E44AD] transition-colors" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="Account email"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#8E44AD]/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Temp Password */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block">Temporary Code</label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8E44AD] transition-colors" size={18} />
                                        <input
                                            type={showTempPassword ? "text" : "password"}
                                            name="tempPassword"
                                            value={form.tempPassword}
                                            onChange={handleChange}
                                            placeholder="From your email"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-[#8E44AD]/50 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowTempPassword(!showTempPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#8E44AD] transition-colors"
                                        >
                                            {showTempPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8E44AD] transition-colors" size={18} />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={form.newPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-[#8E44AD]/50 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#8E44AD] transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={authLoading}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8E44AD] to-[#6366F1] text-white font-black text-base flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all mt-2 disabled:opacity-60"
                                >
                                    {authLoading
                                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : "UPDATE PASSWORD"
                                    }
                                </button>

                            </form>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                body { font-family: 'Urbanist', sans-serif; }
            `}</style>
        </div>
    );
}
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Zap, ArrowRight, X, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// ─── Toast Helpers ────────────────────────────────────────────────────────────
const mkToast = (msg, shadow, iconBg) =>
  toast.custom((t) => (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      background: "#071a12", color: "#e8fff6", fontFamily: "monospace",
      fontSize: "13px", padding: "12px 16px", borderRadius: "12px",
      boxShadow: shadow, maxWidth: "400px",
      opacity: t.visible ? 1 : 0,
      transform: t.visible ? "translateY(0)" : "translateY(-8px)",
      transition: "all 0.2s ease",
    }}>
      {iconBg && <span style={{
        width: "20px", height: "20px", borderRadius: "50%", background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: "#020b08", fontWeight: "900", fontSize: "11px",
      }}>✓</span>}
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={() => toast.dismiss(t.id)} style={{
        background: "none", border: "none", color: "#5a8a70", cursor: "pointer",
        padding: "2px", display: "flex", alignItems: "center", flexShrink: 0,
      }} onMouseEnter={(e) => e.currentTarget.style.color = "#e8fff6"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#5a8a70"}>
        <X size={13} />
      </button>
    </div>
  ), { duration: 3500 });

const successToast = (msg) => mkToast(msg, "0 0 0 1px #00ffb455, 0 8px 32px rgba(0,255,180,0.12)", "#00ffb4");
const errorToast = (msg) => mkToast(msg, "0 0 0 1px #ff4b4b55, 0 8px 32px rgba(255,75,75,0.12)", null);
const loadingToast = (msg) => toast.custom((t) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "10px",
    background: "#071a12", color: "#e8fff6", fontFamily: "monospace",
    fontSize: "13px", padding: "12px 16px", borderRadius: "12px",
    boxShadow: "0 0 0 1px #0d3324, 0 8px 32px rgba(0,0,0,0.5)",
    maxWidth: "400px", opacity: t.visible ? 1 : 0, transition: "opacity 0.2s",
  }}>
    <div style={{
      width: "16px", height: "16px", border: "2px solid #0d3324", borderTop: "2px solid #00ffb4",
      borderRadius: "50%", flexShrink: 0, animation: "spin 0.7s linear infinite"
    }} />
    <span style={{ flex: 1 }}>{msg}</span>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
), { duration: Infinity, id: "loading" });

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", role: "customer" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { errorToast("Please enter your email."); return; }
    if (!form.password.trim()) { errorToast("Please enter your password."); return; }

    loadingToast("Authenticating...");

    try {
      const res = await login({ email: form.email, password: form.password });
      toast.dismiss("loading");

      console.log("🔍 res:", res);
      console.log("🔍 user:", res.data.user);
      console.log("🔍 user.role:", res.data.user.role);
      console.log("🔍 form.role:", form.role);

      const user = res.data.user; // ← res.data.user ✅

      if (user.role !== form.role) {
        console.log("❌ Role mismatch!");
        errorToast(`Invalid credentials for ${form.role} login!`);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      if (user.role === "admin") {
        successToast("Welcome, Admin! 🛡️");
        setTimeout(() => navigate("/admin"), 800);
      } else {
        successToast("Welcome back! 👋");
        setTimeout(() => navigate("/dashboard"), 800);
      }

    } catch (err) {
      toast.dismiss("loading");
      console.log("❌ catch error:", err.response?.data);
      errorToast(err.response?.data?.message || "Invalid email or password!");
    }
  };

  return (
    <div className="min-h-screen bg-[#020b08] text-[#e8fff6] flex font-sans selection:bg-[#00ffb4]/30">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-[#030e0a] border-r border-[#0d3324] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#00ffb4]/5 blur-[120px] -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#00ffb4]/5 blur-[100px] -bottom-20 -right-20 pointer-events-none" />
        <div className="relative z-10 max-w-sm w-full">
          <div className="font-mono text-2xl font-bold mb-10 tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00ffb4] rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(0,255,180,0.4)]">
              <Zap size={18} fill="#020b08" className="text-[#020b08]" />
            </div>
            <span>Sandbox<span className="text-[#00ffb4]">Hub</span></span>
          </div>
          <h2 className="text-5xl font-black leading-[1.1] mb-6">
            Test smarter<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffb4] to-[#00d699]">Deploy faster</span>
          </h2>
          <p className="text-[#8eb0a0] text-sm mb-10 leading-relaxed">
            The playground for developers who value speed, accuracy, and transparent API costs.
          </p>
          <div className="bg-[#071a12]/40 border border-[#0d3324] rounded-xl p-5 font-mono text-[12px] shadow-2xl backdrop-blur-sm">
            <div className="flex gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="space-y-2">
              <p><span className="text-[#00ffb4]">POST</span> <span className="text-[#5a8a70]">/v1/auth/login</span></p>
              <p className="text-[#5a8a70]">Status: <span className="text-[#00ffb4] animate-pulse">200 OK</span></p>
              <div className="h-px bg-[#0d3324] my-2" />
              <p className="text-[#3a5a4a]">{"{"}</p>
              <p className="pl-4 text-[#8eb0a0]">"session": <span className="text-[#e8fff6]">"active"</span>,</p>
              <p className="pl-4 text-[#8eb0a0]">"role": <span className="text-[#00ffb4]">"customer"</span></p>
              <p className="text-[#3a5a4a]">{"}"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden font-mono text-xl font-bold mb-10 flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-[#00ffb4] rounded flex items-center justify-center">
              <Zap size={16} fill="#020b08" className="text-[#020b08]" />
            </div>
            <span>Sandbox<span className="text-[#00ffb4]">Hub</span></span>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
            <p className="text-[#5a8a70] font-medium">Continue your development journey</p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px] block mb-2">Login As</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm({ ...form, role: "customer" })}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${form.role === "customer"
                    ? "bg-[#00ffb4]/10 border-[#00ffb4]/50"
                    : "bg-[#071a12]/50 border-[#0d3324] hover:border-[#00ffb4]/20"
                  }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${form.role === "customer" ? "bg-[#00ffb4]/20" : "bg-[#0d1f15]"
                  }`}>
                  <User size={15} className={form.role === "customer" ? "text-[#00ffb4]" : "text-[#3a5a4a]"} />
                </div>
                <div className="text-left">
                  <p className={`text-xs font-black ${form.role === "customer" ? "text-[#00ffb4]" : "text-[#5a8a70]"}`}>Customer</p>
                  <p className="text-[10px] text-[#3a5a4a]">Test APIs</p>
                </div>
              </button>

              <button type="button" onClick={() => setForm({ ...form, role: "admin" })}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${form.role === "admin"
                    ? "bg-[#ffd700]/10 border-[#ffd700]/50"
                    : "bg-[#071a12]/50 border-[#0d3324] hover:border-[#ffd700]/20"
                  }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${form.role === "admin" ? "bg-[#ffd700]/20" : "bg-[#0d1f15]"
                  }`}>
                  <ShieldCheck size={15} className={form.role === "admin" ? "text-[#ffd700]" : "text-[#3a5a4a]"} />
                </div>
                <div className="text-left">
                  <p className={`text-xs font-black ${form.role === "admin" ? "text-[#ffd700]" : "text-[#5a8a70]"}`}>Admin</p>
                  <p className="text-[10px] text-[#3a5a4a]">Manage APIs</p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px]">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3a5a4a] group-focus-within:text-[#00ffb4] transition-colors" size={18} />
                <input type="email" name="email" placeholder="name@company.com" value={form.email}
                  onChange={handleChange}
                  className="w-full bg-[#071a12]/50 border border-[#0d3324] rounded-xl pl-11 pr-4 py-3.5 text-[#e8fff6] text-sm placeholder-[#3a5a4a] outline-none focus:border-[#00ffb4]/50 focus:ring-1 focus:ring-[#00ffb4]/20 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px]">Password</label>
                <a href="#" className="text-[10px] font-bold text-[#00ffb4] hover:text-[#e8fff6] transition-colors uppercase tracking-[1px]">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3a5a4a] group-focus-within:text-[#00ffb4] transition-colors" size={18} />
                <input type="password" name="password" placeholder="••••••••" value={form.password}
                  onChange={handleChange}
                  className="w-full bg-[#071a12]/50 border border-[#0d3324] rounded-xl pl-11 pr-4 py-3.5 text-[#e8fff6] text-sm placeholder-[#3a5a4a] outline-none focus:border-[#00ffb4]/50 focus:ring-1 focus:ring-[#00ffb4]/20 transition-all" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-2 font-black rounded-xl py-4 text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: form.role === "admin" ? "#ffd700" : "#00ffb4",
                color: "#020b08",
              }}>
              {loading
                ? <div className="w-5 h-5 border-2 border-[#020b08]/30 border-t-[#020b08] rounded-full animate-spin" />
                : <>{form.role === "admin" ? <ShieldCheck size={16} /> : <ArrowRight size={16} strokeWidth={3} />}
                  Login as {form.role === "admin" ? "Admin" : "Customer"}</>
              }
            </button>
          </form>

          <div className="mt-8 pt-8 text-center border-t border-[#0d3324]">
            <p className="text-[#5a8a70] text-sm">
              New to SandboxHub?{" "}
              <Link to="/register" className="text-[#00ffb4] font-bold hover:text-[#e8fff6] transition-colors underline underline-offset-4">
                Create Free Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
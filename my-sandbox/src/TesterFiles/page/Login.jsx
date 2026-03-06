import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Zap, ArrowRight, CheckCircle2, X } from "lucide-react";

// ─── Custom Toast Helpers ──────────────────────────────────────────────────────

const showError = (msg) =>
  toast.custom((t) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#071a12",
        color: "#e8fff6",
        fontFamily: "monospace",
        fontSize: "13px",
        padding: "12px 16px",
        borderRadius: "12px",
        boxShadow: "0 0 0 1px #ff4b4b55, 0 8px 32px rgba(255,75,75,0.12)",
        maxWidth: "360px",
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? "translateY(0)" : "translateY(-8px)",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={() => toast.dismiss(t.id)}
        style={{
          background: "none",
          border: "none",
          color: "#5a8a70",
          cursor: "pointer",
          padding: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#e8fff6")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#5a8a70")}
      >
        <X size={14} />
      </button>
    </div>
  ));

const showSuccess = (msg, id) =>
  toast.custom(
    (t) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#071a12",
          color: "#e8fff6",
          fontFamily: "monospace",
          fontSize: "13px",
          padding: "12px 16px",
          borderRadius: "12px",
          boxShadow: "0 0 0 1px #00ffb455, 0 8px 32px rgba(0,255,180,0.12)",
          maxWidth: "360px",
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? "translateY(0)" : "translateY(-8px)",
          transition: "all 0.2s ease",
        }}
      >
        <span
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#00ffb4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={12} color="#020b08" strokeWidth={3} />
        </span>
        <span style={{ flex: 1 }}>{msg}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            background: "none",
            border: "none",
            color: "#5a8a70",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e8fff6")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5a8a70")}
        >
          <X size={14} />
        </button>
      </div>
    ),
    { id }
  );

const showLoading = (msg) =>
  toast.custom(
    (t) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#071a12",
          color: "#e8fff6",
          fontFamily: "monospace",
          fontSize: "13px",
          padding: "12px 16px",
          borderRadius: "12px",
          boxShadow: "0 0 0 1px #0d3324, 0 8px 32px rgba(0,0,0,0.5)",
          maxWidth: "360px",
          opacity: t.visible ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            border: "2px solid #0d3324",
            borderTop: "2px solid #00ffb4",
            borderRadius: "50%",
            flexShrink: 0,
            animation: "spin 0.7s linear infinite",
          }}
        />
        <span style={{ flex: 1 }}>{msg}</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
    { duration: Infinity, id: "loading-toast" }
  );

// ─── Login Component ───────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      showError("Please enter your email address.");
      return;
    }
    if (!form.password) {
      showError("Please enter your password.");
      return;
    }

    setLoading(true);
    showLoading("Authenticating...");

    // ✅ Koi bhi email/password se login hoga — no hardcoded check
    setTimeout(() => {
      setLoading(false);
      toast.dismiss("loading-toast");
      showSuccess("Welcome back!", "success-toast");
      setTimeout(() => navigate("/dashboard"), 1000);
    }, 1200);
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
              <p className="flex items-center gap-2">
                <span className="text-[#00ffb4]">POST</span>
                <span className="text-[#5a8a70]">/v1/auth/login</span>
              </p>
              <p className="text-[#5a8a70]">Status: <span className="text-[#00ffb4] animate-pulse">200 OK</span></p>
              <div className="h-px bg-[#0d3324] my-2" />
              <p className="text-[#3a5a4a]">{"{"}</p>
              <p className="pl-4 text-[#8eb0a0]">"session": <span className="text-[#e8fff6]">"active"</span>,</p>
              <p className="pl-4 text-[#8eb0a0]">"balance": <span className="text-[#00ffb4]">"₹1,240.50"</span></p>
              <p className="text-[#3a5a4a]">{"}"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden font-mono text-xl font-bold mb-10 flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-[#00ffb4] rounded flex items-center justify-center">
              <Zap size={16} fill="#020b08" className="text-[#020b08]" />
            </div>
            <span>Sandbox<span className="text-[#00ffb4]">Hub</span></span>
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
            <p className="text-[#5a8a70] font-medium">Continue your development journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px]">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3a5a4a] group-focus-within:text-[#00ffb4] transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-[#071a12]/50 border border-[#0d3324] rounded-xl pl-11 pr-4 py-3.5 text-[#e8fff6] text-sm placeholder-[#3a5a4a] outline-none focus:border-[#00ffb4]/50 focus:ring-1 focus:ring-[#00ffb4]/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px]">Password</label>
                <a href="#" className="text-[10px] font-bold text-[#00ffb4] hover:text-[#e8fff6] transition-colors uppercase tracking-[1px]">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3a5a4a] group-focus-within:text-[#00ffb4] transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-[#071a12]/50 border border-[#0d3324] rounded-xl pl-11 pr-4 py-3.5 text-[#e8fff6] text-sm placeholder-[#3a5a4a] outline-none focus:border-[#00ffb4]/50 focus:ring-1 focus:ring-[#00ffb4]/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ffb4] text-[#020b08] font-black rounded-xl py-4 text-sm uppercase tracking-wider transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#020b08]/30 border-t-[#020b08] rounded-full animate-spin" />
              ) : (
                <>
                  Login to Dashboard
                  <ArrowRight size={16} strokeWidth={3} />
                </>
              )}
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
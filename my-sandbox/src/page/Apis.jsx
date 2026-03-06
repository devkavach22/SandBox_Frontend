import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCustomer } from "../hooks/useCustomer";
import Navbar from "./Navbar"; // ← reusable navbar

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#A78BFA" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#818CF8" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#F87171" },
};

const mkToast = (msg, shadow, iconBg) =>
    toast.custom((t) => (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#0a0a0a", color: "#fff", fontFamily: "Urbanist, sans-serif",
            fontSize: "13px", padding: "12px 16px", borderRadius: "16px",
            boxShadow: shadow, maxWidth: "400px", opacity: t.visible ? 1 : 0,
            transform: t.visible ? "translateY(0)" : "translateY(-8px)", transition: "all 0.2s ease",
        }}>
            {iconBg && <span style={{
                width: "20px", height: "20px", borderRadius: "50%", background: iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "#fff", fontWeight: "900", fontSize: "11px"
            }}>✓</span>}
            <span style={{ flex: 1 }}>{msg}</span>
            <button onClick={() => toast.dismiss(t.id)} style={{
                background: "none", border: "none", color: "#888",
                cursor: "pointer", padding: "2px", display: "flex", alignItems: "center",
            }}><X size={13} /></button>
        </div>
    ), { duration: 3000 });

const successToast = (msg) => mkToast(msg, "0 0 0 1px rgba(255,59,142,0.3), 0 8px 32px rgba(255,59,142,0.12)", "#FF3B8E");
const errorToast   = (msg) => mkToast(msg, "0 0 0 1px rgba(239,68,68,0.3), 0 8px 32px rgba(239,68,68,0.12)", null);
const infoToast    = (msg) => mkToast(msg, "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)", null);

export default function Apis() {
    const navigate = useNavigate();
    const userStr  = localStorage.getItem("user");
    const user     = userStr ? JSON.parse(userStr) : null;
    const userId   = user?.id;

    const { apis, loading, selectApi, deselectApi } = useCustomer();
    const [selected, setSelected] = useState(new Set());

    const toggleSelect = async (apiId) => {
        const isSelected = selected.has(apiId);
        setSelected((prev) => {
            const next = new Set(prev);
            isSelected ? next.delete(apiId) : next.add(apiId);
            return next;
        });
        try {
            if (isSelected) await deselectApi(userId, apiId);
            else             await selectApi(userId, apiId);
        } catch (err) {
            setSelected((prev) => {
                const next = new Set(prev);
                isSelected ? next.add(apiId) : next.delete(apiId);
                return next;
            });
            errorToast(err.response?.data?.message || "Something went wrong!");
        }
    };

    const handleProceed = () => {
        if (selected.size === 0) { errorToast("Please select at least one API!"); return; }
        successToast(`${selected.size} API${selected.size > 1 ? "s" : ""} selected!`);
        setTimeout(() => navigate("/dashboard"), 800);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        infoToast("Logged out.");
        setTimeout(() => navigate("/login"), 800);
    };

    // Custom right-side content for the navbar
    const navRightContent = (
        <div className="flex items-center gap-2">
            {/* Proceed button — only when something is selected */}
            {selected.size > 0 && (
                <button
                    onClick={handleProceed}
                    className="flex items-center gap-2 text-white font-black text-xs px-5 py-2.5 rounded-full active:scale-95 transition-all shadow-lg shadow-pink-500/20"
                    style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}
                >
                    <ArrowRight size={14} strokeWidth={3} />
                    Dashboard ({selected.size})
                </button>
            )}

            {/* Skip to dashboard */}
            <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-4 py-2.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-bold"
            >
                Dashboard →
            </button>

            {/* User pill */}
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10"
                style={{ background: "rgba(255,255,255,0.02)" }}
            >
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg, #FF3B8E, #8E44AD)" }}
                >
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-white hidden sm:inline">{user?.name}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-x-hidden">

            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            {/* ─── REUSABLE NAVBAR ─── */}
            <Navbar
                showBack={false}
                rightContent={navRightContent}
                onLogout={handleLogout}
            />

            {/* ─── MAIN ─── */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 pt-28 pb-36">

                {/* Hero Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-[10px] font-black uppercase tracking-[0.2em]"
                        style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)", color: "#FF3B8E" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B8E] animate-pulse" />
                        Step 1 of 2 — Select APIs
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-4 text-white">
                        Choose Your{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#A29BFE]">
                            APIs
                        </span>
                    </h1>
                    <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
                        Select the APIs you want to test and integrate. Each call deducts from your wallet balance.
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-9 h-9 border-2 border-white/5 border-t-[#FF3B8E] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 text-sm">Fetching available APIs...</p>
                    </div>
                )}

                {/* No APIs */}
                {!loading && apis.length === 0 && (
                    <div className="text-center py-16 rounded-[2rem]"
                        style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                        <p className="text-slate-500 text-sm mb-4">No APIs available yet.</p>
                        <button onClick={() => navigate("/dashboard")}
                            className="inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-full text-[#FF3B8E] transition-all"
                            style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)" }}>
                            Go to Dashboard →
                        </button>
                    </div>
                )}

                {/* API Grid */}
                {!loading && apis.length > 0 && (
                    <>
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-5 px-5 py-3 rounded-2xl"
                            style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                            <div className="flex items-center gap-3">
                                <span className="text-sm">
                                    <span className="font-black text-white text-lg">{selected.size}</span>
                                    <span className="text-slate-600"> / {apis.length} selected</span>
                                </span>
                                {selected.size > 0 && (
                                    <div className="flex gap-1 items-center px-2.5 py-1 rounded-full"
                                        style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)" }}>
                                        {[...Array(Math.min(selected.size, 6))].map((_, i) => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-sm bg-[#FF3B8E]" />
                                        ))}
                                        {selected.size > 6 && <span className="text-[9px] text-[#FF3B8E] ml-1">+{selected.size - 6}</span>}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setSelected(new Set(apis.map((a) => a._id)))}
                                    className="text-[11px] font-black px-4 py-1.5 rounded-full transition-all"
                                    style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)", color: "#FF3B8E" }}>
                                    Select All
                                </button>
                                <button onClick={() => setSelected(new Set())}
                                    className="text-[11px] font-black px-4 py-1.5 rounded-full transition-all text-slate-500 hover:text-white"
                                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                            {apis.map((api) => {
                                const mc         = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
                                const isSelected = selected.has(api._id);
                                return (
                                    <button key={api._id} onClick={() => toggleSelect(api._id)}
                                        className="text-left p-5 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-200 group"
                                        style={{
                                            background: isSelected
                                                ? "linear-gradient(135deg, rgba(255,59,142,0.07), rgba(142,68,173,0.04))"
                                                : "#0c0c0c",
                                            boxShadow: isSelected
                                                ? "inset 0 1px 0 rgba(255,59,142,0.15), 0 0 0 1px rgba(255,59,142,0.3), 0 8px 24px rgba(255,59,142,0.06)"
                                                : "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.06)",
                                            transform: isSelected ? "translateY(-1px)" : "translateY(0)",
                                        }}>

                                        {isSelected && (
                                            <div className="absolute top-0 left-[20%] right-[20%] h-px"
                                                style={{ background: "linear-gradient(90deg, transparent, #FF3B8E, transparent)" }} />
                                        )}

                                        <div className="absolute inset-0 pointer-events-none transition-opacity duration-200 rounded-2xl opacity-0 group-hover:opacity-100"
                                            style={{ background: "radial-gradient(ellipse at top left, rgba(255,59,142,0.05), transparent 70%)" }} />

                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black px-2 py-1 rounded-lg"
                                                    style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}${isSelected ? "60" : "40"}` }}>
                                                    {api.method}
                                                </span>
                                                <span className="text-sm font-black transition-colors duration-200"
                                                    style={{ color: isSelected ? "#fff" : "#e2e8f0" }}>
                                                    {api.name}
                                                </span>
                                            </div>

                                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                                style={{
                                                    background: isSelected ? "linear-gradient(135deg, #FF3B8E, #8E44AD)" : "transparent",
                                                    border: `2px solid ${isSelected ? "#FF3B8E" : "rgba(255,255,255,0.15)"}`,
                                                    boxShadow: isSelected ? "0 0 12px rgba(255,59,142,0.4)" : "none",
                                                }}>
                                                {isSelected && <Check size={10} color="#fff" strokeWidth={3} />}
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-500 mb-4 leading-relaxed group-hover:text-slate-400 transition-colors">
                                            {api.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <code className="text-[10px] text-slate-600 px-2.5 py-1.5 rounded-xl truncate max-w-[60%] block"
                                                style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.04)" }}>
                                                {api.url}
                                            </code>
                                            <div className="text-right">
                                                <div className="text-base font-black leading-none transition-colors duration-200"
                                                    style={{ color: isSelected ? "#FF3B8E" : "#64748b" }}>
                                                    ₹{api.pricePerCall}
                                                </div>
                                                <div className="text-[9px] text-slate-600 mt-0.5">per call</div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </main>

            {/* ─── STICKY BOTTOM CTA ─── */}
            {!loading && apis.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 backdrop-blur-3xl bg-black/60 px-6 md:px-10 py-4">
                    <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">
                            {selected.size === 0
                                ? "Select APIs to begin, or go directly to dashboard"
                                : <><span className="text-[#FF3B8E] font-black">{selected.size}</span> of {apis.length} APIs ready</>}
                        </span>

                        <div className="flex gap-3">
                            <button onClick={() => navigate("/dashboard")}
                                className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-5 py-3 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-bold">
                                Skip →
                            </button>

                            <button onClick={handleProceed} disabled={selected.size === 0}
                                className="flex items-center gap-2 text-white font-black text-xs px-6 py-3 rounded-full active:scale-95 transition-all"
                                style={selected.size > 0
                                    ? { background: "linear-gradient(to right, #FF3B8E, #8E44AD)", boxShadow: "0 0 20px rgba(255,59,142,0.3)" }
                                    : { background: "rgba(255,255,255,0.04)", color: "#374151", border: "1px solid rgba(255,255,255,0.06)", cursor: "not-allowed" }}>
                                <ArrowRight size={14} strokeWidth={3} />
                                Continue to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; }
                code { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
            `}</style>
        </div>
    );
}
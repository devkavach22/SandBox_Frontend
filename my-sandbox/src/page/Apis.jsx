/* eslint-disable react-hooks/static-components */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, X, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useCustomer } from "../hooks/useCustomer";
import Navbar from "./Navbar";
import { triggerAuthChange } from "../routes/AppRoutes";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#A78BFA" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#818CF8" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#F87171" },
};

const SECTIONS = [
    {
        key:       "konverthr_node",
        label:     "KonvertHR Node.js APIs",
        color:     "#FF3B8E",
        border:    "rgba(255,59,142,0.15)",
        glow:      "rgba(255,59,142,0.06)",
        lineColor: "rgba(255,59,142,0.1)",
    },
    {
        key:       "konverthr_odoo",
        label:     "KonvertHR Odoo APIs",
        color:     "#A78BFA",
        border:    "rgba(167,139,250,0.15)",
        glow:      "rgba(167,139,250,0.06)",
        lineColor: "rgba(167,139,250,0.1)",
    },
];

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

function getSectionKey(api) {
    const cat = (api.category || "").trim().toLowerCase();
    if (cat === "konverthr_odoo") return "konverthr_odoo";
    if (cat === "konverthr_node") return "konverthr_node";
    const url = (api.url || "").toLowerCase();
    if (url.includes("odoo") || url.includes("/web/") || url.includes("jsonrpc")) return "konverthr_odoo";
    return "konverthr_node";
}

export default function Apis() {
    const navigate = useNavigate();
    const userStr  = localStorage.getItem("user");
    const user     = userStr ? JSON.parse(userStr) : null;
    const userId   = user?.id;

    const { apis, loading, selectApi, deselectApi } = useCustomer();
    const [selected, setSelected] = useState(new Set());
    const [search, setSearch]     = useState("");

    const filteredApis = apis.filter((api) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            api.name?.toLowerCase().includes(q) ||
            api.description?.toLowerCase().includes(q)
        );
    });

    // Pre-split into two columns
    const nodeApis = filteredApis.filter((a) => getSectionKey(a) === "konverthr_node");
    const odooApis = filteredApis.filter((a) => getSectionKey(a) === "konverthr_odoo");

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
        triggerAuthChange();
        navigate("/login");
    };

    const toggleSection = (sectionApis) => {
        setSelected((prev) => {
            const next = new Set(prev);
            const allSelected = sectionApis.every((a) => prev.has(a._id));
            sectionApis.forEach((a) => allSelected ? next.delete(a._id) : next.add(a._id));
            return next;
        });
    };

    const highlightName = (name) => {
        if (!search.trim()) return name;
        const regex = new RegExp(`(${search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
        const parts = name.split(regex);
        return parts.map((part, i) =>
            regex.test(part)
                ? <mark key={i} style={{ background: "rgba(255,59,142,0.25)", color: "#FF3B8E", borderRadius: "3px", padding: "0 2px" }}>{part}</mark>
                : part
        );
    };

    const ApiCard = ({ api }) => {
        const mc         = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
        const isSelected = selected.has(api._id);
        return (
            <button onClick={() => toggleSelect(api._id)}
                className="text-left p-4 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-200 group w-full"
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

                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0"
                            style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}${isSelected ? "60" : "40"}` }}>
                            {api.method}
                        </span>
                        <span className="text-sm font-black transition-colors duration-200 truncate"
                            style={{ color: isSelected ? "#fff" : "#e2e8f0" }}>
                            {highlightName(api.name)}
                        </span>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2 transition-all duration-200"
                        style={{
                            background: isSelected ? "linear-gradient(135deg, #FF3B8E, #8E44AD)" : "transparent",
                            border: `2px solid ${isSelected ? "#FF3B8E" : "rgba(255,255,255,0.15)"}`,
                            boxShadow: isSelected ? "0 0 12px rgba(255,59,142,0.4)" : "none",
                        }}>
                        {isSelected && <Check size={10} color="#fff" strokeWidth={3} />}
                    </div>
                </div>

                <p className="text-xs text-slate-500 mb-3 leading-relaxed group-hover:text-slate-400 transition-colors line-clamp-2">
                    {api.description}
                </p>

                <div className="flex items-center justify-between">
                    <code className="text-[10px] text-slate-600 px-2 py-1 rounded-lg truncate max-w-[65%] block"
                        style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        {api.url}
                    </code>
                    <div className="text-right">
                        <div className="text-sm font-black leading-none transition-colors duration-200"
                            style={{ color: isSelected ? "#FF3B8E" : "#64748b" }}>
                            ₹{api.pricePerCall}
                        </div>
                        <div className="text-[9px] text-slate-600 mt-0.5">per call</div>
                    </div>
                </div>
            </button>
        );
    };

    // Section column header
    const SectionHeader = ({ section, sectionApis }) => {
        const sectionSelected = sectionApis.filter((a) => selected.has(a._id)).length;
        const allInSection    = sectionApis.length > 0 && sectionApis.every((a) => selected.has(a._id));
        return (
            <div className="flex items-center justify-between mb-4 pb-3"
                style={{ borderBottom: `1px solid ${section.lineColor}` }}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: section.color }} />
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: section.color }}>
                        {section.label}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${section.color}20`, color: section.color, border: `1px solid ${section.border}` }}>
                        {sectionSelected}/{sectionApis.length}
                    </span>
                </div>
                <button
                    onClick={() => toggleSection(sectionApis)}
                    className="text-[10px] font-black px-3 py-1.5 rounded-full transition-all flex-shrink-0"
                    style={{ background: section.glow, border: `1px solid ${section.border}`, color: section.color }}>
                    {allInSection ? "Deselect All" : "Select All"}
                </button>
            </div>
        );
    };

    const navRightContent = (
        <div className="flex items-center gap-2">
            {selected.size > 0 && (
                <button onClick={handleProceed}
                    className="flex items-center gap-2 text-white font-black text-xs px-5 py-2.5 rounded-full active:scale-95 transition-all shadow-lg shadow-pink-500/20"
                    style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}>
                    <ArrowRight size={14} strokeWidth={3} />
                    Dashboard ({selected.size})
                </button>
            )}
            <button onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-4 py-2.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-bold">
                Dashboard →
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg, #FF3B8E, #8E44AD)" }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-white hidden sm:inline">{user?.name}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-x-hidden">
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            <Navbar showBack={false} rightContent={navRightContent} onLogout={handleLogout} />

            <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-36">

                {/* ── Page heading ── */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-[10px] font-black uppercase tracking-[0.2em]"
                        style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)", color: "#FF3B8E" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B8E] animate-pulse" />
                        Step 1 of 2 — Select APIs
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-4 text-white">
                        Choose Your{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#A29BFE]">APIs</span>
                    </h1>
                    <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
                        Select the APIs you want to test and integrate. Each call deducts from your wallet balance.
                    </p>
                </div>

                {/* ── Search Bar ── */}
                {!loading && apis.length > 0 && (
                    <div className="relative mb-5 group max-w-3xl mx-auto">
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ background: "rgba(255,59,142,0.04)", boxShadow: "0 0 0 1px rgba(255,59,142,0.25), 0 8px 32px rgba(255,59,142,0.08)" }} />
                        <div className="relative flex items-center"
                            style={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}>
                            <Search size={15} className="absolute left-4 pointer-events-none transition-colors duration-200"
                                style={{ color: search ? "#FF3B8E" : "#475569" }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search APIs by name or description…"
                                className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none py-3.5 pl-11 pr-10"
                                style={{ fontFamily: "Urbanist, sans-serif", caretColor: "#FF3B8E" }}
                            />
                            {search && (
                                <button onClick={() => setSearch("")}
                                    className="absolute right-3.5 flex items-center justify-center w-5 h-5 rounded-full transition-all hover:bg-white/10"
                                    style={{ color: "#64748b" }}>
                                    <X size={11} strokeWidth={2.5} />
                                </button>
                            )}
                        </div>
                        {search.trim() && (
                            <div className="absolute -bottom-5 left-1 text-[10px] font-bold"
                                style={{ color: filteredApis.length > 0 ? "#FF3B8E" : "#64748b" }}>
                                {filteredApis.length === 0 ? "No APIs match your search" : `${filteredApis.length} API${filteredApis.length !== 1 ? "s" : ""} found`}
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="text-center py-20">
                        <div className="w-9 h-9 border-2 border-white/5 border-t-[#FF3B8E] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 text-sm">Fetching available APIs...</p>
                    </div>
                )}

                {!loading && apis.length === 0 && (
                    <div className="text-center py-16 rounded-[2rem]" style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                        <p className="text-slate-500 text-sm mb-4">No APIs available yet.</p>
                        <button onClick={() => navigate("/dashboard")}
                            className="inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-full text-[#FF3B8E] transition-all"
                            style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)" }}>
                            Go to Dashboard →
                        </button>
                    </div>
                )}

                {!loading && apis.length > 0 && (
                    <>
                        {/* ── Stats bar ── */}
                        <div className="flex items-center justify-between mb-6 px-5 py-3 rounded-2xl"
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

                        {/* ── No results ── */}
                        {search.trim() && filteredApis.length === 0 && (
                            <div className="text-center py-16 rounded-[2rem] mb-6"
                                style={{ border: "1px dashed rgba(255,255,255,0.06)" }}>
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                    style={{ background: "rgba(255,59,142,0.06)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                    <Search size={16} style={{ color: "#FF3B8E" }} />
                                </div>
                                <p className="text-slate-500 text-sm mb-1">No APIs found for <span className="text-white font-bold">"{search}"</span></p>
                                <p className="text-slate-600 text-xs">Try a different name or keyword</p>
                                <button onClick={() => setSearch("")}
                                    className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black px-4 py-2 rounded-full text-[#FF3B8E] transition-all"
                                    style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)" }}>
                                    <X size={10} strokeWidth={3} /> Clear search
                                </button>
                            </div>
                        )}

                        {/* ════════════════════════════════════════════════════
                            ── TWO COLUMNS: Node.js (left) | Odoo (right) ──
                        ════════════════════════════════════════════════════ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

                            {/* ── LEFT: Node.js ── */}
                            <div className="rounded-[1.5rem] p-5"
                                style={{ background: "#0a0a0a", border: "1px solid rgba(255,59,142,0.1)", boxShadow: "0 0 40px rgba(255,59,142,0.03)" }}>
                                <SectionHeader section={SECTIONS[0]} sectionApis={nodeApis} />
                                {nodeApis.length === 0 ? (
                                    <p className="text-slate-600 text-xs text-center py-10">No Node.js APIs match your search.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
                                        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,59,142,0.2) transparent" }}>
                                        {nodeApis.map((api) => <ApiCard key={api._id} api={api} />)}
                                    </div>
                                )}
                            </div>

                            {/* ── RIGHT: Odoo ── */}
                            <div className="rounded-[1.5rem] p-5"
                                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.1)", boxShadow: "0 0 40px rgba(167,139,250,0.03)" }}>
                                <SectionHeader section={SECTIONS[1]} sectionApis={odooApis} />
                                {odooApis.length === 0 ? (
                                    <p className="text-slate-600 text-xs text-center py-10">No Odoo APIs match your search.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
                                        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(167,139,250,0.2) transparent" }}>
                                        {odooApis.map((api) => <ApiCard key={api._id} api={api} />)}
                                    </div>
                                )}
                            </div>

                        </div>
                    </>
                )}
            </main>

            {/* ── Bottom action bar ── */}
            {!loading && apis.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 backdrop-blur-3xl bg-black/60 px-6 md:px-10 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
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
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}
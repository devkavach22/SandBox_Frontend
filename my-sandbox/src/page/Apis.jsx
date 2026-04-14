/* eslint-disable react-hooks/static-components */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, X, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useCustomer } from "../hooks/useCustomer";
import Navbar from "./Navbar";
import { triggerAuthChange } from "../routes/AppRoutes";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#7C3AED" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#4F46E5" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#DC2626" },
};

const SECTIONS = [
    {
        key:       "konverthr_node",
        label:     "KonvertHR Node.js APIs",
        color:     "#FF3B8E",
        border:    "rgba(255,59,142,0.2)",
        glow:      "rgba(255,59,142,0.06)",
        lineColor: "rgba(255,59,142,0.12)",
    },
    {
        key:       "konverthr_odoo",
        label:     "KonvertHR Odoo APIs",
        color:     "#8E44AD",
        border:    "rgba(142,68,173,0.2)",
        glow:      "rgba(142,68,173,0.06)",
        lineColor: "rgba(142,68,173,0.12)",
    },
    {
        key:       "konverthr_other",
        label:     "KonvertHR Other APIs",
        color:     "#4F46E5",
        border:    "rgba(99,102,241,0.2)",
        glow:      "rgba(99,102,241,0.06)",
        lineColor: "rgba(99,102,241,0.12)",
    },
];

const mkToast = (msg, shadow, iconBg) =>
    toast.custom((t) => (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#fff", color: "#1e293b", fontFamily: "Urbanist, sans-serif",
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
                background: "none", border: "none", color: "#94a3b8",
                cursor: "pointer", padding: "2px", display: "flex", alignItems: "center",
            }}><X size={13} /></button>
        </div>
    ), { duration: 3000 });

const successToast = (msg) => mkToast(msg, "0 0 0 1px rgba(255,59,142,0.2), 0 8px 32px rgba(255,59,142,0.1)", "linear-gradient(135deg,#FF3B8E,#8E44AD)");
const errorToast   = (msg) => mkToast(msg, "0 0 0 1px rgba(239,68,68,0.2), 0 8px 32px rgba(239,68,68,0.1)", null);

function getSectionKey(api) {
    const cat = (api.category || "").trim().toLowerCase();
    if (cat === "konverthr_odoo")  return "konverthr_odoo";
    if (cat === "konverthr_node")  return "konverthr_node";
    if (cat === "konverthr_other") return "konverthr_other";
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

    const nodeApis  = filteredApis.filter((a) => getSectionKey(a) === "konverthr_node");
    const odooApis  = filteredApis.filter((a) => getSectionKey(a) === "konverthr_odoo");
    const otherApis = filteredApis.filter((a) => getSectionKey(a) === "konverthr_other");

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
                ? <mark key={i} style={{ background: "rgba(255,59,142,0.15)", color: "#FF3B8E", borderRadius: "3px", padding: "0 2px" }}>{part}</mark>
                : part
        );
    };

    const ApiCard = ({ api }) => {
        const mc         = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
        const isSelected = selected.has(api._id);
        return (
            <button onClick={() => toggleSelect(api._id)}
                className="text-left p-4 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-200 group w-full border hover:shadow-md hover:-translate-y-0.5"
                style={{
                    background: isSelected
                        ? "linear-gradient(135deg, rgba(255,59,142,0.05), rgba(142,68,173,0.03))"
                        : "white",
                    borderColor: isSelected ? "rgba(255,59,142,0.35)" : "rgba(0,0,0,0.06)",
                    boxShadow: isSelected ? "0 0 0 1px rgba(255,59,142,0.2), 0 4px 16px rgba(255,59,142,0.06)" : "",
                }}>
                {isSelected && (
                    <div className="absolute top-0 left-[20%] right-[20%] h-px"
                        style={{ background: "linear-gradient(90deg, transparent, #FF3B8E, transparent)" }} />
                )}
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-200 rounded-2xl opacity-0 group-hover:opacity-100"
                    style={{ background: "radial-gradient(ellipse at top left, rgba(255,59,142,0.04), transparent 70%)" }} />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 rounded-full"
                    style={{ background: "linear-gradient(90deg, #FF3B8E, #8E44AD)" }} />

                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0"
                            style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
                            {api.method}
                        </span>
                        <span className="text-sm font-black truncate" style={{ color: isSelected ? "#FF3B8E" : "#1e293b" }}>
                            {highlightName(api.name)}
                        </span>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2 transition-all duration-200"
                        style={{
                            background: isSelected ? "linear-gradient(135deg, #FF3B8E, #8E44AD)" : "transparent",
                            border: `2px solid ${isSelected ? "#FF3B8E" : "rgba(0,0,0,0.15)"}`,
                            boxShadow: isSelected ? "0 0 12px rgba(255,59,142,0.3)" : "none",
                        }}>
                        {isSelected && <Check size={10} color="#fff" strokeWidth={3} />}
                    </div>
                </div>

                <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">
                    {api.description}
                </p>

                <div className="flex items-center justify-between">
                    <code className="text-[10px] text-slate-400 px-2 py-1 rounded-lg truncate max-w-[65%] block"
                        style={{ fontFamily: "monospace", background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.06)" }}>
                        {api.url}
                    </code>
                    <div className="text-right">
                        <div className="text-sm font-black leading-none" style={{ color: isSelected ? "#FF3B8E" : "#94a3b8" }}>
                            ₹{api.pricePerCall}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">per call</div>
                    </div>
                </div>
            </button>
        );
    };

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
                        style={{ background: `${section.color}15`, color: section.color, border: `1px solid ${section.border}` }}>
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

    return (
        <div className="min-h-screen relative overflow-x-hidden"
            style={{ background: "#F8F7FF", color: "#334155", fontFamily: "'Urbanist', sans-serif" }}>

            {/* Glow blobs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full z-0 pointer-events-none"
                style={{ background: "rgba(255,59,142,0.12)", filter: "blur(80px)" }} />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full z-0 pointer-events-none"
                style={{ background: "rgba(142,68,173,0.1)", filter: "blur(80px)" }} />

            <Navbar
                showDashboardLinks
                showLogout
                user={user}
                onLogout={handleLogout}
            />

            <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-36">

                {/* Page heading */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">
                        Choose Your{" "}
                        <span style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            APIs
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm">Select the APIs you want to test. Each call deducts from your wallet balance.</p>
                </div>

                {/* Search Bar */}
                {!loading && apis.length > 0 && (
                    <div className="relative mb-6">
                        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            style={{ color: search ? "#FF3B8E" : undefined }} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search APIs by name or description…"
                            className="w-full rounded-2xl pl-9 pr-10 py-2.5 text-gray-900 text-sm outline-none transition-all placeholder-slate-400"
                            style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", fontFamily: "'Urbanist', sans-serif", caretColor: "#FF3B8E" }}
                            onFocus={e => { e.target.style.borderColor = "rgba(255,59,142,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,59,142,0.08)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
                        />
                        {search && (
                            <button onClick={() => setSearch("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full hover:bg-black/05"
                                style={{ color: "#94a3b8" }}>
                                <X size={11} strokeWidth={2.5} />
                            </button>
                        )}
                        {search.trim() && (
                            <div className="absolute -bottom-5 left-1 text-[10px] font-bold"
                                style={{ color: filteredApis.length > 0 ? "#FF3B8E" : "#94a3b8" }}>
                                {filteredApis.length === 0 ? "No APIs match your search" : `${filteredApis.length} API${filteredApis.length !== 1 ? "s" : ""} found`}
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-8 h-8 border-2 border-black/5 border-t-[#FF3B8E] rounded-full animate-spin" />
                    </div>
                )}

                {!loading && apis.length === 0 && (
                    <div className="rounded-3xl p-20 flex flex-col items-center justify-center gap-4"
                        style={{ border: "1px dashed rgba(0,0,0,0.12)", background: "white" }}>
                        <p className="text-slate-400 text-sm">No APIs available yet.</p>
                        <button onClick={() => navigate("/dashboard")}
                            className="inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-full text-[#FF3B8E] transition-all"
                            style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)" }}>
                            Go to Dashboard →
                        </button>
                    </div>
                )}

                {!loading && apis.length > 0 && (
                    <>
                        {/* Stats bar */}
                        <div className="flex items-center justify-between mb-6 px-5 py-3 rounded-2xl bg-white border border-black/[0.06] shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-sm">
                                    <span className="font-black text-[#FF3B8E] text-lg">{selected.size}</span>
                                    <span className="text-slate-400"> / {apis.length} selected</span>
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
                                    className="text-[11px] font-black px-4 py-1.5 rounded-full transition-all text-slate-500 hover:text-[#FF3B8E]"
                                    style={{ background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)" }}>
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* No results */}
                        {search.trim() && filteredApis.length === 0 && (
                            <div className="text-center py-16 rounded-[2rem] mb-6 bg-white border border-black/[0.06]">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                    style={{ background: "rgba(255,59,142,0.06)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                    <Search size={16} style={{ color: "#FF3B8E" }} />
                                </div>
                                <p className="text-slate-500 text-sm mb-1">No APIs found for <span className="text-gray-900 font-bold">"{search}"</span></p>
                                <p className="text-slate-400 text-xs">Try a different name or keyword</p>
                                <button onClick={() => setSearch("")}
                                    className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black px-4 py-2 rounded-full text-[#FF3B8E]"
                                    style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)" }}>
                                    <X size={10} strokeWidth={3} /> Clear search
                                </button>
                            </div>
                        )}

                        {/* TOP ROW: Node.js | Odoo */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white rounded-[1.5rem] p-5 border border-black/[0.06] shadow-sm">
                                <SectionHeader section={SECTIONS[0]} sectionApis={nodeApis} />
                                {nodeApis.length === 0 ? (
                                    <p className="text-slate-400 text-xs text-center py-10">No Node.js APIs match your search.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
                                        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,59,142,0.2) transparent" }}>
                                        {nodeApis.map((api) => <ApiCard key={api._id} api={api} />)}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-[1.5rem] p-5 border border-black/[0.06] shadow-sm">
                                <SectionHeader section={SECTIONS[1]} sectionApis={odooApis} />
                                {odooApis.length === 0 ? (
                                    <p className="text-slate-400 text-xs text-center py-10">No Odoo APIs match your search.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
                                        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(142,68,173,0.2) transparent" }}>
                                        {odooApis.map((api) => <ApiCard key={api._id} api={api} />)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BOTTOM ROW: Other */}
                        <div className="mb-10">
                            <div className="bg-white rounded-[1.5rem] p-5 border border-black/[0.06] shadow-sm">
                                <SectionHeader section={SECTIONS[2]} sectionApis={otherApis} />
                                {otherApis.length === 0 ? (
                                    <p className="text-slate-400 text-xs text-center py-10">No Other APIs match your search.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
                                        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(99,102,241,0.2) transparent" }}>
                                        {otherApis.map((api) => <ApiCard key={api._id} api={api} />)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Bottom action bar */}
            {!loading && apis.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/[0.06] backdrop-blur-xl bg-white/80 px-6 md:px-10 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-400">
                            {selected.size === 0
                                ? "Select APIs to begin, or go directly to dashboard"
                                : <><span className="text-[#FF3B8E] font-black">{selected.size}</span> of {apis.length} APIs ready</>}
                        </span>
                        <div className="flex gap-3">
                            <button onClick={() => navigate("/dashboard")}
                                className="flex items-center gap-2 text-slate-500 hover:text-[#FF3B8E] text-xs px-5 py-3 rounded-full border border-black/[0.08] hover:border-[#FF3B8E]/20 transition-all font-bold">
                                Skip →
                            </button>
                            <button onClick={handleProceed} disabled={selected.size === 0}
                                className="flex items-center gap-2 text-white font-black text-xs px-6 py-3 rounded-full active:scale-95 transition-all"
                                style={selected.size > 0
                                    ? { background: "linear-gradient(to right, #FF3B8E, #8E44AD)", boxShadow: "0 4px 16px rgba(255,59,142,0.3)" }
                                    : { background: "#f1f5f9", color: "#94a3b8", border: "1px solid rgba(0,0,0,0.08)", cursor: "not-allowed" }}>
                                <ArrowRight size={14} strokeWidth={3} />
                                Continue to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; letter-spacing: -0.02em; }
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
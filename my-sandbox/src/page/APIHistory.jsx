import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    History, Search,
    CheckCircle2, XCircle, IndianRupee, User, X, ChevronDown
} from "lucide-react";
import Navbar from "./Navbar";
import toast from "react-hot-toast";
import { getAllHistoryAPI, getCustomerHistoryAPI, getAllUsersAPI } from "../services/admin.service";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#A78BFA" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#818CF8" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#F87171" },
};

const infoToast = (msg) =>
    toast.custom((t) => (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#0a0a0a", color: "#fff", fontFamily: "Urbanist, sans-serif",
            fontSize: "13px", padding: "12px 16px", borderRadius: "16px",
            boxShadow: "0 0 0 1px rgba(255,59,142,0.2), 0 8px 32px rgba(0,0,0,0.5)",
            maxWidth: "400px", opacity: t.visible ? 1 : 0,
            transform: t.visible ? "translateY(0)" : "translateY(-8px)", transition: "all 0.2s ease",
        }}>
            <span style={{ flex: 1 }}>{msg}</span>
            <button onClick={() => toast.dismiss(t.id)} style={{
                background: "none", border: "none", color: "#888",
                cursor: "pointer", padding: "2px", display: "flex", alignItems: "center",
            }}><X size={13} /></button>
        </div>
    ), { duration: 3000 });

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
const timeAgo = (iso) => {
    const s = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (s < 60)    return `${s}s ago`;
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};

// ─── History Row ──────────────────────────────────────────────────────────────
function HistoryRow({ record, isAdmin }) {
    const [hovered, setHovered] = useState(false);
    const mc      = METHOD_COLORS[record.method] || METHOD_COLORS.POST;
    const success = record.status === "success";

    const apiName      = record.apiName || record.api?.name || "—";
    const url          = record.url || record.api?.url || "—";
    const customerName = record.user?.name || record.customerName || "—";
    const timestamp    = record.createdAt || record.timestamp || "";
    const amount       = record.amountDeducted || record.amount || 0;
    const statusCode   = record.statusCode || (success ? "200" : "ERR");

    const accentColor = success ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)";

    return (
        <div
            className="relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer"
            style={{
                background: hovered ? "#141414" : "#0c0c0c",
                boxShadow: hovered
                    ? `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${mc.border}35, 0 8px 32px rgba(0,0,0,0.3)`
                    : "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.06)",
                transform: hovered ? "translateY(-1px)" : "translateY(0)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-300"
                style={{
                    background: hovered
                        ? success ? "linear-gradient(to bottom, #4ade80, #22c55e)" : `linear-gradient(to bottom, ${mc.text}, ${mc.border})`
                        : "transparent"
                }} />

            {/* Hover glow overlay */}
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at left center, ${accentColor}, transparent 60%)`, opacity: hovered ? 1 : 0 }} />

            {/* Status icon */}
            <div className="relative flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                    background: success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    border: success ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
                    transform: hovered ? "scale(1.1)" : "scale(1)",
                }}>
                {success
                    ? <CheckCircle2 size={15} className="text-green-400" />
                    : <XCircle size={15} className="text-red-400" />}
            </div>

            {/* Method badge */}
            <span className="relative text-[9px] font-black px-2.5 py-1.5 rounded-xl flex-shrink-0 transition-all duration-300"
                style={{
                    background: mc.bg,
                    color: mc.text,
                    border: `1px solid ${mc.border}${hovered ? "80" : "40"}`,
                    boxShadow: hovered ? `0 0 12px ${mc.border}30` : "none",
                }}>
                {record.method}
            </span>

            {/* Main info */}
            <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-black text-sm transition-colors duration-200"
                        style={{ color: hovered ? "#fff" : "#e2e8f0" }}>{apiName}</p>
                    {isAdmin && customerName !== "—" && (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#A78BFA" }}>
                            <User size={9} /> {customerName}
                        </span>
                    )}
                    {timestamp && (
                        <span className="text-[10px] font-bold text-slate-500 flex-shrink-0">{formatDate(timestamp)}</span>
                    )}
                </div>
                <code className="text-[10px] truncate block transition-colors duration-200"
                    style={{ fontFamily: "monospace", color: hovered ? "#64748b" : "#374151" }}>{url}</code>
            </div>

            {/* Status code */}
            <span className="relative text-[10px] font-black px-3 py-1.5 rounded-full flex-shrink-0 transition-all duration-300"
                style={success
                    ? {
                        background: hovered ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.08)",
                        color: "#4ade80",
                        border: "1px solid rgba(34,197,94,0.25)",
                        boxShadow: hovered ? "0 0 12px rgba(34,197,94,0.2)" : "none"
                    }
                    : {
                        background: hovered ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)",
                        color: "#f87171",
                        border: "1px solid rgba(239,68,68,0.25)",
                        boxShadow: hovered ? "0 0 12px rgba(239,68,68,0.2)" : "none"
                    }}>
                {statusCode}
            </span>

            {/* Amount */}
            <div className="relative flex items-center gap-1 flex-shrink-0 px-3 py-1.5 rounded-full transition-all duration-300"
                style={{
                    background: hovered ? "rgba(255,59,142,0.1)" : "transparent",
                    border: hovered ? "1px solid rgba(255,59,142,0.2)" : "1px solid transparent",
                }}>
                <IndianRupee size={12} className="text-[#FF3B8E]" />
                <span className="text-sm font-black text-[#FF3B8E]" style={{ fontFamily: "monospace" }}>{amount}</span>
            </div>

            {/* Time */}
            {timestamp && (
                <div className="relative hidden sm:block text-right flex-shrink-0">
                    <p className="text-[11px] font-bold transition-colors duration-200"
                        style={{ fontFamily: "monospace", color: hovered ? "#94a3b8" : "#475569" }}>
                        {formatTime(timestamp)}
                    </p>
                </div>
            )}

            {/* Time ago badge */}
            {timestamp && (
                <div className="relative flex-shrink-0">
                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-full transition-all duration-300"
                        style={{
                            background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: hovered ? "#94a3b8" : "#475569",
                        }}>
                        {timeAgo(timestamp)}
                    </span>
                </div>
            )}
        </div>
    );
}

// ─── Customer Dropdown ────────────────────────────────────────────────────────
function CustomerDropdown({ customers, value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const selected = value === "ALL" ? null : customers.find((c) => c._id === value);
    const label    = selected ? selected.name : "All Customers";
    const initials = selected?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    const allOpts  = [
        { value: "ALL", label: "All Customers", email: null },
        ...customers.map((c) => ({ value: c._id, label: c.name, email: c.email, avatar: c.avatar, name: c.name }))
    ];

    return (
        <div ref={ref} className="relative w-full" style={{ overflow: "visible" }}>
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all"
                style={{
                    background: "#0f0f0f",
                    border: `1px solid ${open ? "rgba(255,59,142,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: selected ? "#FF3B8E" : "#64748b",
                }}>
                {selected?.avatar
                    ? <img src={selected.avatar} className="w-5 h-5 rounded-full object-cover flex-shrink-0" alt="" />
                    : selected
                        ? <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(255,59,142,0.15)", border: "1px solid rgba(255,59,142,0.3)" }}>
                            <span className="text-[7px] font-black text-[#FF3B8E]">{initials}</span>
                          </div>
                        : <User size={12} className="text-slate-600 flex-shrink-0" />}
                <span className="flex-1 text-left truncate">{label}</span>
                <ChevronDown size={12} className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#FF3B8E]" : "text-slate-600"}`} />
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    zIndex: 9999, background: "#0f0f0f",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px", overflow: "hidden",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,59,142,0.1)",
                }}>
                    {allOpts.map((opt, idx) => {
                        const isSel = value === opt.value;
                        const oi = opt.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                        return (
                            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                                style={{
                                    background: isSel ? "rgba(255,59,142,0.08)" : "transparent",
                                    borderLeft: isSel ? "2px solid #FF3B8E" : "2px solid transparent",
                                    borderBottom: idx < allOpts.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                                }}
                                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                                {opt.value === "ALL"
                                    ? <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                        <User size={13} className="text-slate-500" />
                                      </div>
                                    : opt.avatar
                                        ? <img src={opt.avatar} className="w-7 h-7 rounded-xl object-cover flex-shrink-0" alt="" />
                                        : <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.2)" }}>
                                            <span className="text-[9px] font-black text-[#FF3B8E]">{oi}</span>
                                          </div>}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate"
                                        style={{ color: isSel ? "#FF3B8E" : opt.value === "ALL" ? "#64748b" : "#fff" }}>
                                        {opt.label}
                                    </p>
                                    {opt.email && <p className="text-[10px] truncate text-slate-600" style={{ fontFamily: "monospace" }}>{opt.email}</p>}
                                </div>
                                {isSel && <span className="text-[#FF3B8E] text-xs font-black">✓</span>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function APIHistory() {
    const navigate = useNavigate();
    const user     = JSON.parse(localStorage.getItem("user"));
    const isAdmin  = user?.role === "admin";

    const [rawHistory,   setRawHistory]   = useState([]);
    const [customers,    setCustomers]    = useState([]);
    const [pageLoading,  setPageLoading]  = useState(true);

    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        const loadData = async () => {
            try {
                setPageLoading(true);
                if (isAdmin) {
                    const [historyRes, usersRes] = await Promise.all([getAllHistoryAPI(), getAllUsersAPI()]);
                    setRawHistory(historyRes.data || []);
                    setCustomers(usersRes.data || []);
                } else {
                    const res = await getCustomerHistoryAPI(user.id || user._id);
                    setRawHistory(res.data || []);
                }
            } catch (err) {
                console.log("❌ Load Error:", err.response?.data);
            } finally {
                setPageLoading(false);
            }
        };
        loadData();
    }, []);

    const [search,          setSearch]          = useState("");
    const [filterMethod,    setFilterMethod]    = useState("ALL");
    const [filterStatus,    setFilterStatus]    = useState("ALL");
    const [filterCustomer,  setFilterCustomer]  = useState("ALL");

    const methods  = ["ALL", "GET", "POST", "PUT", "DELETE"];
    const statuses = ["ALL", "success", "error"];

    const filtered = useMemo(() => {
        return rawHistory.filter((r) => {
            const apiName      = r.apiName || r.api?.name || "";
            const url          = r.url || r.api?.url || "";
            const customerName = r.user?.name || r.customerName || "";
            const matchSearch   = !search ||
                apiName.toLowerCase().includes(search.toLowerCase()) ||
                url.toLowerCase().includes(search.toLowerCase()) ||
                customerName.toLowerCase().includes(search.toLowerCase());
            const matchMethod   = filterMethod === "ALL" || r.method === filterMethod;
            const matchStatus   = filterStatus === "ALL" || r.status === filterStatus;
            const recordUserId  = r.user?._id || r.userId || "";
            const matchCustomer = filterCustomer === "ALL" || recordUserId === filterCustomer;
            return matchSearch && matchMethod && matchStatus && matchCustomer;
        });
    }, [rawHistory, search, filterMethod, filterStatus, filterCustomer]);

    const totalCalls   = filtered.length;
    const successCalls = filtered.filter((r) => r.status === "success").length;
    const totalSpent   = filtered.reduce((s, r) => s + (parseFloat(r.amountDeducted || r.amount) || 0), 0);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        infoToast("Logged out.");
        setTimeout(() => navigate("/login"), 800);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-x-hidden">

            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            {/* ─── NAVBAR ─── */}
            <Navbar
                showBack={true}
                badge="API History"
                badgeIcon={<History size={12} />}
                onLogout={handleLogout}
            />

            <main className="relative z-10 pt-24 px-6 md:px-10 pb-16 max-w-6xl mx-auto">

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                        {isAdmin ? "All Customers'" : "Your"}{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#A29BFE]">API History</span>
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isAdmin ? "Complete log of all API calls made by all customers" : "Complete log of all your API calls"}
                    </p>
                </div>

                {pageLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-8 h-8 border-2 border-white/5 border-t-[#FF3B8E] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: "Total Calls",  value: totalCalls,                color: "#FF3B8E",  glow: "rgba(255,59,142,0.12)" },
                                { label: "Successful",   value: successCalls,              color: "#4ade80",  glow: "rgba(34,197,94,0.12)" },
                                { label: "Failed",       value: totalCalls - successCalls, color: "#f87171",  glow: "rgba(239,68,68,0.12)" },
                                { label: "Total Spent",  value: `₹${totalSpent.toFixed(2)}`, color: "#A78BFA", glow: "rgba(167,139,250,0.12)" },
                            ].map((s, i) => (
                                <div key={i} className="rounded-[1.5rem] p-5 transition-all group relative overflow-hidden"
                                    style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.5rem]"
                                        style={{ background: `radial-gradient(ellipse at top left, ${s.glow}, transparent 70%)` }} />
                                    <p className="text-2xl font-black mb-1.5" style={{ color: s.color }}>{s.value}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col gap-3 mb-6 p-4 rounded-[1.5rem]"
                            style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)", overflow: "visible" }}>
                            <div className="flex gap-3 items-center" style={{ overflow: "visible" }}>
                                <div className="relative" style={{ flex: "0 0 calc(50% - 6px)" }}>
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input type="text" placeholder="Search API name, URL..." value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-white text-xs outline-none transition-all placeholder-slate-600"
                                        style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace" }}
                                        onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.06)"}
                                    />
                                </div>
                                {isAdmin && (
                                    <div style={{ flex: "0 0 calc(50% - 6px)", overflow: "visible" }}>
                                        <CustomerDropdown customers={customers} value={filterCustomer} onChange={setFilterCustomer} />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 flex-wrap items-center">
                                <div className="flex gap-1">
                                    {methods.map((m) => {
                                        const mc = METHOD_COLORS[m];
                                        const isActive = filterMethod === m;
                                        return (
                                            <button key={m} onClick={() => setFilterMethod(m)}
                                                className="px-3 py-1.5 rounded-full text-[9px] font-black border transition-all"
                                                style={isActive && m !== "ALL"
                                                    ? { background: mc.bg, border: `1px solid ${mc.border}`, color: mc.text }
                                                    : isActive && m === "ALL"
                                                        ? { background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.4)", color: "#FF3B8E" }
                                                        : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b" }}>
                                                {m}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-1">
                                    {statuses.map((s) => {
                                        const isActive = filterStatus === s;
                                        return (
                                            <button key={s} onClick={() => setFilterStatus(s)}
                                                className="px-3 py-1.5 rounded-full text-[9px] font-black border transition-all"
                                                style={isActive
                                                    ? s === "success"
                                                        ? { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }
                                                        : s === "error"
                                                            ? { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }
                                                            : { background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.4)", color: "#FF3B8E" }
                                                    : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b" }}>
                                                {s === "ALL" ? "ALL STATUS" : s.toUpperCase()}
                                            </button>
                                        );
                                    })}
                                </div>

                                {(search || filterMethod !== "ALL" || filterStatus !== "ALL" || filterCustomer !== "ALL") && (
                                    <button onClick={() => { setSearch(""); setFilterMethod("ALL"); setFilterStatus("ALL"); setFilterCustomer("ALL"); }}
                                        className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all flex-shrink-0"
                                        style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                        <X size={11} /> Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] text-slate-500">
                                Showing <span className="text-[#FF3B8E] font-bold">{filtered.length}</span> of {rawHistory.length} records
                            </p>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-20 rounded-[2rem]"
                                style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                    <History size={24} className="text-[#FF3B8E]" />
                                </div>
                                <p className="text-slate-500 text-sm">
                                    {rawHistory.length === 0 ? "No API calls yet. Start testing!" : "No records match your filters."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {filtered.map((record) => (
                                    <HistoryRow key={record._id} record={record} isAdmin={isAdmin} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; }
                code, pre { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
            `}</style>
        </div>
    );
}
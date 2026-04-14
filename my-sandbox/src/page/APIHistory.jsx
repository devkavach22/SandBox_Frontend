/* eslint-disable no-unused-vars */
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    History, Search,
    CheckCircle2, XCircle, IndianRupee, User, X, ChevronDown
} from "lucide-react";
import Navbar from "./Navbar";
import { getAllHistoryAPI, getCustomerHistoryAPI, getAllUsersAPI } from "../services/admin.service";
import { triggerAuthChange } from "../routes/AppRoutes";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#7C3AED" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#4F46E5" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#DC2626" },
};

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
    const mc      = METHOD_COLORS[record.method] || METHOD_COLORS.POST;
    const success = record.status === "success";

    const apiName      = record.apiName || record.api?.name || "—";
    const url          = record.url || record.api?.url || "—";
    const customerName = record.user?.name || record.customerName || "—";
    const timestamp    = record.createdAt || record.timestamp || "";
    const amount       = record.amountDeducted || record.amount || 0;
    const statusCode   = record.statusCode || (success ? "200" : "ERR");

    return (
        <div
            className="relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 overflow-hidden group border hover:shadow-md hover:-translate-y-0.5"
            style={{ background: "white", borderColor: "rgba(0,0,0,0.06)" }}
        >
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                style={{ background: "radial-gradient(ellipse at top left, rgba(255,59,142,0.05), transparent 70%)" }} />
            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 rounded-full"
                style={{ background: "linear-gradient(90deg, #FF3B8E, #8E44AD)" }} />

            {/* Status icon */}
            <div className="relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                    background: success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                    border: success ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
                }}>
                {success
                    ? <CheckCircle2 size={15} className="text-green-500" />
                    : <XCircle size={15} className="text-red-500" />}
            </div>

            {/* Method badge */}
            <span className="text-[9px] font-black px-2.5 py-1.5 rounded-xl flex-shrink-0"
                style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
                {record.method}
            </span>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-black text-sm text-gray-900">{apiName}</p>
                    {isAdmin && customerName !== "—" && (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "rgba(142,68,173,0.08)", border: "1px solid rgba(142,68,173,0.2)", color: "#8E44AD" }}>
                            <User size={9} /> {customerName}
                        </span>
                    )}
                    {timestamp && (
                        <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">{formatDate(timestamp)}</span>
                    )}
                </div>
                <code className="text-[10px] text-slate-400 truncate block">{url}</code>
            </div>

            {/* Status code */}
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full flex-shrink-0"
                style={success
                    ? { background: "rgba(34,197,94,0.08)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.25)" }
                    : { background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.25)" }}>
                {statusCode}
            </span>

            {/* Amount */}
            <div className="flex items-center gap-1 flex-shrink-0 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,59,142,0.07)", border: "1px solid rgba(255,59,142,0.15)" }}>
                <IndianRupee size={11} className="text-[#FF3B8E]" />
                <span className="text-sm font-black text-[#FF3B8E]">{amount}</span>
            </div>

            {/* Time */}
            {timestamp && (
                <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="text-[11px] font-bold text-slate-400">{formatTime(timestamp)}</p>
                </div>
            )}

            {/* Time ago */}
            {timestamp && (
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 text-slate-400"
                    style={{ background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.07)" }}>
                    {timeAgo(timestamp)}
                </span>
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
                    background: "white",
                    border: `1px solid ${open ? "rgba(255,59,142,0.4)" : "rgba(0,0,0,0.08)"}`,
                    color: selected ? "#FF3B8E" : "#94a3b8",
                    boxShadow: open ? "0 0 0 3px rgba(255,59,142,0.08)" : "none",
                }}>
                {selected?.avatar
                    ? <img src={selected.avatar} className="w-5 h-5 rounded-full object-cover flex-shrink-0" alt="" />
                    : selected
                        ? <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(255,59,142,0.12)", border: "1px solid rgba(255,59,142,0.3)" }}>
                            <span className="text-[7px] font-black text-[#FF3B8E]">{initials}</span>
                          </div>
                        : <User size={12} className="text-slate-400 flex-shrink-0" />}
                <span className="flex-1 text-left truncate">{label}</span>
                <ChevronDown size={12} className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#FF3B8E]" : "text-slate-400"}`} />
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    zIndex: 9999, background: "white",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "16px", overflow: "hidden",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,59,142,0.08)",
                }}>
                    {allOpts.map((opt, idx) => {
                        const isSel = value === opt.value;
                        const oi = opt.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                        return (
                            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                                style={{
                                    background: isSel ? "rgba(255,59,142,0.05)" : "transparent",
                                    borderLeft: isSel ? "2px solid #FF3B8E" : "2px solid transparent",
                                    borderBottom: idx < allOpts.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                                }}
                                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(0,0,0,0.02)"; }}
                                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                                {opt.value === "ALL"
                                    ? <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
                                        <User size={13} className="text-slate-400" />
                                      </div>
                                    : opt.avatar
                                        ? <img src={opt.avatar} className="w-7 h-7 rounded-xl object-cover flex-shrink-0" alt="" />
                                        : <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.18)" }}>
                                            <span className="text-[9px] font-black text-[#FF3B8E]">{oi}</span>
                                          </div>}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate"
                                        style={{ color: isSel ? "#FF3B8E" : opt.value === "ALL" ? "#94a3b8" : "#1e293b" }}>
                                        {opt.label}
                                    </p>
                                    {opt.email && <p className="text-[10px] truncate text-slate-400">{opt.email}</p>}
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

    const [rawHistory,  setRawHistory]  = useState([]);
    const [customers,   setCustomers]   = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

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

    const [search,         setSearch]         = useState("");
    const [filterMethod,   setFilterMethod]   = useState("ALL");
    const [filterStatus,   setFilterStatus]   = useState("ALL");
    const [filterCustomer, setFilterCustomer] = useState("ALL");

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
        triggerAuthChange();
        navigate("/login");
    };

    const hasFilters = search || filterMethod !== "ALL" || filterStatus !== "ALL" || filterCustomer !== "ALL";

    return (
        <div className="min-h-screen relative overflow-x-hidden"
            style={{ background: "#F8F7FF", color: "#334155", fontFamily: "'Urbanist', sans-serif" }}>

            {/* Glow blobs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full z-0 pointer-events-none"
                style={{ background: "rgba(255,59,142,0.12)", filter: "blur(80px)" }} />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full z-0 pointer-events-none"
                style={{ background: "rgba(142,68,173,0.1)", filter: "blur(80px)" }} />

            {/* ─── NAVBAR ─── */}
            <Navbar
                showDashboardLinks
                showLogout
                user={user}
                onLogout={handleLogout}
            />

            <div className="relative z-10 px-6 md:px-10 pt-24 pb-16 max-w-6xl mx-auto">

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">
                        {isAdmin ? "All Customers'" : "Your"}{" "}
                        <span style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            API History
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {isAdmin ? "Complete log of all API calls made by all customers" : "Complete log of all your API calls"}
                    </p>
                </div>

                {pageLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-8 h-8 border-2 border-black/5 border-t-[#FF3B8E] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ─── Stats ─── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: "Total Calls",  value: totalCalls,                  color: "#FF3B8E", glow: "rgba(255,59,142,0.1)" },
                                { label: "Successful",   value: successCalls,                color: "#16a34a", glow: "rgba(34,197,94,0.1)"  },
                                { label: "Failed",       value: totalCalls - successCalls,   color: "#dc2626", glow: "rgba(239,68,68,0.1)"  },
                                { label: "Total Spent",  value: `₹${totalSpent.toFixed(2)}`, color: "#8E44AD", glow: "rgba(142,68,173,0.1)" },
                            ].map((card, i) => (
                                <div key={i}
                                    className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden cursor-default">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                                        style={{ background: `radial-gradient(ellipse at top left, ${card.glow}, transparent 70%)` }} />
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 rounded-full"
                                        style={{ background: "linear-gradient(90deg, #FF3B8E, #8E44AD)" }} />
                                    <p className="text-3xl font-black mb-1.5" style={{ color: card.color }}>{card.value}</p>
                                    <p className="text-[10px] text-slate-400 tracking-[0.2em] font-bold uppercase">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* ─── Filters ─── */}
                        <div className="flex flex-col gap-3 mb-6 p-4 rounded-2xl bg-white border border-black/[0.06] shadow-sm"
                            style={{ overflow: "visible" }}>
                            <div className="flex gap-3 items-center" style={{ overflow: "visible" }}>
                                <div className="relative" style={{ flex: "0 0 calc(50% - 6px)" }}>
                                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input type="text" placeholder="Search API name, URL..." value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-gray-900 text-sm outline-none transition-all placeholder-slate-400"
                                        style={{ background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)", fontFamily: "'Urbanist', sans-serif", caretColor: "#FF3B8E" }}
                                        onFocus={e => { e.target.style.borderColor = "rgba(255,59,142,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,59,142,0.08)"; }}
                                        onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
                                    />
                                </div>
                                {isAdmin && (
                                    <div style={{ flex: "0 0 calc(50% - 6px)", overflow: "visible" }}>
                                        <CustomerDropdown customers={customers} value={filterCustomer} onChange={setFilterCustomer} />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 flex-wrap items-center">
                                {/* Method filters */}
                                <div className="flex gap-1.5">
                                    {methods.map((m) => {
                                        const mc = METHOD_COLORS[m];
                                        const isActive = filterMethod === m;
                                        return (
                                            <button key={m} onClick={() => setFilterMethod(m)}
                                                className="px-3 py-1.5 rounded-full text-[10px] font-black border transition-all"
                                                style={isActive && m !== "ALL"
                                                    ? { background: mc.bg, border: `1px solid ${mc.border}`, color: mc.text }
                                                    : isActive && m === "ALL"
                                                        ? { background: "linear-gradient(to right, #FF3B8E, #8E44AD)", border: "none", color: "#fff", boxShadow: "0 4px 12px rgba(255,59,142,0.2)" }
                                                        : { background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)", color: "#94a3b8" }}>
                                                {m}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Status filters */}
                                <div className="flex gap-1.5">
                                    {statuses.map((s) => {
                                        const isActive = filterStatus === s;
                                        return (
                                            <button key={s} onClick={() => setFilterStatus(s)}
                                                className="px-3 py-1.5 rounded-full text-[10px] font-black border transition-all"
                                                style={isActive
                                                    ? s === "success"
                                                        ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.35)", color: "#16a34a" }
                                                        : s === "error"
                                                            ? { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)", color: "#dc2626" }
                                                            : { background: "linear-gradient(to right, #FF3B8E, #8E44AD)", border: "none", color: "#fff", boxShadow: "0 4px 12px rgba(255,59,142,0.2)" }
                                                    : { background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)", color: "#94a3b8" }}>
                                                {s === "ALL" ? "ALL STATUS" : s.toUpperCase()}
                                            </button>
                                        );
                                    })}
                                </div>

                                {hasFilters && (
                                    <button onClick={() => { setSearch(""); setFilterMethod("ALL"); setFilterStatus("ALL"); setFilterCustomer("ALL"); }}
                                        className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all"
                                        style={{ color: "#dc2626", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                        <X size={10} /> Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Count */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] text-slate-400">
                                Showing <span className="text-[#FF3B8E] font-bold">{filtered.length}</span> of {rawHistory.length} records
                            </p>
                        </div>

                        {/* List */}
                        {filtered.length === 0 ? (
                            <div className="rounded-3xl p-20 flex flex-col items-center justify-center gap-4"
                                style={{ border: "1px dashed rgba(0,0,0,0.12)", background: "white" }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                    <History size={24} className="text-[#FF3B8E]" />
                                </div>
                                <p className="text-slate-400 text-sm">
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
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; letter-spacing: -0.02em; }
            `}</style>
        </div>
    );
}
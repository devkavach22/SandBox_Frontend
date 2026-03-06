import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    CreditCard, Search, User,
    X, ChevronDown, CheckCircle2, IndianRupee, TrendingUp, Wallet, Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllPaymentsAPI, getCustomerPaymentsAPI } from "../services/payment.service";
import { getAllUsersAPI } from "../services/admin.service";
import Navbar from "./Navbar"; // ← reusable navbar

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

// ─── Generic Dropdown ─────────────────────────────────────────────────────────
function CustomDropdown({ options, value, onChange, icon: Icon, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const selected = options.find((o) => o.value === value);
    return (
        <div ref={ref} className="relative" style={{ overflow: "visible" }}>
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap"
                style={{
                    background: "#0f0f0f",
                    border: `1px solid ${open ? "rgba(255,59,142,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: value !== "ALL" ? "#FF3B8E" : "#64748b",
                    minWidth: "130px",
                }}>
                {Icon && <Icon size={12} className="flex-shrink-0" style={{ color: value !== "ALL" ? "#FF3B8E" : "#64748b" }} />}
                <span className="flex-1 text-left truncate">{selected?.label || placeholder}</span>
                <ChevronDown size={11} className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#FF3B8E]" : "text-slate-600"}`} />
            </button>
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: "100%",
                    zIndex: 9999, background: "#0f0f0f",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px", overflow: "hidden",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,59,142,0.08)",
                }}>
                    {options.map((opt, idx) => {
                        const isSel = value === opt.value;
                        return (
                            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                                style={{
                                    background: isSel ? "rgba(255,59,142,0.08)" : "transparent",
                                    borderLeft: isSel ? "2px solid #FF3B8E" : "2px solid transparent",
                                    borderBottom: idx < options.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                                    whiteSpace: "nowrap",
                                }}
                                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                                <p className="text-xs font-bold" style={{ color: isSel ? "#FF3B8E" : "#fff" }}>{opt.label}</p>
                                {isSel && <span className="ml-auto text-[#FF3B8E] text-xs font-black">✓</span>}
                            </button>
                        );
                    })}
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

// ─── Payment Row ──────────────────────────────────────────────────────────────
function PaymentRow({ record, isAdmin }) {
    const [hovered, setHovered] = useState(false);
    const [copied,  setCopied]  = useState(false);

    const paymentId     = record.transaction_id || record.payment_id || "";
    const timestamp     = record.createdAt || record.timestamp || "";
    const customerName  = record.user?.name  || record.userId?.name  || "—";
    const customerEmail = record.user?.email || record.userId?.email || "—";
    const initials      = customerName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    const copyId = () => {
        navigator.clipboard.writeText(paymentId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer"
            style={{
                background: hovered ? "#141414" : "#0c0c0c",
                boxShadow: hovered
                    ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,59,142,0.25), 0 8px 32px rgba(0,0,0,0.3)"
                    : "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.06)",
                transform: hovered ? "translateY(-1px)" : "translateY(0)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-300"
                style={{ background: hovered ? "linear-gradient(to bottom, #FF3B8E, #8E44AD)" : "transparent" }} />
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
                style={{ background: "radial-gradient(ellipse at left center, rgba(255,59,142,0.08), transparent 60%)", opacity: hovered ? 1 : 0 }} />

            <div className="relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                    background: hovered ? "rgba(255,59,142,0.15)" : "rgba(255,59,142,0.08)",
                    border: "1px solid rgba(255,59,142,0.2)",
                    transform: hovered ? "scale(1.1)" : "scale(1)",
                }}>
                <CheckCircle2 size={16} className="text-[#FF3B8E]" />
            </div>

            {isAdmin && (
                <div className="relative flex items-center gap-2 flex-shrink-0 w-36">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                        <span className="text-[9px] font-black text-[#A78BFA]">{initials || "?"}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black truncate transition-colors duration-200"
                            style={{ color: hovered ? "#fff" : "#e2e8f0" }}>{customerName}</p>
                        <p className="text-[9px] truncate text-slate-600" style={{ fontFamily: "monospace" }}>{customerEmail}</p>
                    </div>
                </div>
            )}

            <div className="relative flex-1 min-w-0">
                <p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wider font-bold">Payment ID</p>
                <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-300 truncate transition-colors duration-200"
                        style={{ fontFamily: "monospace", color: hovered ? "#94a3b8" : "#475569" }}>
                        {paymentId || "—"}
                    </code>
                    <button onClick={copyId}
                        className="flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all"
                        style={copied
                            ? { color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)" }
                            : { color: "#475569", border: "1px solid rgba(255,255,255,0.08)", background: "transparent" }}>
                        {copied ? "✓ Copied" : "Copy"}
                    </button>
                </div>
            </div>

            <div className="relative flex-shrink-0 text-center px-3 py-2 rounded-2xl transition-all duration-300"
                style={{
                    background: hovered ? "rgba(255,59,142,0.1)" : "transparent",
                    border: hovered ? "1px solid rgba(255,59,142,0.2)" : "1px solid transparent",
                }}>
                <p className="text-[9px] text-slate-600 mb-0.5 uppercase tracking-wider font-bold">Amount</p>
                <div className="flex items-center gap-0.5 justify-center">
                    <IndianRupee size={13} className="text-[#FF3B8E]" />
                    <span className="text-base font-black text-[#FF3B8E]" style={{ fontFamily: "monospace" }}>
                        {parseFloat(record.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            <div className="relative flex-shrink-0 text-center hidden md:block">
                <p className="text-[9px] text-slate-600 mb-0.5 uppercase tracking-wider font-bold">Status</p>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all duration-300"
                    style={{
                        background: hovered ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.08)",
                        color: "#4ade80",
                        border: "1px solid rgba(34,197,94,0.25)",
                        boxShadow: hovered ? "0 0 10px rgba(34,197,94,0.2)" : "none",
                    }}>
                    {record.status || "Success"}
                </span>
            </div>

            <div className="relative flex-shrink-0 text-right hidden sm:block">
                <p className="text-[9px] text-slate-600 mb-0.5 uppercase tracking-wider font-bold">Date</p>
                <p className="text-[11px] font-bold transition-colors duration-200"
                    style={{ fontFamily: "monospace", color: hovered ? "#94a3b8" : "#475569" }}>
                    {timestamp ? formatDate(timestamp) : "—"}
                </p>
            </div>

            <div className="relative flex-shrink-0 flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full transition-all duration-300"
                    style={{
                        background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: hovered ? "#94a3b8" : "#475569",
                    }}>
                    {timestamp ? timeAgo(timestamp) : "—"}
                </span>
                <span className="text-[9px] transition-colors duration-200"
                    style={{ fontFamily: "monospace", color: hovered ? "#64748b" : "#374151" }}>
                    {timestamp ? formatTime(timestamp) : ""}
                </span>
            </div>
        </div>
    );
}

// ─── Filter Options ───────────────────────────────────────────────────────────
const AMOUNT_OPTIONS = [
    { value: "ALL",       label: "All Amounts" },
    { value: "0-100",     label: "₹0 – ₹100" },
    { value: "100-500",   label: "₹100 – ₹500" },
    { value: "500-1000",  label: "₹500 – ₹1,000" },
    { value: "1000-5000", label: "₹1,000 – ₹5,000" },
    { value: "5000+",     label: "₹5,000+" },
];

const getMonthOptions = (payments) => {
    const seen = new Set();
    const opts = [{ value: "ALL", label: "All Months" }];
    payments.forEach((p) => {
        const d   = new Date(p.createdAt || p.timestamp);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        if (!seen.has(key)) { seen.add(key); opts.push({ value: key, label }); }
    });
    return opts;
};

const getDateOptions = (payments, monthFilter) => {
    const seen = new Set();
    const opts = [{ value: "ALL", label: "All Dates" }];
    payments
        .filter((p) => {
            if (monthFilter === "ALL") return true;
            const d   = new Date(p.createdAt || p.timestamp);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            return key === monthFilter;
        })
        .forEach((p) => {
            const d   = new Date(p.createdAt || p.timestamp);
            const key = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            if (!seen.has(key)) { seen.add(key); opts.push({ value: key, label }); }
        });
    return opts;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Payment() {
    const navigate = useNavigate();
    const user     = JSON.parse(localStorage.getItem("user"));
    const isAdmin  = user?.role === "admin";

    const [rawPayments, setRawPayments] = useState([]);
    const [customers,   setCustomers]   = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        const loadData = async () => {
            try {
                setPageLoading(true);
                if (isAdmin) {
                    const [paymentsRes, usersRes] = await Promise.all([getAllPaymentsAPI(), getAllUsersAPI()]);
                    setRawPayments(paymentsRes.data || []);
                    setCustomers(usersRes.data || []);
                } else {
                    const res = await getCustomerPaymentsAPI(user.id || user._id);
                    setRawPayments(res.data || []);
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
    const [filterCustomer,  setFilterCustomer]  = useState("ALL");
    const [filterAmount,    setFilterAmount]    = useState("ALL");
    const [filterMonth,     setFilterMonth]     = useState("ALL");
    const [filterDate,      setFilterDate]      = useState("ALL");

    const handleMonthChange = (val) => { setFilterMonth(val); setFilterDate("ALL"); };

    const monthOptions = useMemo(() => getMonthOptions(rawPayments), [rawPayments]);
    const dateOptions  = useMemo(() => getDateOptions(rawPayments, filterMonth), [rawPayments, filterMonth]);

    const filtered = useMemo(() => {
        return rawPayments.filter((r) => {
            const amt          = parseFloat(r.amount) || 0;
            const paymentId    = r.transaction_id || r.payment_id || "";
            const customerName = r.user?.name || r.userId?.name || "";
            const timestamp    = r.createdAt || r.timestamp || "";

            const matchSearch   = !search ||
                paymentId.toLowerCase().includes(search.toLowerCase()) ||
                customerName.toLowerCase().includes(search.toLowerCase());

            const recordUserId  = r.user?._id || r.userId?._id || "";
            const matchCustomer = filterCustomer === "ALL" || recordUserId === filterCustomer;

            let matchAmount = true;
            if (filterAmount !== "ALL") {
                if (filterAmount === "5000+") matchAmount = amt >= 5000;
                else {
                    const [lo, hi] = filterAmount.split("-").map(Number);
                    matchAmount = amt >= lo && amt < hi;
                }
            }

            let matchMonth = true;
            if (filterMonth !== "ALL" && timestamp) {
                const d   = new Date(timestamp);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                matchMonth = key === filterMonth;
            }

            let matchDate = true;
            if (filterDate !== "ALL" && timestamp) {
                matchDate = new Date(timestamp).toISOString().slice(0, 10) === filterDate;
            }

            return matchSearch && matchCustomer && matchAmount && matchMonth && matchDate;
        });
    }, [rawPayments, search, filterCustomer, filterAmount, filterMonth, filterDate]);

    const totalAmount     = filtered.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const totalTxns       = filtered.length;
    const avgAmount       = totalTxns > 0 ? totalAmount / totalTxns : 0;
    const uniqueCustomers = new Set(filtered.map((r) => r.user?._id || r.userId?._id)).size;
    const hasFilters      = search || filterCustomer !== "ALL" || filterAmount !== "ALL" || filterMonth !== "ALL" || filterDate !== "ALL";

    const clearAll = () => {
        setSearch(""); setFilterCustomer("ALL");
        setFilterAmount("ALL"); setFilterMonth("ALL"); setFilterDate("ALL");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        infoToast("Logged out.");
        setTimeout(() => navigate("/login"), 800);
    };

    const stats = [
        { label: "Total Transactions", value: totalTxns,   icon: <CreditCard size={18} />, color: "#FF3B8E",  glow: "rgba(255,59,142,0.12)" },
        { label: "Total Collected",    value: `₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: <TrendingUp size={18} />, color: "#4ade80", glow: "rgba(34,197,94,0.12)" },
        { label: "Avg Transaction",    value: `₹${avgAmount.toFixed(2)}`, icon: <Wallet size={18} />, color: "#818CF8", glow: "rgba(99,102,241,0.12)" },
        isAdmin
            ? { label: "Unique Customers", value: uniqueCustomers, icon: <User size={18} />, color: "#A78BFA", glow: "rgba(167,139,250,0.12)" }
            : { label: "Total Added",      value: `₹${totalAmount.toFixed(2)}`, icon: <Wallet size={18} />, color: "#A78BFA", glow: "rgba(167,139,250,0.12)" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-x-hidden">

            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            {/* ─── REUSABLE NAVBAR ─── */}
            <Navbar
                showBack
                badge="Payments"
                badgeIcon={<CreditCard size={12} />}
                onLogout={handleLogout}
            />

            <main className="relative z-10 pt-24 px-6 md:px-10 pb-16 max-w-6xl mx-auto">

                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                        {isAdmin ? "All Customers'" : "Your"}{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#A29BFE]">Payment History</span>
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isAdmin ? "Complete payment log of all customers" : "All your wallet top-up transactions"}
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
                            {stats.map((s, i) => (
                                <div key={i} className="rounded-[1.5rem] p-5 transition-all group relative overflow-hidden"
                                    style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.5rem]"
                                        style={{ background: `radial-gradient(ellipse at top left, ${s.glow}, transparent 70%)` }} />
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                                            style={{ background: s.glow, border: `1px solid ${s.color}30` }}>
                                            <span style={{ color: s.color }}>{s.icon}</span>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black mb-1.5" style={{ color: s.color }}>{s.value}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col gap-4 mb-6 p-5 rounded-[1.5rem]"
                            style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)", overflow: "visible" }}>

                            <div className="flex gap-3 items-center flex-wrap" style={{ overflow: "visible" }}>
                                <div className="relative flex-1 min-w-[180px]">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input type="text" placeholder="Search payment ID or customer..." value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-white text-xs outline-none transition-all placeholder-slate-600"
                                        style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace" }}
                                        onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.06)"}
                                    />
                                </div>
                                {isAdmin && (
                                    <div style={{ flex: "0 0 calc(38% - 6px)", overflow: "visible" }}>
                                        <CustomerDropdown customers={customers} value={filterCustomer} onChange={setFilterCustomer} />
                                    </div>
                                )}
                                {hasFilters && (
                                    <button onClick={clearAll}
                                        className="flex items-center gap-1 text-[10px] font-bold px-3 py-2 rounded-full transition-all flex-shrink-0"
                                        style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                        <X size={11} /> Clear All
                                    </button>
                                )}
                            </div>

                            {/* Amount filters */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider flex-shrink-0 w-16">
                                    <IndianRupee size={10} /> Amt
                                </div>
                                {AMOUNT_OPTIONS.map((opt) => {
                                    const isActive = filterAmount === opt.value;
                                    return (
                                        <button key={opt.value} onClick={() => setFilterAmount(opt.value)}
                                            className="px-3 py-1.5 rounded-full text-[10px] font-black border transition-all"
                                            style={isActive
                                                ? { background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.4)", color: "#FF3B8E", boxShadow: "0 0 8px rgba(255,59,142,0.15)" }
                                                : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b" }}>
                                            {opt.value === "ALL" ? "All" : opt.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Date filters */}
                            <div className="flex items-center gap-2 flex-wrap" style={{ overflow: "visible" }}>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider flex-shrink-0 w-16">
                                    <Calendar size={10} /> Date
                                </div>
                                <CustomDropdown options={monthOptions} value={filterMonth} onChange={handleMonthChange} icon={Calendar} placeholder="All Months" />
                                {filterMonth !== "ALL" && (
                                    <CustomDropdown options={dateOptions} value={filterDate} onChange={setFilterDate} icon={Calendar} placeholder="All Dates" />
                                )}
                            </div>

                            {/* Active filters */}
                            {(filterMonth !== "ALL" || filterDate !== "ALL") && (
                                <div className="flex gap-2 flex-wrap pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase self-center">Active:</span>
                                    {filterMonth !== "ALL" && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                                            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818CF8" }}>
                                            <Calendar size={9} /> {monthOptions.find(o => o.value === filterMonth)?.label}
                                            <button onClick={() => { setFilterMonth("ALL"); setFilterDate("ALL"); }}><X size={9} /></button>
                                        </span>
                                    )}
                                    {filterDate !== "ALL" && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                                            style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#A78BFA" }}>
                                            <Calendar size={9} /> {dateOptions.find(o => o.value === filterDate)?.label}
                                            <button onClick={() => setFilterDate("ALL")}><X size={9} /></button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] text-slate-500">
                                Showing <span className="text-[#FF3B8E] font-bold">{filtered.length}</span> of {rawPayments.length} transactions
                            </p>
                            {totalAmount > 0 && (
                                <p className="text-[11px] text-slate-500">
                                    Filtered Total: <span className="font-bold text-[#FF3B8E]">
                                        ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </span>
                                </p>
                            )}
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-20 rounded-[2rem]"
                                style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                    <CreditCard size={24} className="text-[#FF3B8E]" />
                                </div>
                                <p className="text-slate-500 text-sm">
                                    {rawPayments.length === 0 ? "No payments yet. Add balance to get started!" : "No records match your filters."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {filtered.map((record) => (
                                    <PaymentRow key={record._id} record={record} isAdmin={isAdmin} />
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
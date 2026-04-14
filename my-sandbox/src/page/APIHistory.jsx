/* eslint-disable no-unused-vars */
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    History, Search,
    CheckCircle2, XCircle, IndianRupee, User, X, ChevronDown,
    Activity, TrendingUp, AlertCircle, Wallet, Phone, Globe, Clock
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, subtext, subtext2, accentColor, glowColor, borderHover, Icon, badge }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: "white",
                border: `1px solid ${hovered ? borderHover : "rgba(0,0,0,0.06)"}`,
                borderRadius: 20,
                padding: "18px 20px 16px",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                boxShadow: hovered ? `0 12px 32px ${glowColor}` : "0 1px 4px rgba(0,0,0,0.04)",
            }}
        >
            {/* Top accent bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: accentColor, borderRadius: "20px 20px 0 0",
                opacity: hovered ? 1 : 0, transition: "opacity 0.22s ease",
            }} />

            {/* Header row: icon + badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 11,
                    background: glowColor, border: `1px solid ${borderHover}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={15} style={{ color: accentColor }} />
                </div>
                {badge && (
                    <span style={{
                        fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 100,
                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                        letterSpacing: "0.04em", whiteSpace: "nowrap",
                    }}>{badge.text}</span>
                )}
            </div>

            {/* Value */}
            <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, margin: "0 0 4px", color: accentColor }}>
                {value}
            </p>

            {/* Label */}
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 12px" }}>
                {label}
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "0 0 10px" }} />

            {/* Sub rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {subtext && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{subtext.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: subtext.color || "#64748b" }}>{subtext.value}</span>
                    </div>
                )}
                {subtext2 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{subtext2.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: subtext2.color || "#64748b" }}>{subtext2.value}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

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

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 16px",
                borderRadius: 14,
                background: hovered ? "rgba(255,59,142,0.02)" : "rgba(248,247,255,0.6)",
                border: `1px solid ${hovered ? "rgba(255,59,142,0.18)" : "rgba(0,0,0,0.05)"}`,
                transform: hovered ? "translateX(3px)" : "translateX(0)",
                transition: "all 0.2s ease",
                overflow: "hidden",
                cursor: "default",
                minWidth: 0,
            }}
        >
            {/* Left accent bar */}
            <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                background: success ? "linear-gradient(180deg,#22c55e,#16a34a)" : "linear-gradient(180deg,#ef4444,#dc2626)",
                borderRadius: "14px 0 0 14px",
                opacity: hovered ? 1 : 0.3,
                transition: "opacity 0.2s ease",
            }} />

            {/* Status icon */}
            <div style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                border: success ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
            }}>
                {success ? <CheckCircle2 size={14} color="#22c55e" /> : <XCircle size={14} color="#ef4444" />}
            </div>

            {/* Method badge */}
            <span style={{
                fontSize: 9, fontWeight: 900, padding: "4px 9px", borderRadius: 8, flexShrink: 0,
                background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40`,
                letterSpacing: "0.04em", whiteSpace: "nowrap",
            }}>
                {record.method}
            </span>

            {/* Main info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                    <p style={{ fontWeight: 800, fontSize: 13, color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {apiName}
                    </p>
                    {isAdmin && customerName !== "—" && (
                        <span style={{
                            display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 700,
                            padding: "2px 7px", borderRadius: 100,
                            background: "rgba(142,68,173,0.07)", border: "1px solid rgba(142,68,173,0.18)", color: "#8E44AD",
                            flexShrink: 0, whiteSpace: "nowrap",
                        }}>
                            <User size={8} /> {customerName}
                        </span>
                    )}
                    {timestamp && (
                        <span className="ah-hide-xs" style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", flexShrink: 0, whiteSpace: "nowrap" }}>
                            {formatDate(timestamp)}
                        </span>
                    )}
                </div>
                <code style={{ fontSize: 10, color: "#94a3b8", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {url}
                </code>
            </div>

            {/* Status code */}
            <span className="ah-hide-xs" style={{
                fontSize: 10, fontWeight: 900, padding: "4px 10px", borderRadius: 100, flexShrink: 0, whiteSpace: "nowrap",
                ...(success
                    ? { background: "rgba(34,197,94,0.08)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.25)" }
                    : { background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.25)" })
            }}>
                {statusCode}
            </span>

            {/* Amount */}
            <div style={{
                display: "flex", alignItems: "center", gap: 3, flexShrink: 0,
                padding: "4px 10px", borderRadius: 100,
                background: hovered ? "rgba(255,59,142,0.1)" : "rgba(255,59,142,0.06)",
                border: "1px solid rgba(255,59,142,0.15)", transition: "background 0.18s ease",
                whiteSpace: "nowrap",
            }}>
                <IndianRupee size={10} color="#FF3B8E" />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#FF3B8E" }}>{amount}</span>
            </div>

            {/* Time */}
            {timestamp && (
                <p className="ah-hide-xs" style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", margin: 0, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {formatTime(timestamp)}
                </p>
            )}

            {/* Time ago */}
            {timestamp && (
                <span style={{
                    fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 100, flexShrink: 0,
                    color: "#94a3b8", background: "white", border: "1px solid rgba(0,0,0,0.07)", whiteSpace: "nowrap",
                }}>
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
        <div ref={ref} style={{ position: "relative", width: "100%", overflow: "visible" }}>
            <button onClick={() => setOpen(!open)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 12,
                background: "white",
                border: `1px solid ${open ? "rgba(255,59,142,0.4)" : "rgba(0,0,0,0.08)"}`,
                color: selected ? "#FF3B8E" : "#94a3b8",
                boxShadow: open ? "0 0 0 3px rgba(255,59,142,0.08)" : "none",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Urbanist', sans-serif", transition: "all 0.18s ease",
            }}>
                {selected?.avatar
                    ? <img src={selected.avatar} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} alt="" />
                    : selected
                        ? <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(255,59,142,0.12)", border: "1px solid rgba(255,59,142,0.3)" }}>
                            <span style={{ fontSize: 7, fontWeight: 900, color: "#FF3B8E" }}>{initials}</span>
                          </div>
                        : <User size={12} color="#94a3b8" style={{ flexShrink: 0 }} />}
                <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                <ChevronDown size={12} color={open ? "#FF3B8E" : "#94a3b8"} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }} />
            </button>
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    zIndex: 9999, background: "white",
                    border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "hidden",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                }}>
                    {allOpts.map((opt, idx) => {
                        const isSel = value === opt.value;
                        const oi = opt.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                        return (
                            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
                                width: "100%", display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 14px", textAlign: "left",
                                background: isSel ? "rgba(255,59,142,0.05)" : "transparent",
                                borderLeft: isSel ? "2px solid #FF3B8E" : "2px solid transparent",
                                borderBottom: idx < allOpts.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                                borderTop: "none", borderRight: "none",
                                cursor: "pointer", fontFamily: "'Urbanist', sans-serif", transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "rgba(0,0,0,0.02)"; }}
                            onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                                {opt.value === "ALL"
                                    ? <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}><User size={13} color="#94a3b8" /></div>
                                    : opt.avatar
                                        ? <img src={opt.avatar} style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" />
                                        : <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.18)" }}>
                                            <span style={{ fontSize: 9, fontWeight: 900, color: "#FF3B8E" }}>{oi}</span>
                                          </div>}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0, color: isSel ? "#FF3B8E" : opt.value === "ALL" ? "#94a3b8" : "#1e293b" }}>{opt.label}</p>
                                    {opt.email && <p style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#94a3b8", margin: 0 }}>{opt.email}</p>}
                                </div>
                                {isSel && <span style={{ color: "#FF3B8E", fontSize: 12, fontWeight: 900 }}>✓</span>}
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
    const failedCalls  = totalCalls - successCalls;
    const totalSpent   = filtered.reduce((s, r) => s + (parseFloat(r.amountDeducted || r.amount) || 0), 0);
    const successRate  = totalCalls > 0 ? ((successCalls / totalCalls) * 100).toFixed(0) : 0;
    const avgPerCall   = totalCalls > 0 ? (totalSpent / totalCalls).toFixed(2) : "0.00";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        triggerAuthChange();
        navigate("/login");
    };

    const hasFilters = search || filterMethod !== "ALL" || filterStatus !== "ALL" || filterCustomer !== "ALL";

    const statCards = [
        {
            label: "Total Calls", value: totalCalls, Icon: Activity,
            accentColor: "#FF3B8E", glowColor: "rgba(255,59,142,0.08)", borderHover: "rgba(255,59,142,0.25)",
            badge: { text: "ALL TIME", bg: "rgba(255,59,142,0.07)", color: "#FF3B8E", border: "rgba(255,59,142,0.2)" },
            subtext:  { label: "Total requests", value: rawHistory.length, color: "#0f172a" },
            subtext2: { label: "Filtered showing", value: totalCalls, color: "#FF3B8E" },
        },
        {
            label: "Successful", value: successCalls, Icon: TrendingUp,
            accentColor: "#16a34a", glowColor: "rgba(34,197,94,0.08)", borderHover: "rgba(34,197,94,0.25)",
            badge: { text: `${successRate}% RATE`, bg: "rgba(34,197,94,0.07)", color: "#16a34a", border: "rgba(34,197,94,0.2)" },
            subtext:  { label: "Success rate", value: `${successRate}%`, color: "#16a34a" },
            subtext2: { label: "Out of total", value: totalCalls, color: "#64748b" },
        },
        {
            label: "Failed", value: failedCalls, Icon: AlertCircle,
            accentColor: "#dc2626", glowColor: "rgba(239,68,68,0.08)", borderHover: "rgba(239,68,68,0.25)",
            badge: failedCalls === 0
                ? { text: "ALL CLEAR", bg: "rgba(34,197,94,0.07)", color: "#16a34a", border: "rgba(34,197,94,0.2)" }
                : { text: "NEEDS ATTENTION", bg: "rgba(239,68,68,0.07)", color: "#dc2626", border: "rgba(239,68,68,0.2)" },
            subtext:  { label: "Error rate", value: totalCalls > 0 ? `${((failedCalls / totalCalls) * 100).toFixed(0)}%` : "0%", color: failedCalls > 0 ? "#dc2626" : "#16a34a" },
            subtext2: { label: "Status", value: failedCalls === 0 ? "No issues" : "Check logs", color: failedCalls > 0 ? "#dc2626" : "#16a34a" },
        },
        {
            label: "Total Spent", value: `₹${totalSpent.toFixed(2)}`, Icon: Wallet,
            accentColor: "#8E44AD", glowColor: "rgba(142,68,173,0.08)", borderHover: "rgba(142,68,173,0.25)",
            badge: { text: "BILLING", bg: "rgba(142,68,173,0.07)", color: "#8E44AD", border: "rgba(142,68,173,0.2)" },
            subtext:  { label: "Avg per call", value: `₹${avgPerCall}`, color: "#8E44AD" },
            subtext2: { label: "Total calls billed", value: totalCalls, color: "#64748b" },
        },
    ];

    return (
        <div style={{
            minHeight: "100vh", background: "#F8F7FF", color: "#334155",
            fontFamily: "'Urbanist', sans-serif", position: "relative", overflowX: "hidden",
        }}>
            {/* Glow blobs */}
            <div style={{ position: "fixed", top: "-10%", left: "-10%", width: "40%", height: "40%", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "rgba(255,59,142,0.1)", filter: "blur(80px)" }} />
            <div style={{ position: "fixed", bottom: "-10%", right: "-10%", width: "40%", height: "40%", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "rgba(142,68,173,0.08)", filter: "blur(80px)" }} />

            <Navbar showDashboardLinks showLogout user={user} onLogout={handleLogout} />

            <div className="ah-page" style={{ position: "relative", zIndex: 10, width: "100%", boxSizing: "border-box" }}>

                {/* ─── Header ─── */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
                        letterSpacing: "0.08em", textTransform: "uppercase", color: "#FF3B8E",
                        background: "rgba(255,59,142,0.07)", border: "1px solid rgba(255,59,142,0.18)",
                        borderRadius: 100, padding: "4px 12px", marginBottom: 12,
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B8E", animation: "ahPulse 2s ease-in-out infinite", display: "inline-block" }} />
                        Live activity log
                    </div>
                    <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 8px", lineHeight: 1.15 }}>
                        {isAdmin ? "All Customers'" : "Your"}{" "}
                        <span style={{ background: "linear-gradient(to right,#FF3B8E,#8E44AD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            API History
                        </span>
                    </h1>
                    <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                        {isAdmin
                            ? <>Every call across all customers — <strong style={{ color: "#0f172a", fontWeight: 700 }}>timestamped, searchable, and tracked.</strong></>
                            : <>Every call you've made — <strong style={{ color: "#0f172a", fontWeight: 700 }}>timestamped, searchable, and tracked.</strong> Nothing slips through.</>
                        }
                    </p>
                </div>

                {pageLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 0" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.05)", borderTopColor: "#FF3B8E", animation: "ahSpin 0.7s linear infinite" }} />
                    </div>
                ) : (
                    <>
                        {/* ─── Stat Cards ─── */}
                        <div className="ah-stats-grid" style={{ display: "grid", gap: 14, marginBottom: 24 }}>
                            {statCards.map((card, i) => <StatCard key={i} {...card} />)}
                        </div>

                        {/* ─── Records Card ─── */}
                        <div style={{
                            background: "white",
                            border: "1px solid rgba(0,0,0,0.06)",
                            borderRadius: 22,
                            boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                            overflow: "visible",
                        }}>
                            {/* Card Header */}
                            <div style={{
                                padding: "18px 20px 0",
                                borderBottom: "1px solid rgba(0,0,0,0.05)",
                                marginBottom: 0,
                            }}>
                                {/* Search + dropdown */}
                                <div className="ah-filter-row" style={{ display: "flex", gap: 10, alignItems: "center", overflow: "visible", marginBottom: 14 }}>
                                    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                                        <Search size={13} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                                        <input type="text" placeholder="Search API name, URL..." value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            style={{
                                                width: "100%", borderRadius: 12, paddingLeft: 36, paddingRight: 14,
                                                paddingTop: 9, paddingBottom: 9,
                                                color: "#0f172a", fontSize: 13, outline: "none",
                                                background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)",
                                                fontFamily: "'Urbanist', sans-serif", caretColor: "#FF3B8E",
                                                boxSizing: "border-box", transition: "border-color 0.18s, box-shadow 0.18s",
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = "rgba(255,59,142,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,59,142,0.08)"; }}
                                            onBlur={(e) => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
                                        />
                                    </div>
                                    {isAdmin && (
                                        <div className="ah-dropdown-wrap" style={{ overflow: "visible" }}>
                                            <CustomerDropdown customers={customers} value={filterCustomer} onChange={setFilterCustomer} />
                                        </div>
                                    )}
                                </div>

                                {/* Pills + count row */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, paddingBottom: 14 }}>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                                        {methods.map((m) => {
                                            const mc = METHOD_COLORS[m];
                                            const isActive = filterMethod === m;
                                            return (
                                                <button key={m} onClick={() => setFilterMethod(m)} style={{
                                                    padding: "5px 12px", borderRadius: 100, fontSize: 10, fontWeight: 900,
                                                    cursor: "pointer", fontFamily: "'Urbanist', sans-serif",
                                                    transition: "all 0.18s ease", whiteSpace: "nowrap",
                                                    ...(isActive && m !== "ALL"
                                                        ? { background: mc.bg, border: `1px solid ${mc.border}`, color: mc.text }
                                                        : isActive
                                                            ? { background: "linear-gradient(to right,#FF3B8E,#8E44AD)", border: "none", color: "#fff", boxShadow: "0 4px 12px rgba(255,59,142,0.25)" }
                                                            : { background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)", color: "#94a3b8" }),
                                                }}>{m}</button>
                                            );
                                        })}
                                        <div style={{ width: 1, height: 16, background: "rgba(0,0,0,0.08)", flexShrink: 0 }} />
                                        {statuses.map((s) => {
                                            const isActive = filterStatus === s;
                                            return (
                                                <button key={s} onClick={() => setFilterStatus(s)} style={{
                                                    padding: "5px 12px", borderRadius: 100, fontSize: 10, fontWeight: 900,
                                                    cursor: "pointer", fontFamily: "'Urbanist', sans-serif",
                                                    transition: "all 0.18s ease", whiteSpace: "nowrap",
                                                    ...(isActive
                                                        ? s === "success"
                                                            ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.35)", color: "#16a34a" }
                                                            : s === "error"
                                                                ? { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)", color: "#dc2626" }
                                                                : { background: "linear-gradient(to right,#FF3B8E,#8E44AD)", border: "none", color: "#fff", boxShadow: "0 4px 12px rgba(255,59,142,0.25)" }
                                                        : { background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)", color: "#94a3b8" }),
                                                }}>
                                                    {s === "ALL" ? "All Status" : s === "success" ? "Success" : "Error"}
                                                </button>
                                            );
                                        })}
                                        {hasFilters && (
                                            <button onClick={() => { setSearch(""); setFilterMethod("ALL"); setFilterStatus("ALL"); setFilterCustomer("ALL"); }} style={{
                                                display: "flex", alignItems: "center", gap: 4,
                                                fontSize: 10, fontWeight: 700, padding: "5px 10px", borderRadius: 100,
                                                color: "#dc2626", background: "rgba(239,68,68,0.07)",
                                                border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer",
                                                fontFamily: "'Urbanist', sans-serif",
                                            }}>
                                                <X size={10} /> Clear
                                            </button>
                                        )}
                                    </div>

                                    {/* Record count badge */}
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        padding: "5px 12px", borderRadius: 100,
                                        background: "rgba(255,59,142,0.05)", border: "1px solid rgba(255,59,142,0.15)",
                                    }}>
                                        <History size={11} color="#FF3B8E" />
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#FF3B8E" }}>{filtered.length}</span>
                                        <span style={{ fontSize: 11, color: "#94a3b8" }}>of {rawHistory.length} records</span>
                                    </div>
                                </div>
                            </div>

                            {/* Records list body */}
                            <div style={{ padding: "14px 16px 16px" }}>
                                {filtered.length === 0 ? (
                                    <div style={{
                                        padding: "60px 20px",
                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
                                        border: "1px dashed rgba(0,0,0,0.1)", borderRadius: 16, background: "#FAFAFA",
                                    }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,59,142,0.07)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                            <History size={20} color="#FF3B8E" />
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", margin: "0 0 4px" }}>
                                                {rawHistory.length === 0 ? "No API calls yet" : "No records match"}
                                            </p>
                                            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                                                {rawHistory.length === 0 ? "Start testing your APIs to see activity here." : "Try adjusting your filters or search query."}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {filtered.map((record) => (
                                            <HistoryRow key={record._id} record={record} isAdmin={isAdmin} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { font-family: 'Urbanist', sans-serif; letter-spacing: -0.02em; box-sizing: border-box; }
                @keyframes ahPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
                @keyframes ahSpin  { to { transform: rotate(360deg); } }

                .ah-page { padding: 88px 40px 64px; }
                @media (max-width: 768px) { .ah-page { padding: 80px 20px 48px; } }
                @media (max-width: 480px) { .ah-page { padding: 76px 14px 40px; } }

                .ah-stats-grid { grid-template-columns: repeat(4, 1fr); }
                @media (max-width: 960px) { .ah-stats-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 400px) { .ah-stats-grid { grid-template-columns: repeat(1, 1fr); } }

                .ah-dropdown-wrap { width: 220px; flex-shrink: 0; }
                @media (max-width: 640px) {
                    .ah-filter-row { flex-direction: column !important; }
                    .ah-filter-row > * { width: 100% !important; }
                    .ah-dropdown-wrap { width: 100%; }
                }
                @media (max-width: 540px) { .ah-hide-xs { display: none !important; } }
            `}</style>
        </div>
    );
}
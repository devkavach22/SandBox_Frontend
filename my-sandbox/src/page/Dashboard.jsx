/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Zap, Plus, History, CreditCard, User, LogOut, X,
    Activity, Wallet, Code2, Timer, Play, Key, Info,
    ChevronDown, ChevronUp, Copy, Check, Search
} from "lucide-react";
import { usePayment } from "../hooks/usepayment";
import { useCustomer } from "../hooks/useCustomer";
import { getCustomerHistoryAPI } from "../services/customer.service";
import { triggerAuthChange } from "../routes/AppRoutes";

const METHOD_COLORS = {
    GET: { bg: "rgba(139,92,246,0.08)", border: "#8B5CF6", text: "#A78BFA" },
    POST: { bg: "rgba(255,59,142,0.08)", border: "#FF3B8E", text: "#FF3B8E" },
    PUT: { bg: "rgba(99,102,241,0.08)", border: "#6366F1", text: "#818CF8" },
    DELETE: { bg: "rgba(239,68,68,0.08)", border: "#EF4444", text: "#F87171" },
};

const METHOD_FILTERS = ["ALL", "GET", "POST", "PUT", "DELETE"];

function getSectionKey(api) {
    const cat = (api.category || "").trim().toLowerCase();
    if (cat === "konverthr_odoo") return "konverthr_odoo";
    if (cat === "konverthr_node") return "konverthr_node";
    if (cat === "konverthr_other") return "konverthr_other";
    const url = (api.url || "").toLowerCase();
    if (url.includes("odoo") || url.includes("/web/") || url.includes("jsonrpc")) return "konverthr_odoo";
    return "konverthr_node";
}

const SECTIONS = [
    { key: "konverthr_node", label: "Node.js APIs", color: "#FF3B8E", border: "rgba(255,59,142,0.15)", glow: "rgba(255,59,142,0.06)" },
    { key: "konverthr_odoo", label: "Odoo APIs", color: "#A78BFA", border: "rgba(167,139,250,0.15)", glow: "rgba(167,139,250,0.06)" },
    { key: "konverthr_other", label: "Other APIs", color: "#34D399", border: "rgba(52,211,153,0.15)", glow: "rgba(52,211,153,0.06)" },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { createOrder, verifyPayment, loading: paymentLoading } = usePayment();
    const { fetchUserProfile, deselectApi } = useCustomer();

    const [user, setUser] = useState(null);
    const [selectedApis, setSelectedApis] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [apiCallCount, setApiCallCount] = useState(0);
    const [showAuthInfo, setShowAuthInfo] = useState(true);
    const [copied, setCopied] = useState(null);
    const [toast, setToast] = useState(null);
    const [sandboxSearch, setSandboxSearch] = useState("");
    const [sandboxMethodFilter, setSandboxMethodFilter] = useState("ALL");

    const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) { navigate("/login"); return; }
        setUser(storedUser);
        setBalance(storedUser.balance || 0);
        fetchUserProfile(storedUser.id).then((profile) => {
            if (profile) {
                setSelectedApis(profile.selectedApis || []);
                const currentBalance = profile.balance || 0;
                setBalance(currentBalance);
                if (currentBalance === 0) setShowPayment(true);
            }
        });
        getCustomerHistoryAPI(storedUser.id)
            .then((res) => setApiCallCount(res?.count ?? res?.data?.length ?? 0))
            .catch(() => { });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        triggerAuthChange();
        navigate("/login");
    };

    const handleRemoveApi = async (api) => {
        setSelectedApis((prev) => prev.filter((a) => a._id !== api._id));
        try { await deselectApi(user.id, api._id); }
        catch { setSelectedApis((prev) => [...prev, api]); }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handlePayment = async () => {
        if (!amount || amount <= 0) return;
        try {
            const orderRes = await createOrder(amount);
            const order = orderRes.data;
            const options = {
                key: "rzp_test_SKgLsCXlMbmxsZ",
                amount: order.amount, currency: "INR",
                name: "SandboxHub", description: "Add Balance", order_id: order.id,
                handler: async (response) => {
                    const verifyRes = await verifyPayment({
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        amount, userId: user.id,
                    });
                    const newBalance = verifyRes?.data?.balance || balance + amount;
                    const updatedUser = { ...user, balance: newBalance };
                    setBalance(newBalance); setUser(updatedUser);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    showToast("Payment Successful! Balance Added ✅");
                    setShowPayment(false); setAmount(0);
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: "#FF3B8E" },
            };
            new window.Razorpay(options).open();
        } catch (err) {
            console.log("❌ Payment Error:", err);
            showToast("Payment Failed! Please try again.", "error");
        }
    };

    const filteredApis = selectedApis.filter((api) => {
        const q = sandboxSearch.trim().toLowerCase();
        const matchesSearch = !q || api.name?.toLowerCase().includes(q) || api.description?.toLowerCase().includes(q) || api.url?.toLowerCase().includes(q);
        const matchesMethod = sandboxMethodFilter === "ALL" || api.method === sandboxMethodFilter;
        return matchesSearch && matchesMethod;
    });

    const nodeApis = filteredApis.filter((a) => getSectionKey(a) === "konverthr_node");
    const odooApis = filteredApis.filter((a) => getSectionKey(a) === "konverthr_odoo");
    const otherApis = filteredApis.filter((a) => getSectionKey(a) === "konverthr_other");
    const isFiltering = sandboxSearch.trim() || sandboxMethodFilter !== "ALL";

    const authRequestBody = `{\n  "user_name": "Komal"\n}`;
    const authResponseBody = `{\n  "status": "success",\n  "token": "4c16f70193749be219adb0ad6f9dd840",\n  "user_name": "Komal",\n  "message": "Existing valid token returned"\n}`;
    const authEndpoint = "https://staging.konverthr.com/api/auth";

    // ── API Card ──
    const ApiCard = ({ api }) => {
        const mc = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
        return (
            <div className="rounded-[1.5rem] p-5 transition-all duration-300 group relative overflow-hidden"
                style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.5rem]"
                    style={{ background: "radial-gradient(ellipse at top left, rgba(255,59,142,0.06), transparent 70%)" }} />
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0"
                            style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
                            {api.method}
                        </span>
                        <h3 className="font-black text-white text-sm truncate">{api.name}</h3>
                    </div>
                    <span className="font-black text-[#FF3B8E] text-sm flex-shrink-0 ml-2">₹{api.pricePerCall}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed line-clamp-2">{api.description}</p>
                <div className="flex items-center justify-between">
                    <code className="text-[10px] text-slate-600 px-2 py-1 rounded-lg truncate max-w-[55%]"
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        {api.url}
                    </code>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleRemoveApi(api)}
                            className="flex items-center gap-1 text-[10px] font-black text-red-400 px-3 py-1.5 rounded-full transition-all"
                            style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)" }}>
                            <X size={10} /> REMOVE
                        </button>
                        <button onClick={() => navigate(`/sandbox/${api._id}`, { state: { api } })}
                            className="flex items-center gap-1 text-[10px] font-black text-white px-3 py-1.5 rounded-full hover:brightness-110 transition-all"
                            style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}>
                            <Play size={10} fill="white" /> RUN
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Section Column ──
    const SectionColumn = ({ section, apis: sectionApis }) => (
        <div className="rounded-[1.5rem] overflow-hidden"
            style={{ background: "#0a0a0a", border: `1px solid ${section.border}`, boxShadow: `0 0 40px ${section.glow}` }}>
            <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: `1px solid ${section.border}` }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: section.color }} />
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: section.color }}>
                        {section.label}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${section.color}18`, color: section.color, border: `1px solid ${section.border}` }}>
                        {sectionApis.length}
                    </span>
                </div>
            </div>
            <div className="p-4">
                {sectionApis.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-slate-600 text-xs">
                            {isFiltering ? "No APIs match your filter." : "No APIs selected in this category."}
                        </p>
                        {!isFiltering && (
                            <button onClick={() => navigate("/apis")}
                                className="mt-3 text-[10px] font-black px-4 py-2 rounded-full transition-all"
                                style={{ background: `${section.color}12`, border: `1px solid ${section.border}`, color: section.color }}>
                                + SELECT
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-0.5 pb-4"
                        style={{ scrollbarWidth: "thin", scrollbarColor: `${section.color}30 transparent` }}>
                        {sectionApis.map((api) => <ApiCard key={api._id} api={api} />)}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-x-hidden">
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            {/* ─── NAVBAR ─── */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-3xl bg-black/40 px-6 md:px-10 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
                    <div className="w-9 h-9 bg-gradient-to-br from-[#FF3B8E] to-[#8E44AD] rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:rotate-6 transition-transform">
                        <Zap size={18} className="text-white fill-current" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-white">
                        Sandbox<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#A29BFE]">Hub</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowPayment(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#FF3B8E] to-[#8E44AD] text-white font-black text-xs px-4 py-2.5 rounded-full hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-pink-500/20">
                        <Plus size={13} /> ADD BALANCE
                    </button>
                    <button onClick={() => navigate("/history")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white text-xs px-3 py-2.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                        <History size={13} /> HISTORY
                    </button>
                    <button onClick={() => navigate("/payments")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white text-xs px-3 py-2.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                        <CreditCard size={13} /> PAYMENTS
                    </button>
                    <button onClick={() => navigate("/profile")}
                        className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 hover:border-[#FF3B8E]/30 hover:bg-white/5 transition-all">
                        {user?.avatar
                            ? <img src={user.avatar} className="w-6 h-6 rounded-full object-cover border border-white/20" alt="" />
                            : <div className="w-6 h-6 bg-gradient-to-br from-[#FF3B8E]/30 to-[#8E44AD]/30 rounded-full flex items-center justify-center">
                                <User size={12} className="text-[#FF3B8E]" />
                            </div>}
                        <div>
                            <p className="text-xs font-black text-white">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
                        </div>
                    </button>
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 text-slate-500 hover:text-red-400 text-xs px-3 py-2.5 rounded-full border border-white/10 hover:border-red-500/30 transition-all">
                        <LogOut size={13} /> LOGOUT
                    </button>
                </div>
            </nav>

            <div className="relative z-10 px-6 md:px-10 pt-24 pb-16">

                {/* ─── STATS ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: <Activity size={20} />, value: apiCallCount, label: "API CALLS", color: "#FF3B8E", glow: "rgba(255,59,142,0.15)" },
                        { icon: <Wallet size={20} />, value: `₹${balance}`, label: "WALLET BALANCE", color: "#A78BFA", glow: "rgba(167,139,250,0.15)" },
                        { icon: <Code2 size={20} />, value: selectedApis.length, label: "MY APIS", color: "#FF3B8E", glow: "rgba(255,59,142,0.15)" },
                        { icon: <Timer size={20} />, value: "124ms", label: "AVG RESPONSE", color: "#A78BFA", glow: "rgba(167,139,250,0.15)" },
                    ].map((card, i) => (
                        <div key={i} style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.06)" }}
                            className="bg-[#0f0f0f] rounded-[1.5rem] p-6 hover:bg-[#141414] transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.5rem]"
                                style={{ background: `radial-gradient(ellipse at top left, ${card.glow}, transparent 70%)` }} />
                            <div className="flex justify-between items-start mb-5">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                    style={{ background: card.glow, border: `1px solid ${card.color}30` }}>
                                    <span style={{ color: card.color }}>{card.icon}</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black mb-1.5" style={{ color: card.color }}>{card.value}</p>
                            <p className="text-[10px] text-slate-500 tracking-[0.2em] font-bold uppercase">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* ─── AUTH NOTICE ─── */}
                <div className="mb-6">
                    <div style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,59,142,0.15)" }}
                        className="bg-[#0f0f0f] rounded-[1.5rem] overflow-hidden">
                        <button onClick={() => setShowAuthInfo((p) => !p)}
                            className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(255,59,142,0.12)", border: "1px solid rgba(255,59,142,0.25)" }}>
                                    <Key size={15} className="text-[#FF3B8E]" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-white">KonvertHR — Authentication Required</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Retrieve an auth token before calling any KonvertHR API</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black px-3 py-1 rounded-full text-[#FF3B8E]"
                                    style={{ background: "rgba(255,59,142,0.12)", border: "1px solid rgba(255,59,142,0.25)" }}>MANDATORY</span>
                                {showAuthInfo ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
                            </div>
                        </button>

                        {showAuthInfo && (
                            <div className="border-t border-white/[0.05] px-6 py-6 space-y-5">
                                <div className="flex items-start gap-3 rounded-2xl px-4 py-3"
                                    style={{ background: "rgba(255,59,142,0.06)", border: "1px solid rgba(255,59,142,0.12)" }}>
                                    <Info size={13} className="text-[#FF3B8E] mt-0.5 flex-shrink-0" />
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        All KonvertHR APIs require a valid <span className="text-white font-bold">token</span> in the request header.
                                        Call the Authentication endpoint first, then include it as{" "}
                                        <code className="bg-black/60 px-1.5 py-0.5 rounded text-[#FF3B8E]">Authorization: &lt;token&gt;</code> in all subsequent requests.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#FF3B8E]"
                                                    style={{ background: "rgba(255,59,142,0.15)", border: "1px solid rgba(255,59,142,0.3)" }}>1</span>
                                                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Auth Endpoint &amp; Request</span>
                                            </div>
                                            <button onClick={() => handleCopy(`POST ${authEndpoint}\n\n${authRequestBody}`, "req")}
                                                className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-[#FF3B8E] transition-all">
                                                {copied === "req" ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                                                {copied === "req" ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                        <div className="rounded-2xl p-4 space-y-2"
                                            style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg"
                                                    style={{ background: METHOD_COLORS.POST.bg, color: METHOD_COLORS.POST.text, border: `1px solid ${METHOD_COLORS.POST.border}40` }}>POST</span>
                                                <code className="text-[10px] text-slate-500 truncate">{authEndpoint}</code>
                                            </div>
                                            <pre className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">{authRequestBody}</pre>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#A78BFA]"
                                                    style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>2</span>
                                                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Response — Token</span>
                                            </div>
                                            <button onClick={() => handleCopy(authResponseBody, "res")}
                                                className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-[#A78BFA] transition-all">
                                                {copied === "res" ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                                                {copied === "res" ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                        <div className="rounded-2xl p-4" style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">
                                                {`{
  "status": `}<span className="text-green-400">"success"</span>{`,
  "token": `}<span className="text-[#FF3B8E]">"4c16f70193749be219adb0ad6f9dd840"</span>{`,
  "user_name": `}<span className="text-[#A78BFA]">"Komal"</span>{`,
  "message": `}<span className="text-green-400">"Existing valid token returned"</span>{`
}`}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
                                    style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#818CF8] flex-shrink-0"
                                        style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>3</span>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Copy the <span className="text-[#FF3B8E] font-bold">token</span> and pass it in the{" "}
                                        <code className="mx-1 bg-white/5 px-1.5 py-0.5 rounded text-[#A78BFA]">Authorization</code> header as{" "}
                                        <code className="bg-white/5 px-1.5 py-0.5 rounded text-[#A78BFA]">&lt;token&gt;</code> for all subsequent KonvertHR API calls.
                                    </p>
                                </div>
                                <div className="rounded-2xl overflow-hidden"
                                    style={{ background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.18)" }}>
                                    <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#A78BFA] flex-shrink-0"
                                            style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)" }}>4</span>
                                        <div className="flex items-center gap-2 flex-1">
                                            <p className="text-[11px] font-black text-white">Where to find your <code className="bg-black/60 px-1.5 py-0.5 rounded text-[#A78BFA]">user_id</code>?</p>
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-[#A78BFA]"
                                                style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)" }}>IMPORTANT</span>
                                        </div>
                                    </div>
                                    <div className="px-5 py-4 space-y-4">
                                        <div className="flex items-start gap-3 rounded-xl px-4 py-3"
                                            style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.1)" }}>
                                            <Info size={13} className="text-[#A78BFA] mt-0.5 flex-shrink-0" />
                                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                                When you <span className="text-white font-bold">sign up</span> or <span className="text-white font-bold">log in</span> to KonvertHR,
                                                the API response returns your unique <code className="mx-1 bg-black/60 px-1.5 py-0.5 rounded text-[#A78BFA]">user_id</code>.
                                                Always use your <span className="text-[#A78BFA] font-bold">real user_id</span> — <span className="text-red-400 font-bold">never</span> use a placeholder.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-500 tracking-[0.18em] uppercase mb-2 px-1">Example Signup / Login Response</p>
                                            <div className="rounded-xl p-4" style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">
                                                    {`{
  "status": `}<span className="text-green-400">"success"</span>{`,
  "user_id": `}<span className="text-[#A78BFA] font-bold">"64f3a1c2e8b12d0017a9c3f5"</span>{`,
  "user_name": `}<span className="text-[#FF3B8E]">"Komal"</span>{`,
  "token": `}<span className="text-[#FF3B8E]">"4c16f70193749be219adb0ad6f9dd840"</span>{`
}`}
                                                </pre>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] flex-shrink-0" />
                                            <p className="text-[10px] text-slate-500">
                                                💡 Save this <code className="bg-black/60 px-1.5 py-0.5 rounded text-[#A78BFA]">user_id</code> after login — you'll need it in subsequent API requests.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── API SANDBOX ─── */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-black text-white tracking-tight">My API Sandbox</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 px-3 py-1.5 rounded-full"
                                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                                {selectedApis.length} APIs selected
                            </span>
                            <button onClick={() => navigate("/apis")}
                                className="flex items-center gap-2 text-xs font-black px-4 py-1.5 rounded-full text-[#FF3B8E] transition-all"
                                style={{ border: "1px solid rgba(255,59,142,0.3)", background: "rgba(255,59,142,0.08)" }}>
                                <Plus size={12} /> MANAGE
                            </button>
                        </div>
                    </div>

                    {/* ── Search + Filter bar ── */}
                    {selectedApis.length > 0 && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1 group">
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                                    style={{ boxShadow: "0 0 0 1px rgba(255,59,142,0.25), 0 4px 20px rgba(255,59,142,0.06)" }} />
                                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                                    style={{ color: sandboxSearch ? "#FF3B8E" : "#475569" }} />
                                <input type="text" value={sandboxSearch} onChange={(e) => setSandboxSearch(e.target.value)}
                                    placeholder="Search your APIs by name, URL…"
                                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none py-3 pl-9 pr-8 rounded-2xl"
                                    style={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "Urbanist, sans-serif", caretColor: "#FF3B8E" }} />
                                {sandboxSearch && (
                                    <button onClick={() => setSandboxSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                                        <X size={11} strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {METHOD_FILTERS.map((m) => {
                                    const mc = METHOD_COLORS[m];
                                    const isActive = sandboxMethodFilter === m;
                                    return (
                                        <button key={m} onClick={() => setSandboxMethodFilter(m)}
                                            className="text-[10px] font-black px-3 py-2 rounded-xl transition-all"
                                            style={isActive
                                                ? m === "ALL"
                                                    ? { background: "linear-gradient(to right, #FF3B8E, #8E44AD)", color: "#fff", boxShadow: "0 0 12px rgba(255,59,142,0.25)" }
                                                    : { background: mc.bg, color: mc.text, border: `1px solid ${mc.border}`, boxShadow: `0 0 10px ${mc.border}30` }
                                                : { background: "rgba(255,255,255,0.02)", color: "#475569", border: "1px solid rgba(255,255,255,0.07)" }
                                            }>
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Filter result pill ── */}
                    {selectedApis.length > 0 && isFiltering && (
                        <div className="flex items-center gap-2 mb-5">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{
                                    background: filteredApis.length > 0 ? "rgba(255,59,142,0.08)" : "rgba(100,116,139,0.08)",
                                    border: `1px solid ${filteredApis.length > 0 ? "rgba(255,59,142,0.2)" : "rgba(100,116,139,0.15)"}`,
                                }}>
                                <div className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                        background: filteredApis.length > 0 ? "#FF3B8E" : "#64748b",
                                        boxShadow: filteredApis.length > 0 ? "0 0 6px #FF3B8E" : "none"
                                    }} />
                                <span className="text-[11px] font-black"
                                    style={{ color: filteredApis.length > 0 ? "#FF3B8E" : "#64748b" }}>
                                    {filteredApis.length === 0
                                        ? "No APIs match"
                                        : `${filteredApis.length} of ${selectedApis.length} APIs`}
                                </span>
                            </div>
                            {sandboxMethodFilter !== "ALL" && (() => {
                                const mc = METHOD_COLORS[sandboxMethodFilter];
                                return (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black"
                                        style={{ background: mc.bg, border: `1px solid ${mc.border}50`, color: mc.text }}>
                                        {sandboxMethodFilter}
                                        <button onClick={() => setSandboxMethodFilter("ALL")}
                                            className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity">
                                            <X size={9} strokeWidth={3} />
                                        </button>
                                    </div>
                                );
                            })()}
                            {sandboxSearch.trim() && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                                    "{sandboxSearch}"
                                    <button onClick={() => setSandboxSearch("")}
                                        className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity">
                                        <X size={9} strokeWidth={3} />
                                    </button>
                                </div>
                            )}
                            <button onClick={() => { setSandboxSearch(""); setSandboxMethodFilter("ALL"); }}
                                className="flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full transition-all"
                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748b" }}
                                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                                onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
                                <X size={9} strokeWidth={3} /> Clear all
                            </button>
                        </div>
                    )}

                    {/* ── No APIs selected ── */}
                    {selectedApis.length === 0 ? (
                        <div className="rounded-[2rem] p-20 flex flex-col items-center justify-center gap-4"
                            style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                            <p className="text-slate-600 text-sm">No APIs selected yet.</p>
                            <button onClick={() => navigate("/apis")}
                                className="flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-full text-[#FF3B8E] transition-all"
                                style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.2)" }}>
                                <Plus size={13} /> SELECT APIS
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* ── TOP ROW: Node.js | Odoo ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionColumn section={SECTIONS[0]} apis={nodeApis} />
                                <SectionColumn section={SECTIONS[1]} apis={odooApis} />
                            </div>
                            {/* ── BOTTOM ROW: Other (full width) ── */}
                            <div className="grid grid-cols-1 gap-5">
                                <SectionColumn section={SECTIONS[2]} apis={otherApis} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── PAYMENT MODAL ─── */}
            {showPayment && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 px-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-7 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight">Add Balance</h3>
                                <p className="text-[10px] text-slate-500 mt-1">{balance === 0 ? "⚠️ Add balance to start using APIs" : "Secure payment via Razorpay"}</p>
                            </div>
                            {balance > 0 && (
                                <button onClick={() => { setShowPayment(false); setAmount(0); }}
                                    className="w-8 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:border-red-500/30 hover:text-red-400 transition-all">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {balance === 0 && (
                            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                <p className="text-[11px] text-red-400 font-bold">Your wallet is empty. Add balance to call APIs.</p>
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Amount</label>
                            <div className="flex items-center bg-black/40 border border-white/5 rounded-2xl px-4 py-3.5 focus-within:border-[#FF3B8E]/40 transition-all">
                                <span className="text-slate-500 mr-2 font-bold">₹</span>
                                <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))}
                                    placeholder="0.00" className="bg-transparent text-white outline-none w-full text-sm font-bold" />
                            </div>
                        </div>
                        <div className="mb-7">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Quick Select</label>
                            <div className="grid grid-cols-3 gap-2">
                                {quickAmounts.map((q) => (
                                    <button key={q} onClick={() => setAmount(q)}
                                        className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${amount === q
                                                ? "bg-gradient-to-r from-[#FF3B8E]/20 to-[#8E44AD]/20 border-[#FF3B8E]/50 text-[#FF3B8E]"
                                                : "bg-white/[0.02] border-white/[0.06] text-slate-500 hover:border-[#FF3B8E]/20 hover:text-white"
                                            }`}>₹{q}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={handlePayment} disabled={paymentLoading || !amount || amount <= 0}
                            className="w-full bg-gradient-to-r from-[#FF3B8E] to-[#8E44AD] text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20">
                            {paymentLoading
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><Zap size={16} fill="white" /> PAY ₹{amount || 0}</>}
                        </button>
                        <p className="text-center text-[10px] text-slate-600 mt-3">🔒 Powered by Razorpay</p>
                    </div>
                </div>
            )}

            {/* ─── TOAST ─── */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl text-sm font-bold
                    ${toast.type === "success" ? "bg-[#0a0a0a] border-[#FF3B8E]/30 text-[#FF3B8E]" : "bg-[#0a0a0a] border-red-500/30 text-red-400"}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${toast.type === "success" ? "bg-[#FF3B8E]" : "bg-red-500"}`} />
                    {toast.message}
                    <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100"><X size={12} /></button>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
}
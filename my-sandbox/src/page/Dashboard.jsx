/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
    Zap, Plus, X,
    Activity, Wallet, Code2, Timer, Play, Key, Info,
    ChevronDown, ChevronUp, Copy, Check, Search
} from "lucide-react";
import { usePayment } from "../hooks/usepayment";
import { useCustomer } from "../hooks/useCustomer";
import { getCustomerHistoryAPI } from "../services/customer.service";
import { triggerAuthChange } from "../routes/AppRoutes";

const METHOD_COLORS = {
    GET: { bg: "rgba(139,92,246,0.08)", border: "#8B5CF6", text: "#7C3AED" },
    POST: { bg: "rgba(255,59,142,0.08)", border: "#FF3B8E", text: "#FF3B8E" },
    PUT: { bg: "rgba(99,102,241,0.08)", border: "#6366F1", text: "#4F46E5" },
    DELETE: { bg: "rgba(239,68,68,0.08)", border: "#EF4444", text: "#DC2626" },
};

const METHOD_FILTERS = ["ALL", "GET", "POST", "PUT", "DELETE"];

const SECTIONS = [
    { key: "konverthr_node", label: "Node.js APIs", color: "#FF3B8E", border: "rgba(255,59,142,0.18)", glow: "rgba(255,59,142,0.06)" },
    { key: "konverthr_odoo", label: "Odoo APIs", color: "#8E44AD", border: "rgba(142,68,173,0.18)", glow: "rgba(142,68,173,0.06)" },
    { key: "konverthr_other", label: "Other APIs", color: "#059669", border: "rgba(52,211,153,0.18)", glow: "rgba(52,211,153,0.06)" },
];

function getSectionKey(api) {
    const cat = (api.category || "").trim().toLowerCase();
    if (cat === "konverthr_odoo") return "konverthr_odoo";
    if (cat === "konverthr_node") return "konverthr_node";
    if (cat === "konverthr_other") return "konverthr_other";
    const url = (api.url || "").toLowerCase();
    if (url.includes("odoo") || url.includes("/web/") || url.includes("jsonrpc")) return "konverthr_odoo";
    return "konverthr_node";
}

// ── API Card — defined OUTSIDE Dashboard to prevent remount ──
function ApiCard({ api, onRemove, onRun }) {
    const mc = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
    return (
        <div
            className="rounded-2xl p-5 transition-all duration-300 group relative overflow-hidden border hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: "#F8F7FF", borderColor: "rgba(0,0,0,0.06)" }}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                style={{ background: "radial-gradient(ellipse at top left, rgba(255,59,142,0.06), transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 right-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 rounded-full"
                style={{ background: "linear-gradient(90deg, #FF3B8E, #8E44AD)" }} />
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0"
                        style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
                        {api.method}
                    </span>
                    <h3 className="font-black text-gray-900 text-sm truncate">{api.name}</h3>
                </div>
                <span className="font-black text-[#FF3B8E] text-sm flex-shrink-0 ml-2">₹{api.pricePerCall}</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed line-clamp-2">{api.description}</p>
            <div className="flex items-center justify-between">
                <code className="text-[10px] text-slate-400 px-2 py-1 rounded-lg truncate max-w-[55%]"
                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)" }}>
                    {api.url}
                </code>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onRemove(api)}
                        className="flex items-center gap-1 text-[10px] font-black text-red-500 px-3 py-1.5 rounded-full transition-all"
                        style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.07)" }}>
                        <X size={10} /> REMOVE
                    </button>
                    <button onClick={() => onRun(api)}
                        className="flex items-center gap-1 text-[10px] font-black text-white px-3 py-1.5 rounded-full hover:brightness-110 transition-all"
                        style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}>
                        <Play size={10} fill="white" /> RUN
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Section Column — defined OUTSIDE Dashboard ──
function SectionColumn({ section, apis: sectionApis, isFiltering, onRemove, onRun, onNavigate }) {
    return (
        <div className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: "white", border: `1px solid ${section.border}` }}>
            <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: `1px solid ${section.border}` }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: section.color }} />
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: section.color }}>
                        {section.label}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${section.color}15`, color: section.color, border: `1px solid ${section.border}` }}>
                        {sectionApis.length}
                    </span>
                </div>
            </div>
            <div className="p-4">
                {sectionApis.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-slate-400 text-xs">
                            {isFiltering ? "No APIs match your filter." : "No APIs selected in this category."}
                        </p>
                        {!isFiltering && (
                            <button onClick={() => onNavigate("/apis")}
                                className="mt-3 text-[10px] font-black px-4 py-2 rounded-full transition-all"
                                style={{ background: `${section.color}10`, border: `1px solid ${section.border}`, color: section.color }}>
                                + SELECT
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-0.5 pb-2"
                        style={{ scrollbarWidth: "thin", scrollbarColor: `${section.color}30 transparent` }}>
                        {sectionApis.map((api) => (
                            <ApiCard key={api._id} api={api} onRemove={onRemove} onRun={onRun} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

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

    const handleRunApi = (api) => {
        navigate(`/sandbox/${api._id}`, { state: { api } });
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
                amount: order.amount,
                currency: "INR",
                name: "SandboxHub",
                description: "Add Balance",
                order_id: order.id,
                handler: async (response) => {
                    try {                                          // ✅ try-catch added
                        const verifyRes = await verifyPayment({
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            amount,
                            userId: user.id,
                        });
                        const newBalance = verifyRes?.data?.balance || balance + amount;
                        const updatedUser = { ...user, balance: newBalance };
                        localStorage.setItem("user", JSON.stringify(updatedUser));  // ✅ localStorage first
                        setBalance(newBalance);
                        setUser(updatedUser);
                        setShowPayment(false);   // ✅ close modal BEFORE toast
                        setAmount(0);
                        showToast("Payment Successful! Balance Added ✅");
                    } catch (err) {
                        console.log("❌ Verify Error:", err);
                        // ✅ Even if verify fails, still close modal & show error
                        setShowPayment(false);
                        setAmount(0);
                        showToast("Payment done but verification failed. Contact support.", "error");
                    }
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
    const isFiltering = !!(sandboxSearch.trim() || sandboxMethodFilter !== "ALL");

    const authRequestBody = `{\n  "user_name": "Komal"\n}`;
    const authResponseBody = `{\n  "status": "success",\n  "token": "4c16f70193749be219adb0ad6f9dd840",\n  "user_name": "Komal",\n  "message": "Existing valid token returned"\n}`;
    const authEndpoint = "https://staging.konverthr.com/api/auth";

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
                onAddBalance={() => setShowPayment(true)}
                onLogout={handleLogout}
            />

            <div className="relative z-10 px-6 md:px-10 pt-24 pb-16">

                {/* ─── STATS ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: <Activity size={18} />, value: apiCallCount, label: "API CALLS", color: "#FF3B8E", glow: "rgba(255,59,142,0.1)" },
                        { icon: <Wallet size={18} />, value: `₹${balance}`, label: "WALLET BALANCE", color: "#8E44AD", glow: "rgba(142,68,173,0.1)" },
                        { icon: <Code2 size={18} />, value: selectedApis.length, label: "MY APIS", color: "#FF3B8E", glow: "rgba(255,59,142,0.1)" },
                        { icon: <Timer size={18} />, value: "124ms", label: "AVG RESPONSE", color: "#8E44AD", glow: "rgba(142,68,173,0.1)" },
                    ].map((card, i) => (
                        <div key={i}
                            className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden cursor-default">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                                style={{ background: `radial-gradient(ellipse at top left, ${card.glow}, transparent 70%)` }} />
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 rounded-full"
                                style={{ background: "linear-gradient(90deg, #FF3B8E, #8E44AD)" }} />
                            <div className="flex justify-between items-start mb-5">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                    style={{ background: card.glow, border: `1px solid ${card.color}30` }}>
                                    <span style={{ color: card.color }}>{card.icon}</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black mb-1.5" style={{ color: card.color }}>{card.value}</p>
                            <p className="text-[10px] text-slate-400 tracking-[0.2em] font-bold uppercase">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* ─── AUTH NOTICE ─── */}
                <div className="mb-6">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm"
                        style={{ border: "1px solid rgba(255,59,142,0.2)", boxShadow: "0 2px 12px rgba(255,59,142,0.06)" }}>
                        <button onClick={() => setShowAuthInfo((p) => !p)}
                            className="w-full flex items-center justify-between px-6 py-5 hover:bg-pink-50/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.25)" }}>
                                    <Key size={15} className="text-[#FF3B8E]" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-gray-900">KonvertHR — Authentication Required</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Retrieve an auth token before calling any KonvertHR API</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black px-3 py-1 rounded-full text-[#FF3B8E]"
                                    style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.25)" }}>
                                    MANDATORY
                                </span>
                                {showAuthInfo
                                    ? <ChevronUp size={15} className="text-slate-400" />
                                    : <ChevronDown size={15} className="text-slate-400" />}
                            </div>
                        </button>

                        {showAuthInfo && (
                            <div className="border-t border-black/[0.05] px-6 py-6 space-y-5">
                                <div className="flex items-start gap-3 rounded-2xl px-4 py-3"
                                    style={{ background: "rgba(255,59,142,0.05)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                    <Info size={13} className="text-[#FF3B8E] mt-0.5 flex-shrink-0" />
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        All KonvertHR APIs require a valid <span className="text-gray-900 font-bold">token</span> in the request header.
                                        Call the Authentication endpoint first, then include it as{" "}
                                        <code className="px-1.5 py-0.5 rounded text-[#FF3B8E] text-[10px]"
                                            style={{ background: "rgba(255,59,142,0.08)" }}>
                                            Authorization: &lt;token&gt;
                                        </code>{" "}
                                        in all subsequent requests.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#FF3B8E]"
                                                    style={{ background: "rgba(255,59,142,0.12)", border: "1px solid rgba(255,59,142,0.3)" }}>1</span>
                                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Auth Endpoint &amp; Request</span>
                                            </div>
                                            <button onClick={() => handleCopy(`POST ${authEndpoint}\n\n${authRequestBody}`, "req")}
                                                className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-[#FF3B8E] transition-all">
                                                {copied === "req" ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                {copied === "req" ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                        <div className="rounded-2xl p-4 space-y-2"
                                            style={{ background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.07)" }}>
                                            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg"
                                                    style={{ background: METHOD_COLORS.POST.bg, color: METHOD_COLORS.POST.text, border: `1px solid ${METHOD_COLORS.POST.border}40` }}>POST</span>
                                                <code className="text-[10px] text-slate-400 truncate">{authEndpoint}</code>
                                            </div>
                                            <pre className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap font-mono">{authRequestBody}</pre>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#8E44AD]"
                                                    style={{ background: "rgba(142,68,173,0.12)", border: "1px solid rgba(142,68,173,0.3)" }}>2</span>
                                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Response — Token</span>
                                            </div>
                                            <button onClick={() => handleCopy(authResponseBody, "res")}
                                                className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-[#8E44AD] transition-all">
                                                {copied === "res" ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                {copied === "res" ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                        <div className="rounded-2xl p-4" style={{ background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.07)" }}>
                                            <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono">
                                                {`{
  "status": `}<span className="text-green-600">"success"</span>{`,
  "token": `}<span className="text-[#FF3B8E]">"4c16f70193749be219adb0ad6f9dd840"</span>{`,
  "user_name": `}<span className="text-[#8E44AD]">"Komal"</span>{`,
  "message": `}<span className="text-green-600">"Existing valid token returned"</span>{`
}`}
                                            </pre>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
                                    style={{ background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.06)" }}>
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#6366F1] flex-shrink-0"
                                        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)" }}>3</span>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Copy the <span className="text-[#FF3B8E] font-bold">token</span> and pass it in the{" "}
                                        <code className="mx-1 px-1.5 py-0.5 rounded text-[#8E44AD] text-[10px]"
                                            style={{ background: "rgba(142,68,173,0.08)" }}>Authorization</code>
                                        header as{" "}
                                        <code className="px-1.5 py-0.5 rounded text-[#8E44AD] text-[10px]"
                                            style={{ background: "rgba(142,68,173,0.08)" }}>&lt;token&gt;</code>
                                        {" "}for all subsequent KonvertHR API calls.
                                    </p>
                                </div>

                                <div className="rounded-2xl overflow-hidden"
                                    style={{ background: "rgba(142,68,173,0.03)", border: "1px solid rgba(142,68,173,0.18)" }}>
                                    <div className="flex items-center gap-3 px-5 py-4"
                                        style={{ borderBottom: "1px solid rgba(142,68,173,0.1)" }}>
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#8E44AD] flex-shrink-0"
                                            style={{ background: "rgba(142,68,173,0.12)", border: "1px solid rgba(142,68,173,0.3)" }}>4</span>
                                        <div className="flex items-center gap-2 flex-1">
                                            <p className="text-[11px] font-black text-gray-900">
                                                Where to find your{" "}
                                                <code className="px-1.5 py-0.5 rounded text-[#8E44AD] text-[10px]"
                                                    style={{ background: "rgba(142,68,173,0.08)" }}>user_id</code>?
                                            </p>
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-[#8E44AD]"
                                                style={{ background: "rgba(142,68,173,0.1)", border: "1px solid rgba(142,68,173,0.25)" }}>
                                                IMPORTANT
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-5 py-4 space-y-4">
                                        <div className="flex items-start gap-3 rounded-xl px-4 py-3"
                                            style={{ background: "rgba(142,68,173,0.05)", border: "1px solid rgba(142,68,173,0.1)" }}>
                                            <Info size={13} className="text-[#8E44AD] mt-0.5 flex-shrink-0" />
                                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                                When you <span className="text-gray-900 font-bold">sign up</span> or{" "}
                                                <span className="text-gray-900 font-bold">log in</span> to KonvertHR,
                                                the API response returns your unique{" "}
                                                <code className="mx-1 px-1.5 py-0.5 rounded text-[#8E44AD] text-[10px]"
                                                    style={{ background: "rgba(142,68,173,0.08)" }}>user_id</code>.
                                                Always use your <span className="text-[#8E44AD] font-bold">real user_id</span> —{" "}
                                                <span className="text-red-500 font-bold">never</span> use a placeholder.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 tracking-[0.18em] uppercase mb-2 px-1">Example Signup / Login Response</p>
                                            <div className="rounded-xl p-4" style={{ background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.07)" }}>
                                                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono">
                                                    {`{
  "status": `}<span className="text-green-600">"success"</span>{`,
  "user_id": `}<span className="text-[#8E44AD] font-bold">"64f3a1c2e8b12d0017a9c3f5"</span>{`,
  "user_name": `}<span className="text-[#FF3B8E]">"Komal"</span>{`,
  "token": `}<span className="text-[#FF3B8E]">"4c16f70193749be219adb0ad6f9dd840"</span>{`
}`}
                                                </pre>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#8E44AD] flex-shrink-0" />
                                            <p className="text-[10px] text-slate-400">
                                                💡 Save this{" "}
                                                <code className="px-1.5 py-0.5 rounded text-[#8E44AD] text-[10px]"
                                                    style={{ background: "rgba(142,68,173,0.08)" }}>user_id</code>
                                                {" "}after login — you'll need it in subsequent API requests.
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
                        <h2 className="text-lg font-black text-gray-900 tracking-tight">My API Sandbox</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 px-3 py-1.5 rounded-full border border-black/[0.08] bg-white">
                                {selectedApis.length} APIs selected
                            </span>
                            <button onClick={() => navigate("/apis")}
                                className="flex items-center gap-2 text-xs font-black px-4 py-1.5 rounded-full text-[#FF3B8E] transition-all"
                                style={{ border: "1px solid rgba(255,59,142,0.3)", background: "rgba(255,59,142,0.07)" }}>
                                <Plus size={12} /> MANAGE
                            </button>
                        </div>
                    </div>

                    {/* Search + Filter */}
                    {selectedApis.length > 0 && (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                                    style={{ color: sandboxSearch ? "#FF3B8E" : "#94a3b8" }} />
                                <input
                                    type="text"
                                    value={sandboxSearch}
                                    onChange={(e) => setSandboxSearch(e.target.value)}
                                    placeholder="Search your APIs by name, URL…"
                                    className="w-full text-sm text-gray-900 placeholder-slate-400 outline-none py-3 pl-9 pr-8 rounded-2xl transition-all"
                                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", fontFamily: "'Urbanist', sans-serif", caretColor: "#FF3B8E" }}
                                    onFocus={e => { e.target.style.borderColor = "rgba(255,59,142,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,59,142,0.08)"; }}
                                    onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
                                />
                                {sandboxSearch && (
                                    <button onClick={() => setSandboxSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-700 transition-colors">
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
                                                    ? { background: "linear-gradient(to right, #FF3B8E, #8E44AD)", color: "#fff", border: "none", boxShadow: "0 4px 12px rgba(255,59,142,0.2)" }
                                                    : { background: mc.bg, color: mc.text, border: `1px solid ${mc.border}`, boxShadow: `0 0 10px ${mc.border}20` }
                                                : { background: "white", color: "#94a3b8", border: "1px solid rgba(0,0,0,0.08)" }
                                            }>
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Filter result pill */}
                    {selectedApis.length > 0 && isFiltering && (
                        <div className="flex items-center gap-2 mb-5">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{
                                    background: filteredApis.length > 0 ? "rgba(255,59,142,0.07)" : "rgba(100,116,139,0.07)",
                                    border: `1px solid ${filteredApis.length > 0 ? "rgba(255,59,142,0.2)" : "rgba(100,116,139,0.15)"}`,
                                }}>
                                <div className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: filteredApis.length > 0 ? "#FF3B8E" : "#94a3b8" }} />
                                <span className="text-[11px] font-black"
                                    style={{ color: filteredApis.length > 0 ? "#FF3B8E" : "#94a3b8" }}>
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
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black text-slate-500"
                                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
                                    "{sandboxSearch}"
                                    <button onClick={() => setSandboxSearch("")}
                                        className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity">
                                        <X size={9} strokeWidth={3} />
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => { setSandboxSearch(""); setSandboxMethodFilter("ALL"); }}
                                className="flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full text-slate-400 border border-black/[0.08] bg-white hover:text-gray-700 hover:border-black/20 transition-all">
                                <X size={9} strokeWidth={3} /> Clear all
                            </button>
                        </div>
                    )}

                    {/* No APIs selected */}
                    {selectedApis.length === 0 ? (
                        <div className="rounded-3xl p-20 flex flex-col items-center justify-center gap-4"
                            style={{ border: "1px dashed rgba(0,0,0,0.12)", background: "white" }}>
                            <p className="text-slate-400 text-sm">No APIs selected yet.</p>
                            <button onClick={() => navigate("/apis")}
                                className="flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-full text-[#FF3B8E] transition-all"
                                style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)" }}>
                                <Plus size={13} /> SELECT APIS
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                                <SectionColumn section={SECTIONS[0]} apis={nodeApis} isFiltering={isFiltering} onRemove={handleRemoveApi} onRun={handleRunApi} onNavigate={navigate} />
                                <SectionColumn section={SECTIONS[1]} apis={odooApis} isFiltering={isFiltering} onRemove={handleRemoveApi} onRun={handleRunApi} onNavigate={navigate} />
                            </div>
                            <div className="grid grid-cols-1 gap-5">
                                <SectionColumn section={SECTIONS[2]} apis={otherApis} isFiltering={isFiltering} onRemove={handleRemoveApi} onRun={handleRunApi} onNavigate={navigate} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── PAYMENT MODAL ─── */}
            {showPayment && (
                <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
                    style={{ background: "rgba(248,247,255,0.85)", backdropFilter: "blur(8px)" }}>
                    <div className="bg-white border border-black/[0.08] rounded-3xl p-7 w-full max-w-md"
                        style={{ boxShadow: "0 20px 60px rgba(255,59,142,0.12)" }}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Add Balance</h3>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    {balance === 0 ? "⚠️ Add balance to start using APIs" : "Secure payment via Razorpay"}
                                </p>
                            </div>
                            {balance > 0 && (
                                <button onClick={() => { setShowPayment(false); setAmount(0); }}
                                    className="w-8 h-8 bg-slate-50 border border-black/[0.08] rounded-full flex items-center justify-center hover:border-red-500/30 hover:text-red-500 transition-all text-slate-400">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {balance === 0 && (
                            <div className="mb-5 px-4 py-3 rounded-2xl flex items-center gap-3"
                                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                <p className="text-[11px] text-red-500 font-bold">Your wallet is empty. Add balance to call APIs.</p>
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">Amount</label>
                            <div className="flex items-center rounded-2xl px-4 py-3.5"
                                style={{ background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)" }}>
                                <span className="text-slate-400 mr-2 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={amount || ""}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    placeholder="0.00"
                                    className="bg-transparent text-gray-900 outline-none w-full text-sm font-bold"
                                    style={{ fontFamily: "'Urbanist', sans-serif" }}
                                />
                            </div>
                        </div>
                        <div className="mb-7">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">Quick Select</label>
                            <div className="grid grid-cols-3 gap-2">
                                {quickAmounts.map((q) => (
                                    <button key={q} onClick={() => setAmount(q)}
                                        className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${amount === q ? "text-[#FF3B8E]" : "text-slate-400 hover:text-gray-700"}`}
                                        style={amount === q
                                            ? { background: "linear-gradient(135deg, rgba(255,59,142,0.08), rgba(142,68,173,0.08))", borderColor: "rgba(255,59,142,0.4)" }
                                            : { background: "#F8F7FF", borderColor: "rgba(0,0,0,0.08)" }
                                        }>
                                        ₹{q}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handlePayment}
                            disabled={paymentLoading || !amount || amount <= 0}
                            className="w-full text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: "linear-gradient(135deg, #FF3B8E, #8E44AD)", boxShadow: "0 8px 24px rgba(255,59,142,0.25)" }}>
                            {paymentLoading
                                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                : <><Zap size={16} fill="white" /> PAY ₹{amount || 0}</>}
                        </button>
                        <p className="text-center text-[10px] text-slate-400 mt-3">🔒 Powered by Razorpay</p>
                    </div>
                </div>
            )}

            {/* ─── TOAST ─── */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-lg text-sm font-bold bg-white
                    ${toast.type === "success" ? "border-[#FF3B8E]/30 text-[#FF3B8E]" : "border-red-500/30 text-red-500"}`}
                    style={{ boxShadow: toast.type === "success" ? "0 8px 24px rgba(255,59,142,0.12)" : "0 8px 24px rgba(239,68,68,0.1)" }}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${toast.type === "success" ? "bg-[#FF3B8E]" : "bg-red-500"}`} />
                    {toast.message}
                    <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100"><X size={12} /></button>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; letter-spacing: -0.02em; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
}
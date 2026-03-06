/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Zap, ArrowLeft, Play, X } from "lucide-react";
import { useCustomer } from "../hooks/useCustomer";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#A78BFA" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#818CF8" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#F87171" },
};

export default function Sandbox() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const api       = location.state?.api;
    const userStr   = localStorage.getItem("user");
    const user      = userStr ? JSON.parse(userStr) : null;
    const { callApi } = useCustomer();

    const [requestBody,    setRequestBody]    = useState(
        api?.sampleBody ? JSON.stringify(api.sampleBody, null, 2) : ""
    );
    const [authToken,      setAuthToken]      = useState("");
    const [sandboxResult,  setSandboxResult]  = useState(null);
    const [sandboxLoading, setSandboxLoading] = useState(false);

    if (!api) { navigate("/dashboard"); return null; }

    const mc = METHOD_COLORS[api.method] || METHOD_COLORS.POST;

    const handleRunApi = async () => {
        setSandboxLoading(true);
        setSandboxResult(null);
        try {
            let parsedBody = null;
            if (api.method !== "GET" && requestBody.trim()) {
                parsedBody = JSON.parse(requestBody);
            }
            const headers = authToken ? { authorization: authToken } : {};
            const res = await callApi({
                userId:      user.id,
                apiId:       api._id,
                requestBody: parsedBody,
                headers,
            });
            setSandboxResult(res);
        } catch (err) {
            setSandboxResult({
                success: false,
                message: err.response?.data?.message || "Something went wrong!",
            });
        } finally {
            setSandboxLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-hidden">

            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            {/* ─── NAVBAR ─── */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-3xl bg-black/40 px-6 md:px-10 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-4 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                        <ArrowLeft size={13} /> BACK
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
                        <div className="w-9 h-9 bg-gradient-to-br from-[#FF3B8E] to-[#8E44AD] rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:rotate-6 transition-transform">
                            <Zap size={18} className="text-white fill-current" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-white">
                            Sandbox<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#A29BFE]">Hub</span>
                        </span>
                    </div>
                </div>

                {/* API Info */}
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-lg"
                        style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
                        {api.method}
                    </span>
                    <span className="text-sm font-black text-white">{api.name}</span>
                    <span className="text-xs font-black text-[#FF3B8E] px-3 py-1 rounded-full"
                        style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.25)" }}>
                        ₹{api.pricePerCall} / call
                    </span>
                </div>
            </nav>

            {/* ─── MAIN LAYOUT ─── */}
            <div className="relative z-10 grid grid-cols-2 gap-0 h-screen pt-[65px]">

                {/* ── LEFT PANEL — Input ── */}
                <div className="border-r border-white/[0.05] p-6 overflow-y-auto space-y-5">

                    {/* API Details */}
                    <div className="rounded-2xl p-4"
                        style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-1.5">Endpoint</p>
                        <code className="text-xs text-[#FF3B8E] break-all">{api.url}</code>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{api.description}</p>
                    </div>

                    {/* Auth Token */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">
                            Authorization Token{" "}
                            <span className="text-slate-600 normal-case">(optional — KonvertHR APIs ke liye)</span>
                        </label>
                        <input
                            type="text"
                            value={authToken}
                            onChange={(e) => setAuthToken(e.target.value)}
                            placeholder="4c16f70193749be219adb0ad6f9dd840"
                            className="w-full rounded-2xl px-4 py-3 text-white text-xs outline-none transition-all placeholder-slate-600"
                            style={{
                                background: "#0f0f0f",
                                border: "1px solid rgba(255,255,255,0.06)",
                                fontFamily: "monospace",
                            }}
                            onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.06)"}
                        />
                    </div>

                    {/* Request Body */}
                    {api.method !== "GET" && (
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">
                                Request Body <span className="text-slate-600 normal-case">(JSON)</span>
                            </label>
                            <textarea
                                value={requestBody}
                                onChange={(e) => setRequestBody(e.target.value)}
                                rows={12}
                                placeholder='{"key": "value"}'
                                className="w-full rounded-2xl px-4 py-3 text-white text-xs outline-none transition-all resize-none placeholder-slate-600"
                                style={{
                                    background: "#0f0f0f",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    fontFamily: "monospace",
                                }}
                                onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.06)"}
                            />
                        </div>
                    )}

                    {/* Run Button */}
                    <button
                        onClick={handleRunApi}
                        disabled={sandboxLoading}
                        className="w-full text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20"
                        style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}
                    >
                        {sandboxLoading
                            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <><Play size={16} fill="white" /> RUN API — ₹{api.pricePerCall} will be deducted</>
                        }
                    </button>
                </div>

                {/* ── RIGHT PANEL — Response ── */}
                <div className="p-6 overflow-y-auto space-y-5">

                    {/* Sample Response */}
                    {!sandboxResult && api.sampleResponse && (
                        <div className="rounded-2xl overflow-hidden"
                            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}>
                            <div className="flex items-center justify-between px-5 py-3"
                                style={{ background: "#0f0f0f", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Sample Response</span>
                                <span className="text-[9px] font-black text-[#A78BFA] px-2.5 py-1 rounded-full"
                                    style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                                    PREVIEW
                                </span>
                            </div>
                            <pre className="p-5 text-[12px] text-slate-400 overflow-x-auto leading-relaxed"
                                style={{ background: "#080808", fontFamily: "monospace" }}>
                                {JSON.stringify(api.sampleResponse, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Loading State */}
                    {sandboxLoading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-10 h-10 border-2 border-white/5 border-t-[#FF3B8E] rounded-full animate-spin" />
                            <p className="text-slate-500 text-sm">Calling API...</p>
                        </div>
                    )}

                    {/* Actual Response */}
                    {sandboxResult && !sandboxLoading && (
                        <div className="rounded-2xl overflow-hidden"
                            style={{ boxShadow: `0 0 0 1px ${sandboxResult.success === false ? "rgba(239,68,68,0.2)" : "rgba(255,59,142,0.2)"}` }}>
                            {/* Response Header */}
                            <div className="flex items-center justify-between px-5 py-3"
                                style={{ background: "#0f0f0f", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Response</span>
                                <div className="flex items-center gap-3">
                                    {sandboxResult.data && (
                                        <>
                                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                                                style={sandboxResult.data.status === "success"
                                                    ? { background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }
                                                    : { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                                                }>
                                                {sandboxResult.data.statusCode}
                                            </span>
                                            <span className="text-[10px] text-slate-500">{sandboxResult.data.responseTime}</span>
                                            <span className="text-[10px] text-[#F87171]">-₹{sandboxResult.data.amountDeducted}</span>
                                            <span className="text-[10px] text-slate-500">Balance: ₹{sandboxResult.data.remainingBalance}</span>
                                        </>
                                    )}
                                    {!sandboxResult.success && (
                                        <span className="text-[10px] font-black text-[#F87171] flex items-center gap-1">
                                            <X size={10} /> ERROR
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Response Body */}
                            <pre className="p-5 text-[12px] text-slate-300 overflow-x-auto leading-relaxed"
                                style={{ background: "#080808", fontFamily: "monospace" }}>
                                {JSON.stringify(sandboxResult.data?.response || sandboxResult, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Empty State */}
                    {!sandboxResult && !sandboxLoading && !api.sampleResponse && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-2xl"
                            style={{ border: "1px dashed rgba(255,255,255,0.07)" }}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                <Play size={24} className="text-[#FF3B8E]" />
                            </div>
                            <p className="text-slate-600 text-sm">Run the API to see response here</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; }
                pre, code, input, textarea { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
            `}</style>
        </div>
    );
}
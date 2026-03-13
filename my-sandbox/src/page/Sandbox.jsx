/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Zap, ArrowLeft, Play, X, Upload, FileText, Image, File, CheckCircle2, Paperclip } from "lucide-react";
import { useCustomer } from "../hooks/useCustomer";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#A78BFA" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#818CF8" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#F87171" },
};

function formatBytes(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(file) {
    if (!file) return <File size={13} />;
    const type = file.type || file.mimetype || "";
    if (type.startsWith("image/")) return <Image size={13} />;
    if (type.includes("pdf"))       return <FileText size={13} />;
    return <File size={13} />;
}

// ── File field detection: value === "" means file field ──
function detectFileFields(sampleBody) {
    if (!sampleBody || typeof sampleBody !== "object") return [];
    return Object.entries(sampleBody)
        .filter(([, v]) => v === "" || (typeof v === "string" && /\.(pdf|jpg|jpeg|png|gif|doc|docx|xls|xlsx|csv|txt|zip)$/i.test(v)))
        .map(([k]) => k);
}

// ─── Smart Request Body Builder ───────────────────────────────────────────────
function SmartBodyEditor({ api, bodyText, onBodyChange, fileMap, onFileMapChange }) {
    const fileInputRefs = useRef({});
    const fileFields = detectFileFields(api?.sampleBody);
    const adminAttachments = api?.attachments || [];

    const nonFileBody = (() => {
        try {
            const parsed = JSON.parse(bodyText);
            const filtered = Object.fromEntries(
                Object.entries(parsed).filter(([k]) => !fileFields.includes(k))
            );
            return Object.keys(filtered).length > 0 ? JSON.stringify(filtered, null, 2) : "";
        } catch { return bodyText; }
    })();

    const handleNonFileChange = (val) => {
        try {
            const parsed = val.trim() ? JSON.parse(val) : {};
            const fileEntries = Object.fromEntries(fileFields.map((k) => [k, ""]));
            onBodyChange(JSON.stringify({ ...fileEntries, ...parsed }, null, 2));
        } catch {
            onBodyChange(val);
        }
    };

    const handleFileSelect = (fieldKey, file) => {
        onFileMapChange({ ...fileMap, [fieldKey]: { type: "custom", file } });
    };

    const handleAdminAttachmentSelect = (fieldKey, attachment) => {
        onFileMapChange({ ...fileMap, [fieldKey]: { type: "admin", attachment } });
    };

    const clearFileField = (fieldKey) => {
        const updated = { ...fileMap };
        delete updated[fieldKey];
        onFileMapChange(updated);
    };

    return (
        <div className="space-y-4">
            {fileFields.map((fieldKey) => {
                const selected = fileMap[fieldKey];
                const inputRef = (el) => { fileInputRefs.current[fieldKey] = el; };

                return (
                    <div key={fieldKey}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">
                            <span className="text-[#FF3B8E]">{fieldKey}</span>
                            <span className="text-slate-600 normal-case font-normal ml-2">(file field)</span>
                        </label>

                        {selected ? (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-2"
                                style={{ background: "rgba(255,59,142,0.06)", border: "1px solid rgba(255,59,142,0.25)" }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(255,59,142,0.12)", border: "1px solid rgba(255,59,142,0.2)", color: "#FF3B8E" }}>
                                    {selected.type === "custom" ? getFileIcon(selected.file) : <Paperclip size={13} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-white truncate">
                                        {selected.type === "custom" ? selected.file.name : selected.attachment.originalname}
                                    </p>
                                    <p className="text-[9px] text-slate-600">
                                        {selected.type === "custom"
                                            ? formatBytes(selected.file.size)
                                            : `Admin attachment · ${formatBytes(selected.attachment.size)}`}
                                    </p>
                                </div>
                                <CheckCircle2 size={14} className="text-[#34D399] flex-shrink-0" />
                                <button type="button" onClick={() => clearFileField(fieldKey)}
                                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                                    style={{ color: "#f87171" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <X size={10} strokeWidth={3} />
                                </button>
                            </div>
                        ) : null}

                        {adminAttachments.length > 0 && (
                            <div className="mb-2">
                                <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold mb-1.5">Admin provided files</p>
                                <div className="flex flex-wrap gap-2">
                                    {adminAttachments.map((att, idx) => (
                                        <button key={idx} type="button"
                                            onClick={() => handleAdminAttachmentSelect(fieldKey, att)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all"
                                            style={selected?.type === "admin" && selected.attachment === att
                                                ? { background: "rgba(255,59,142,0.12)", border: "1px solid rgba(255,59,142,0.4)", color: "#FF3B8E" }
                                                : { background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }
                                            }
                                            onMouseEnter={e => {
                                                if (!(selected?.type === "admin" && selected.attachment === att)) {
                                                    e.currentTarget.style.borderColor = "rgba(255,59,142,0.3)";
                                                    e.currentTarget.style.color = "#FF3B8E";
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (!(selected?.type === "admin" && selected.attachment === att)) {
                                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                                    e.currentTarget.style.color = "#64748b";
                                                }
                                            }}>
                                            <Paperclip size={10} />
                                            <span className="truncate max-w-[120px]">{att.originalname}</span>
                                            <span className="text-slate-700">{formatBytes(att.size)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div
                            onClick={() => fileInputRefs.current[fieldKey]?.click()}
                            className="w-full rounded-2xl flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                            style={{ background: "#0f0f0f", border: "1px dashed rgba(255,255,255,0.1)" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,59,142,0.35)"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <Upload size={13} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-500">Upload your own file</p>
                                <p className="text-[9px] text-slate-700">Any file · Max 10MB</p>
                            </div>
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileSelect(fieldKey, f);
                                    e.target.value = "";
                                }}
                            />
                        </div>
                    </div>
                );
            })}

            {nonFileBody && (
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">
                        Other Fields <span className="text-slate-600 normal-case font-normal">(JSON)</span>
                    </label>
                    <textarea
                        value={nonFileBody}
                        onChange={(e) => handleNonFileChange(e.target.value)}
                        rows={6}
                        className="w-full rounded-2xl px-4 py-3 text-white text-xs outline-none transition-all resize-none placeholder-slate-600"
                        style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace" }}
                        onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.06)"}
                    />
                </div>
            )}

            {fileFields.length === 0 && (
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">
                        Request Body <span className="text-slate-600 normal-case">(JSON)</span>
                    </label>
                    <textarea
                        value={bodyText}
                        onChange={(e) => onBodyChange(e.target.value)}
                        rows={12}
                        placeholder='{"key": "value"}'
                        className="w-full rounded-2xl px-4 py-3 text-white text-xs outline-none transition-all resize-none placeholder-slate-600"
                        style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace" }}
                        onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.06)"}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Main Sandbox ─────────────────────────────────────────────────────────────
export default function Sandbox() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const api       = location.state?.api;
    const userStr   = localStorage.getItem("user");
    const user      = userStr ? JSON.parse(userStr) : null;
    const { callApi } = useCustomer();

    const lastResponseKey = api ? `sandbox_last_response_${api._id}` : null;
    const savedLastResponse = lastResponseKey
        ? (() => { try { return JSON.parse(localStorage.getItem(lastResponseKey)); } catch { return null; } })()
        : null;

    const [requestBody,    setRequestBody]    = useState(
        api?.sampleBody ? JSON.stringify(api.sampleBody, null, 2) : ""
    );
    const [authToken,      setAuthToken]      = useState("");
    const [sandboxResult,  setSandboxResult]  = useState(null);
    const [sandboxLoading, setSandboxLoading] = useState(false);
    const [lastResponse,   setLastResponse]   = useState(savedLastResponse);
    const [fileMap,        setFileMap]        = useState({});

    // ── Base URL override — localStorage mein save ──
    const baseUrlKey = api ? `sandbox_base_url_${api._id}` : null;
    const [baseUrl, setBaseUrl] = useState(
        baseUrlKey ? (localStorage.getItem(baseUrlKey) || "") : ""
    );
    const handleBaseUrlChange = (val) => {
        setBaseUrl(val);
        if (baseUrlKey) localStorage.setItem(baseUrlKey, val);
    };

    // ── Final URL — customer override hai to use karo, warna admin wali ──
    const effectiveUrl = baseUrl.trim() || api.url;

    if (!api) { navigate("/dashboard"); return null; }

    const mc         = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
    const fileFields = detectFileFields(api?.sampleBody);
    const hasFileFields = fileFields.length > 0;

    // ── userId safely nikalo ──
    const userId = user?._id || user?.id;

    const handleRunApi = async () => {
        setSandboxLoading(true);
        setSandboxResult(null);

        try {
            const headers = authToken ? { authorization: authToken } : {};

            if (hasFileFields) {
                // ── File wali API ──

                // Validation: har file field ke liye file honi chahiye
                const missingFields = fileFields.filter((k) => !fileMap[k]);
                if (missingFields.length > 0) {
                    setSandboxResult({
                        success: false,
                        message: `Please select a file for: ${missingFields.join(", ")}`,
                    });
                    setSandboxLoading(false);
                    return;
                }

                const fd = new FormData();

                // File fields append karo
                for (const [fieldKey, val] of Object.entries(fileMap)) {
                    if (val.type === "custom" && val.file) {
                        // Customer ka apna file
                        fd.append(fieldKey, val.file);
                    } else if (val.type === "admin" && val.attachment) {
                        // Admin attachment — blob fetch karke append karo
                        const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.11.241:6001";
                        const fileUrl  = `${BASE_URL}/${val.attachment.path}`;
                        const blob     = await fetch(fileUrl).then((r) => r.blob());
                        fd.append(fieldKey, blob, val.attachment.originalname);
                    }
                }

                // Non-file JSON fields bhi append karo
                try {
                    const parsed = JSON.parse(requestBody);
                    for (const [k, v] of Object.entries(parsed)) {
                        if (!fileFields.includes(k)) {
                            fd.append(k, typeof v === "object" ? JSON.stringify(v) : v);
                        }
                    }
                } catch { /* ignore parse error */ }

                const res = await callApi({
                    userId,
                    apiId:       api._id,
                    requestBody: fd,
                    headers,
                    isFormData:  true,
                    urlOverride: baseUrl.trim() || undefined,
                });
                saveAndSet(res);

            } else {
                // ── Normal JSON call ──
                let parsedBody = null;
                if (api.method !== "GET" && requestBody.trim()) {
                    try { parsedBody = JSON.parse(requestBody); }
                    catch { parsedBody = null; }
                }
                const res = await callApi({
                    userId,
                    apiId:       api._id,
                    requestBody: parsedBody,
                    headers,
                    urlOverride: baseUrl.trim() || undefined,
                });
                saveAndSet(res);
            }

        } catch (err) {
            const errResult = {
                success: false,
                message: err.response?.data?.message || "Something went wrong!",
                _savedAt: new Date().toISOString(),
            };
            setSandboxResult(errResult);
            setLastResponse(errResult);
            if (lastResponseKey) localStorage.setItem(lastResponseKey, JSON.stringify(errResult));
        } finally {
            setSandboxLoading(false);
        }
    };

    const saveAndSet = (res) => {
        const withMeta = { ...res, _savedAt: new Date().toISOString() };
        setSandboxResult(res);
        setLastResponse(withMeta);
        if (lastResponseKey) localStorage.setItem(lastResponseKey, JSON.stringify(withMeta));
    };

    const formatSavedAt = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    };

    const displayResult = sandboxResult || null;

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-hidden">
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

                {/* ── LEFT PANEL ── */}
                <div className="border-r border-white/[0.05] p-6 overflow-y-auto space-y-5">

                    <div className="rounded-2xl p-4"
                        style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-1.5">Endpoint</p>
                        <code className="text-xs text-[#FF3B8E] break-all">{effectiveUrl}</code>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{api.description}</p>
                        <div className="mt-3">
                            <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold mb-1">
                                Base URL Override <span className="normal-case font-normal text-slate-700">(optional — replaces default URL)</span>
                            </p>
                            <input
                                type="text"
                                value={baseUrl}
                                onChange={(e) => handleBaseUrlChange(e.target.value)}
                                placeholder={api.url}
                                className="w-full rounded-xl px-3 py-2 text-white text-[11px] outline-none transition-all placeholder-slate-700"
                                style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "monospace" }}
                                onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">
                            Authorization Token <span className="text-slate-600 normal-case">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={authToken}
                            onChange={(e) => setAuthToken(e.target.value)}
                            placeholder="4c16f70193749be219adb0ad6f9dd840"
                            className="w-full rounded-2xl px-4 py-3 text-white text-xs outline-none transition-all placeholder-slate-600"
                            style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace" }}
                            onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.06)"}
                        />
                    </div>

                    {api.method !== "GET" && (
                        <SmartBodyEditor
                            api={api}
                            bodyText={requestBody}
                            onBodyChange={setRequestBody}
                            fileMap={fileMap}
                            onFileMapChange={setFileMap}
                        />
                    )}

                    <button
                        onClick={handleRunApi}
                        disabled={sandboxLoading}
                        className="w-full text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20"
                        style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}>
                        {sandboxLoading
                            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <><Play size={16} fill="white" /> RUN API — ₹{api.pricePerCall} will be deducted</>
                        }
                    </button>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="p-6 overflow-y-auto space-y-5">

                    {!sandboxResult && !sandboxLoading && (lastResponse || api.sampleResponse) && (
                        <div className="rounded-2xl overflow-hidden"
                            style={{ boxShadow: `0 0 0 1px ${lastResponse ? "rgba(255,59,142,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                            <div className="flex items-center justify-between px-5 py-3"
                                style={{ background: "#0f0f0f", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                    {lastResponse ? "Last Response" : "Sample Response"}
                                </span>
                                <div className="flex items-center gap-2">
                                    {lastResponse ? (
                                        <>
                                            {lastResponse._savedAt && (
                                                <span className="text-[9px] text-slate-600">{formatSavedAt(lastResponse._savedAt)}</span>
                                            )}
                                            {lastResponse.data?.statusCode && (
                                                <span className="text-[9px] font-black px-2.5 py-1 rounded-full"
                                                    style={lastResponse.data.status === "success"
                                                        ? { background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }
                                                        : { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                                                    }>{lastResponse.data.statusCode}</span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-[9px] font-black text-[#A78BFA] px-2.5 py-1 rounded-full"
                                            style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                                            PREVIEW
                                        </span>
                                    )}
                                </div>
                            </div>
                            <pre className="p-5 text-[12px] text-slate-400 overflow-x-auto leading-relaxed"
                                style={{ background: "#080808", fontFamily: "monospace" }}>
                                {lastResponse
                                    ? JSON.stringify(lastResponse.data?.response || lastResponse, null, 2)
                                    : JSON.stringify(api.sampleResponse, null, 2)
                                }
                            </pre>
                        </div>
                    )}

                    {sandboxLoading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-10 h-10 border-2 border-white/5 border-t-[#FF3B8E] rounded-full animate-spin" />
                            <p className="text-slate-500 text-sm">Calling API...</p>
                        </div>
                    )}

                    {displayResult && !sandboxLoading && (
                        <div className="rounded-2xl overflow-hidden"
                            style={{ boxShadow: `0 0 0 1px ${displayResult.success === false ? "rgba(239,68,68,0.2)" : "rgba(255,59,142,0.2)"}` }}>
                            <div className="flex items-center justify-between px-5 py-3"
                                style={{ background: "#0f0f0f", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Response</span>
                                <div className="flex items-center gap-3">
                                    {displayResult.data && (
                                        <>
                                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                                                style={displayResult.data.status === "success"
                                                    ? { background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }
                                                    : { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                                                }>{displayResult.data.statusCode}</span>
                                            <span className="text-[10px] text-slate-500">{displayResult.data.responseTime}</span>
                                            <span className="text-[10px] text-[#F87171]">-₹{displayResult.data.amountDeducted}</span>
                                            <span className="text-[10px] text-slate-500">Balance: ₹{displayResult.data.remainingBalance}</span>
                                        </>
                                    )}
                                    {!displayResult.success && (
                                        <span className="text-[10px] font-black text-[#F87171] flex items-center gap-1">
                                            <X size={10} /> ERROR
                                        </span>
                                    )}
                                </div>
                            </div>
                            <pre className="p-5 text-[12px] text-slate-300 overflow-x-auto leading-relaxed"
                                style={{ background: "#080808", fontFamily: "monospace" }}>
                                {JSON.stringify(displayResult.data?.response || displayResult, null, 2)}
                            </pre>
                        </div>
                    )}

                    {!displayResult && !sandboxLoading && !api.sampleResponse && (
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
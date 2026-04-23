/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Zap, ArrowLeft, Play, X, Upload, FileText, Image, File, CheckCircle2, Paperclip, Plus, Trash2 } from "lucide-react";
import { useCustomer } from "../hooks/useCustomer";
import Navbar from "./Navbar";
import { triggerAuthChange } from "../routes/AppRoutes";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#7C3AED" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#4F46E5" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#DC2626" },
};

// ── Default headers — always pre-filled ──
const DEFAULT_HEADERS = [
    { key: "ClientId",   value: "84fd2189afae0d53e7025a35ec76b70cfb0a48d67ec72f3b78f2a2ce5f9297f2" },
    { key: "SecreteKey", value: "c1cf43a7c4d7f9984d3cf703083732ae6b54ef772a3f3f5d9b4f0dc0f302e263" },
];

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
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">
                            <span className="text-[#FF3B8E]">{fieldKey}</span>
                            <span className="text-slate-400 normal-case font-normal ml-2">(file field)</span>
                        </label>

                        {selected ? (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-2"
                                style={{ background: "rgba(255,59,142,0.05)", border: "1px solid rgba(255,59,142,0.2)" }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.2)", color: "#FF3B8E" }}>
                                    {selected.type === "custom" ? getFileIcon(selected.file) : <Paperclip size={13} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-gray-900 truncate">
                                        {selected.type === "custom" ? selected.file.name : selected.attachment.originalname}
                                    </p>
                                    <p className="text-[9px] text-slate-400">
                                        {selected.type === "custom"
                                            ? formatBytes(selected.file.size)
                                            : `Admin attachment · ${formatBytes(selected.attachment.size)}`}
                                    </p>
                                </div>
                                <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                                <button type="button" onClick={() => clearFileField(fieldKey)}
                                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 text-red-400 hover:bg-red-50">
                                    <X size={10} strokeWidth={3} />
                                </button>
                            </div>
                        ) : null}

                        {adminAttachments.length > 0 && (
                            <div className="mb-2">
                                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Admin provided files</p>
                                <div className="flex flex-wrap gap-2">
                                    {adminAttachments.map((att, idx) => (
                                        <button key={idx} type="button"
                                            onClick={() => handleAdminAttachmentSelect(fieldKey, att)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all"
                                            style={selected?.type === "admin" && selected.attachment === att
                                                ? { background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.3)", color: "#FF3B8E" }
                                                : { background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)", color: "#64748b" }
                                            }
                                            onMouseEnter={e => {
                                                if (!(selected?.type === "admin" && selected.attachment === att)) {
                                                    e.currentTarget.style.borderColor = "rgba(255,59,142,0.25)";
                                                    e.currentTarget.style.color = "#FF3B8E";
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (!(selected?.type === "admin" && selected.attachment === att)) {
                                                    e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                                                    e.currentTarget.style.color = "#64748b";
                                                }
                                            }}>
                                            <Paperclip size={10} />
                                            <span className="truncate max-w-[120px]">{att.originalname}</span>
                                            <span className="text-slate-400">{formatBytes(att.size)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div
                            onClick={() => fileInputRefs.current[fieldKey]?.click()}
                            className="w-full rounded-2xl flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                            style={{ background: "#F8F7FF", border: "1px dashed rgba(0,0,0,0.12)" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,59,142,0.35)"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"}>
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                <Upload size={13} className="text-[#FF3B8E]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-500">Upload your own file</p>
                                <p className="text-[9px] text-slate-400">Any file · Max 10MB</p>
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">
                        Other Fields <span className="text-slate-400 normal-case font-normal">(JSON)</span>
                    </label>
                    <textarea
                        value={nonFileBody}
                        onChange={(e) => handleNonFileChange(e.target.value)}
                        rows={6}
                        className="w-full rounded-2xl px-4 py-3 text-gray-900 text-xs outline-none transition-all resize-none placeholder-slate-400"
                        style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", fontFamily: "monospace" }}
                        onFocus={e => { e.target.style.borderColor = "rgba(255,59,142,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,59,142,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
                    />
                </div>
            )}

            {fileFields.length === 0 && (
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">
                        Request Body <span className="text-slate-400 normal-case">(JSON)</span>
                    </label>
                    <textarea
                        value={bodyText}
                        onChange={(e) => onBodyChange(e.target.value)}
                        rows={12}
                        placeholder='{"key": "value"}'
                        className="w-full rounded-2xl px-4 py-3 text-gray-900 text-xs outline-none transition-all resize-none placeholder-slate-400"
                        style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", fontFamily: "monospace" }}
                        onFocus={e => { e.target.style.borderColor = "rgba(255,59,142,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,59,142,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.08)"; e.target.style.boxShadow = "none"; }}
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

    if (!api) { navigate("/dashboard"); return null; }

    const lastResponseKey = `sandbox_last_response_${api._id}`;
    const baseUrlKey      = `sandbox_base_url_${api._id}`;
    const headersKey      = `sandbox_headers_${api._id}`;

    const savedLastResponse = (() => { try { return JSON.parse(localStorage.getItem(lastResponseKey)); } catch { return null; } })();

    // ── Load saved headers; if none saved yet, use DEFAULT_HEADERS ──
    const savedHeaders = (() => {
        try {
            const stored = JSON.parse(localStorage.getItem(headersKey));
            return stored && stored.length > 0 ? stored : DEFAULT_HEADERS;
        } catch {
            return DEFAULT_HEADERS;
        }
    })();

    const [requestBody, setRequestBody] = useState(api?.sampleBody ? JSON.stringify(api.sampleBody, null, 2) : "");
    const [headers, setHeaders]         = useState(savedHeaders);
    const [baseUrl, setBaseUrl]         = useState(localStorage.getItem(baseUrlKey) || "");
    const [sandboxResult, setSandboxResult] = useState(null);
    const [sandboxLoading, setSandboxLoading] = useState(false);
    const [lastResponse, setLastResponse]     = useState(savedLastResponse);
    const [fileMap, setFileMap]               = useState({});

    // Save headers to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(headersKey, JSON.stringify(headers));
    }, [headers, headersKey]);

    const handleBaseUrlChange = (val) => {
        setBaseUrl(val);
        localStorage.setItem(baseUrlKey, val);
    };

    const effectiveUrl  = baseUrl.trim() || api?.url;
    const mc            = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
    const fileFields    = detectFileFields(api?.sampleBody);
    const hasFileFields = fileFields.length > 0;
    const userId        = user?._id || user?.id;

    // Header Handlers
    const addHeaderRow    = () => setHeaders([...headers, { key: "", value: "" }]);
    const removeHeaderRow = (idx) => setHeaders(headers.filter((_, i) => i !== idx));
    const handleHeaderUpdate = (idx, field, val) => {
        const updated = [...headers];
        updated[idx][field] = val;
        setHeaders(updated);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        triggerAuthChange();
        navigate("/login");
    };

    const handleRunApi = async () => {
        setSandboxLoading(true);
        setSandboxResult(null);
        try {
            const headerObject = headers.reduce((acc, curr) => {
                if (curr.key.trim()) acc[curr.key.trim().toLowerCase()] = curr.value;
                return acc;
            }, {});

            if (hasFileFields) {
                const missingFields = fileFields.filter((k) => !fileMap[k]);
                if (missingFields.length > 0) {
                    setSandboxResult({ success: false, message: `Please select a file for: ${missingFields.join(", ")}` });
                    setSandboxLoading(false);
                    return;
                }
                const fd = new FormData();
                for (const [fieldKey, val] of Object.entries(fileMap)) {
                    if (val.type === "custom" && val.file) {
                        fd.append(fieldKey, val.file);
                    } else if (val.type === "admin" && val.attachment) {
                        const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.11.241:6001";
                        const fileUrl  = `${BASE_URL}/${val.attachment.path}`;
                        const blob     = await fetch(fileUrl).then((r) => r.blob());
                        fd.append(fieldKey, blob, val.attachment.originalname);
                    }
                }
                try {
                    const parsed = JSON.parse(requestBody);
                    for (const [k, v] of Object.entries(parsed)) {
                        if (!fileFields.includes(k)) fd.append(k, typeof v === "object" ? JSON.stringify(v) : v);
                    }
                } catch { /* ignore */ }
                const res = await callApi({ userId, apiId: api._id, requestBody: fd, headers: headerObject, isFormData: true, urlOverride: baseUrl.trim() || undefined });
                saveAndSet(res);
            } else {
                let parsedBody = null;
                if (api.method !== "GET" && requestBody.trim()) {
                    try { parsedBody = JSON.parse(requestBody); } catch { parsedBody = null; }
                }
                const res = await callApi({ userId, apiId: api._id, requestBody: parsedBody, headers: headerObject, urlOverride: baseUrl.trim() || undefined });
                saveAndSet(res);
            }
        } catch (err) {
            const errResult = { success: false, message: err.response?.data?.message || "Something went wrong!", _savedAt: new Date().toISOString() };
            setSandboxResult(errResult);
            setLastResponse(errResult);
            localStorage.setItem(lastResponseKey, JSON.stringify(errResult));
        } finally {
            setSandboxLoading(false);
        }
    };

    const saveAndSet = (res) => {
        const withMeta = { ...res, _savedAt: new Date().toISOString() };
        setSandboxResult(res);
        setLastResponse(withMeta);
        localStorage.setItem(lastResponseKey, JSON.stringify(withMeta));
    };

    const formatSavedAt = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    };

    const displayResult = sandboxResult || null;

    return (
        <div className="min-h-screen relative overflow-hidden"
            style={{ background: "#F8F7FF", color: "#334155", fontFamily: "'Urbanist', sans-serif" }}>

            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full z-0 pointer-events-none"
                style={{ background: "rgba(255,59,142,0.12)", filter: "blur(80px)" }} />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full z-0 pointer-events-none"
                style={{ background: "rgba(142,68,173,0.1)", filter: "blur(80px)" }} />

            <Navbar
                showBack showLogout user={user} onLogout={handleLogout} badge={api.name}
                badgeExtra={
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-lg ml-2"
                        style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
                        {api.method}
                    </span>
                }
            />

            <div className="relative z-10 grid grid-cols-2 gap-0 h-screen pt-[65px]">

                {/* ── LEFT PANEL ── */}
                <div className="flex flex-col h-full border-r border-black/[0.06] bg-white/60 backdrop-blur-sm overflow-hidden">

                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                        {/* API Info */}
                        <div className="rounded-2xl p-4 bg-white border border-black/[0.06] shadow-sm">
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-1.5">Endpoint</p>
                            <code className="text-xs text-[#FF3B8E] break-all" style={{ fontFamily: "monospace" }}>{effectiveUrl}</code>
                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{api.description}</p>
                            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                                <span className="text-[10px] text-slate-400 font-bold">Price per call</span>
                                <span className="text-sm font-black text-[#FF3B8E]">₹{api.pricePerCall}</span>
                            </div>
                            <div className="mt-3">
                                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-1">Base URL Override</p>
                                <input
                                    type="text" value={baseUrl} onChange={(e) => handleBaseUrlChange(e.target.value)}
                                    placeholder={api.url} className="w-full rounded-xl px-3 py-2 text-[11px] outline-none border border-black/[0.08]"
                                    style={{ background: "#F8F7FF", fontFamily: "monospace" }}
                                />
                            </div>
                        </div>

                        {/* Dynamic Headers */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Headers</label>
                                <button onClick={addHeaderRow} className="flex items-center gap-1 text-[10px] font-black text-[#FF3B8E] uppercase tracking-wider hover:opacity-70 transition-all">
                                    <Plus size={12} strokeWidth={3} /> Add Header
                                </button>
                            </div>
                            <div className="space-y-2">
                                {headers.map((header, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            placeholder="Key" value={header.key} onChange={(e) => handleHeaderUpdate(idx, "key", e.target.value)}
                                            className="w-1/3 rounded-xl px-3 py-2 text-[11px] outline-none border border-black/[0.08]"
                                            style={{ fontFamily: "monospace", background: "white" }}
                                        />
                                        <input
                                            placeholder="Value" value={header.value} onChange={(e) => handleHeaderUpdate(idx, "value", e.target.value)}
                                            className="flex-1 rounded-xl px-3 py-2 text-[11px] outline-none border border-black/[0.08]"
                                            style={{ fontFamily: "monospace", background: "white" }}
                                        />
                                        {headers.length > 1 && (
                                            <button onClick={() => removeHeaderRow(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        {api.method !== "GET" && (
                            <SmartBodyEditor
                                api={api} bodyText={requestBody} onBodyChange={setRequestBody}
                                fileMap={fileMap} onFileMapChange={setFileMap}
                            />
                        )}
                    </div>

                    {/* Fixed Run Button at Bottom */}
                    <div className="p-6 pt-2 bg-white/80 backdrop-blur-md border-t border-black/[0.04]">
                        <button
                            onClick={handleRunApi}
                            disabled={sandboxLoading}
                            className="w-full text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)", boxShadow: "0 4px 20px rgba(255,59,142,0.3)" }}>
                            {sandboxLoading
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><Play size={16} fill="white" /> RUN API — ₹{api.pricePerCall} will be deducted</>
                            }
                        </button>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                    {!sandboxResult && !sandboxLoading && (lastResponse || api.sampleResponse) && (
                        <div className="rounded-2xl overflow-hidden bg-white border border-black/[0.06] shadow-sm">
                            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06]" style={{ background: "#F8F7FF" }}>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{lastResponse ? "Last Response" : "Sample Response"}</span>
                                {lastResponse?.data?.statusCode && (
                                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full"
                                        style={lastResponse.data.status === "success"
                                            ? { background: "rgba(34,197,94,0.08)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)" }
                                            : { background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }
                                        }>{lastResponse.data.statusCode}</span>
                                )}
                            </div>
                            <pre className="p-5 text-[12px] text-slate-500 overflow-x-auto leading-relaxed" style={{ background: "white", fontFamily: "monospace" }}>
                                {JSON.stringify(lastResponse?.data?.response || lastResponse || api.sampleResponse, null, 2)}
                            </pre>
                        </div>
                    )}

                    {sandboxLoading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-10 h-10 border-2 border-black/5 border-t-[#FF3B8E] rounded-full animate-spin" />
                            <p className="text-slate-400 text-sm">Calling API...</p>
                        </div>
                    )}

                    {displayResult && !sandboxLoading && (
                        <div className="rounded-2xl overflow-hidden bg-white border shadow-sm" style={{ borderColor: displayResult.success === false ? "rgba(239,68,68,0.2)" : "rgba(255,59,142,0.2)" }}>
                            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06]" style={{ background: "#F8F7FF" }}>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Response</span>
                                {displayResult.data && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.08)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)" }}>{displayResult.data.statusCode}</span>
                                        <span className="text-[10px] font-bold text-red-500">-₹{displayResult.data.amountDeducted}</span>
                                    </div>
                                )}
                            </div>
                            <pre className="p-5 text-[12px] text-slate-600 overflow-x-auto leading-relaxed" style={{ background: "white", fontFamily: "monospace" }}>
                                {JSON.stringify(displayResult.data?.response || displayResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; letter-spacing: -0.02em; }
                pre, code, input, textarea { font-family: 'JetBrains Mono', monospace !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}
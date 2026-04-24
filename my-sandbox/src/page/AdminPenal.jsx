/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    LogOut, Plus, X, Trash2, Edit3,
    ShieldCheck, ToggleLeft, ToggleRight,
    IndianRupee, Save, Users, Eye, 
    Upload, FileText, Image, File, CheckCircle2, Activity,
    TrendingUp, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdmin } from "../hooks/useAdmin";
import Navbar from "./Navbar";
import { triggerAuthChange } from "../routes/AppRoutes";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#7C3AED" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#4F46E5" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#DC2626" },
};

const CATEGORIES = [
    { value: "konverthr_node",  label: "KonvertHR Node.js APIs", color: "#FF3B8E", glow: "rgba(255,59,142,0.08)" },
    { value: "konverthr_odoo",  label: "KonvertHR Odoo APIs",    color: "#8B5CF6", glow: "rgba(139,92,246,0.08)" },
    { value: "konverthr_other", label: "KonvertHR Other APIs",   color: "#16a34a", glow: "rgba(34,197,94,0.08)"  },
];

const mkToast = (msg, shadow, iconBg) =>
    toast.custom((t) => (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#fff", color: "#0f172a", fontFamily: "Urbanist, sans-serif",
            fontSize: "14px", padding: "12px 16px", borderRadius: "16px",
            boxShadow: shadow, maxWidth: "400px", opacity: t.visible ? 1 : 0,
            transform: t.visible ? "translateY(0)" : "translateY(-8px)", transition: "all 0.2s ease",
            border: "1px solid rgba(0,0,0,0.07)",
        }}>
            {iconBg && <span style={{
                width: "22px", height: "22px", borderRadius: "50%", background: iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "#fff", fontWeight: "900", fontSize: "12px",
            }}>✓</span>}
            <span style={{ flex: 1 }}>{msg}</span>
            <button onClick={() => toast.dismiss(t.id)} style={{
                background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px",
            }}><X size={14} /></button>
        </div>
    ), { duration: 3000 });

const successToast = (msg) => mkToast(msg, "0 0 0 1px rgba(255,59,142,0.2), 0 8px 32px rgba(255,59,142,0.12)", "#FF3B8E");
const errorToast   = (msg) => mkToast(msg, "0 0 0 1px rgba(239,68,68,0.2), 0 8px 32px rgba(239,68,68,0.12)", null);
const infoToast    = (msg) => mkToast(msg, "0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)", null);

const EMPTY_FORM = {
    name: "", url: "", method: "POST", price: "0.10",
    description: "", enabled: true,
    sampleBody: "", sampleResponse: "",
    category: "konverthr_node",
};

// ─── File Icon Helper ─────────────────────────────────────────────────────────
function getFileIcon(file) {
    if (!file) return <File size={15} />;
    if (file.type.startsWith("image/")) return <Image size={15} />;
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) return <FileText size={15} />;
    return <File size={15} />;
}
function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────
function FileUploadZone({ files, onChange }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault(); setDragging(false);
        onChange([...files, ...Array.from(e.dataTransfer.files)]);
    };
    const handleFileInput = (e) => {
        onChange([...files, ...Array.from(e.target.files)]);
        e.target.value = "";
    };
    const removeFile = (idx) => onChange(files.filter((_, i) => i !== idx));

    return (
        <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>
                Attachments <span style={{ color: "#cbd5e1", textTransform: "none", fontWeight: 400 }}>(optional)</span>
            </label>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    width: "100%", borderRadius: 16, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 0",
                    cursor: "pointer", transition: "all 0.18s ease", boxSizing: "border-box",
                    background: dragging ? "rgba(255,59,142,0.04)" : "#F8F7FF",
                    border: `1.5px dashed ${dragging ? "#FF3B8E" : "rgba(0,0,0,0.1)"}`,
                }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: dragging ? "rgba(255,59,142,0.1)" : "white",
                    border: `1px solid ${dragging ? "rgba(255,59,142,0.3)" : "rgba(0,0,0,0.08)"}`,
                    transition: "all 0.18s ease",
                }}>
                    <Upload size={17} style={{ color: dragging ? "#FF3B8E" : "#94a3b8" }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: dragging ? "#FF3B8E" : "#94a3b8", margin: 0 }}>
                    {dragging ? "Drop files here" : "Click or drag & drop files"}
                </p>
                <p style={{ fontSize: 11, color: "#cbd5e1", margin: 0 }}>Any file type · Max 10MB each</p>
                <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileInput} />
            </div>
            {files.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {files.map((file, idx) => (
                        <div key={idx} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                            borderRadius: 12, background: "white", border: "1px solid rgba(0,0,0,0.07)",
                        }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, background: "rgba(255,59,142,0.07)", border: "1px solid rgba(255,59,142,0.15)", color: "#FF3B8E",
                            }}>{getFileIcon(file)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{formatBytes(file.size)}</p>
                            </div>
                            <CheckCircle2 size={14} style={{ color: "#16a34a", flexShrink: 0 }} />
                            <button type="button" onClick={() => removeFile(idx)} style={{
                                width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center",
                                justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", color: "#dc2626",
                            }}><X size={11} strokeWidth={3} /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, Icon, accentColor, glowColor, borderHover, badge, subtext, subtext2, loading }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: "white", border: `1px solid ${hovered ? borderHover : "rgba(0,0,0,0.06)"}`,
                borderRadius: 20, padding: "20px 22px 18px", cursor: "default",
                position: "relative", overflow: "hidden", transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                boxShadow: hovered ? `0 12px 32px ${glowColor}` : "0 1px 4px rgba(0,0,0,0.04)",
            }}
        >
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: accentColor, borderRadius: "20px 20px 0 0",
                opacity: hovered ? 1 : 0, transition: "opacity 0.22s ease",
            }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 11, background: glowColor, border: `1px solid ${borderHover}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={17} style={{ color: accentColor }} />
                </div>
                {badge && (
                    <span style={{
                        fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 100,
                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                        letterSpacing: "0.04em", whiteSpace: "nowrap",
                    }}>{badge.text}</span>
                )}
            </div>
            <p style={{ fontSize: 34, fontWeight: 900, lineHeight: 1, margin: "0 0 5px", color: accentColor }}>
                {loading ? "—" : value}
            </p>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 14px" }}>
                {label}
            </p>
            <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "0 0 12px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {subtext && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{subtext.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: subtext.color || "#64748b" }}>{subtext.value}</span>
                    </div>
                )}
                {subtext2 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{subtext2.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: subtext2.color || "#64748b" }}>{subtext2.value}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── API Form Modal ───────────────────────────────────────────────────────────
function ApiFormModal({ initial, onClose, onSave }) {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const [files, setFiles] = useState([]);
    const methods = ["GET", "POST", "PUT", "DELETE"];

    const inputStyle = {
        width: "100%", borderRadius: 12, padding: "11px 14px", fontSize: 14,
        color: "#0f172a", outline: "none", background: "#F8F7FF",
        border: "1px solid rgba(0,0,0,0.08)", fontFamily: "monospace",
        boxSizing: "border-box", transition: "border-color 0.18s, box-shadow 0.18s",
    };
    const focusStyle = (e) => { e.target.style.borderColor = "rgba(255,59,142,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,59,142,0.08)"; };
    const blurStyle  = (e) => { e.target.style.borderColor = "rgba(0,0,0,0.08)";   e.target.style.boxShadow = "none"; };

    const handleSave = () => {
        if (!form.name.trim()) { errorToast("API name required."); return; }
        if (!form.url.trim())  { errorToast("API URL required."); return; }
        const price = parseFloat(form.price);
        if (isNaN(price) || price < 0) { errorToast("Valid price required."); return; }
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) { errorToast(`"${file.name}" exceeds 10MB limit.`); return; }
        }
        let parsedSampleBody = null, parsedSampleResponse = null;
        if (form.sampleBody.trim()) {
            try { parsedSampleBody = JSON.parse(form.sampleBody); }
            catch { errorToast("Sample Body valid JSON nahi hai!"); return; }
        }
        if (form.sampleResponse.trim()) {
            try { parsedSampleResponse = JSON.parse(form.sampleResponse); }
            catch { errorToast("Sample Response valid JSON nahi hai!"); return; }
        }
        onSave({ ...form, price: parseFloat(form.price), sampleBody: parsedSampleBody, sampleResponse: parsedSampleResponse, files });
        onClose();
    };

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 100, display: "flex",
            alignItems: "center", justifyContent: "center", padding: 16,
            background: "rgba(15,23,42,0.6)", backdropFilter: "blur(12px)",
        }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{
                width: "100%", maxWidth: 760, borderRadius: 28, padding: 28,
                maxHeight: "90vh", overflowY: "auto", background: "white",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.2)",
            }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
                            letterSpacing: "0.08em", textTransform: "uppercase", color: "#FF3B8E",
                            background: "rgba(255,59,142,0.07)", border: "1px solid rgba(255,59,142,0.18)",
                            borderRadius: 100, padding: "4px 12px", marginBottom: 8,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B8E", display: "inline-block" }} />
                            {initial ? "Edit API" : "New API"}
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0 }}>{initial ? "Edit API Details" : "Add New API"}</h2>
                        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Fill in the details below to {initial ? "update" : "register"} an API</p>
                    </div>
                    <button onClick={onClose} style={{
                        width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(0,0,0,0.08)", background: "#F8F7FF", cursor: "pointer", color: "#94a3b8",
                    }}><X size={15} /></button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Row 1 – Name + Price */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>API Name *</label>
                            <input type="text" placeholder="e.g. Send SMS" value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>Price per Call (₹) *</label>
                            <div style={{ position: "relative" }}>
                                <IndianRupee size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                                <input type="number" min="0" step="0.01" placeholder="0.50" value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    style={{ ...inputStyle, paddingLeft: 34 }} onFocus={focusStyle} onBlur={blurStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Row 2 – Method + URL */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>Method & Endpoint *</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                {methods.map((m) => {
                                    const c = METHOD_COLORS[m];
                                    return (
                                        <button key={m} type="button" onClick={() => setForm({ ...form, method: m })}
                                            style={{
                                                padding: "9px 12px", borderRadius: 10, fontSize: 11, fontWeight: 900, cursor: "pointer",
                                                transition: "all 0.15s ease", fontFamily: "Urbanist, sans-serif", letterSpacing: "0.04em",
                                                ...(form.method === m
                                                    ? { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
                                                    : { background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)", color: "#94a3b8" }),
                                            }}>{m}</button>
                                    );
                                })}
                            </div>
                            <input type="text" placeholder="https://api.example.com/endpoint" value={form.url}
                                onChange={(e) => setForm({ ...form, url: e.target.value })}
                                style={{ ...inputStyle, flex: 1, minWidth: 0 }} onFocus={focusStyle} onBlur={blurStyle} />
                        </div>
                    </div>

                    {/* Row 3 – Description */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>Description</label>
                        <input type="text" placeholder="What does this API do?" value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                    </div>

                    {/* Row 4 – Sample Body + Response */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {[
                            { label: "Sample Request Body", key: "sampleBody", placeholder: '{\n  "key": "value"\n}' },
                            { label: "Sample Response", key: "sampleResponse", placeholder: '{\n  "status": "ok",\n  "data": {}\n}' },
                        ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>
                                    {label} <span style={{ color: "#cbd5e1", textTransform: "none", fontWeight: 400 }}>(JSON)</span>
                                </label>
                                <textarea rows={8} placeholder={placeholder} value={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                                    onFocus={focusStyle} onBlur={blurStyle} />
                            </div>
                        ))}
                    </div>

                    {/* Row 5 – File Upload */}
                    <FileUploadZone files={files} onChange={setFiles} />

                    {/* Row 6 – Category + Toggle + Save */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {/* Category pills */}
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            {CATEGORIES.map((cat) => (
                                <button key={cat.value} type="button"
                                    onClick={() => setForm({ ...form, category: cat.value })}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 800,
                                        cursor: "pointer", fontFamily: "Urbanist, sans-serif", transition: "all 0.15s ease",
                                        letterSpacing: "0.04em", textTransform: "uppercase",
                                        ...(form.category === cat.value
                                            ? { background: cat.glow, border: `1px solid ${cat.color}50`, color: cat.color }
                                            : { background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.08)", color: "#94a3b8" }),
                                    }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: form.category === cat.value ? cat.color : "#cbd5e1" }} />
                                    {cat.value === "konverthr_node" ? "Node.js" : cat.value === "konverthr_odoo" ? "Odoo" : "Other"}
                                </button>
                            ))}
                        </div>

                        {/* Divider */}
                        <div style={{ width: 1, height: 32, background: "rgba(0,0,0,0.07)", flexShrink: 0 }} />

                        {/* Toggle */}
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 14px", borderRadius: 14, background: "#F8F7FF",
                            border: "1px solid rgba(0,0,0,0.07)", minWidth: 180,
                        }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>Visible to Customers</p>
                                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Enable to show this API</p>
                            </div>
                            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                {form.enabled
                                    ? <ToggleRight size={28} style={{ color: "#FF3B8E" }} />
                                    : <ToggleLeft size={28} style={{ color: "#94a3b8" }} />}
                            </button>
                        </div>

                        {/* Save button */}
                        <button onClick={handleSave} style={{
                            flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
                            padding: "11px 22px", borderRadius: 100, fontSize: 13, fontWeight: 900,
                            color: "white", border: "none", cursor: "pointer",
                            background: "linear-gradient(to right, #FF3B8E, #8E44AD)",
                            boxShadow: "0 4px 16px rgba(255,59,142,0.3)",
                            transition: "transform 0.15s, box-shadow 0.15s", letterSpacing: "0.04em",
                            textTransform: "uppercase", fontFamily: "Urbanist, sans-serif",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,59,142,0.4)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,59,142,0.3)"; }}>
                            <Save size={14} /> {initial ? "Save" : "Add API"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── API Row ──────────────────────────────────────────────────────────────────
function ApiRow({ api, onToggle, onEdit, onDelete }) {
    const [hovered, setHovered] = useState(false);
    const mc = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 16,
                background: hovered ? "rgba(255,59,142,0.02)" : "rgba(248,247,255,0.7)",
                border: `1px solid ${hovered ? "rgba(255,59,142,0.18)" : "rgba(0,0,0,0.05)"}`,
                transform: hovered ? "translateX(3px)" : "translateX(0)",
                transition: "all 0.2s ease", opacity: api.enabled ? 1 : 0.55,
                position: "relative", overflow: "hidden",
            }}>
            {/* Left accent */}
            <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                background: api.enabled ? "linear-gradient(180deg,#FF3B8E,#8E44AD)" : "#cbd5e1",
                borderRadius: "16px 0 0 16px", opacity: hovered ? 1 : 0.4, transition: "opacity 0.2s",
            }} />

            {/* Method badge */}
            <span style={{
                fontSize: 11, fontWeight: 900, padding: "5px 11px", borderRadius: 9, flexShrink: 0,
                background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40`, letterSpacing: "0.04em",
            }}>{api.method}</span>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{api.name}</p>
                    {!api.enabled && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100, flexShrink: 0, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626" }}>Hidden</span>
                    )}
                    {api.sampleResponse && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100, flexShrink: 0, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", color: "#16a34a" }}>Preview ✓</span>
                    )}
                    {api.attachments?.length > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100, flexShrink: 0, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", color: "#4F46E5" }}>
                            <Upload size={9} /> {api.attachments.length}
                        </span>
                    )}
                </div>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{api.description}</p>
                <code style={{ fontSize: 12, color: "#94a3b8" }}>{api.url}</code>
            </div>

            {/* Price */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 15, color: "#FF3B8E", margin: 0, fontFamily: "monospace" }}>₹{api.pricePerCall}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>per call</p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                <button onClick={() => onToggle(api._id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {api.enabled ? <ToggleRight size={26} style={{ color: "#FF3B8E" }} /> : <ToggleLeft size={26} style={{ color: "#94a3b8" }} />}
                </button>
                <button onClick={() => onEdit(api)} style={{
                    width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.07)", color: "#4F46E5",
                    transition: "border-color 0.15s",
                }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"}>
                    <Edit3 size={14} />
                </button>
                <button onClick={() => onDelete(api._id)} style={{
                    width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.07)", color: "#dc2626",
                    transition: "border-color 0.15s",
                }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"}>
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Customer Card ────────────────────────────────────────────────────────────
function CustomerCard({ customer, onClick }) {
    const [hovered, setHovered] = useState(false);
    const initials = customer.name ? customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";
    const joinDate = customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    return (
        <div onClick={() => onClick(customer)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                borderRadius: 20, padding: 22, cursor: "pointer", position: "relative", overflow: "hidden",
                background: "white",
                border: `1px solid ${hovered ? "rgba(255,59,142,0.25)" : "rgba(0,0,0,0.06)"}`,
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                boxShadow: hovered ? "0 12px 32px rgba(255,59,142,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
                transition: "all 0.22s ease",
            }}>
            {/* Top accent bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "linear-gradient(to right, #FF3B8E, #8E44AD)", borderRadius: "20px 20px 0 0",
                opacity: hovered ? 1 : 0, transition: "opacity 0.22s ease",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
                {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name}
                        style={{ width: 50, height: 50, borderRadius: 14, objectFit: "cover", flexShrink: 0, border: `2px solid ${hovered ? "rgba(255,59,142,0.3)" : "rgba(0,0,0,0.07)"}`, transition: "border-color 0.2s" }} />
                ) : (
                    <div style={{
                        width: 50, height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        background: hovered ? "rgba(255,59,142,0.1)" : "rgba(255,59,142,0.06)",
                        border: `2px solid ${hovered ? "rgba(255,59,142,0.3)" : "rgba(255,59,142,0.12)"}`,
                        transition: "all 0.2s",
                    }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: "#FF3B8E" }}>{initials}</span>
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.name}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>{customer.email}</p>
                </div>
                <Eye size={16} style={{ color: hovered ? "#FF3B8E" : "#cbd5e1", transition: "color 0.2s", flexShrink: 0 }} />
            </div>

            <div style={{ height: 1, background: "rgba(0,0,0,0.05)", marginBottom: 14 }} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center" }}>
                {[
                    { value: customer.selectedApis?.length || 0, label: "APIs",    color: "#8B5CF6" },
                    { value: `₹${customer.balance || 0}`,        label: "Balance", color: "#FF3B8E" },
                    { value: customer.totalCalls || 0,           label: "Calls",   color: "#4F46E5" },
                ].map((s, i) => (
                    <div key={i} style={{ padding: "10px 4px", borderRadius: 10, background: "#F8F7FF" }}>
                        <p style={{ fontSize: 20, fontWeight: 900, color: s.color, margin: 0, fontFamily: "monospace" }}>{s.value}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, margin: 0 }}>{s.label}</p>
                    </div>
                ))}
            </div>
            <p style={{ fontSize: 11, color: "#cbd5e1", marginTop: 12, fontFamily: "monospace" }}>Joined {joinDate}</p>
        </div>
    );
}

// ─── Customer Detail Modal ────────────────────────────────────────────────────
function CustomerModal({ customer, onClose }) {
    const initials = customer.name ? customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center",
            justifyContent: "center", padding: 16, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(12px)",
        }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{
                width: "100%", maxWidth: 460, borderRadius: 28, padding: 28, maxHeight: "80vh",
                overflowY: "auto", background: "white", boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.2)",
            }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {customer.avatar ? (
                            <img src={customer.avatar} alt={customer.name} style={{ width: 68, height: 68, borderRadius: 16, objectFit: "cover", border: "2px solid rgba(255,59,142,0.2)" }} />
                        ) : (
                            <div style={{ width: 68, height: 68, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,59,142,0.07)", border: "2px solid rgba(255,59,142,0.15)" }}>
                                <span style={{ fontSize: 24, fontWeight: 900, color: "#FF3B8E" }}>{initials}</span>
                            </div>
                        )}
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: 0 }}>{customer.name}</h2>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontFamily: "monospace" }}>{customer.email}</p>
                            <p style={{ fontSize: 11, color: "#cbd5e1", margin: "2px 0 0", fontFamily: "monospace" }}>ID: {customer._id || "—"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(0,0,0,0.08)", background: "#F8F7FF", cursor: "pointer", color: "#94a3b8", flexShrink: 0,
                    }}><X size={15} /></button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
                    {[
                        { label: "Wallet",    value: `₹${customer.balance || 0}`, color: "#FF3B8E" },
                        { label: "API Calls", value: customer.totalCalls || 0,    color: "#4F46E5" },
                        { label: "APIs",      value: customer.selectedApis?.length || 0, color: "#8B5CF6" },
                    ].map((s) => (
                        <div key={s.label} style={{ borderRadius: 14, padding: "14px 10px", textAlign: "center", background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <p style={{ fontWeight: 900, fontSize: 24, color: s.color, margin: "0 0 3px", fontFamily: "monospace" }}>{s.value}</p>
                            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, margin: 0 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>Contact Info</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {[
                            { label: "Phone",     value: customer.phone || "—" },
                            { label: "Client ID", value: customer.client_id || "—" },
                            { label: "Role",      value: customer.role || "—" },
                        ].map((row) => (
                            <div key={row.label} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "12px 16px", borderRadius: 12, background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.05)",
                            }}>
                                <span style={{ fontSize: 13, color: "#94a3b8" }}>{row.label}</span>
                                <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, fontFamily: "monospace", textTransform: "capitalize" }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── API Section ──────────────────────────────────────────────────────────────
function ApiSection({ label, apis, color, glow, emptyText, onToggle, onEdit, onDelete }) {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100,
                    background: glow, border: `1px solid ${color}26`,
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, padding: "2px 9px", borderRadius: 100, background: `${color}18`, color }}>{apis.length}</span>
                </div>
                <div style={{ flex: 1, height: 1, background: `${color}18` }} />
            </div>
            {apis.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", borderRadius: 16, border: `1px dashed ${color}26` }}>
                    <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>{emptyText}</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {apis.map((api) => <ApiRow key={api._id} api={api} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)}
                </div>
            )}
        </div>
    );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────
export default function AdminPanel() {
    const navigate = useNavigate();
    const { apis, customers, stats, loading, addApi, updateApi, deleteApi, toggleApi } = useAdmin();
    const [showForm,         setShowForm]         = useState(false);
    const [editApi,          setEditApi]          = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [activeTab,        setActiveTab]        = useState("apis");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "admin") navigate("/login");
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        triggerAuthChange();
        navigate("/login");
    };

    const handleAdd = async (formData) => {
        try {
            if (formData.files?.length > 0) {
                const fd = new FormData();
                fd.append("name", formData.name); fd.append("url", formData.url);
                fd.append("method", formData.method); fd.append("pricePerCall", formData.price);
                fd.append("description", formData.description); fd.append("enabled", formData.enabled);
                fd.append("category", formData.category);
                if (formData.sampleBody)     fd.append("sampleBody",     JSON.stringify(formData.sampleBody));
                if (formData.sampleResponse) fd.append("sampleResponse", JSON.stringify(formData.sampleResponse));
                formData.files.forEach((file) => fd.append("attachments", file));
                await addApi(fd, true);
            } else {
                await addApi({ name: formData.name, url: formData.url, method: formData.method, pricePerCall: formData.price, description: formData.description, enabled: formData.enabled, sampleBody: formData.sampleBody, sampleResponse: formData.sampleResponse, category: formData.category });
            }
            successToast(`"${formData.name}" added!`);
        } catch { errorToast("Failed to add API."); }
    };

    const handleEdit = async (formData) => {
        try {
            if (formData.files?.length > 0) {
                const fd = new FormData();
                fd.append("name", formData.name); fd.append("url", formData.url);
                fd.append("method", formData.method); fd.append("pricePerCall", formData.price);
                fd.append("description", formData.description); fd.append("enabled", formData.enabled);
                fd.append("category", formData.category);
                if (formData.sampleBody)     fd.append("sampleBody",     JSON.stringify(formData.sampleBody));
                if (formData.sampleResponse) fd.append("sampleResponse", JSON.stringify(formData.sampleResponse));
                formData.files.forEach((file) => fd.append("attachments", file));
                await updateApi(editApi._id, fd, true);
            } else {
                await updateApi(editApi._id, { name: formData.name, url: formData.url, method: formData.method, pricePerCall: formData.price, description: formData.description, enabled: formData.enabled, sampleBody: formData.sampleBody, sampleResponse: formData.sampleResponse, category: formData.category });
            }
            setEditApi(null);
            successToast("API updated!");
        } catch { errorToast("Failed to update API."); }
    };

    const handleDelete = async (id) => {
        try { await deleteApi(id); infoToast("API deleted."); }
        catch { errorToast("Failed to delete API."); }
    };
    const handleToggle = async (id) => {
        try { await toggleApi(id); }
        catch { errorToast("Failed to toggle API."); }
    };

    const enabledCount  = apis.filter((a) => a.enabled).length;
    const disabledCount = (stats?.totalApis ?? apis.length) - enabledCount;

    const statCards = [
        {
            label: "Total APIs", value: stats?.totalApis ?? apis.length, Icon: Activity,
            accentColor: "#FF3B8E", glowColor: "rgba(255,59,142,0.08)", borderHover: "rgba(255,59,142,0.25)",
            badge: { text: "ALL APIS", bg: "rgba(255,59,142,0.07)", color: "#FF3B8E", border: "rgba(255,59,142,0.2)" },
            subtext:  { label: "Active APIs",   value: enabledCount,  color: "#16a34a" },
            subtext2: { label: "Disabled APIs",  value: disabledCount, color: "#dc2626" },
        },
        {
            label: "Active APIs", value: enabledCount, Icon: TrendingUp,
            accentColor: "#16a34a", glowColor: "rgba(34,197,94,0.08)", borderHover: "rgba(34,197,94,0.25)",
            badge: { text: "LIVE", bg: "rgba(34,197,94,0.07)", color: "#16a34a", border: "rgba(34,197,94,0.2)" },
            subtext:  { label: "Visible to customers", value: enabledCount, color: "#16a34a" },
            subtext2: { label: "Out of total",          value: stats?.totalApis ?? apis.length, color: "#64748b" },
        },
        {
            label: "Disabled APIs", value: disabledCount, Icon: AlertCircle,
            accentColor: "#dc2626", glowColor: "rgba(239,68,68,0.08)", borderHover: "rgba(239,68,68,0.25)",
            badge: disabledCount === 0
                ? { text: "ALL CLEAR", bg: "rgba(34,197,94,0.07)", color: "#16a34a", border: "rgba(34,197,94,0.2)" }
                : { text: "HIDDEN", bg: "rgba(239,68,68,0.07)", color: "#dc2626", border: "rgba(239,68,68,0.2)" },
            subtext:  { label: "Hidden from users", value: disabledCount, color: disabledCount > 0 ? "#dc2626" : "#16a34a" },
            subtext2: { label: "Status", value: disabledCount === 0 ? "All live" : "Toggle to enable", color: "#64748b" },
        },
        {
            label: "Total Customers", value: stats?.totalCustomers ?? customers.length, Icon: Users,
            accentColor: "#8B5CF6", glowColor: "rgba(139,92,246,0.08)", borderHover: "rgba(139,92,246,0.25)",
            badge: { text: "USERS", bg: "rgba(139,92,246,0.07)", color: "#8B5CF6", border: "rgba(139,92,246,0.2)" },
            subtext:  { label: "Registered users", value: stats?.totalCustomers ?? customers.length, color: "#8B5CF6" },
            subtext2: { label: "Access level", value: "Customer", color: "#64748b" },
        },
    ];

    const nodeApis  = apis.filter((a) => a.category === "konverthr_node" || !a.category);
    const odooApis  = apis.filter((a) => a.category === "konverthr_odoo");
    const otherApis = apis.filter((a) => a.category === "konverthr_other");

    const API_SECTIONS = [
        { key: "node",  label: "KonvertHR Node.js APIs", apis: nodeApis,  color: "#FF3B8E", glow: "rgba(255,59,142,0.06)",  emptyText: "No Node.js APIs yet." },
        { key: "odoo",  label: "KonvertHR Odoo APIs",    apis: odooApis,  color: "#8B5CF6", glow: "rgba(139,92,246,0.06)", emptyText: "No Odoo APIs yet." },
        { key: "other", label: "KonvertHR Other APIs",   apis: otherApis, color: "#16a34a", glow: "rgba(34,197,94,0.06)",  emptyText: "No Other APIs yet." },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#F8F7FF", color: "#334155", fontFamily: "'Urbanist', sans-serif", position: "relative", overflowX: "hidden" }}>

            {/* Ambient glows */}
            <div style={{ position: "fixed", top: "-10%", left: "-10%", width: "40%", height: "40%", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "rgba(255,59,142,0.08)", filter: "blur(80px)" }} />
            <div style={{ position: "fixed", bottom: "-10%", right: "-10%", width: "40%", height: "40%", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "rgba(142,68,173,0.07)", filter: "blur(80px)" }} />

            {/* Modals */}
            {(showForm || editApi) && (
                <ApiFormModal
                    initial={editApi ? {
                        name: editApi.name, url: editApi.url, method: editApi.method,
                        price: editApi.pricePerCall?.toString(), description: editApi.description,
                        enabled: editApi.enabled, category: editApi.category || "konverthr_node",
                        sampleBody:     editApi.sampleBody     ? JSON.stringify(editApi.sampleBody, null, 2)     : "",
                        sampleResponse: editApi.sampleResponse ? JSON.stringify(editApi.sampleResponse, null, 2) : "",
                    } : null}
                    onClose={() => { setShowForm(false); setEditApi(null); }}
                    onSave={editApi ? handleEdit : handleAdd}
                />
            )}
            {selectedCustomer && (
                <CustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
            )}

            <Navbar
                showAdminLinks={true}
                onLogout={handleLogout}
                rightContent={
                    activeTab === "apis" && (
                        <button onClick={() => setShowForm(true)} style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "9px 20px", borderRadius: 100, fontSize: 13, fontWeight: 900,
                            color: "white", border: "none", cursor: "pointer",
                            background: "linear-gradient(to right, #FF3B8E, #8E44AD)",
                            boxShadow: "0 4px 14px rgba(255,59,142,0.3)",
                            fontFamily: "Urbanist, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase",
                        }}>
                            <Plus size={14} strokeWidth={3} /><span>Add API</span>
                        </button>
                    )
                }
            />

            <main style={{ position: "relative", zIndex: 10, padding: "88px 5vw 64px" }}>

                {/* Page header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700,
                        letterSpacing: "0.08em", textTransform: "uppercase", color: "#FF3B8E",
                        background: "rgba(255,59,142,0.07)", border: "1px solid rgba(255,59,142,0.18)",
                        borderRadius: 100, padding: "5px 14px", marginBottom: 10,
                    }}>
                        <ShieldCheck size={13} />
                        Admin Panel
                    </div>
                    <h1 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 8px", lineHeight: 1.15 }}>
                        Manage{" "}
                        <span style={{ background: "linear-gradient(to right,#FF3B8E,#8E44AD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            APIs & Customers
                        </span>
                    </h1>
                    <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>
                        Control all APIs, pricing, and customer access — <strong style={{ color: "#0f172a", fontWeight: 700 }}>all in one place.</strong>
                    </p>
                </div>

                {/* Stat Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
                    {statCards.map((s, i) => <StatCard key={i} {...s} loading={loading} />)}
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                    {[
                        { id: "apis",      label: "Manage APIs" },
                        { id: "customers", label: `Customers (${customers.length})` },
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: "12px 22px", fontSize: 14, fontWeight: 900, cursor: "pointer",
                            background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? "#FF3B8E" : "transparent"}`,
                            color: activeTab === tab.id ? "#FF3B8E" : "#94a3b8",
                            fontFamily: "Urbanist, sans-serif", letterSpacing: "0.03em",
                            textTransform: "uppercase", transition: "all 0.18s ease",
                        }}>{tab.label}</button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.05)", borderTopColor: "#FF3B8E", animation: "apSpin 0.7s linear infinite" }} />
                    </div>
                )}

                {/* APIs Tab */}
                {!loading && activeTab === "apis" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        {API_SECTIONS.map((section) => (
                            <ApiSection key={section.key} {...section}
                                onToggle={handleToggle} onEdit={setEditApi} onDelete={handleDelete} />
                        ))}
                    </div>
                )}

                {/* Customers Tab */}
                {!loading && activeTab === "customers" && (
                    <div>
                        {customers.length === 0 ? (
                            <div style={{
                                textAlign: "center", padding: "80px 20px", borderRadius: 20,
                                border: "1px dashed rgba(0,0,0,0.1)", background: "white",
                            }}>
                                <div style={{ width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.15)" }}>
                                    <Users size={24} style={{ color: "#8B5CF6" }} />
                                </div>
                                <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", margin: "0 0 4px" }}>No customers yet</p>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Registered customers will appear here.</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                                {customers.map((c) => (
                                    <CustomerCard key={c._id} customer={c} onClick={setSelectedCustomer} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { font-family: 'Urbanist', sans-serif; letter-spacing: -0.02em; box-sizing: border-box; }
                @keyframes apSpin { to { transform: rotate(360deg); } }
                @media (max-width: 960px) {
                    main { padding: 80px 3vw 48px !important; }
                    .ap-stats { grid-template-columns: repeat(2, 1fr) !important; }
                    .ap-customers { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 560px) {
                    main { padding: 76px 16px 40px !important; }
                    .ap-customers { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
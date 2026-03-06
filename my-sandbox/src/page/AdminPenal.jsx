/* eslint-disable no-unused-vars */
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     Zap, LogOut, Plus, X, Trash2, Edit3,
//     ShieldCheck, ToggleLeft, ToggleRight,
//     IndianRupee, Save, Users, Eye, History, CreditCard
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { useAdmin } from "../hooks/useAdmin";
// import Navbar from "./Navbar";

// const METHOD_COLORS = {
//     GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#A78BFA" },
//     POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
//     PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#818CF8" },
//     DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#F87171" },
// };

// const mkToast = (msg, shadow, iconBg) =>
//     toast.custom((t) => (
//         <div style={{
//             display: "flex", alignItems: "center", gap: "10px",
//             background: "#0a0a0a", color: "#fff", fontFamily: "Urbanist, sans-serif",
//             fontSize: "13px", padding: "12px 16px", borderRadius: "16px",
//             boxShadow: shadow, maxWidth: "400px", opacity: t.visible ? 1 : 0,
//             transform: t.visible ? "translateY(0)" : "translateY(-8px)", transition: "all 0.2s ease",
//         }}>
//             {iconBg && <span style={{
//                 width: "20px", height: "20px", borderRadius: "50%", background: iconBg,
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 flexShrink: 0, color: "#fff", fontWeight: "900", fontSize: "11px",
//             }}>✓</span>}
//             <span style={{ flex: 1 }}>{msg}</span>
//             <button onClick={() => toast.dismiss(t.id)} style={{
//                 background: "none", border: "none", color: "#888", cursor: "pointer", padding: "2px",
//             }}><X size={13} /></button>
//         </div>
//     ), { duration: 3000 });

// const successToast = (msg) => mkToast(msg, "0 0 0 1px rgba(255,59,142,0.3), 0 8px 32px rgba(255,59,142,0.12)", "#FF3B8E");
// const errorToast   = (msg) => mkToast(msg, "0 0 0 1px rgba(239,68,68,0.3), 0 8px 32px rgba(239,68,68,0.12)", null);
// const infoToast    = (msg) => mkToast(msg, "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)", null);

// const EMPTY_FORM = {
//     name: "", url: "", method: "POST", price: "0.10",
//     description: "", enabled: true,
//     sampleBody: "", sampleResponse: "",
// };

// // ─── API Form Modal ───────────────────────────────────────────────────────────
// function ApiFormModal({ initial, onClose, onSave }) {
//     const [form, setForm] = useState(initial || EMPTY_FORM);
//     const methods = ["GET", "POST", "PUT", "DELETE"];

//     const handleSave = () => {
//         if (!form.name.trim()) { errorToast("API name required."); return; }
//         if (!form.url.trim())  { errorToast("API URL required."); return; }
//         const price = parseFloat(form.price);
//         if (isNaN(price) || price < 0) { errorToast("Valid price required."); return; }

//         let parsedSampleBody = null, parsedSampleResponse = null;
//         if (form.sampleBody.trim()) {
//             try { parsedSampleBody = JSON.parse(form.sampleBody); }
//             catch { errorToast("Sample Body valid JSON nahi hai!"); return; }
//         }
//         if (form.sampleResponse.trim()) {
//             try { parsedSampleResponse = JSON.parse(form.sampleResponse); }
//             catch { errorToast("Sample Response valid JSON nahi hai!"); return; }
//         }
//         onSave({ ...form, price: parseFloat(form.price), sampleBody: parsedSampleBody, sampleResponse: parsedSampleResponse });
//         onClose();
//     };

//     return (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
//             style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
//             onClick={(e) => e.target === e.currentTarget && onClose()}>

//             <div className="w-full max-w-3xl rounded-[2rem] p-7"
//                 style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.8)" }}>

//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-7">
//                     <div>
//                         <h2 className="text-lg font-black text-white">{initial ? "Edit API" : "Add New API"}</h2>
//                         <p className="text-[11px] text-slate-500 mt-0.5">Fill in the API details below</p>
//                     </div>
//                     <button onClick={onClose}
//                         className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
//                         style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
//                         <X size={14} />
//                     </button>
//                 </div>

//                 <div className="space-y-4">
//                     {/* Row 1 — Name + Price */}
//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">API Name *</label>
//                             <input type="text" placeholder="e.g. Send SMS" value={form.name}
//                                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                                 className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-slate-700"
//                                 style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
//                                 onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
//                                 onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
//                         </div>
//                         <div>
//                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Price per Call (₹) *</label>
//                             <div className="relative">
//                                 <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
//                                 <input type="number" min="0" step="0.01" placeholder="0.50" value={form.price}
//                                     onChange={(e) => setForm({ ...form, price: e.target.value })}
//                                     className="w-full rounded-2xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all placeholder-slate-700"
//                                     style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
//                                     onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
//                                     onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Row 2 — Method + URL */}
//                     <div>
//                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Method & Endpoint *</label>
//                         <div className="flex gap-2">
//                             <div className="flex gap-1 flex-shrink-0">
//                                 {methods.map((m) => {
//                                     const c = METHOD_COLORS[m];
//                                     return (
//                                         <button key={m} type="button" onClick={() => setForm({ ...form, method: m })}
//                                             className="px-2.5 py-2.5 rounded-xl text-[9px] font-black border transition-all"
//                                             style={form.method === m
//                                                 ? { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
//                                                 : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
//                                             {m}
//                                         </button>
//                                     );
//                                 })}
//                             </div>
//                             <input type="text" placeholder="https://api.example.com/endpoint" value={form.url}
//                                 onChange={(e) => setForm({ ...form, url: e.target.value })}
//                                 className="flex-1 rounded-2xl px-3 py-3 text-white text-xs outline-none transition-all min-w-0 placeholder-slate-700"
//                                 style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
//                                 onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
//                                 onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
//                         </div>
//                     </div>

//                     {/* Row 3 — Description */}
//                     <div>
//                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Description</label>
//                         <input type="text" placeholder="What does this API do?" value={form.description}
//                             onChange={(e) => setForm({ ...form, description: e.target.value })}
//                             className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-slate-700"
//                             style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
//                             onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
//                             onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
//                     </div>

//                     {/* Row 4 — Sample Body + Sample Response */}
//                     <div className="grid grid-cols-2 gap-4">
//                         {[
//                             { label: "Sample Request Body", key: "sampleBody", placeholder: '{\n  "key": "value"\n}' },
//                             { label: "Sample Response", key: "sampleResponse", placeholder: '{\n  "status": "ok",\n  "data": {}\n}' },
//                         ].map(({ label, key, placeholder }) => (
//                             <div key={key}>
//                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">
//                                     {label} <span className="text-slate-700 normal-case font-normal">(JSON)</span>
//                                 </label>
//                                 <textarea rows={8} placeholder={placeholder}
//                                     value={form[key]}
//                                     onChange={(e) => setForm({ ...form, [key]: e.target.value })}
//                                     className="w-full rounded-2xl px-4 py-3 text-white text-xs outline-none transition-all resize-none placeholder-slate-700"
//                                     style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
//                                     onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
//                                     onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
//                             </div>
//                         ))}
//                     </div>

//                     {/* Row 5 — Toggle + Save */}
//                     <div className="flex items-center gap-3 mt-2">
//                         <div className="flex items-center justify-between flex-1 p-3.5 rounded-2xl"
//                             style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
//                             <div>
//                                 <p className="text-xs font-bold text-white">Visible to Customers</p>
//                                 <p className="text-[10px] text-slate-500">Enable to show this API to customers</p>
//                             </div>
//                             <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })}>
//                                 {form.enabled
//                                     ? <ToggleRight size={28} className="text-[#FF3B8E]" />
//                                     : <ToggleLeft size={28} className="text-slate-600" />}
//                             </button>
//                         </div>
//                         <button onClick={handleSave}
//                             className="flex-shrink-0 text-white font-black rounded-2xl py-3.5 px-6 text-sm uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-pink-500/20"
//                             style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}>
//                             <Save size={15} /> {initial ? "Save" : "Add API"}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // ─── Customer Card ────────────────────────────────────────────────────────────
// function CustomerCard({ customer, onClick }) {
//     const [hovered, setHovered] = useState(false);
//     const initials = customer.name
//         ? customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
//         : "??";
//     const joinDate = customer.createdAt
//         ? new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
//         : "—";

//     return (
//         <div onClick={() => onClick(customer)}
//             className="rounded-2xl p-5 cursor-pointer relative overflow-hidden transition-all duration-200"
//             style={{
//                 background: hovered ? "#141414" : "#0c0c0c",
//                 boxShadow: hovered
//                     ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,59,142,0.25), 0 8px 24px rgba(0,0,0,0.3)"
//                     : "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.06)",
//                 transform: hovered ? "translateY(-2px)" : "translateY(0)",
//             }}
//             onMouseEnter={() => setHovered(true)}
//             onMouseLeave={() => setHovered(false)}>

//             {/* Hover glow */}
//             <div className="absolute inset-0 pointer-events-none transition-opacity duration-200 rounded-2xl"
//                 style={{ background: "radial-gradient(ellipse at top left, rgba(255,59,142,0.07), transparent 70%)", opacity: hovered ? 1 : 0 }} />
//             {/* Left bar */}
//             <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200"
//                 style={{ background: hovered ? "linear-gradient(to bottom, #FF3B8E, #8E44AD)" : "transparent" }} />

//             <div className="relative flex items-center gap-3 mb-4">
//                 {customer.avatar ? (
//                     <img src={customer.avatar} alt={customer.name}
//                         className="w-12 h-12 rounded-2xl object-cover flex-shrink-0 transition-all duration-200"
//                         style={{ border: `2px solid ${hovered ? "rgba(255,59,142,0.4)" : "rgba(255,255,255,0.08)"}` }} />
//                 ) : (
//                     <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
//                         style={{
//                             background: hovered ? "rgba(255,59,142,0.15)" : "rgba(255,59,142,0.08)",
//                             border: `2px solid ${hovered ? "rgba(255,59,142,0.4)" : "rgba(255,59,142,0.15)"}`,
//                         }}>
//                         <span className="text-sm font-black text-[#FF3B8E]">{initials}</span>
//                     </div>
//                 )}
//                 <div className="min-w-0 flex-1">
//                     <p className="font-black text-sm truncate transition-colors duration-200"
//                         style={{ color: hovered ? "#fff" : "#e2e8f0" }}>{customer.name}</p>
//                     <p className="text-[11px] text-slate-600 truncate" style={{ fontFamily: "monospace" }}>{customer.email}</p>
//                 </div>
//                 <Eye size={14} className="transition-colors duration-200 flex-shrink-0"
//                     style={{ color: hovered ? "#FF3B8E" : "#374151" }} />
//             </div>

//             <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.05)" }} />

//             <div className="relative grid grid-cols-3 gap-2 text-center">
//                 {[
//                     { value: customer.selectedApis?.length || 0, label: "APIs",    color: "#A78BFA" },
//                     { value: `₹${customer.balance || 0}`,        label: "Balance", color: "#FF3B8E" },
//                     { value: customer.totalCalls || 0,           label: "Calls",   color: "#818CF8" },
//                 ].map((s, i) => (
//                     <div key={i}>
//                         <p className="text-base font-black" style={{ color: s.color, fontFamily: "monospace" }}>{s.value}</p>
//                         <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">{s.label}</p>
//                     </div>
//                 ))}
//             </div>

//             <p className="relative text-[10px] text-slate-700 mt-3" style={{ fontFamily: "monospace" }}>Joined {joinDate}</p>
//         </div>
//     );
// }

// // ─── Customer Detail Modal ────────────────────────────────────────────────────
// function CustomerModal({ customer, onClose }) {
//     const initials = customer.name
//         ? customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
//         : "??";

//     return (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
//             style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
//             onClick={(e) => e.target === e.currentTarget && onClose()}>
//             <div className="w-full max-w-md rounded-[2rem] p-7 max-h-[80vh] overflow-y-auto"
//                 style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.8)" }}>

//                 <div className="flex items-start justify-between mb-6">
//                     <div className="flex items-center gap-4">
//                         {customer.avatar ? (
//                             <img src={customer.avatar} alt={customer.name}
//                                 className="w-16 h-16 rounded-2xl object-cover border-2"
//                                 style={{ borderColor: "rgba(255,59,142,0.3)" }} />
//                         ) : (
//                             <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
//                                 style={{ background: "rgba(255,59,142,0.1)", border: "2px solid rgba(255,59,142,0.2)" }}>
//                                 <span className="text-xl font-black text-[#FF3B8E]">{initials}</span>
//                             </div>
//                         )}
//                         <div>
//                             <h2 className="text-lg font-black text-white">{customer.name}</h2>
//                             <p className="text-[11px] text-slate-500" style={{ fontFamily: "monospace" }}>{customer.email}</p>
//                             <p className="text-[10px] text-slate-700 mt-0.5" style={{ fontFamily: "monospace" }}>ID: {customer._id || "—"}</p>
//                         </div>
//                     </div>
//                     <button onClick={onClose}
//                         className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
//                         style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
//                         <X size={14} />
//                     </button>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3 mb-6">
//                     {[
//                         { label: "Wallet",    value: `₹${customer.balance || 0}`, color: "#FF3B8E",  glow: "rgba(255,59,142,0.12)" },
//                         { label: "API Calls", value: customer.totalCalls || 0,    color: "#818CF8",  glow: "rgba(99,102,241,0.12)" },
//                         { label: "APIs",      value: customer.selectedApis?.length || 0, color: "#A78BFA", glow: "rgba(167,139,250,0.12)" },
//                     ].map((s) => (
//                         <div key={s.label} className="rounded-2xl p-3 text-center"
//                             style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
//                             <p className="font-black text-lg mb-0.5" style={{ color: s.color, fontFamily: "monospace" }}>{s.value}</p>
//                             <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">{s.label}</p>
//                         </div>
//                     ))}
//                 </div>

//                 <div>
//                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Contact Info</p>
//                     <div className="space-y-2">
//                         {[
//                             { label: "Phone",     value: customer.phone || "—" },
//                             { label: "Client ID", value: customer.client_id || "—" },
//                             { label: "Role",      value: customer.role || "—" },
//                         ].map((row) => (
//                             <div key={row.label} className="flex justify-between p-3 rounded-2xl"
//                                 style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.05)" }}>
//                                 <span className="text-[11px] text-slate-600">{row.label}</span>
//                                 <span className="text-[11px] text-white capitalize" style={{ fontFamily: "monospace" }}>{row.value}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // ─── Admin Panel ──────────────────────────────────────────────────────────────
// export default function AdminPanel() {
//     const navigate = useNavigate();
//     const { apis, customers, stats, loading, addApi, updateApi, deleteApi, toggleApi } = useAdmin();

//     const [showForm,          setShowForm]          = useState(false);
//     const [editApi,           setEditApi]           = useState(null);
//     const [selectedCustomer,  setSelectedCustomer]  = useState(null);
//     const [activeTab,         setActiveTab]         = useState("apis");

//     useEffect(() => {
//         const user = JSON.parse(localStorage.getItem("user"));
//         if (!user || user.role !== "admin") navigate("/login");
//     }, []);

//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         window.location.href = "/login";
//     };

//     const handleAdd = async (formData) => {
//         try {
//             await addApi({ name: formData.name, url: formData.url, method: formData.method, pricePerCall: formData.price, description: formData.description, enabled: formData.enabled, sampleBody: formData.sampleBody, sampleResponse: formData.sampleResponse });
//             successToast(`"${formData.name}" added!`);
//         } catch { errorToast("Failed to add API."); }
//     };

//     const handleEdit = async (formData) => {
//         try {
//             await updateApi(editApi._id, { name: formData.name, url: formData.url, method: formData.method, pricePerCall: formData.price, description: formData.description, enabled: formData.enabled, sampleBody: formData.sampleBody, sampleResponse: formData.sampleResponse });
//             setEditApi(null);
//             successToast("API updated!");
//         } catch { errorToast("Failed to update API."); }
//     };

//     const handleDelete = async (id) => {
//         try { await deleteApi(id); infoToast("API deleted."); }
//         catch { errorToast("Failed to delete API."); }
//     };

//     const handleToggle = async (id) => {
//         try { await toggleApi(id); }
//         catch { errorToast("Failed to toggle API."); }
//     };

//     const user         = JSON.parse(localStorage.getItem("user"));
//     const enabledCount = apis.filter((a) => a.enabled).length;

//     const statCards = [
//         { label: "Total APIs",       value: stats?.totalApis ?? apis.length,           color: "#FF3B8E", glow: "rgba(255,59,142,0.12)" },
//         { label: "Active APIs",      value: enabledCount,                               color: "#4ade80", glow: "rgba(34,197,94,0.12)" },
//         { label: "Disabled APIs",    value: (stats?.totalApis ?? apis.length) - enabledCount, color: "#f87171", glow: "rgba(239,68,68,0.12)" },
//         { label: "Total Customers",  value: stats?.totalCustomers ?? customers.length,  color: "#A78BFA", glow: "rgba(167,139,250,0.12)" },
//     ];

//     return (
//         <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-x-hidden">

//             {/* Ambient glows */}
//             <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
//             <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

//             {/* Modals */}
//             {(showForm || editApi) && (
//                 <ApiFormModal
//                     initial={editApi ? {
//                         name: editApi.name, url: editApi.url, method: editApi.method,
//                         price: editApi.pricePerCall?.toString(), description: editApi.description,
//                         enabled: editApi.enabled,
//                         sampleBody:     editApi.sampleBody     ? JSON.stringify(editApi.sampleBody, null, 2)     : "",
//                         sampleResponse: editApi.sampleResponse ? JSON.stringify(editApi.sampleResponse, null, 2) : "",
//                     } : null}
//                     onClose={() => { setShowForm(false); setEditApi(null); }}
//                     onSave={editApi ? handleEdit : handleAdd}
//                 />
//             )}
//             {selectedCustomer && (
//                 <CustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
//             )}

//             {/* ─── NAVBAR ─── */}
//             <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-3xl bg-black/40 px-6 md:px-10 py-4 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                     <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
//                         <div className="w-9 h-9 bg-gradient-to-br from-[#FF3B8E] to-[#8E44AD] rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:rotate-6 transition-transform">
//                             <Zap size={18} className="text-white fill-current" />
//                         </div>
//                         <span className="text-lg font-black tracking-tight text-white">
//                             Sandbox<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#A29BFE]">Hub</span>
//                         </span>
//                     </div>
//                     <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
//                         style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.25)", color: "#FF3B8E" }}>
//                         <ShieldCheck size={11} /> ADMIN
//                     </span>
//                 </div>

//                 <div className="flex items-center gap-2">
//                     {activeTab === "apis" && (
//                         <button onClick={() => setShowForm(true)}
//                             className="flex items-center gap-2 text-white font-black rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-pink-500/20"
//                             style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}>
//                             <Plus size={14} strokeWidth={3} /><span className="hidden sm:inline">Add API</span>
//                         </button>
//                     )}
//                     <button onClick={() => navigate("/history")}
//                         className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-3 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-bold uppercase tracking-wider">
//                         <History size={13} /><span className="hidden sm:inline">History</span>
//                     </button>
//                     <button onClick={() => navigate("/payments")}
//                         className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-3 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-bold uppercase tracking-wider">
//                         <CreditCard size={13} /><span className="hidden sm:inline">Payments</span>
//                     </button>
//                     <button onClick={() => navigate("/profile")}
//                         className="flex items-center gap-2.5 px-3 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group">
//                         <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
//                             style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.2)" }}>
//                             <ShieldCheck size={13} className="text-[#FF3B8E]" />
//                         </div>
//                         <div className="hidden sm:block text-left">
//                             <p className="text-xs font-bold text-white leading-none">Admin</p>
//                             <p className="text-[10px] text-slate-600 mt-0.5" style={{ fontFamily: "monospace" }}>{user?.email}</p>
//                         </div>
//                     </button>
//                     <button onClick={handleLogout}
//                         className="flex items-center gap-2 text-slate-500 hover:text-red-400 text-xs px-3 py-2 rounded-full border border-white/10 hover:border-red-500/30 transition-all font-bold uppercase tracking-wider">
//                         <LogOut size={13} /><span className="hidden sm:inline">Logout</span>
//                     </button>
//                 </div>
//             </nav>

//             <main className="relative z-10 pt-24 px-6 md:px-10 pb-16 max-w-6xl mx-auto">

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//                     {statCards.map((s, i) => (
//                         <div key={i} className="rounded-[1.5rem] p-5 transition-all group relative overflow-hidden"
//                             style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)" }}>
//                             <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.5rem]"
//                                 style={{ background: `radial-gradient(ellipse at top left, ${s.glow}, transparent 70%)` }} />
//                             <p className="text-2xl font-black mb-1.5" style={{ color: s.color }}>
//                                 {loading ? "..." : s.value}
//                             </p>
//                             <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">{s.label}</p>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Tabs */}
//                 <div className="flex gap-1 mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
//                     {[
//                         { id: "apis",      label: "Manage APIs" },
//                         { id: "customers", label: `Customers (${customers.length})` },
//                     ].map((tab) => (
//                         <button key={tab.id} onClick={() => setActiveTab(tab.id)}
//                             className="px-5 py-3 text-sm font-black uppercase tracking-wider border-b-2 transition-all"
//                             style={activeTab === tab.id
//                                 ? { borderColor: "#FF3B8E", color: "#FF3B8E" }
//                                 : { borderColor: "transparent", color: "#475569" }}>
//                             {tab.label}
//                         </button>
//                     ))}
//                 </div>

//                 {/* Loading */}
//                 {loading && (
//                     <div className="flex items-center justify-center py-20">
//                         <div className="w-8 h-8 border-2 border-white/5 border-t-[#FF3B8E] rounded-full animate-spin" />
//                     </div>
//                 )}

//                 {/* APIs Tab */}
//                 {!loading && activeTab === "apis" && (
//                     <div>
//                         <div className="flex items-center justify-between mb-4">
//                             <p className="text-[11px] text-slate-600">{enabledCount} visible to customers</p>
//                         </div>

//                         {apis.length === 0 ? (
//                             <div className="text-center py-20 rounded-[2rem]"
//                                 style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
//                                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
//                                     style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.15)" }}>
//                                     <Plus size={24} className="text-[#FF3B8E]" />
//                                 </div>
//                                 <p className="text-slate-500 text-sm mb-4">No APIs yet.</p>
//                                 <button onClick={() => setShowForm(true)}
//                                     className="inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-full text-[#FF3B8E] transition-all"
//                                     style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)" }}>
//                                     <Plus size={12} /> Add your first API
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="space-y-2.5">
//                                 {apis.map((api) => {
//                                     const mc = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
//                                     return (
//                                         <div key={api._id}
//                                             className="flex items-center gap-4 p-4 rounded-2xl transition-all"
//                                             style={{
//                                                 background: api.enabled ? "#0c0c0c" : "#080808",
//                                                 boxShadow: api.enabled
//                                                     ? "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.06)"
//                                                     : "0 0 0 1px rgba(255,255,255,0.04)",
//                                                 opacity: api.enabled ? 1 : 0.5,
//                                             }}>
//                                             <span className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0"
//                                                 style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
//                                                 {api.method}
//                                             </span>

//                                             <div className="flex-1 min-w-0">
//                                                 <div className="flex items-center gap-2 mb-0.5">
//                                                     <p className="font-bold text-sm text-white truncate">{api.name}</p>
//                                                     {!api.enabled && (
//                                                         <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
//                                                             style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
//                                                             Hidden
//                                                         </span>
//                                                     )}
//                                                     {api.sampleResponse && (
//                                                         <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
//                                                             style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
//                                                             Preview ✓
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                                 <p className="text-[11px] text-slate-500 truncate">{api.description}</p>
//                                                 <code className="text-[10px] text-slate-700" style={{ fontFamily: "monospace" }}>{api.url}</code>
//                                             </div>

//                                             <div className="text-right flex-shrink-0">
//                                                 <p className="font-black text-[#FF3B8E]" style={{ fontFamily: "monospace" }}>₹{api.pricePerCall}</p>
//                                                 <p className="text-[9px] text-slate-600">per call</p>
//                                             </div>

//                                             <div className="flex items-center gap-2 flex-shrink-0">
//                                                 <button onClick={() => handleToggle(api._id)}>
//                                                     {api.enabled
//                                                         ? <ToggleRight size={22} className="text-[#FF3B8E]" />
//                                                         : <ToggleLeft size={22} className="text-slate-600" />}
//                                                 </button>
//                                                 <button onClick={() => setEditApi(api)}
//                                                     className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
//                                                     style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#818CF8" }}
//                                                     onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"}
//                                                     onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"}>
//                                                     <Edit3 size={12} />
//                                                 </button>
//                                                 <button onClick={() => handleDelete(api._id)}
//                                                     className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
//                                                     style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
//                                                     onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"}
//                                                     onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"}>
//                                                     <Trash2 size={12} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Customers Tab */}
//                 {!loading && activeTab === "customers" && (
//                     <div>
//                         {customers.length === 0 ? (
//                             <div className="text-center py-20 rounded-[2rem]"
//                                 style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
//                                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
//                                     style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
//                                     <Users size={24} className="text-[#A78BFA]" />
//                                 </div>
//                                 <p className="text-slate-500 text-sm">No customers registered yet.</p>
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 {customers.map((c) => (
//                                     <CustomerCard key={c._id} customer={c} onClick={setSelectedCustomer} />
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </main>

//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
//                 * { font-family: 'Urbanist', sans-serif; }
//                 code, input, textarea { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
//             `}</style>
//         </div>
//     );
// }



import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    LogOut, Plus, X, Trash2, Edit3,
    ShieldCheck, ToggleLeft, ToggleRight,
    IndianRupee, Save, Users, Eye, History, CreditCard
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdmin } from "../hooks/useAdmin";
import Navbar from "./Navbar";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#A78BFA" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#818CF8" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#F87171" },
};

const mkToast = (msg, shadow, iconBg) =>
    toast.custom((t) => (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#0a0a0a", color: "#fff", fontFamily: "Urbanist, sans-serif",
            fontSize: "13px", padding: "12px 16px", borderRadius: "16px",
            boxShadow: shadow, maxWidth: "400px", opacity: t.visible ? 1 : 0,
            transform: t.visible ? "translateY(0)" : "translateY(-8px)", transition: "all 0.2s ease",
        }}>
            {iconBg && <span style={{
                width: "20px", height: "20px", borderRadius: "50%", background: iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "#fff", fontWeight: "900", fontSize: "11px",
            }}>✓</span>}
            <span style={{ flex: 1 }}>{msg}</span>
            <button onClick={() => toast.dismiss(t.id)} style={{
                background: "none", border: "none", color: "#888", cursor: "pointer", padding: "2px",
            }}><X size={13} /></button>
        </div>
    ), { duration: 3000 });

const successToast = (msg) => mkToast(msg, "0 0 0 1px rgba(255,59,142,0.3), 0 8px 32px rgba(255,59,142,0.12)", "#FF3B8E");
const errorToast   = (msg) => mkToast(msg, "0 0 0 1px rgba(239,68,68,0.3), 0 8px 32px rgba(239,68,68,0.12)", null);
const infoToast    = (msg) => mkToast(msg, "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)", null);

const EMPTY_FORM = {
    name: "", url: "", method: "POST", price: "0.10",
    description: "", enabled: true,
    sampleBody: "", sampleResponse: "",
};

// ─── API Form Modal ───────────────────────────────────────────────────────────
function ApiFormModal({ initial, onClose, onSave }) {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const methods = ["GET", "POST", "PUT", "DELETE"];

    const handleSave = () => {
        if (!form.name.trim()) { errorToast("API name required."); return; }
        if (!form.url.trim())  { errorToast("API URL required."); return; }
        const price = parseFloat(form.price);
        if (isNaN(price) || price < 0) { errorToast("Valid price required."); return; }

        let parsedSampleBody = null, parsedSampleResponse = null;
        if (form.sampleBody.trim()) {
            try { parsedSampleBody = JSON.parse(form.sampleBody); }
            catch { errorToast("Sample Body valid JSON nahi hai!"); return; }
        }
        if (form.sampleResponse.trim()) {
            try { parsedSampleResponse = JSON.parse(form.sampleResponse); }
            catch { errorToast("Sample Response valid JSON nahi hai!"); return; }
        }
        onSave({ ...form, price: parseFloat(form.price), sampleBody: parsedSampleBody, sampleResponse: parsedSampleResponse });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}>

            <div className="w-full max-w-3xl rounded-[2rem] p-7"
                style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.8)" }}>

                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h2 className="text-lg font-black text-white">{initial ? "Edit API" : "Add New API"}</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Fill in the API details below</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <X size={14} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Row 1 — Name + Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">API Name *</label>
                            <input type="text" placeholder="e.g. Send SMS" value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-slate-700"
                                style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
                                onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Price per Call (₹) *</label>
                            <div className="relative">
                                <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input type="number" min="0" step="0.01" placeholder="0.50" value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="w-full rounded-2xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all placeholder-slate-700"
                                    style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
                                    onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                            </div>
                        </div>
                    </div>

                    {/* Row 2 — Method + URL */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Method & Endpoint *</label>
                        <div className="flex gap-2">
                            <div className="flex gap-1 flex-shrink-0">
                                {methods.map((m) => {
                                    const c = METHOD_COLORS[m];
                                    return (
                                        <button key={m} type="button" onClick={() => setForm({ ...form, method: m })}
                                            className="px-2.5 py-2.5 rounded-xl text-[9px] font-black border transition-all"
                                            style={form.method === m
                                                ? { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
                                                : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                            <input type="text" placeholder="https://api.example.com/endpoint" value={form.url}
                                onChange={(e) => setForm({ ...form, url: e.target.value })}
                                className="flex-1 rounded-2xl px-3 py-3 text-white text-xs outline-none transition-all min-w-0 placeholder-slate-700"
                                style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
                                onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                        </div>
                    </div>

                    {/* Row 3 — Description */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Description</label>
                        <input type="text" placeholder="What does this API do?" value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-slate-700"
                            style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
                            onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                    </div>

                    {/* Row 4 — Sample Body + Sample Response */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Sample Request Body", key: "sampleBody", placeholder: '{\n  "key": "value"\n}' },
                            { label: "Sample Response", key: "sampleResponse", placeholder: '{\n  "status": "ok",\n  "data": {}\n}' },
                        ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">
                                    {label} <span className="text-slate-700 normal-case font-normal">(JSON)</span>
                                </label>
                                <textarea rows={8} placeholder={placeholder}
                                    value={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    className="w-full rounded-2xl px-4 py-3 text-white text-xs outline-none transition-all resize-none placeholder-slate-700"
                                    style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}
                                    onFocus={e => e.target.style.borderColor = "rgba(255,59,142,0.4)"}
                                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                            </div>
                        ))}
                    </div>

                    {/* Row 5 — Toggle + Save */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center justify-between flex-1 p-3.5 rounded-2xl"
                            style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div>
                                <p className="text-xs font-bold text-white">Visible to Customers</p>
                                <p className="text-[10px] text-slate-500">Enable to show this API to customers</p>
                            </div>
                            <button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })}>
                                {form.enabled
                                    ? <ToggleRight size={28} className="text-[#FF3B8E]" />
                                    : <ToggleLeft size={28} className="text-slate-600" />}
                            </button>
                        </div>
                        <button onClick={handleSave}
                            className="flex-shrink-0 text-white font-black rounded-2xl py-3.5 px-6 text-sm uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-pink-500/20"
                            style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}>
                            <Save size={15} /> {initial ? "Save" : "Add API"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Customer Card ────────────────────────────────────────────────────────────
function CustomerCard({ customer, onClick }) {
    const [hovered, setHovered] = useState(false);
    const initials = customer.name
        ? customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";
    const joinDate = customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    return (
        <div onClick={() => onClick(customer)}
            className="rounded-2xl p-5 cursor-pointer relative overflow-hidden transition-all duration-200"
            style={{
                background: hovered ? "#141414" : "#0c0c0c",
                boxShadow: hovered
                    ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,59,142,0.25), 0 8px 24px rgba(0,0,0,0.3)"
                    : "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.06)",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>

            {/* Hover glow */}
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-200 rounded-2xl"
                style={{ background: "radial-gradient(ellipse at top left, rgba(255,59,142,0.07), transparent 70%)", opacity: hovered ? 1 : 0 }} />
            {/* Left bar */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200"
                style={{ background: hovered ? "linear-gradient(to bottom, #FF3B8E, #8E44AD)" : "transparent" }} />

            <div className="relative flex items-center gap-3 mb-4">
                {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name}
                        className="w-12 h-12 rounded-2xl object-cover flex-shrink-0 transition-all duration-200"
                        style={{ border: `2px solid ${hovered ? "rgba(255,59,142,0.4)" : "rgba(255,255,255,0.08)"}` }} />
                ) : (
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{
                            background: hovered ? "rgba(255,59,142,0.15)" : "rgba(255,59,142,0.08)",
                            border: `2px solid ${hovered ? "rgba(255,59,142,0.4)" : "rgba(255,59,142,0.15)"}`,
                        }}>
                        <span className="text-sm font-black text-[#FF3B8E]">{initials}</span>
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="font-black text-sm truncate transition-colors duration-200"
                        style={{ color: hovered ? "#fff" : "#e2e8f0" }}>{customer.name}</p>
                    <p className="text-[11px] text-slate-600 truncate" style={{ fontFamily: "monospace" }}>{customer.email}</p>
                </div>
                <Eye size={14} className="transition-colors duration-200 flex-shrink-0"
                    style={{ color: hovered ? "#FF3B8E" : "#374151" }} />
            </div>

            <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.05)" }} />

            <div className="relative grid grid-cols-3 gap-2 text-center">
                {[
                    { value: customer.selectedApis?.length || 0, label: "APIs",    color: "#A78BFA" },
                    { value: `₹${customer.balance || 0}`,        label: "Balance", color: "#FF3B8E" },
                    { value: customer.totalCalls || 0,           label: "Calls",   color: "#818CF8" },
                ].map((s, i) => (
                    <div key={i}>
                        <p className="text-base font-black" style={{ color: s.color, fontFamily: "monospace" }}>{s.value}</p>
                        <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">{s.label}</p>
                    </div>
                ))}
            </div>

            <p className="relative text-[10px] text-slate-700 mt-3" style={{ fontFamily: "monospace" }}>Joined {joinDate}</p>
        </div>
    );
}

// ─── Customer Detail Modal ────────────────────────────────────────────────────
function CustomerModal({ customer, onClose }) {
    const initials = customer.name
        ? customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md rounded-[2rem] p-7 max-h-[80vh] overflow-y-auto"
                style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.8)" }}>

                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {customer.avatar ? (
                            <img src={customer.avatar} alt={customer.name}
                                className="w-16 h-16 rounded-2xl object-cover border-2"
                                style={{ borderColor: "rgba(255,59,142,0.3)" }} />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{ background: "rgba(255,59,142,0.1)", border: "2px solid rgba(255,59,142,0.2)" }}>
                                <span className="text-xl font-black text-[#FF3B8E]">{initials}</span>
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-black text-white">{customer.name}</h2>
                            <p className="text-[11px] text-slate-500" style={{ fontFamily: "monospace" }}>{customer.email}</p>
                            <p className="text-[10px] text-slate-700 mt-0.5" style={{ fontFamily: "monospace" }}>ID: {customer._id || "—"}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <X size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Wallet",    value: `₹${customer.balance || 0}`, color: "#FF3B8E",  glow: "rgba(255,59,142,0.12)" },
                        { label: "API Calls", value: customer.totalCalls || 0,    color: "#818CF8",  glow: "rgba(99,102,241,0.12)" },
                        { label: "APIs",      value: customer.selectedApis?.length || 0, color: "#A78BFA", glow: "rgba(167,139,250,0.12)" },
                    ].map((s) => (
                        <div key={s.label} className="rounded-2xl p-3 text-center"
                            style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="font-black text-lg mb-0.5" style={{ color: s.color, fontFamily: "monospace" }}>{s.value}</p>
                            <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Contact Info</p>
                    <div className="space-y-2">
                        {[
                            { label: "Phone",     value: customer.phone || "—" },
                            { label: "Client ID", value: customer.client_id || "—" },
                            { label: "Role",      value: customer.role || "—" },
                        ].map((row) => (
                            <div key={row.label} className="flex justify-between p-3 rounded-2xl"
                                style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <span className="text-[11px] text-slate-600">{row.label}</span>
                                <span className="text-[11px] text-white capitalize" style={{ fontFamily: "monospace" }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────
export default function AdminPanel() {
    const navigate = useNavigate();
    const { apis, customers, stats, loading, addApi, updateApi, deleteApi, toggleApi } = useAdmin();

    const [showForm,          setShowForm]          = useState(false);
    const [editApi,           setEditApi]           = useState(null);
    const [selectedCustomer,  setSelectedCustomer]  = useState(null);
    const [activeTab,         setActiveTab]         = useState("apis");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "admin") navigate("/login");
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const handleAdd = async (formData) => {
        try {
            await addApi({ name: formData.name, url: formData.url, method: formData.method, pricePerCall: formData.price, description: formData.description, enabled: formData.enabled, sampleBody: formData.sampleBody, sampleResponse: formData.sampleResponse });
            successToast(`"${formData.name}" added!`);
        } catch { errorToast("Failed to add API."); }
    };

    const handleEdit = async (formData) => {
        try {
            await updateApi(editApi._id, { name: formData.name, url: formData.url, method: formData.method, pricePerCall: formData.price, description: formData.description, enabled: formData.enabled, sampleBody: formData.sampleBody, sampleResponse: formData.sampleResponse });
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

    const user         = JSON.parse(localStorage.getItem("user"));
    const enabledCount = apis.filter((a) => a.enabled).length;

    const statCards = [
        { label: "Total APIs",       value: stats?.totalApis ?? apis.length,           color: "#FF3B8E", glow: "rgba(255,59,142,0.12)" },
        { label: "Active APIs",      value: enabledCount,                               color: "#4ade80", glow: "rgba(34,197,94,0.12)" },
        { label: "Disabled APIs",    value: (stats?.totalApis ?? apis.length) - enabledCount, color: "#f87171", glow: "rgba(239,68,68,0.12)" },
        { label: "Total Customers",  value: stats?.totalCustomers ?? customers.length,  color: "#A78BFA", glow: "rgba(167,139,250,0.12)" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-x-hidden">

            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

            {/* Modals */}
            {(showForm || editApi) && (
                <ApiFormModal
                    initial={editApi ? {
                        name: editApi.name, url: editApi.url, method: editApi.method,
                        price: editApi.pricePerCall?.toString(), description: editApi.description,
                        enabled: editApi.enabled,
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

            {/* ─── NAVBAR ─── */}
            <Navbar
                showAdminLinks={true}
                onLogout={handleLogout}
                rightContent={
                    activeTab === "apis" && (
                        <button onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 text-white font-black rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-pink-500/20"
                            style={{ background: "linear-gradient(to right, #FF3B8E, #8E44AD)" }}>
                            <Plus size={14} strokeWidth={3} /><span className="hidden sm:inline">Add API</span>
                        </button>
                    )
                }
            />

            <main className="relative z-10 pt-24 px-6 md:px-10 pb-16 max-w-6xl mx-auto">

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {statCards.map((s, i) => (
                        <div key={i} className="rounded-[1.5rem] p-5 transition-all group relative overflow-hidden"
                            style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.5rem]"
                                style={{ background: `radial-gradient(ellipse at top left, ${s.glow}, transparent 70%)` }} />
                            <p className="text-2xl font-black mb-1.5" style={{ color: s.color }}>
                                {loading ? "..." : s.value}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {[
                        { id: "apis",      label: "Manage APIs" },
                        { id: "customers", label: `Customers (${customers.length})` },
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className="px-5 py-3 text-sm font-black uppercase tracking-wider border-b-2 transition-all"
                            style={activeTab === tab.id
                                ? { borderColor: "#FF3B8E", color: "#FF3B8E" }
                                : { borderColor: "transparent", color: "#475569" }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-white/5 border-t-[#FF3B8E] rounded-full animate-spin" />
                    </div>
                )}

                {/* APIs Tab */}
                {!loading && activeTab === "apis" && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] text-slate-600">{enabledCount} visible to customers</p>
                        </div>

                        {apis.length === 0 ? (
                            <div className="text-center py-20 rounded-[2rem]"
                                style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.15)" }}>
                                    <Plus size={24} className="text-[#FF3B8E]" />
                                </div>
                                <p className="text-slate-500 text-sm mb-4">No APIs yet.</p>
                                <button onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-full text-[#FF3B8E] transition-all"
                                    style={{ background: "rgba(255,59,142,0.08)", border: "1px solid rgba(255,59,142,0.2)" }}>
                                    <Plus size={12} /> Add your first API
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {apis.map((api) => {
                                    const mc = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
                                    return (
                                        <div key={api._id}
                                            className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                                            style={{
                                                background: api.enabled ? "#0c0c0c" : "#080808",
                                                boxShadow: api.enabled
                                                    ? "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.06)"
                                                    : "0 0 0 1px rgba(255,255,255,0.04)",
                                                opacity: api.enabled ? 1 : 0.5,
                                            }}>
                                            <span className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0"
                                                style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
                                                {api.method}
                                            </span>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="font-bold text-sm text-white truncate">{api.name}</p>
                                                    {!api.enabled && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                                                            Hidden
                                                        </span>
                                                    )}
                                                    {api.sampleResponse && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                                                            Preview ✓
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 truncate">{api.description}</p>
                                                <code className="text-[10px] text-slate-700" style={{ fontFamily: "monospace" }}>{api.url}</code>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className="font-black text-[#FF3B8E]" style={{ fontFamily: "monospace" }}>₹{api.pricePerCall}</p>
                                                <p className="text-[9px] text-slate-600">per call</p>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button onClick={() => handleToggle(api._id)}>
                                                    {api.enabled
                                                        ? <ToggleRight size={22} className="text-[#FF3B8E]" />
                                                        : <ToggleLeft size={22} className="text-slate-600" />}
                                                </button>
                                                <button onClick={() => setEditApi(api)}
                                                    className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                                                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#818CF8" }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"}>
                                                    <Edit3 size={12} />
                                                </button>
                                                <button onClick={() => handleDelete(api._id)}
                                                    className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                                                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Customers Tab */}
                {!loading && activeTab === "customers" && (
                    <div>
                        {customers.length === 0 ? (
                            <div className="text-center py-20 rounded-[2rem]"
                                style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
                                    <Users size={24} className="text-[#A78BFA]" />
                                </div>
                                <p className="text-slate-500 text-sm">No customers registered yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {customers.map((c) => (
                                    <CustomerCard key={c._id} customer={c} onClick={setSelectedCustomer} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; }
                code, input, textarea { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
            `}</style>
        </div>
    );
}
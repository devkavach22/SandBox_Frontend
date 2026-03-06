/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, LogOut, User, Activity, Wallet, Terminal, Code2, Plus, X,
  IndianRupee, Play, ChevronDown, ChevronUp, Copy, Check, Lock, Trash2, Wand2
} from "lucide-react";
import toast from "react-hot-toast";

const mockUser = { name: "Priya Sharma", email: "priya@company.com", plan: "Pro" };

const METHOD_COLORS = {
  GET:    { bg: "#0a2d1a", border: "#00ffb4", text: "#00ffb4" },
  POST:   { bg: "#1a1a0a", border: "#ffd700", text: "#ffd700" },
  PUT:    { bg: "#0a1a2d", border: "#4da6ff", text: "#4da6ff" },
  DELETE: { bg: "#2d0a0a", border: "#ff4b4b", text: "#ff4b4b" },
};

const DEFAULT_APIS = [
  {
    id: "sms", name: "SMS Gateway", description: "Send OTP & transactional SMS instantly",
    method: "POST", endpoint: "POST /v1/sms/send", url: "/v1/sms/send",
    pricePerCall: 0.25, badge: "Popular", isCustom: false,
    sampleBody: `{\n  "to": "+91XXXXXXXXXX",\n  "message": "Your OTP is 1234"\n}`,
    sampleResponse: `{\n  "status": "success",\n  "message_id": "msg_abc123",\n  "credits_used": 0.25\n}`,
  },
  {
    id: "email", name: "Email API", description: "Transactional emails with templates",
    method: "POST", endpoint: "POST /v1/email/send", url: "/v1/email/send",
    pricePerCall: 0.10, badge: "Fast", isCustom: false,
    sampleBody: `{\n  "to": "user@example.com",\n  "subject": "Welcome!",\n  "body": "Hello World"\n}`,
    sampleResponse: `{\n  "status": "success",\n  "email_id": "eml_xyz789",\n  "credits_used": 0.10\n}`,
  },
  {
    id: "otp", name: "OTP Verify", description: "Generate & verify OTPs via SMS/Email",
    method: "POST", endpoint: "POST /v1/otp/generate", url: "/v1/otp/generate",
    pricePerCall: 0.50, badge: "Secure", isCustom: false,
    sampleBody: `{\n  "phone": "+91XXXXXXXXXX",\n  "expiry_minutes": 10\n}`,
    sampleResponse: `{\n  "status": "success",\n  "otp_token": "tok_def456",\n  "credits_used": 0.50\n}`,
  },
  {
    id: "whatsapp", name: "WhatsApp API", description: "Send WhatsApp messages via Business API",
    method: "POST", endpoint: "POST /v1/whatsapp/send", url: "/v1/whatsapp/send",
    pricePerCall: 1.00, badge: "New", isCustom: false,
    sampleBody: `{\n  "to": "+91XXXXXXXXXX",\n  "template": "order_confirmation"\n}`,
    sampleResponse: `{\n  "status": "success",\n  "wamid": "wam_ghi321",\n  "credits_used": 1.00\n}`,
  },
];

// ─── Razorpay ─────────────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ─── Toast Helpers ────────────────────────────────────────────────────────────
const mkToast = (msg, shadow, iconBg) =>
  toast.custom((t) => (
    <div style={{
      display:"flex", alignItems:"center", gap:"10px",
      background:"#071a12", color:"#e8fff6", fontFamily:"monospace",
      fontSize:"13px", padding:"12px 16px", borderRadius:"12px",
      boxShadow: shadow, maxWidth:"420px",
      opacity: t.visible ? 1 : 0,
      transform: t.visible ? "translateY(0)" : "translateY(-8px)",
      transition: "all 0.2s ease",
    }}>
      {iconBg && <span style={{
        width:"20px", height:"20px", borderRadius:"50%", background: iconBg,
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0, color:"#020b08", fontWeight:"900", fontSize:"11px",
      }}>✓</span>}
      <span style={{flex:1}}>{msg}</span>
    </div>
  ), { duration: 3500 });

const successToast = (msg) => mkToast(msg, "0 0 0 1px #00ffb455, 0 8px 32px rgba(0,255,180,0.12)", "#00ffb4");
const errorToast   = (msg) => mkToast(msg, "0 0 0 1px #ff4b4b55, 0 8px 32px rgba(255,75,75,0.12)", null);
const infoToast    = (msg) => mkToast(msg, "0 0 0 1px #0d3324, 0 8px 32px rgba(0,0,0,0.5)", null);

// ─── JSON Beautify Helper ─────────────────────────────────────────────────────
const beautifyJSON = (str) => {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return null; // invalid JSON
  }
};

// ─── Add Balance Modal ────────────────────────────────────────────────────────
function AddBalanceModal({ onClose, onPay }) {
  const [amount, setAmount] = useState("");
  const quick = [100, 200, 500, 1000, 2000, 5000];

  const handlePay = () => {
    const p = parseFloat(amount);
    if (!amount || isNaN(p) || p < 1) { errorToast("Please enter a valid amount (min ₹1)."); return; }
    onPay(p); onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background:"rgba(2,11,8,0.85)", backdropFilter:"blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-[#071a12] border border-[#0d3324] rounded-2xl p-6"
        style={{ boxShadow:"0 0 0 1px #0d3324, 0 24px 64px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-[#e8fff6]">Add Balance</h2>
            <p className="text-[11px] text-[#5a8a70] font-mono mt-0.5">Secure payment via Razorpay</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#0d1f15] border border-[#0d3324] hover:border-[#ff4b4b]/40 hover:text-[#ff4b4b] text-[#5a8a70] flex items-center justify-center transition-all"><X size={14} /></button>
        </div>
        <div className="mb-4">
          <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px] block mb-2">Enter Amount</label>
          <div className="relative group">
            <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3a5a4a] group-focus-within:text-[#00ffb4] transition-colors" />
            <input type="number" min="1" placeholder="0.00" value={amount}
              onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => e.key==="Enter" && handlePay()}
              className="w-full bg-[#0a2018]/60 border border-[#0d3324] rounded-xl pl-10 pr-4 py-3.5 text-[#e8fff6] text-lg font-black font-mono placeholder-[#3a5a4a] outline-none focus:border-[#00ffb4]/50 focus:ring-1 focus:ring-[#00ffb4]/20 transition-all" />
          </div>
        </div>
        <div className="mb-6">
          <p className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px] mb-2">Quick Select</p>
          <div className="grid grid-cols-3 gap-2">
            {quick.map((a) => (
              <button key={a} onClick={() => setAmount(a.toString())}
                className={`py-2 rounded-lg text-xs font-bold font-mono border transition-all ${amount===a.toString() ? "bg-[#00ffb4]/10 border-[#00ffb4]/50 text-[#00ffb4]" : "bg-[#0a2018]/60 border-[#0d3324] text-[#5a8a70] hover:border-[#00ffb4]/30 hover:text-[#e8fff6]"}`}>
                ₹{a}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handlePay} className="w-full bg-[#00ffb4] hover:brightness-110 text-[#020b08] font-black rounded-xl py-3.5 text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,255,180,0.2)]">
          <Zap size={15} fill="#020b08" />
          Pay ₹{parseFloat(amount) > 0 ? parseFloat(amount).toLocaleString("en-IN") : "0"}
        </button>
        <p className="text-center text-[10px] text-[#3a5a4a] font-mono mt-3">🔒 256-bit SSL encrypted · Powered by Razorpay</p>
      </div>
    </div>
  );
}

// ─── Add Custom API Modal ─────────────────────────────────────────────────────
function AddApiModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name:"", url:"", method:"GET", price:"0.10", description:"" });
  const methods = ["GET", "POST", "PUT", "DELETE"];

  const handleAdd = () => {
    if (!form.name.trim()) { errorToast("Please enter API name."); return; }
    if (!form.url.trim()) { errorToast("Please enter API URL."); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { errorToast("Please enter a valid price."); return; }
    onAdd({
      id: `custom_${Date.now()}`,
      name: form.name,
      description: form.description || "Custom API",
      method: form.method,
      endpoint: `${form.method} ${form.url}`,
      url: form.url,
      pricePerCall: price,
      badge: "Custom",
      isCustom: true,
      sampleBody: form.method === "GET" ? "" : `{\n  \n}`,
      sampleResponse: `{\n  "status": "pending"\n}`,
    });
    onClose();
    successToast(`"${form.name}" API added!`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background:"rgba(2,11,8,0.85)", backdropFilter:"blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-[#071a12] border border-[#0d3324] rounded-2xl p-6"
        style={{ boxShadow:"0 0 0 1px #0d3324, 0 24px 64px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-[#e8fff6]">Add Custom API</h2>
            <p className="text-[11px] text-[#5a8a70] font-mono mt-0.5">Add your own API endpoint to test</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#0d1f15] border border-[#0d3324] hover:border-[#ff4b4b]/40 hover:text-[#ff4b4b] text-[#5a8a70] flex items-center justify-center transition-all"><X size={14} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px] block mb-1.5">API Name *</label>
            <input type="text" placeholder="e.g. My User API" value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full bg-[#0a2018]/60 border border-[#0d3324] rounded-xl px-4 py-3 text-[#e8fff6] text-sm font-mono placeholder-[#3a5a4a] outline-none focus:border-[#00ffb4]/50 focus:ring-1 focus:ring-[#00ffb4]/20 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px] block mb-1.5">Method & URL *</label>
            <div className="flex gap-2">
              <div className="flex gap-1">
                {methods.map((m) => {
                  const c = METHOD_COLORS[m];
                  return (
                    <button key={m} onClick={() => setForm({...form, method: m})}
                      className="px-2.5 py-2.5 rounded-xl text-[10px] font-black font-mono border transition-all"
                      style={form.method === m
                        ? { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
                        : { background: "#0a2018", border: "1px solid #0d3324", color: "#5a8a70" }}>
                      {m}
                    </button>
                  );
                })}
              </div>
              <input type="text" placeholder="https://api.example.com/v1/users" value={form.url}
                onChange={(e) => setForm({...form, url: e.target.value})}
                className="flex-1 bg-[#0a2018]/60 border border-[#0d3324] rounded-xl px-4 py-3 text-[#e8fff6] text-xs font-mono placeholder-[#3a5a4a] outline-none focus:border-[#00ffb4]/50 focus:ring-1 focus:ring-[#00ffb4]/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px] block mb-1.5">Description</label>
            <input type="text" placeholder="What does this API do?" value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full bg-[#0a2018]/60 border border-[#0d3324] rounded-xl px-4 py-3 text-[#e8fff6] text-sm font-mono placeholder-[#3a5a4a] outline-none focus:border-[#00ffb4]/50 focus:ring-1 focus:ring-[#00ffb4]/20 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px] block mb-1.5">Price per Call (₹)</label>
            <div className="relative group">
              <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3a5a4a] group-focus-within:text-[#00ffb4] transition-colors" />
              <input type="number" min="0" step="0.01" placeholder="0.10" value={form.price}
                onChange={(e) => setForm({...form, price: e.target.value})}
                className="w-full bg-[#0a2018]/60 border border-[#0d3324] rounded-xl pl-10 pr-4 py-3 text-[#e8fff6] text-sm font-mono placeholder-[#3a5a4a] outline-none focus:border-[#00ffb4]/50 focus:ring-1 focus:ring-[#00ffb4]/20 transition-all" />
            </div>
          </div>
        </div>
        <button onClick={handleAdd} className="w-full mt-6 bg-[#00ffb4] hover:brightness-110 text-[#020b08] font-black rounded-xl py-3.5 text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,255,180,0.2)]">
          <Plus size={15} strokeWidth={3} /> Add API
        </button>
      </div>
    </div>
  );
}

// ─── JSON Editor with Beautify ────────────────────────────────────────────────
function JsonEditor({ value, onChange, rows = 4, placeholder }) {
  const [hasError, setHasError] = useState(false);
  const [beautified, setBeautified] = useState(false);

  const handleChange = (e) => {
    onChange(e.target.value);
    setBeautified(false);
    try { JSON.parse(e.target.value); setHasError(false); } catch { setHasError(true); }
  };

  const handleBeautify = () => {
    const result = beautifyJSON(value);
    if (result) {
      onChange(result);
      setHasError(false);
      setBeautified(true);
      setTimeout(() => setBeautified(false), 2000);
    } else {
      errorToast("Invalid JSON — cannot beautify!");
    }
  };

  return (
    <div className="relative">
      {/* Beautify button */}
      <button
        onClick={handleBeautify}
        title="Beautify JSON"
        className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold font-mono border transition-all ${
          beautified
            ? "bg-[#00ffb4]/15 border-[#00ffb4]/50 text-[#00ffb4]"
            : "bg-[#0d1f15] border-[#0d3324] text-[#5a8a70] hover:border-[#00ffb4]/40 hover:text-[#00ffb4]"
        }`}
      >
        {beautified ? <><Check size={10} /> Done!</> : <><Wand2 size={10} /> Format</>}
      </button>

      <textarea
        value={value}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-[#020b08] rounded-xl p-3 pr-20 text-[#e8fff6] text-xs font-mono outline-none resize-none transition-all"
        style={{
          border: hasError && value.trim()
            ? "1px solid rgba(255,75,75,0.5)"
            : "1px solid #0d3324",
          boxShadow: hasError && value.trim()
            ? "0 0 0 1px rgba(255,75,75,0.1)"
            : "none",
        }}
      />

      {/* JSON error indicator */}
      {hasError && value.trim() && (
        <p className="text-[10px] text-[#ff4b4b] font-mono mt-1 flex items-center gap-1">
          <span>⚠</span> Invalid JSON
        </p>
      )}
    </div>
  );
}

// ─── API Tester Panel ─────────────────────────────────────────────────────────
function ApiTester({ api, balance, onDeduct }) {
  const [method, setMethod]     = useState(api.method);
  const [url, setUrl]           = useState(api.isCustom ? api.url : api.endpoint.split(" ")[1]);
  const [body, setBody]         = useState(api.sampleBody);
  const [headers, setHeaders]   = useState(`{\n  "Content-Type": "application/json"\n}`);
  const [response, setResponse] = useState(null);
  const [status, setStatus]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [tab, setTab]           = useState("body");

  const methods    = ["GET", "POST", "PUT", "DELETE"];
  const canAfford  = balance >= api.pricePerCall;
  const showBody   = method !== "GET";

  // Switch to headers if GET selected and was on body tab
  useEffect(() => { if (method === "GET" && tab === "body") setTab("headers"); }, [method]);

  const handleTest = async () => {
    if (balance < api.pricePerCall) {
      errorToast(`Insufficient balance! Need ₹${api.pricePerCall} to call this API.`);
      return;
    }
    setLoading(true); setResponse(null); setStatus(null);

    try {
      let parsedHeaders = { "Content-Type": "application/json" };
      try { parsedHeaders = { ...parsedHeaders, ...JSON.parse(headers) }; } catch {}

      const fetchOptions = { method, headers: parsedHeaders };
      if (showBody && body.trim()) {
        try { fetchOptions.body = JSON.stringify(JSON.parse(body)); } catch { fetchOptions.body = body; }
      }

      const res  = await fetch(url, fetchOptions);
      const text = await res.text();
      let formatted = text;
      try { formatted = JSON.stringify(JSON.parse(text), null, 2); } catch {}

      setStatus(res.status);
      setResponse(formatted);
      onDeduct(api.pricePerCall);
      successToast(`${method} ${res.status} · ₹${api.pricePerCall} deducted`);
    } catch (err) {
      setStatus(200);
      setResponse(api.sampleResponse);
      onDeduct(api.pricePerCall);
      successToast(`API called! ₹${api.pricePerCall} deducted from wallet.`);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mc = METHOD_COLORS[method];

  return (
    <div className="mt-4 border-t border-[#0d3324] pt-4 space-y-3">

      {/* Method + URL Bar */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1">
          {methods.map((m) => {
            const c = METHOD_COLORS[m];
            return (
              <button key={m} onClick={() => setMethod(m)}
                className="px-2.5 py-2 rounded-lg text-[10px] font-black font-mono border transition-all"
                style={method === m
                  ? { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
                  : { background: "#020b08", border: "1px solid #0d3324", color: "#5a8a70" }}>
                {m}
              </button>
            );
          })}
        </div>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-[#020b08] border border-[#0d3324] rounded-lg px-3 py-2 text-[#e8fff6] text-xs font-mono outline-none focus:border-[#00ffb4]/40 transition-all min-w-0" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#0d3324]">
        {(showBody ? ["body", "headers"] : ["headers"]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider border-b-2 transition-all ${tab === t ? "border-[#00ffb4] text-[#00ffb4]" : "border-transparent text-[#5a8a70] hover:text-[#e8fff6]"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ✅ Body Editor with Beautify */}
      {tab === "body" && showBody && (
        <JsonEditor value={body} onChange={setBody} rows={4} placeholder='{ "key": "value" }' />
      )}

      {/* ✅ Headers Editor with Beautify */}
      {tab === "headers" && (
        <JsonEditor value={headers} onChange={setHeaders} rows={4} placeholder='{ "Content-Type": "application/json" }' />
      )}

      {/* Send Button */}
      <button onClick={handleTest} disabled={loading}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all border ${
          canAfford
            ? "bg-[#00ffb4]/10 border-[#00ffb4]/30 text-[#00ffb4] hover:bg-[#00ffb4]/20"
            : "bg-[#ff4b4b]/5 border-[#ff4b4b]/20 text-[#ff4b4b]/60 cursor-not-allowed"
        }`}>
        {loading
          ? <div style={{ width:"14px", height:"14px", border:"2px solid #00ffb4", borderTop:"2px solid transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
          : canAfford
            ? <><Play size={12} fill="currentColor" /><span style={{ color: mc.text }}>{method}</span> Request · ₹{api.pricePerCall}/call</>
            : <><Lock size={12} /> Insufficient Balance · Add Funds</>
        }
      </button>

      {/* Response */}
      {response && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[2px]"
                style={{ color: status >= 200 && status < 300 ? "#00ffb4" : "#ff4b4b" }}>
                Response
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                style={status >= 200 && status < 300
                  ? { color:"#00ffb4", background:"#00ffb415", border:"1px solid #00ffb430" }
                  : { color:"#ff4b4b", background:"#ff4b4b15", border:"1px solid #ff4b4b30" }}>
                {status} {status >= 200 && status < 300 ? "OK" : "ERROR"}
              </span>
            </div>
            <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-[#5a8a70] hover:text-[#e8fff6] transition-colors font-mono">
              {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
            </button>
          </div>
          <pre className="bg-[#020b08] border border-[#00ffb4]/20 rounded-xl p-3 text-xs font-mono text-[#00ffb4] overflow-x-auto max-h-48 overflow-y-auto">
            {response}
          </pre>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── API Card ─────────────────────────────────────────────────────────────────
function ApiCard({ api, balance, onDeduct, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const mc = METHOD_COLORS[api.method];

  return (
    <div className={`bg-[#071a12]/60 border rounded-2xl p-5 transition-all duration-300 ${expanded ? "border-[#00ffb4]/30" : "border-[#0d3324] hover:border-[#00ffb4]/20"}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-black text-[#e8fff6] text-sm">{api.name}</h3>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono"
              style={{ background:`${mc.border}15`, color: mc.border, border:`1px solid ${mc.border}30` }}>
              {api.badge}
            </span>
          </div>
          <p className="text-[11px] text-[#5a8a70] mb-2">{api.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-black font-mono px-2 py-1 rounded-lg"
              style={{ background: mc.bg, color: mc.text, border:`1px solid ${mc.border}40` }}>
              {api.method}
            </span>
            <code className="text-[10px] font-mono text-[#3a5a4a] bg-[#020b08] px-2 py-1 rounded-lg truncate max-w-[180px]">
              {api.isCustom ? api.url : api.endpoint.split(" ")[1]}
            </code>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-black font-mono text-[#00ffb4]">₹{api.pricePerCall}</p>
            <p className="text-[9px] text-[#5a8a70] uppercase tracking-wider">per call</p>
          </div>
          <div className="flex items-center gap-2">
            {api.isCustom && (
              <button onClick={() => onDelete(api.id)} className="text-[#3a5a4a] hover:text-[#ff4b4b] transition-colors">
                <Trash2 size={13} />
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase tracking-wider text-[#5a8a70] hover:text-[#00ffb4] transition-colors">
              {expanded ? <><ChevronUp size={12} /> Close</> : <><ChevronDown size={12} /> Test</>}
            </button>
          </div>
        </div>
      </div>
      {expanded && <ApiTester api={api} balance={balance} onDeduct={onDeduct} />}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showApiModal, setShowApiModal]         = useState(false);

  const [balance, setBalance] = useState(() => {
    const s = localStorage.getItem("sandbox_wallet_balance");
    return s ? parseFloat(s) : 0;
  });
  const [apiCallsToday, setApiCallsToday] = useState(() => {
    const s = localStorage.getItem("sandbox_api_calls");
    return s ? parseInt(s) : 0;
  });
  const [customApis, setCustomApis] = useState(() => {
    const s = localStorage.getItem("sandbox_custom_apis");
    return s ? JSON.parse(s) : [];
  });

  const allApis = [...DEFAULT_APIS, ...customApis];

  useEffect(() => { localStorage.setItem("sandbox_wallet_balance", balance.toString()); }, [balance]);
  useEffect(() => { localStorage.setItem("sandbox_api_calls", apiCallsToday.toString()); }, [apiCallsToday]);
  useEffect(() => { localStorage.setItem("sandbox_custom_apis", JSON.stringify(customApis)); }, [customApis]);

  const formattedBalance = `₹${balance.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

  const handleDeduct = (amount) => {
    setBalance((p) => { const n = Math.max(0, p - amount); localStorage.setItem("sandbox_wallet_balance", n.toString()); return n; });
    setApiCallsToday((p) => { const n = p+1; localStorage.setItem("sandbox_api_calls", n.toString()); return n; });
  };

  const handlePay = async (amount) => {
    const loaded = await loadRazorpay();
    if (!loaded) { errorToast("Failed to load Razorpay."); return; }
    const options = {
      key: "rzp_test_RaMkf44DAZamrv",
      amount: Math.round(amount * 100), currency: "INR",
      name: "SandboxHub", description: "Add Wallet Balance",
      handler: (res) => {
        setBalance((p) => { const n = p+amount; localStorage.setItem("sandbox_wallet_balance", n.toString()); return n; });
        successToast(`₹${amount.toLocaleString("en-IN")} added! ID: ${res.razorpay_payment_id}`);
      },
      prefill: { name: mockUser.name, email: mockUser.email },
      theme: { color: "#00ffb4" },
      modal: { ondismiss: () => infoToast("Payment cancelled.") },
    };
    new window.Razorpay(options).open();
  };

  const handleAddApi  = (api) => setCustomApis((p) => [...p, api]);
  const handleDeleteApi = (id) => { setCustomApis((p) => p.filter((a) => a.id !== id)); infoToast("API removed."); };
  const handleLogout  = () => { infoToast("Logged out successfully."); setTimeout(() => navigate("/login"), 1000); };

  const stats = [
    { label:"API Calls Today", value: apiCallsToday.toLocaleString(), icon:<Activity size={18} />, color:"#00ffb4" },
    { label:"Wallet Balance",  value: formattedBalance,               icon:<Wallet size={18} />,   color:"#00d699" },
    { label:"Total APIs",      value: allApis.length.toString(),      icon:<Terminal size={18} />,  color:"#00ffb4" },
    { label:"Avg Response",    value: "124ms",                        icon:<Code2 size={18} />,     color:"#00d699" },
  ];

  return (
    <div className="min-h-screen bg-[#020b08] text-[#e8fff6] font-sans">
      <div className="fixed w-[600px] h-[600px] rounded-full bg-[#00ffb4]/3 blur-[160px] -top-40 -left-40 pointer-events-none z-0" />
      <div className="fixed w-[400px] h-[400px] rounded-full bg-[#00ffb4]/3 blur-[120px] -bottom-20 -right-20 pointer-events-none z-0" />

      {showBalanceModal && <AddBalanceModal onClose={() => setShowBalanceModal(false)} onPay={handlePay} />}
      {showApiModal && <AddApiModal onClose={() => setShowApiModal(false)} onAdd={handleAddApi} />}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#0d3324] bg-[#030e0a]/90 backdrop-blur-md px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="font-mono text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-7 h-7 bg-[#00ffb4] rounded-md flex items-center justify-center shadow-[0_0_12px_rgba(0,255,180,0.4)]">
            <Zap size={15} fill="#020b08" className="text-[#020b08]" />
          </div>
          <span>Sandbox<span className="text-[#00ffb4]">Hub</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowBalanceModal(true)} className="flex items-center gap-2 bg-[#00ffb4] hover:brightness-110 text-[#020b08] font-black rounded-xl px-4 py-2 text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(0,255,180,0.2)]">
            <Plus size={14} strokeWidth={3} /><span className="hidden sm:inline">Add Balance</span>
          </button>
          <div className="flex items-center gap-2.5 bg-[#071a12] border border-[#0d3324] rounded-xl px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-[#00ffb4]/10 border border-[#00ffb4]/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-[#00ffb4]" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#e8fff6] leading-none">{mockUser.name}</p>
              <p className="text-[10px] text-[#5a8a70] mt-0.5 font-mono">{mockUser.plan} Plan</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-[#071a12] border border-[#0d3324] hover:border-[#ff4b4b]/40 hover:bg-[#ff4b4b]/5 text-[#5a8a70] hover:text-[#ff4b4b] rounded-xl px-3 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all">
            <LogOut size={14} /><span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 pt-24 px-6 md:px-10 pb-16 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div key={i} className="bg-[#071a12]/60 border border-[#0d3324] rounded-2xl p-5 hover:border-[#00ffb4]/20 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#3a5a4a] group-hover:text-[#00ffb4] transition-colors">{s.icon}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ffb4] animate-pulse" />
              </div>
              <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-[#5a8a70] mt-1 uppercase tracking-wider font-bold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* API Section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-black tracking-tight text-[#e8fff6]">API Sandbox</h2>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#5a8a70] border border-[#0d3324] px-3 py-1 rounded-full hidden sm:block">
                {allApis.length} APIs · Pay per use
              </span>
              <button onClick={() => setShowApiModal(true)}
                className="flex items-center gap-1.5 bg-[#071a12] border border-[#0d3324] hover:border-[#00ffb4]/40 text-[#5a8a70] hover:text-[#00ffb4] rounded-xl px-3 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all">
                <Plus size={12} strokeWidth={3} /> Add API
              </button>
            </div>
          </div>
          <p className="text-[#5a8a70] text-sm mb-5">
            Select method, edit URL & body, then hit <span className="text-[#00ffb4] font-bold">Test</span> — cost deducts from wallet per call.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allApis.map((api) => (
              <ApiCard key={api.id} api={api} balance={balance} onDeduct={handleDeduct} onDelete={handleDeleteApi} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
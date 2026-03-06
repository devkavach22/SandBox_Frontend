// /* eslint-disable react-hooks/exhaustive-deps */
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Zap, Plus, History, CreditCard, User, LogOut, X, Activity, Wallet, Code2, Timer, Play, Key, Info, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
// import { usePayment } from "../hooks/usepayment";
// import { useCustomer } from "../hooks/useCustomer";
// import { getCustomerHistoryAPI } from "../services/customer.service";

// const METHOD_COLORS = {
//     GET: { bg: "#0a2d1a", border: "#00ffb4", text: "#00ffb4" },
//     POST: { bg: "#1a1a0a", border: "#ffd700", text: "#ffd700" },
//     PUT: { bg: "#0a1a2d", border: "#4da6ff", text: "#4da6ff" },
//     DELETE: { bg: "#2d0a0a", border: "#ff4b4b", text: "#ff4b4b" },
// };

// export default function Dashboard() {
//     const navigate = useNavigate();
//     const { createOrder, verifyPayment, loading: paymentLoading } = usePayment();
//     const { fetchUserProfile, deselectApi } = useCustomer();

//     const [user, setUser] = useState(null);
//     const [selectedApis, setSelectedApis] = useState([]);
//     const [showPayment, setShowPayment] = useState(false);
//     const [amount, setAmount] = useState(0);
//     const [balance, setBalance] = useState(0);
//     const [apiCallCount, setApiCallCount] = useState(0);
//     const [showAuthInfo, setShowAuthInfo] = useState(true);
//     const [copied, setCopied] = useState(null);
//     const [toast, setToast] = useState(null); // { message, type: "success" | "error" }

//     const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

//     useEffect(() => {
//         const storedUser = JSON.parse(localStorage.getItem("user"));
//         if (!storedUser) { navigate("/login"); return; }
//         setUser(storedUser);
//         setBalance(storedUser.balance || 0);

//         fetchUserProfile(storedUser.id).then((profile) => {
//             if (profile) {
//                 setSelectedApis(profile.selectedApis || []);
//                 const currentBalance = profile.balance || 0;
//                 setBalance(currentBalance);
//                 if (currentBalance === 0) {
//                     setShowPayment(true);
//                 }
//             }
//         });

//         getCustomerHistoryAPI(storedUser.id).then((res) => {
//             setApiCallCount(res?.data?.length || 0);
//         }).catch(() => { });
//     }, []);

//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         navigate("/login");
//     };

//     const handleRemoveApi = async (api) => {
//         setSelectedApis((prev) => prev.filter((a) => a._id !== api._id));
//         try {
//             await deselectApi(user.id, api._id);
//         } catch {
//             setSelectedApis((prev) => [...prev, api]);
//         }
//     };

//     const handleCopy = (text, id) => {
//         navigator.clipboard.writeText(text);
//         setCopied(id);
//         setTimeout(() => setCopied(null), 1500);
//     };

//     const showToast = (message, type = "success") => {
//         setToast({ message, type });
//         setTimeout(() => setToast(null), 3500);
//     };

//     const handlePayment = async () => {
//         if (!amount || amount <= 0) return;
//         try {
//             const orderRes = await createOrder(amount);
//             const order = orderRes.data;
//             const options = {
//                 key: "rzp_test_SKgLsCXlMbmxsZ",
//                 amount: order.amount,
//                 currency: "INR",
//                 name: "SandboxHub",
//                 description: "Add Balance",
//                 order_id: order.id,
//                 handler: async (response) => {
//                     const verifyRes = await verifyPayment({
//                         order_id: response.razorpay_order_id,
//                         payment_id: response.razorpay_payment_id,
//                         signature: response.razorpay_signature,
//                         amount,
//                         userId: user.id,
//                     });
//                     const newBalance = verifyRes?.data?.balance || balance + amount;
//                     const updatedUser = { ...user, balance: newBalance };
//                     setBalance(newBalance);
//                     setUser(updatedUser);
//                     localStorage.setItem("user", JSON.stringify(updatedUser));
//                     showToast("Payment Successful! Balance Added ✅");
//                     setShowPayment(false);
//                     setAmount(0);
//                 },
//                 prefill: { name: user?.name, email: user?.email },
//                 theme: { color: "#00ffb4" },
//             };
//             const rzp = new window.Razorpay(options);
//             rzp.open();
//         } catch (err) {
//             console.log("❌ Payment Error:", err);
//             showToast("Payment Failed! Please try again.", "error");
//         }
//     };

//     const authRequestBody = `{\n  "user_name": "Komal"\n}`;
//     const authResponseBody = `{\n  "status": "success",\n  "token": "4c16f70193749be219adb0ad6f9dd840",\n  "user_name": "Komal",\n  "message": "Existing valid token returned"\n}`;
//     const authEndpoint = "https://staging.konverthr.com/api/auth";

//     return (
//         <div className="min-h-screen bg-[#020b08] text-[#e8fff6] font-mono">

//             {/* Navbar */}
//             <nav className="border-b border-[#0d3324] px-6 py-3 flex items-center justify-between">
//                 <div className="flex items-center gap-2 font-bold text-lg">
//                     <div className="w-7 h-7 bg-[#00ffb4] rounded flex items-center justify-center">
//                         <Zap size={14} fill="#020b08" className="text-[#020b08]" />
//                     </div>
//                     <span>Sandbox<span className="text-[#00ffb4]">Hub</span></span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <button onClick={() => setShowPayment(true)}
//                         className="flex items-center gap-2 bg-[#00ffb4] text-[#020b08] font-black text-xs px-4 py-2 rounded-lg hover:bg-[#00d699] transition-all">
//                         <Plus size={14} /> ADD BALANCE
//                     </button>
//                     <button onClick={() => navigate("/history")}
//                         className="flex items-center gap-2 text-[#5a8a70] hover:text-[#e8fff6] text-xs px-3 py-2 rounded-lg border border-[#0d3324] hover:border-[#00ffb4]/30 transition-all">
//                         <History size={14} /> HISTORY
//                     </button>
//                     <button onClick={() => navigate("/payments")}
//                         className="flex items-center gap-2 text-[#5a8a70] hover:text-[#e8fff6] text-xs px-3 py-2 rounded-lg border border-[#0d3324] hover:border-[#00ffb4]/30 transition-all">
//                         <CreditCard size={14} /> PAYMENTS
//                     </button>
//                     <button onClick={() => navigate("/profile")}
//                         className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#0d3324] hover:border-[#00ffb4]/30 hover:bg-[#00ffb4]/5 transition-all">
//                         {user?.avatar
//                             ? <img src={user.avatar} className="w-6 h-6 rounded-full object-cover border border-[#00ffb4]/30" alt="" />
//                             : <div className="w-6 h-6 bg-[#00ffb4]/20 rounded-full flex items-center justify-center">
//                                 <User size={12} className="text-[#00ffb4]" />
//                             </div>
//                         }
//                         <div>
//                             <p className="text-xs font-black text-[#e8fff6]">{user?.name}</p>
//                             <p className="text-[10px] text-[#5a8a70] capitalize">{user?.role}</p>
//                         </div>
//                     </button>
//                     <button onClick={handleLogout}
//                         className="flex items-center gap-2 text-[#5a8a70] hover:text-[#ff4b4b] text-xs px-3 py-2 rounded-lg border border-[#0d3324] hover:border-[#ff4b4b]/30 transition-all">
//                         <LogOut size={14} /> LOGOUT
//                     </button>
//                 </div>
//             </nav>

//             {/* Stats */}
//             <div className="p-6 grid grid-cols-4 gap-4 mb-6">
//                 {[
//                     { icon: <Activity size={18} />, value: apiCallCount, label: "API CALLS" },
//                     { icon: <Wallet size={18} />, value: `₹${balance}`, label: "WALLET BALANCE" },
//                     { icon: <Code2 size={18} />, value: `${selectedApis.length}`, label: "MY APIS" },
//                     { icon: <Timer size={18} />, value: "124ms", label: "AVG RESPONSE" },
//                 ].map((card, i) => (
//                     <div key={i} className="bg-[#030e0a] border border-[#0d3324] rounded-xl p-5">
//                         <div className="flex justify-between items-start mb-4">
//                             <span className="text-[#3a5a4a]">{card.icon}</span>
//                             <div className="w-2 h-2 rounded-full bg-[#00ffb4]" />
//                         </div>
//                         <p className="text-2xl font-black text-[#00ffb4] mb-1">{card.value}</p>
//                         <p className="text-[10px] text-[#5a8a70] tracking-widest">{card.label}</p>
//                     </div>
//                 ))}
//             </div>

//             {/* ─── KonvertHR Authentication Notice ─── */}
//             <div className="px-6 mb-6">
//                 <div className="bg-[#030e0a] border border-[#ffd700]/30 rounded-xl overflow-hidden">

//                     {/* Header */}
//                     <button
//                         onClick={() => setShowAuthInfo((p) => !p)}
//                         className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#ffd700]/5 transition-all">
//                         <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-lg flex items-center justify-center flex-shrink-0">
//                                 <Key size={14} className="text-[#ffd700]" />
//                             </div>
//                             <div className="text-left">
//                                 <p className="text-sm font-black text-[#ffd700]">KonvertHR — Authentication Required</p>
//                                 <p className="text-[10px] text-[#5a8a70] mt-0.5">
//                                     You must retrieve an auth token before calling any KonvertHR API
//                                 </p>
//                             </div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#ffd700]/10 border border-[#ffd700]/20 text-[#ffd700]">
//                                 MANDATORY
//                             </span>
//                             {showAuthInfo
//                                 ? <ChevronUp size={14} className="text-[#5a8a70]" />
//                                 : <ChevronDown size={14} className="text-[#5a8a70]" />
//                             }
//                         </div>
//                     </button>

//                     {/* Expandable Body */}
//                     {showAuthInfo && (
//                         <div className="border-t border-[#0d3324] px-5 py-5 space-y-5">

//                             {/* Info Banner */}
//                             <div className="flex items-start gap-3 bg-[#ffd700]/5 border border-[#ffd700]/15 rounded-xl px-4 py-3">
//                                 <Info size={13} className="text-[#ffd700] mt-0.5 flex-shrink-0" />
//                                 <p className="text-[11px] text-[#b8a840] leading-relaxed">
//                                     All KonvertHR APIs require a valid <span className="text-[#ffd700] font-bold"> token</span> in the
//                                     request header. You must first call the Authentication endpoint to obtain your token,
//                                     then include it as <code className="bg-[#020b08] px-1.5 py-0.5 rounded text-[#ffd700]">Authorization:  &lt;token&gt;</code> in all subsequent KonvertHR API requests.
//                                 </p>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">

//                                 {/* Step 1 — Request */}
//                                 <div>
//                                     <div className="flex items-center justify-between mb-2">
//                                         <div className="flex items-center gap-2">
//                                             <span className="w-5 h-5 bg-[#ffd700]/20 border border-[#ffd700]/30 rounded-full flex items-center justify-center text-[9px] font-black text-[#ffd700]">1</span>
//                                             <span className="text-[10px] font-bold text-[#5a8a70] tracking-widest uppercase">Auth Endpoint &amp; Request Body</span>
//                                         </div>
//                                         <button onClick={() => handleCopy(`POST ${authEndpoint}\n\n${authRequestBody}`, "req")}
//                                             className="flex items-center gap-1 text-[9px] text-[#5a8a70] hover:text-[#ffd700] transition-all">
//                                             {copied === "req" ? <Check size={10} className="text-[#00ffb4]" /> : <Copy size={10} />}
//                                             {copied === "req" ? "Copied!" : "Copy"}
//                                         </button>
//                                     </div>
//                                     <div className="bg-[#020b08] border border-[#0d3324] rounded-xl p-4 space-y-2">
//                                         <div className="flex items-center gap-2 pb-2 border-b border-[#0d3324]">
//                                             <span className="text-[9px] font-black px-2 py-0.5 rounded-md"
//                                                 style={{ background: METHOD_COLORS.POST.bg, color: METHOD_COLORS.POST.text, border: `1px solid ${METHOD_COLORS.POST.border}40` }}>
//                                                 POST
//                                             </span>
//                                             <code className="text-[10px] text-[#5a8a70] truncate">{authEndpoint}</code>
//                                         </div>
//                                         <pre className="text-[11px] text-[#e8fff6] leading-relaxed whitespace-pre-wrap">
//                                             {authRequestBody}
//                                         </pre>
//                                     </div>
//                                 </div>

//                                 {/* Step 2 — Response */}
//                                 <div>
//                                     <div className="flex items-center justify-between mb-2">
//                                         <div className="flex items-center gap-2">
//                                             <span className="w-5 h-5 bg-[#00ffb4]/20 border border-[#00ffb4]/30 rounded-full flex items-center justify-center text-[9px] font-black text-[#00ffb4]">2</span>
//                                             <span className="text-[10px] font-bold text-[#5a8a70] tracking-widest uppercase">Response — Token Received</span>
//                                         </div>
//                                         <button onClick={() => handleCopy(authResponseBody, "res")}
//                                             className="flex items-center gap-1 text-[9px] text-[#5a8a70] hover:text-[#00ffb4] transition-all">
//                                             {copied === "res" ? <Check size={10} className="text-[#00ffb4]" /> : <Copy size={10} />}
//                                             {copied === "res" ? "Copied!" : "Copy"}
//                                         </button>
//                                     </div>
//                                     <div className="bg-[#020b08] border border-[#0d3324] rounded-xl p-4">
//                                         <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">
//                                             {`{
//   "status": `}<span className="text-[#00ffb4]">"success"</span>{`,
//   "token": `}<span className="text-[#ffd700]">"4c16f70193749be219adb0ad6f9dd840"</span>{`,
//   "user_name": `}<span className="text-[#4da6ff]">"Komal"</span>{`,
//   "message": `}<span className="text-[#00ffb4]">"Existing valid token returned"</span>{`
// }`}
//                                         </pre>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Step 3 — Usage reminder */}
//                             <div className="flex items-center gap-3 bg-[#020b08] border border-[#0d3324] rounded-xl px-4 py-3">
//                                 <span className="w-5 h-5 bg-[#4da6ff]/20 border border-[#4da6ff]/30 rounded-full flex items-center justify-center text-[9px] font-black text-[#4da6ff] flex-shrink-0">3</span>
//                                 <p className="text-[11px] text-[#5a8a70] leading-relaxed">
//                                     Copy the <span className="text-[#ffd700] font-bold">token</span> from the response and pass it in the
//                                     <code className="mx-1 bg-[#0d3324] px-1.5 py-0.5 rounded text-[#4da6ff]">Authorization</code> header
//                                     as <code className="bg-[#0d3324] px-1.5 py-0.5 rounded text-[#4da6ff]"> &lt;token&gt;</code> for
//                                     all subsequent KonvertHR API calls.
//                                 </p>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* API Sandbox */}
//             <div className="px-6 pb-10">
//                 <div className="relative flex items-center justify-center mb-4">
//                     <h2 className="text-lg font-black">My API Sandbox</h2>
//                     <div className="absolute right-0 flex items-center gap-3">
//                         <span className="text-xs text-[#5a8a70] border border-[#0d3324] px-3 py-1 rounded-lg">
//                             {selectedApis.length} APIs selected
//                         </span>
//                         <button onClick={() => navigate("/apis")}
//                             className="flex items-center gap-2 text-[#00ffb4] border border-[#00ffb4]/30 text-xs font-black px-3 py-1 rounded-lg hover:bg-[#00ffb4]/10 transition-all">
//                             <Plus size={12} /> MANAGE
//                         </button>
//                     </div>
//                 </div>

//                 {selectedApis.length === 0 ? (
//                     <div className="border border-dashed border-[#0d3324] rounded-xl p-16 flex flex-col items-center justify-center gap-4">
//                         <p className="text-[#3a5a4a] text-sm">No APIs selected.</p>
//                         <button onClick={() => navigate("/apis")}
//                             className="flex items-center gap-2 bg-[#00ffb4]/10 border border-[#00ffb4]/30 text-[#00ffb4] text-xs font-black px-4 py-2 rounded-lg hover:bg-[#00ffb4]/20 transition-all">
//                             <Plus size={14} /> SELECT APIS
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {selectedApis.map((api) => {
//                             const mc = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
//                             return (
//                                 <div key={api._id}
//                                     className="bg-[#030e0a] border border-[#0d3324] rounded-xl p-5 hover:border-[#00ffb4]/30 transition-all group">
//                                     <div className="flex items-center justify-between mb-3">
//                                         <div className="flex items-center gap-2">
//                                             <span className="text-[9px] font-black font-mono px-2 py-1 rounded-lg"
//                                                 style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
//                                                 {api.method}
//                                             </span>
//                                             <h3 className="font-black text-[#e8fff6] text-sm">{api.name}</h3>
//                                         </div>
//                                         <span className="font-black font-mono text-[#00ffb4] text-sm">₹{api.pricePerCall}</span>
//                                     </div>
//                                     <p className="text-[11px] text-[#5a8a70] mb-3">{api.description}</p>
//                                     <div className="flex items-center justify-between">
//                                         <code className="text-[10px] font-mono text-[#3a5a4a] bg-[#020b08] px-2 py-1 rounded-lg truncate max-w-[55%]">
//                                             {api.url}
//                                         </code>
//                                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
//                                             <button onClick={() => handleRemoveApi(api)}
//                                                 className="flex items-center gap-1 text-[10px] font-black text-[#ff4b4b] border border-[#ff4b4b]/30 px-3 py-1.5 rounded-lg hover:bg-[#ff4b4b]/10 transition-all">
//                                                 <X size={10} /> REMOVE
//                                             </button>
//                                             <button onClick={() => navigate(`/sandbox/${api._id}`, { state: { api } })}
//                                                 className="flex items-center gap-1 text-[10px] font-black text-[#020b08] bg-[#00ffb4] px-3 py-1.5 rounded-lg hover:brightness-110 transition-all">
//                                                 <Play size={10} fill="#020b08" /> RUN
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>

//             {/* Payment Modal */}
//             {showPayment && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
//                     <div className="bg-[#071a12] border border-[#0d3324] rounded-2xl p-6 w-full max-w-md">

//                         <div className="flex justify-between items-start mb-6">
//                             <div>
//                                 <h3 className="text-lg font-black">Add Balance</h3>
//                                 <p className="text-[10px] text-[#5a8a70]">
//                                     {balance === 0
//                                         ? "⚠️ Add balance to start using APIs"
//                                         : "Secure payment via Razorpay"}
//                                 </p>
//                             </div>
//                             {balance > 0 && (
//                                 <button onClick={() => { setShowPayment(false); setAmount(0); }}
//                                     className="w-8 h-8 bg-[#0d1f15] border border-[#0d3324] rounded-lg flex items-center justify-center hover:border-[#ff4b4b]/30 hover:text-[#ff4b4b] transition-all">
//                                     <X size={14} />
//                                 </button>
//                             )}
//                         </div>

//                         {balance === 0 && (
//                             <div className="mb-4 px-4 py-3 bg-[#ff4b4b]/10 border border-[#ff4b4b]/20 rounded-xl flex items-center gap-3">
//                                 <div className="w-2 h-2 rounded-full bg-[#ff4b4b] animate-pulse flex-shrink-0" />
//                                 <p className="text-[11px] text-[#ff4b4b] font-bold">
//                                     Your wallet is empty. Add balance to call APIs.
//                                 </p>
//                             </div>
//                         )}

//                         <div className="mb-4">
//                             <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px] block mb-2">AMOUNT</label>
//                             <div className="flex items-center bg-[#030e0a] border border-[#0d3324] rounded-xl px-4 py-3 focus-within:border-[#00ffb4]/50">
//                                 <span className="text-[#5a8a70] mr-2">₹</span>
//                                 <input type="number" value={amount || ""}
//                                     onChange={(e) => setAmount(Number(e.target.value))}
//                                     placeholder="0.00"
//                                     className="bg-transparent text-[#e8fff6] outline-none w-full text-sm" />
//                             </div>
//                         </div>

//                         <div className="mb-6">
//                             <label className="text-[10px] font-bold text-[#5a8a70] uppercase tracking-[2px] block mb-2">QUICK SELECT</label>
//                             <div className="grid grid-cols-3 gap-2">
//                                 {quickAmounts.map((q) => (
//                                     <button key={q} onClick={() => setAmount(q)}
//                                         className={`py-2 rounded-lg text-xs font-black border transition-all ${amount === q
//                                                 ? "bg-[#00ffb4]/20 border-[#00ffb4]/50 text-[#00ffb4]"
//                                                 : "bg-[#030e0a] border-[#0d3324] text-[#5a8a70] hover:border-[#00ffb4]/30"
//                                             }`}>
//                                         ₹{q}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         <button onClick={handlePayment}
//                             disabled={paymentLoading || !amount || amount <= 0}
//                             className="w-full bg-[#00ffb4] text-[#020b08] font-black py-3 rounded-xl text-sm uppercase tracking-wider hover:bg-[#00d699] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
//                             {paymentLoading
//                                 ? <div className="w-5 h-5 border-2 border-[#020b08]/30 border-t-[#020b08] rounded-full animate-spin" />
//                                 : <><Zap size={16} fill="#020b08" /> PAY ₹{amount || 0}</>
//                             }
//                         </button>
//                         <p className="text-center text-[10px] text-[#3a5a4a] mt-3">🔒 Powered by Razorpay</p>
//                     </div>
//                 </div>
//             )}
//             {/* Toast Notification */}
//             {/* Toast Notification */}
//             {toast && (
//                 <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl font-mono text-sm font-bold transition-all
//         ${toast.type === "success"
//                         ? "bg-[#071a12] border-[#00ffb4]/40 text-[#00ffb4]"
//                         : "bg-[#1a0707] border-[#ff4b4b]/40 text-[#ff4b4b]"
//                     }`}>
//                     <div className={`w-2 h-2 rounded-full flex-shrink-0 ${toast.type === "success" ? "bg-[#00ffb4]" : "bg-[#ff4b4b]"} animate-pulse`} />
//                     {toast.message}
//                     <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 transition-all">
//                         <X size={12} />
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }


/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Zap, Plus, History, CreditCard, User, LogOut, X,
    Activity, Wallet, Code2, Timer, Play, Key, Info,
    ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";
import { usePayment } from "../hooks/usepayment";
import { useCustomer } from "../hooks/useCustomer";
import { getCustomerHistoryAPI } from "../services/customer.service";

const METHOD_COLORS = {
    GET:    { bg: "rgba(139,92,246,0.08)",  border: "#8B5CF6", text: "#A78BFA" },
    POST:   { bg: "rgba(255,59,142,0.08)",  border: "#FF3B8E", text: "#FF3B8E" },
    PUT:    { bg: "rgba(99,102,241,0.08)",  border: "#6366F1", text: "#818CF8" },
    DELETE: { bg: "rgba(239,68,68,0.08)",   border: "#EF4444", text: "#F87171" },
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { createOrder, verifyPayment, loading: paymentLoading } = usePayment();
    const { fetchUserProfile, deselectApi } = useCustomer();

    const [user, setUser]                 = useState(null);
    const [selectedApis, setSelectedApis] = useState([]);
    const [showPayment, setShowPayment]   = useState(false);
    const [amount, setAmount]             = useState(0);
    const [balance, setBalance]           = useState(0);
    const [apiCallCount, setApiCallCount] = useState(0);
    const [showAuthInfo, setShowAuthInfo] = useState(true);
    const [copied, setCopied]             = useState(null);
    const [toast, setToast]               = useState(null);

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
            .then((res) => setApiCallCount(res?.data?.length || 0))
            .catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
                amount: order.amount,
                currency: "INR",
                name: "SandboxHub",
                description: "Add Balance",
                order_id: order.id,
                handler: async (response) => {
                    const verifyRes = await verifyPayment({
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        amount,
                        userId: user.id,
                    });
                    const newBalance = verifyRes?.data?.balance || balance + amount;
                    const updatedUser = { ...user, balance: newBalance };
                    setBalance(newBalance);
                    setUser(updatedUser);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    showToast("Payment Successful! Balance Added ✅");
                    setShowPayment(false);
                    setAmount(0);
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: "#FF3B8E" },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.log("❌ Payment Error:", err);
            showToast("Payment Failed! Please try again.", "error");
        }
    };

    const authRequestBody  = `{\n  "user_name": "Komal"\n}`;
    const authResponseBody = `{\n  "status": "success",\n  "token": "4c16f70193749be219adb0ad6f9dd840",\n  "user_name": "Komal",\n  "message": "Existing valid token returned"\n}`;
    const authEndpoint     = "https://staging.konverthr.com/api/auth";

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 relative overflow-x-hidden">

            {/* Ambient glows */}
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
                              </div>
                        }
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
                        { icon: <Activity size={20} />, value: apiCallCount,          label: "API CALLS",      color: "#FF3B8E", glow: "rgba(255,59,142,0.15)" },
                        { icon: <Wallet   size={20} />, value: `₹${balance}`,         label: "WALLET BALANCE", color: "#A78BFA", glow: "rgba(167,139,250,0.15)" },
                        { icon: <Code2    size={20} />, value: selectedApis.length,   label: "MY APIS",        color: "#FF3B8E", glow: "rgba(255,59,142,0.15)" },
                        { icon: <Timer    size={20} />, value: "124ms",               label: "AVG RESPONSE",   color: "#A78BFA", glow: "rgba(167,139,250,0.15)" },
                    ].map((card, i) => (
                        <div key={i}
                            style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.06)` }}
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

                {/* ─── KONVERTHR AUTH NOTICE ─── */}
                <div className="mb-6">
                    <div style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,59,142,0.15)" }}
                        className="bg-[#0f0f0f] rounded-[1.5rem] overflow-hidden">

                        <button
                            onClick={() => setShowAuthInfo((p) => !p)}
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
                                    style={{ background: "rgba(255,59,142,0.12)", border: "1px solid rgba(255,59,142,0.25)" }}>
                                    MANDATORY
                                </span>
                                {showAuthInfo
                                    ? <ChevronUp size={15} className="text-slate-500" />
                                    : <ChevronDown size={15} className="text-slate-500" />}
                            </div>
                        </button>

                        {showAuthInfo && (
                            <div className="border-t border-white/[0.05] px-6 py-6 space-y-5">

                                {/* Info Banner */}
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
                                    {/* Step 1 */}
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
                                                    style={{ background: METHOD_COLORS.POST.bg, color: METHOD_COLORS.POST.text, border: `1px solid ${METHOD_COLORS.POST.border}40` }}>
                                                    POST
                                                </span>
                                                <code className="text-[10px] text-slate-500 truncate">{authEndpoint}</code>
                                            </div>
                                            <pre className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">{authRequestBody}</pre>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
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
                                        <div className="rounded-2xl p-4"
                                            style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)" }}>
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

                                {/* Step 3 */}
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
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── API SANDBOX ─── */}
                <div>
                    <div className="relative flex items-center justify-center mb-5">
                        <h2 className="text-lg font-black text-white tracking-tight">My API Sandbox</h2>
                        <div className="absolute right-0 flex items-center gap-2">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedApis.map((api) => {
                                const mc = METHOD_COLORS[api.method] || METHOD_COLORS.POST;
                                return (
                                    <div key={api._id}
                                        className="rounded-[1.5rem] p-5 transition-all duration-300 group relative overflow-hidden"
                                        style={{ background: "#0f0f0f", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.5rem]"
                                            style={{ background: "radial-gradient(ellipse at top left, rgba(255,59,142,0.06), transparent 70%)" }} />
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black px-2 py-1 rounded-lg"
                                                    style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}40` }}>
                                                    {api.method}
                                                </span>
                                                <h3 className="font-black text-white text-sm">{api.name}</h3>
                                            </div>
                                            <span className="font-black text-[#FF3B8E] text-sm">₹{api.pricePerCall}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{api.description}</p>
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
                            })}
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
                                <p className="text-[10px] text-slate-500 mt-1">
                                    {balance === 0 ? "⚠️ Add balance to start using APIs" : "Secure payment via Razorpay"}
                                </p>
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
                                <input type="number" value={amount || ""}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    placeholder="0.00"
                                    className="bg-transparent text-white outline-none w-full text-sm font-bold" />
                            </div>
                        </div>

                        <div className="mb-7">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Quick Select</label>
                            <div className="grid grid-cols-3 gap-2">
                                {quickAmounts.map((q) => (
                                    <button key={q} onClick={() => setAmount(q)}
                                        className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                                            amount === q
                                                ? "bg-gradient-to-r from-[#FF3B8E]/20 to-[#8E44AD]/20 border-[#FF3B8E]/50 text-[#FF3B8E]"
                                                : "bg-white/[0.02] border-white/[0.06] text-slate-500 hover:border-[#FF3B8E]/20 hover:text-white"
                                        }`}>
                                        ₹{q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handlePayment}
                            disabled={paymentLoading || !amount || amount <= 0}
                            className="w-full bg-gradient-to-r from-[#FF3B8E] to-[#8E44AD] text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20">
                            {paymentLoading
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><Zap size={16} fill="white" /> PAY ₹{amount || 0}</>
                            }
                        </button>
                        <p className="text-center text-[10px] text-slate-600 mt-3">🔒 Powered by Razorpay</p>
                    </div>
                </div>
            )}

            {/* ─── TOAST ─── */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl text-sm font-bold transition-all
                    ${toast.type === "success"
                        ? "bg-[#0a0a0a] border-[#FF3B8E]/30 text-[#FF3B8E]"
                        : "bg-[#0a0a0a] border-red-500/30 text-red-400"
                    }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${toast.type === "success" ? "bg-[#FF3B8E]" : "bg-red-500"}`} />
                    {toast.message}
                    <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 transition-all">
                        <X size={12} />
                    </button>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                * { font-family: 'Urbanist', sans-serif; }
            `}</style>
        </div>
    );
}
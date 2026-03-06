import { useNavigate } from "react-router-dom";
import { Zap, ArrowLeft, LogOut, ShieldCheck, History, CreditCard } from "lucide-react";

export default function Navbar({
    showBack       = false,
    backTo         = null,
    badge          = null,
    badgeIcon      = null,
    showAdminLinks = false,
    showLogout     = true,
    onLogout       = null,
    rightContent   = null,
}) {
    const navigate = useNavigate();
    const user     = JSON.parse(localStorage.getItem("user") || "null");
    const isAdmin  = user?.role === "admin";

    const defaultBack = isAdmin ? "/admin" : "/dashboard";

    const handleLogout = () => {
        if (onLogout) { onLogout(); return; }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-3xl bg-black/40 px-6 md:px-10 py-4 flex items-center justify-between">

            {/* ── LEFT ── */}
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={() => navigate(backTo || defaultBack)}
                        className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-4 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-bold"
                    >
                        <ArrowLeft size={13} /> BACK
                    </button>
                )}

                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate("/")}
                >
                    <div className="w-9 h-9 bg-gradient-to-br from-[#FF3B8E] to-[#8E44AD] rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:rotate-6 transition-transform">
                        <Zap size={18} className="text-white fill-current" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-white">
                        Sandbox
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#A29BFE]">
                            Hub
                        </span>
                    </span>
                </div>

                {/* Admin badge — always shown for admin */}
                {isAdmin && !badge && (
                    <span
                        className="hidden sm:flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.25)", color: "#FF3B8E" }}
                    >
                        <ShieldCheck size={11} /> ADMIN
                    </span>
                )}

                {/* Custom badge */}
                {badge && (
                    <span
                        className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.25)", color: "#FF3B8E" }}
                    >
                        {badgeIcon} {badge}
                    </span>
                )}
            </div>

            {/* ── RIGHT ── */}
            <div className="flex items-center gap-2">

                {/* Admin quick-links */}
                {showAdminLinks && (
                    <>
                        <button
                            onClick={() => navigate("/history")}
                            className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-3 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-bold uppercase tracking-wider"
                        >
                            <History size={13} /><span className="hidden sm:inline">History</span>
                        </button>
                        <button
                            onClick={() => navigate("/payments")}
                            className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-3 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-bold uppercase tracking-wider"
                        >
                            <CreditCard size={13} /><span className="hidden sm:inline">Payments</span>
                        </button>
                    </>
                )}

                {rightContent}

                {showLogout && (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-slate-500 hover:text-red-400 text-xs px-3 py-2 rounded-full border border-white/10 hover:border-red-500/30 transition-all font-bold uppercase tracking-wider"
                    >
                        <LogOut size={13} /><span className="hidden sm:inline">Logout</span>
                    </button>
                )}
            </div>
        </nav>
    );
}
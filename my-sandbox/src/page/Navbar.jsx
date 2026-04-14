import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Zap, ArrowLeft, LogOut, ShieldCheck, History,
    CreditCard, Plus, User, Menu, X, LayoutDashboard
} from "lucide-react";
import { triggerAuthChange } from "../routes/AppRoutes";

export default function Navbar({
    showBack           = false,
    backTo             = null,
    badge              = null,
    badgeIcon          = null,
    showAdminLinks     = false,
    showLogout         = true,
    onLogout           = null,
    rightContent       = null,
    showDashboardLinks = false,
    onAddBalance       = null,
    user               = null,
}) {
    const navigate    = useNavigate();
    const storedUser  = user || JSON.parse(localStorage.getItem("user") || "null");
    const isAdmin     = storedUser?.role === "admin";
    const defaultBack = isAdmin ? "/admin" : "/dashboard";

    const [menuOpen, setMenuOpen] = useState(false);

    // Lock body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    const go = (path) => { setMenuOpen(false); navigate(path); };

    const handleLogout = () => {
        setMenuOpen(false);
        if (onLogout) { onLogout(); return; }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        triggerAuthChange();
        navigate("/login");
    };

    const initials = storedUser?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');

                .nb-btn {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 11px; font-weight: 900; font-family: 'Urbanist', sans-serif;
                    padding: 8px 14px; border-radius: 999px;
                    border: 1px solid rgba(0,0,0,0.08);
                    background: white; color: #64748b;
                    cursor: pointer; transition: all 0.2s; white-space: nowrap;
                    letter-spacing: -0.01em;
                }
                .nb-btn:hover { color: #FF3B8E; border-color: rgba(255,59,142,0.3); }
                .nb-btn-logout:hover { color: #ef4444 !important; border-color: rgba(239,68,68,0.3) !important; }

                .nb-btn-primary {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 11px; font-weight: 900; font-family: 'Urbanist', sans-serif;
                    padding: 8px 16px; border-radius: 999px; border: none;
                    background: linear-gradient(135deg, #FF3B8E, #8E44AD);
                    color: white; cursor: pointer; transition: all 0.2s;
                    white-space: nowrap; letter-spacing: -0.01em;
                    box-shadow: 0 4px 14px rgba(255,59,142,0.25);
                }
                .nb-btn-primary:hover { filter: brightness(1.1); }
                .nb-btn-primary:active { transform: scale(0.95); }

                /* Hamburger — hidden on desktop */
                .nb-hamburger {
                    display: none;
                    align-items: center; justify-content: center;
                    width: 38px; height: 38px; border-radius: 12px;
                    border: 1px solid rgba(0,0,0,0.08);
                    background: white; cursor: pointer;
                    transition: all 0.2s; flex-shrink: 0; color: #64748b;
                }
                .nb-hamburger:hover { border-color: rgba(255,59,142,0.3); color: #FF3B8E; }

                /* Desktop row — hidden on mobile */
                .nb-desktop { display: flex; align-items: center; gap: 8px; }

                @media (max-width: 768px) {
                    .nb-desktop   { display: none !important; }
                    .nb-hamburger { display: flex !important; }
                }

                /* ── Overlay ── */
                .nb-overlay {
                    position: fixed; inset: 0; z-index: 48;
                    background: rgba(0,0,0,0.2);
                    backdrop-filter: blur(3px);
                    -webkit-backdrop-filter: blur(3px);
                    animation: nb-ov-in 0.2s ease;
                }
                @keyframes nb-ov-in { from { opacity:0; } to { opacity:1; } }

                /* ── Full-width drawer ── */
                .nb-drawer {
                    position: fixed;
                    top: 57px;
                    left: 0; right: 0;
                    z-index: 49;
                    background: white;
                    border-bottom: 1px solid rgba(0,0,0,0.07);
                    box-shadow: 0 16px 48px rgba(0,0,0,0.14);
                    animation: nb-dr-in 0.22s cubic-bezier(0.16,1,0.3,1);
                }
                @keyframes nb-dr-in {
                    from { opacity:0; transform: translateY(-10px); }
                    to   { opacity:1; transform: translateY(0); }
                }

                /* User pill inside drawer */
                .nb-dr-user {
                    display: flex; align-items: center; gap: 12px;
                    margin: 12px 16px 4px;
                    padding: 14px 16px;
                    border-radius: 18px;
                    background: linear-gradient(135deg, rgba(255,59,142,0.05), rgba(142,68,173,0.04));
                    border: 1px solid rgba(255,59,142,0.12);
                }

                /* Nav rows */
                .nb-dr-item {
                    display: flex; align-items: center; gap: 14px;
                    width: 100%; padding: 14px 20px;
                    font-size: 14px; font-weight: 800;
                    font-family: 'Urbanist', sans-serif; letter-spacing: -0.02em;
                    background: none; border: none; cursor: pointer;
                    color: #1e293b; text-align: left;
                    transition: background 0.15s, color 0.15s;
                    border-top: 1px solid rgba(0,0,0,0.045);
                }
                .nb-dr-item:first-of-type { border-top: none; }
                .nb-dr-item:hover { background: rgba(255,59,142,0.04); color: #FF3B8E; }
                .nb-dr-item:hover .nb-dr-icon {
                    background: rgba(255,59,142,0.1) !important;
                    border-color: rgba(255,59,142,0.2) !important;
                    color: #FF3B8E !important;
                }
                .nb-dr-item-primary { background: rgba(255,59,142,0.03); color: #FF3B8E; }
                .nb-dr-item-primary .nb-dr-label { color: #FF3B8E; }

                .nb-dr-item-logout:hover {
                    background: rgba(239,68,68,0.04) !important; color: #ef4444 !important;
                }
                .nb-dr-item-logout:hover .nb-dr-icon {
                    background: rgba(239,68,68,0.08) !important;
                    border-color: rgba(239,68,68,0.2) !important;
                    color: #ef4444 !important;
                }

                .nb-dr-icon {
                    width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08);
                    color: #64748b; transition: all 0.15s;
                }
                .nb-dr-icon-primary {
                    background: linear-gradient(135deg, #FF3B8E, #8E44AD) !important;
                    border: none !important; color: white !important;
                    box-shadow: 0 4px 12px rgba(255,59,142,0.3);
                }

                .nb-dr-label   { flex: 1; font-size: 14px; font-weight: 800; }
                .nb-dr-sublabel { font-size: 11px; font-weight: 600; color: #94a3b8; margin-top: 2px; }

                .nb-dr-divider {
                    height: 1px; background: rgba(0,0,0,0.06); margin: 6px 20px;
                }
                .nb-dr-footer { padding-bottom: 8px; }
            `}</style>

            {/* ── NAVBAR ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
                background: "rgba(255,255,255,0.88)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                padding: "10px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontFamily: "'Urbanist', sans-serif",
            }}>
                {/* LEFT */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {showBack && (
                        <button className="nb-btn" onClick={() => navigate(backTo || defaultBack)}>
                            <ArrowLeft size={13} /> BACK
                        </button>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}
                        onClick={() => navigate("/")}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: "linear-gradient(135deg, #FF3B8E, #8E44AD)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 14px rgba(255,59,142,0.25)", flexShrink: 0,
                        }}>
                            <Zap size={17} color="white" fill="white" />
                        </div>
                        <span style={{ fontSize: 17, fontWeight: 900, color: "#111827", letterSpacing: "-0.03em" }}>
                            Sandbox
                            <span style={{
                                background: "linear-gradient(to right, #FF3B8E, #8E44AD)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>Hub</span>
                        </span>
                    </div>
                    {isAdmin && !badge && (
                        <span style={{
                            display: "flex", alignItems: "center", gap: 5,
                            fontSize: 10, fontWeight: 900, padding: "3px 10px", borderRadius: 999,
                            background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.25)", color: "#FF3B8E",
                        }}>
                            <ShieldCheck size={11} /> ADMIN
                        </span>
                    )}
                    {badge && (
                        <span style={{
                            display: "flex", alignItems: "center", gap: 5,
                            fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                            background: "rgba(255,59,142,0.1)", border: "1px solid rgba(255,59,142,0.25)", color: "#FF3B8E",
                        }}>
                            {badgeIcon} {badge}
                        </span>
                    )}
                </div>

                {/* RIGHT — Desktop */}
                <div className="nb-desktop">
                    {showDashboardLinks && (
                        <>
                            {/* ── DASHBOARD BUTTON (NEW) ── */}
                            <button className="nb-btn" onClick={() => navigate("/dashboard")}>
                                <LayoutDashboard size={13} /> DASHBOARD
                            </button>

                            <button className="nb-btn-primary" onClick={onAddBalance}>
                                <Plus size={13} /> ADD BALANCE
                            </button>
                            <button className="nb-btn" onClick={() => navigate("/history")}>
                                <History size={13} /> HISTORY
                            </button>
                            <button className="nb-btn" onClick={() => navigate("/payments")}>
                                <CreditCard size={13} /> PAYMENTS
                            </button>
                            <button
                                onClick={() => navigate("/profile")}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "6px 12px", borderRadius: 999,
                                    border: "1px solid rgba(0,0,0,0.08)", background: "white",
                                    cursor: "pointer", transition: "all 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,59,142,0.3)"}
                                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"}
                            >
                                {storedUser?.avatar
                                    ? <img src={storedUser.avatar} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} alt="" />
                                    : <div style={{
                                        width: 24, height: 24, borderRadius: "50%",
                                        background: "linear-gradient(135deg, rgba(255,59,142,0.15), rgba(142,68,173,0.15))",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                      }}>
                                        <User size={12} color="#FF3B8E" />
                                      </div>
                                }
                                <div style={{ textAlign: "left" }}>
                                    <p style={{ fontSize: 12, fontWeight: 900, color: "#111827", margin: 0, lineHeight: 1.2 }}>{storedUser?.name}</p>
                                    <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, textTransform: "capitalize" }}>{storedUser?.role}</p>
                                </div>
                            </button>
                        </>
                    )}
                    {showAdminLinks && (
                        <>
                            <button className="nb-btn" onClick={() => navigate("/history")}><History size={13} /> HISTORY</button>
                            <button className="nb-btn" onClick={() => navigate("/payments")}><CreditCard size={13} /> PAYMENTS</button>
                        </>
                    )}
                    {rightContent}
                    {showLogout && (
                        <button className="nb-btn nb-btn-logout" onClick={handleLogout}>
                            <LogOut size={13} /> LOGOUT
                        </button>
                    )}
                </div>

                {/* RIGHT — Mobile hamburger */}
                <button
                    className="nb-hamburger"
                    onClick={() => setMenuOpen(o => !o)}
                    style={{
                        color: menuOpen ? "#FF3B8E" : "#64748b",
                        borderColor: menuOpen ? "rgba(255,59,142,0.3)" : undefined,
                        background: menuOpen ? "rgba(255,59,142,0.06)" : "white",
                    }}
                >
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </nav>

            {/* ── FULL-WIDTH MOBILE DRAWER ── */}
            {menuOpen && (
                <>
                    {/* Dim overlay — click to close */}
                    <div className="nb-overlay" onClick={() => setMenuOpen(false)} />

                    {/* Drawer panel */}
                    <div className="nb-drawer">

                        {/* User info */}
                        {storedUser && (
                            <div className="nb-dr-user">
                                {storedUser?.avatar
                                    ? <img src={storedUser.avatar} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} alt="" />
                                    : <div style={{
                                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                        background: "linear-gradient(135deg, rgba(255,59,142,0.12), rgba(142,68,173,0.12))",
                                        border: "1px solid rgba(255,59,142,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                      }}>
                                        <span style={{ fontSize: 15, fontWeight: 900, color: "#FF3B8E" }}>{initials}</span>
                                      </div>
                                }
                                <div>
                                    <p style={{ fontSize: 15, fontWeight: 900, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>{storedUser?.name}</p>
                                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", textTransform: "capitalize", fontWeight: 600 }}>{storedUser?.role}</p>
                                </div>
                            </div>
                        )}

                        {/* Dashboard links */}
                        {showDashboardLinks && (
                            <>
                                {/* ── DASHBOARD BUTTON (NEW) ── */}
                                <button className="nb-dr-item" onClick={() => go("/dashboard")}>
                                    <div className="nb-dr-icon"><LayoutDashboard size={17} /></div>
                                    <div>
                                        <div className="nb-dr-label">Dashboard</div>
                                        <div className="nb-dr-sublabel">Go to your sandbox</div>
                                    </div>
                                </button>

                                <button className="nb-dr-item nb-dr-item-primary" onClick={() => { setMenuOpen(false); onAddBalance?.(); }}>
                                    <div className="nb-dr-icon nb-dr-icon-primary"><Plus size={17} /></div>
                                    <div>
                                        <div className="nb-dr-label">Add Balance</div>
                                        <div className="nb-dr-sublabel">Top up your wallet</div>
                                    </div>
                                </button>
                                <button className="nb-dr-item" onClick={() => go("/history")}>
                                    <div className="nb-dr-icon"><History size={17} /></div>
                                    <div>
                                        <div className="nb-dr-label">History</div>
                                        <div className="nb-dr-sublabel">View your API call log</div>
                                    </div>
                                </button>
                                <button className="nb-dr-item" onClick={() => go("/payments")}>
                                    <div className="nb-dr-icon"><CreditCard size={17} /></div>
                                    <div>
                                        <div className="nb-dr-label">Payments</div>
                                        <div className="nb-dr-sublabel">Transaction history</div>
                                    </div>
                                </button>
                                <button className="nb-dr-item" onClick={() => go("/profile")}>
                                    <div className="nb-dr-icon"><User size={17} /></div>
                                    <div>
                                        <div className="nb-dr-label">Profile</div>
                                        <div className="nb-dr-sublabel">Manage your account</div>
                                    </div>
                                </button>
                            </>
                        )}

                        {/* Admin links */}
                        {showAdminLinks && (
                            <>
                                <button className="nb-dr-item" onClick={() => go("/history")}>
                                    <div className="nb-dr-icon"><History size={17} /></div>
                                    <div>
                                        <div className="nb-dr-label">History</div>
                                        <div className="nb-dr-sublabel">View all API calls</div>
                                    </div>
                                </button>
                                <button className="nb-dr-item" onClick={() => go("/payments")}>
                                    <div className="nb-dr-icon"><CreditCard size={17} /></div>
                                    <div>
                                        <div className="nb-dr-label">Payments</div>
                                        <div className="nb-dr-sublabel">All transactions</div>
                                    </div>
                                </button>
                            </>
                        )}

                        {/* Custom right content */}
                        {rightContent && (
                            <div style={{ padding: "8px 20px" }}>{rightContent}</div>
                        )}

                        {/* Logout */}
                        {showLogout && (
                            <div className="nb-dr-footer">
                                <div className="nb-dr-divider" />
                                <button className="nb-dr-item nb-dr-item-logout" onClick={handleLogout}>
                                    <div className="nb-dr-icon"><LogOut size={17} /></div>
                                    <div>
                                        <div className="nb-dr-label">Logout</div>
                                        <div className="nb-dr-sublabel">Sign out of your account</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
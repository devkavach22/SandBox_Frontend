/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Wallet, Terminal, BarChart3, ChevronRight } from "lucide-react";

const TYPING_WORDS = ["Refined & Fluid.", "Built for Devs.", "Fast & Scalable.", "Pay Per Request."];

export default function LandingPage() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [typedText, setTypedText] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const current = TYPING_WORDS[wordIndex];
        let timeout;
        if (!isDeleting && typedText.length < current.length) {
            timeout = setTimeout(() => setTypedText(current.slice(0, typedText.length + 1)), 130);
        } else if (!isDeleting && typedText.length === current.length) {
            timeout = setTimeout(() => setIsDeleting(true), 2800);
        } else if (isDeleting && typedText.length > 0) {
            timeout = setTimeout(() => setTypedText(current.slice(0, typedText.length - 1)), 70);
        } else if (isDeleting && typedText.length === 0) {
            setIsDeleting(false);
            setWordIndex((i) => (i + 1) % TYPING_WORDS.length);
        }
        return () => clearTimeout(timeout);
    }, [typedText, isDeleting, wordIndex]);

    useEffect(() => {
        const interval = setInterval(() => setShowCursor(c => !c), 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);
        const particles = Array.from({ length: 40 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            r: Math.random() * 4 + 2,
        }));
        let animId;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 59, 142, 0.2)";
                ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#F8F7FF] text-slate-700 font-sans relative overflow-x-hidden">

            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/40 blur-[120px] rounded-full z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/40 blur-[120px] rounded-full z-0" />
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* NAV */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/[0.06] backdrop-blur-3xl bg-white/70">
                <div className="flex justify-between items-center px-6 md:px-16 py-4">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
                        <div className="w-9 h-9 bg-gradient-to-br from-[#FF3B8E] to-[#8E44AD] rounded-xl flex items-center justify-center shadow-md shadow-pink-200 transition-transform group-hover:rotate-6">
                            <Zap size={20} className="text-white fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">
                            Sandbox<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#8E44AD]">Hub</span>
                        </span>
                    </div>

                    <div className="hidden md:flex gap-4 items-center">
                        <button onClick={() => navigate("/login")} className="text-sm font-bold text-white px-6 py-2.5 rounded-full transition-all active:scale-95 shadow-md shadow-pink-200" style={{ background: "#FF3B8E" }}>
                            Login
                        </button>
                        <button onClick={() => navigate("/register")} className="px-6 py-2.5 rounded-full text-white text-sm font-bold transition-all active:scale-95 shadow-md shadow-violet-200" style={{ background: "#8E44AD" }}>
                            Get Started
                        </button>
                    </div>

                    <button className="md:hidden text-slate-600 p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden overflow-hidden border-t border-black/5 bg-white/90 backdrop-blur-3xl"
                        >
                            <div className="flex flex-col gap-3 px-6 py-5">
                                <button onClick={() => { navigate("/login"); setIsMenuOpen(false); }} className="w-full text-sm font-bold text-white py-3 rounded-xl transition-all active:scale-95" style={{ background: "#FF3B8E" }}>Login</button>
                                <button onClick={() => { navigate("/register"); setIsMenuOpen(false); }} className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all active:scale-95" style={{ background: "#8E44AD" }}>Get Started</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* MAIN */}
            <div className="relative z-10 max-w-[1400px] mx-auto pt-32 pb-20 px-8">

                {/* HERO */}
                <section className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-pink-100 border border-pink-300 text-[#c0185e] font-bold text-xs px-5 py-1.5 rounded-full mb-6 uppercase tracking-widest"
                    >
                        ✨ The Next-Gen API Protocol
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-8 text-gray-900">
                        Universal API Layer
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] via-[#D946EF] to-[#8B5CF6] inline-flex items-center">
                            {typedText}
                            <span style={{ opacity: showCursor ? 1 : 0, color: "#FF3B8E", marginLeft: "2px", fontWeight: 300, fontSize: "0.85em", lineHeight: 1 }}>|</span>
                        </span>
                    </h1>

                    <p className="max-w-2xl text-slate-500 text-lg md:text-xl leading-relaxed mb-10 font-medium">
                        Connect, Scale, and Build. Pay only for what you execute with our
                        <span className="text-gray-900 font-semibold"> sub-penny </span>
                        micro-billing wallet.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-6 sm:px-0">
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 sm:px-10 rounded-xl sm:rounded-full bg-gradient-to-r from-[#FF3B8E] to-[#8E44AD] text-white font-extrabold text-base shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all active:scale-95">
                            Explore APIs <ChevronRight size={20} />
                        </button>
                        <button className="w-full sm:w-auto flex items-center justify-center py-4 sm:px-10 rounded-xl sm:rounded-full border border-violet-200 bg-white text-gray-700 font-bold text-base hover:bg-violet-50 transition-all shadow-sm active:scale-95">
                            Whitepaper
                        </button>
                    </div>
                </section>

                {/* SECTION LABEL */}
                <div className="mt-28 mb-12 flex flex-col items-center text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FF3B8E] bg-pink-50 border border-pink-200 px-4 py-1 rounded-full mb-4">What We Offer</span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Everything you need to build faster</h2>
                    <p className="text-slate-500 mt-3 max-w-xl text-base leading-relaxed">
                        From hyper-fast connections to granular billing — SandboxHub gives your team superpowers without the enterprise price tag.
                    </p>
                </div>

                {/* FEATURE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12 + 0.2 }}
                            className="group relative rounded-3xl cursor-pointer"
                            style={{ perspective: "1000px" }}
                        >
                            <div
                                className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"
                                style={{ background: `linear-gradient(135deg, ${f.glowFrom}, ${f.glowTo})` }}
                            />

                            <div className="relative flex flex-col gap-5 p-8 md:p-10 border border-pink-100 rounded-3xl bg-white group-hover:border-transparent transition-all duration-300 shadow-sm group-hover:shadow-2xl h-full overflow-hidden">

                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl"
                                    style={{ background: `linear-gradient(145deg, ${f.innerBg} 0%, #ffffff 60%)` }}
                                />

                                {/* Top: number + icon + badge */}
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl font-black text-pink-100 group-hover:text-pink-200 transition-colors select-none leading-none">
                                            0{i + 1}
                                        </span>
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shrink-0"
                                            style={{ background: f.iconBg, borderColor: f.iconBorder }}
                                        >
                                            <span style={{ color: f.iconColor }}>{f.icon}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full transition-all duration-300 group-hover:shadow-sm" style={{ background: f.badgeBg, color: f.badgeColor }}>
                                        {f.badge}
                                    </span>
                                </div>

                                {/* Title + desc */}
                                <div className="relative">
                                    <h3 className="text-gray-900 font-extrabold text-xl tracking-tight mb-2 group-hover:text-gray-950 transition-colors">
                                        {f.title}
                                    </h3>
                                    <p className="text-slate-500 text-lg leading-relaxed group-hover:text-slate-600 transition-colors">
                                        {f.desc}
                                    </p>
                                </div>

                                {/* Bullets */}
                                <div className="relative flex flex-wrap gap-2">
                                    {f.bullets.map((b) => (
                                        <span key={b} className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full group-hover:border-slate-200 group-hover:bg-white transition-all">
                                            {b}
                                        </span>
                                    ))}
                                </div>

                                {/* Bottom: stat + try it button */}
                                <div className="relative flex items-center justify-between pt-4 mt-auto border-t border-pink-50 group-hover:border-pink-100 transition-colors">
                                    <div>
                                        <p className="text-2xl font-black text-gray-900">{f.stat}</p>
                                        <p className="text-xs text-slate-400 font-medium">{f.statLabel}</p>
                                    </div>

                                    <button
                                        className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95"
                                        style={{
                                            background: f.badgeBg,
                                            color: f.badgeColor,
                                            border: `1px solid ${f.iconBorder}`,
                                        }}
                                    >
                                        Try it yourself
                                    </button>
                                </div>

                                {/* Bottom accent line */}
                                <div
                                    className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 rounded-full"
                                    style={{ background: `linear-gradient(90deg, ${f.glowFrom}, ${f.glowTo})` }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&display=swap');
                body { font-family: 'Urbanist', sans-serif; letter-spacing: -0.02em; }
            `}</style>
        </div>
    );
}

const features = [
    {
        icon: <Zap size={26} />,
        title: "Hyper-Connect",
        badge: "Core",
        badgeBg: "#FFF0F6", badgeColor: "#c0185e",
        iconBg: "linear-gradient(135deg,#FFF0F6,#F3F0FF)", iconBorder: "#FECDD3", iconColor: "#FF3B8E",
        glowFrom: "#FF3B8E33", glowTo: "#F9A8D433",
        innerBg: "#FFF5F8",
        desc: "Instantly link your app to hundreds of micro-service endpoints with zero config. Our intelligent routing engine detects latency in real time and automatically switches to the fastest available node — so your users never wait.",
        bullets: ["Auto-routing", "Zero downtime", "500+ endpoints", "WebSocket support"],
        stat: "99.99%", statLabel: "Uptime guarantee",
    },
    {
        icon: <Wallet size={26} />,
        title: "Precision Pay",
        badge: "Billing",
        badgeBg: "#F3F0FF", badgeColor: "#6D28D9",
        iconBg: "linear-gradient(135deg,#F3F0FF,#EDE9FE)", iconBorder: "#DDD6FE", iconColor: "#8E44AD",
        glowFrom: "#8E44AD33", glowTo: "#A78BFA33",
        innerBg: "#F8F5FF",
        desc: "No more overpriced subscriptions. With our micro-billing engine you pay down to the 6th decimal per API request — meaning a slow month costs you almost nothing. Wallets auto-top-up and spending caps keep you in full control.",
        bullets: ["6-decimal billing", "Auto top-up", "Spending caps", "Invoice export"],
        stat: "₹ 10", statLabel: "Minimum charge",
    },
    {
        icon: <Terminal size={26} />,
        title: "Dev Studio",
        badge: "Tools",
        badgeBg: "#F0FFF6", badgeColor: "#0F6E56",
        iconBg: "linear-gradient(135deg,#F0FFF6,#D1FAE5)", iconBorder: "#A7F3D0", iconColor: "#059669",
        glowFrom: "#10B98133", glowTo: "#34D39933",
        innerBg: "#F2FFF8",
        desc: "A world-class API testing suite built directly into your dashboard. Write, debug, and replay requests without leaving the browser. Collaborative workspaces let your whole team share collections, environments, and test runs instantly.",
        bullets: ["Live request editor", "Env variables", "Team workspaces", "Request history"],
        stat: "10x", statLabel: "Faster debugging",
    },
    {
        icon: <BarChart3 size={26} />,
        title: "Flow Metrics",
        badge: "Analytics",
        badgeBg: "#FFF7ED", badgeColor: "#854F0B",
        iconBg: "linear-gradient(135deg,#FFF7ED,#FEF3C7)", iconBorder: "#FDE68A", iconColor: "#D97706",
        glowFrom: "#F59E0B33", glowTo: "#FCD34D33",
        innerBg: "#FFFBF0",
        desc: "Observe every penny and every packet with beautiful real-time analytics. Drill into per-endpoint latency, error rates, and cost breakdowns — then set smart alerts so issues get flagged before your users even notice.",
        bullets: ["Real-time charts", "Cost breakdown", "Smart alerts", "CSV export"],
        stat: "<50ms", statLabel: "Dashboard refresh rate",
    },
];
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Wallet, Terminal, BarChart3, ChevronRight } from "lucide-react";

export default function LandingPage() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            r: Math.random() * 2 + 0.5,
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
                ctx.fillStyle = "rgba(167, 139, 250, 0.2)";
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
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans relative overflow-x-hidden">
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full z-0" />
            
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-3xl bg-black/40">
                <div className="flex justify-between items-center px-8 md:px-16 py-5">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF3B8E] to-[#8E44AD] rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 transition-transform group-hover:rotate-6">
                            <Zap size={22} className="text-white fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Sandbox<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] to-[#A29BFE]">Hub</span></span>
                    </div>

                    <div className="hidden md:flex gap-8 items-center font-medium">
                        {/* Login button — pink bg */}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-sm font-bold text-white px-6 py-2.5 rounded-full transition-all active:scale-95"
                            style={{ background: "#FF3B8E" }}
                        >
                            Login
                        </button>

                        {/* Get Started button — white bg */}
                        <button
                            onClick={() => navigate("/register")}
                            className="px-6 py-2.5 rounded-full text-black text-sm font-bold hover:bg-slate-100 transition-all shadow-xl active:scale-95"
                            style={{ background: "#FFFFFF" }}
                        >
                            Get Started
                        </button>
                    </div>

                    <button className="md:hidden text-slate-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            <div className="relative z-10 max-w-6xl mx-auto pt-32 pb-20 px-6">
                <section className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 text-[#FF3B8E] font-medium text-[11px] px-4 py-1 rounded-full mb-6 backdrop-blur-md uppercase tracking-widest"
                    >
                        ✨ The Next-Gen API Protocol
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 text-white drop-shadow-2xl">
                        Universal <span style={{ fontFamily: "'Playfair Display', serif" }} className="italic font-normal text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mr-2">API</span> Layer<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3B8E] via-[#D946EF] to-[#8B5CF6] animate-gradient-x">
                           Refined & Fluid.
                        </span>
                    </h1>

                    <p className="max-w-2xl text-slate-400 text-lg md:text-xl leading-relaxed mb-10 font-medium">
                        Connect, Scale, and Build. Pay only for what you execute with our 
                        <span className="text-white"> sub-penny </span> micro-billing wallet.
                    </p>

                    <div className="flex gap-4 flex-wrap justify-center">
                        <button className="px-10 py-4 rounded-full bg-gradient-to-r from-[#FF3B8E] to-[#8E44AD] text-white font-extrabold text-base flex items-center gap-2">
                            Explore APIs <ChevronRight size={20} />
                        </button>
                        <button className="px-10 py-4 rounded-full border border-white/10 bg-white/5 text-white font-bold text-base hover:bg-white/10 transition-all backdrop-blur-md">
                            Whitepaper
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-24">
                    {features.map((f) => (
                        <div key={f.title} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-violet-500/30 transition-all duration-500 group relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-violet-400 mb-6 bg-violet-400/10 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2 tracking-tight uppercase text-sm">
                                {f.title}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-400 transition-colors">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;900&family=Playfair+Display:ital@1&display=swap');
                body { font-family: 'Urbanist', sans-serif; letter-spacing: -0.02em; }
                
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-move 5s ease infinite;
                }

                @keyframes gradient-move {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}

const features = [
    { icon: <Zap size={22} />, title: "Hyper-Connect", desc: "Instantly link your app to hundreds of micro-service endpoints." },
    { icon: <Wallet size={22} />, title: "Precision Pay", desc: "No more subscriptions. Pay down to the 6th decimal per request." },
    { icon: <Terminal size={22} />, title: "Dev Studio", desc: "A world-class testing suite built directly into your dashboard." },
    { icon: <BarChart3 size={22} />, title: "Flow Metrics", desc: "Observe every penny and packet with beautiful real-time analytics." },
];



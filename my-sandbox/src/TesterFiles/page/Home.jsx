/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Wallet, Terminal, BarChart3, ChevronRight } from "lucide-react";

export default function Home() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Background Particles Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const particles = Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.5 + 0.5,
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
                ctx.fillStyle = "rgba(0,255,180,0.3)";
                ctx.fill();
            });
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach((b) => {
                    const d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (d < 120) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(0,255,180,${0.1 * (1 - d / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        },
    };

    return (
        <div className="min-h-screen bg-[#020b08] text-[#e8fff6] font-sans relative overflow-x-hidden">
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#0d3324] backdrop-blur-2xl bg-[#020b08]/85">
                <div className="flex justify-between items-center px-8 md:px-16 py-4">
                    <div className="font-mono text-lg font-bold tracking-tighter cursor-pointer flex items-center gap-2.5" onClick={() => navigate("/")}>
                        <div className="w-8 h-8 bg-[#00ffb4] rounded flex items-center justify-center shadow-[0_0_15px_rgba(0,255,180,0.3)]">
                            <Zap size={18} className="text-[#020b08] fill-current" />
                        </div>
                        <span className="text-lg">Sandbox<span className="text-[#00ffb4]">Hub</span></span>
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden md:flex gap-6 items-center">
                        <button onClick={() => navigate("/login")} className="px-5 py-2 rounded-xl bg-[#00ffb4] border border-[#00ffb4] text-black text-sm font-bold hover:bg-[#00d699] transition-all">
                            Login
                        </button>
                        <button onClick={() => navigate("/register")} className="px-6 py-2 rounded-xl bg-[#00ffb4] border border-[#00ffb4] text-black text-sm font-bold hover:bg-[#00d699] transition-all">
                            Get Started
                        </button>
                    </div>

                    <button className="md:hidden text-[#00ffb4]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* MOBILE MENU CONTENT - Updated to Single Line */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-[#0d3324] bg-[#020b08] px-6 py-4 flex flex-row gap-3"
                        >
                            <button 
                                onClick={() => { navigate("/login"); setIsMenuOpen(false); }} 
                                className="flex-1 py-2.5 rounded-xl bg-[#00ffb4] text-black text-xs font-bold text-center"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => { navigate("/register"); setIsMenuOpen(false); }} 
                                className="flex-1 py-2.5 rounded-xl border border-[#00ffb4] text-[#00ffb4] text-xs font-bold text-center"
                            >
                                Get Started
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* MAIN CONTENT */}
            <div className="relative z-10 max-w-6xl mx-auto pt-36 pb-20">
                <section className="flex flex-col items-center text-center px-6 mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-[#00ffb4]/10 border border-[#00ffb4]/30 text-[#00ffb4] font-mono text-[10px] px-3 py-1 rounded-full mb-6"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00ffb4] animate-pulse"></span>
                        V2.0 Now Live: Pay-per-use APIs
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight mb-6">
                        The Developer's<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffb4] to-[#00faeb]">Micro-Wallet</span> API Layer.
                    </h1>

                    <p className="max-w-xl text-[#8eb0a0] text-base md:text-lg leading-relaxed mb-10">
                        Stop paying for expensive monthly tiers. Integrate professional APIs
                        and only pay <span className="text-[#e8fff6] font-medium">fractional pennies</span> per request.
                    </p>

                    <div className="flex gap-4 flex-wrap justify-center">
                        <button className="px-8 py-3 rounded-lg bg-[#00ffb4] text-[#020b08] font-bold text-sm hover:bg-[#00d699] transition-all flex items-center gap-2">
                            Start Building Free <ChevronRight size={18} />
                        </button>
                        <button className="px-8 py-3 rounded-lg border border-[#0d3324] bg-white/5 font-bold text-sm hover:bg-white/10 transition-all backdrop-blur-md">
                            Documentation
                        </button>
                    </div>
                </section>

                <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 max-w-5xl mx-auto mt-8"
                >
                    {features.map((f, idx) => (
                        <motion.div
                            key={f.title}
                            variants={cardVariants}
                            whileHover={{
                                y: -5,
                                borderColor: "rgba(0,255,180,0.4)",
                                backgroundColor: "rgba(13,51,36,0.2)"
                            }}
                            className="group bg-[#071a12]/30 border border-[#0d3324] rounded-lg p-5 transition-colors duration-300"
                        >
                            <div className="text-[#00ffb4] mb-3 bg-[#00ffb4]/10 w-9 h-9 flex items-center justify-center rounded-md border border-[#00ffb4]/10 group-hover:bg-[#00ffb4] group-hover:text-[#020b08] transition-all duration-300">
                                {f.icon}
                            </div>
                            <h3 className="font-bold text-sm mb-1.5 tracking-tight group-hover:text-[#00ffb4] transition-colors">
                                {f.title}
                            </h3>
                            <p className="text-[#5a8a70] text-[11px] leading-relaxed font-medium line-clamp-2 group-hover:text-[#8eb0a0]">
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.section>
            </div>
        </div>
    );
}

const features = [
    { icon: <Zap size={16} />, title: "Instant APIs", desc: "Production-ready endpoints for SMS, OTP, and Global Maps." },
    { icon: <Wallet size={16} />, title: "Micro-Billing", desc: "Automated wallet deductions with zero hidden fees." },
    { icon: <Terminal size={16} />, title: "Live Console", desc: "Debug and test headers in real-time within your browser." },
    { icon: <BarChart3 size={16} />, title: "Insights", desc: "Detailed breakdown of cost-per-endpoint and response times." },
];
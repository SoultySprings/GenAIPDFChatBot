import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, FileText, Database, Radio, CheckCircle2, Sparkles, Zap } from 'lucide-react';

const LoadingScreen = ({ theme = 'dark' }) => {
    const [step, setStep] = useState(0);
    const steps = [
        { text: "Analyzing Structure", icon: FileText },
        { text: "Vectorizing Content", icon: Database },
        { text: "Optimizing Pathways", icon: BrainCircuit },
        { text: "Syncing Knowledge", icon: Radio },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    // Theme-based colors
    const isLight = theme === 'light';
    const isCyber = theme === 'cyberpunk';

    const bgColor = isLight ? "bg-white/90" : isCyber ? "bg-black/90" : "bg-[#09090b]/90";
    const borderColor = isLight ? "border-zinc-200" : "border-white/5";
    const textColor = isLight ? "text-zinc-800" : "text-zinc-100";
    const subTextColor = isLight ? "text-zinc-500" : "text-zinc-500";
    const iconContainerColor = isLight ? "bg-white border-zinc-200" : "bg-gradient-to-tr from-zinc-900 to-zinc-800 border-white/5";
    const glowColor = isLight ? "bg-indigo-500/10" : isCyber ? "bg-fuchsia-500/20" : "bg-indigo-500/20";
    const accentColor = isLight ? "text-indigo-600" : isCyber ? "text-fuchsia-400" : "text-zinc-200";
    const waveGradient = isLight ? "url(#light-gradient)" : isCyber ? "url(#cyber-gradient)" : "url(#dark-gradient)";

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center ${bgColor} backdrop-blur-xl transition-colors duration-500`}>
            <div className="relative w-full max-w-sm p-0 mx-auto flex flex-col items-center">

                {/* Central Minimalist Icon */}
                <div className="relative mb-8 group">
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute inset-0 ${glowColor} blur-3xl rounded-full`}
                    />
                    <div className={`relative w-24 h-24 rounded-3xl ${iconContainerColor} border shadow-2xl flex items-center justify-center ring-1 ring-inset ${isLight ? 'ring-zinc-100 shadow-zinc-200/50' : 'ring-white/10'} transition-all duration-500`}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, ease: "linear", repeat: Infinity }}
                            className={`absolute inset-0 rounded-3xl border ${isLight ? 'border-zinc-100 border-t-indigo-500/40' : 'border-white/5 border-t-indigo-500/30'}`}
                        />
                        <BrainCircuit size={40} className={accentColor} strokeWidth={1.5} />
                        <motion.div
                            className="absolute -top-1.5 -right-1.5"
                            animate={{ scale: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        >
                            <Sparkles size={16} className={isCyber ? "text-fuchsia-400 fill-fuchsia-400" : "text-indigo-400 fill-indigo-400"} />
                        </motion.div>
                    </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2 mb-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-xl font-bold tracking-tight ${textColor}`}
                    >
                        Ingesting Knowledge
                    </motion.h2>
                    <p className={`${subTextColor} text-xs font-semibold uppercase tracking-widest`}>
                        {steps[step].text}...
                    </p>
                </div>

                {/* Minimalist Progress Wave */}
                <div className={`relative h-20 w-full max-w-[320px] overflow-hidden rounded-2xl border ${borderColor} ${isLight ? 'bg-zinc-50' : 'bg-zinc-900/50'} flex items-center justify-center`}>

                    {/* Background Grid */}
                    <div className={`absolute inset-0 bg-[radial-gradient(${isLight ? '#e4e4e7' : '#27272a'}_1px,transparent_1px)] [background-size:16px_16px] opacity-20`} />

                    {/* Step Indicators (Subtle) */}
                    <div className="relative z-10 flex gap-6">
                        {steps.map((s, i) => {
                            const isActive = i === step;
                            const isDone = i < step;

                            let stepColorClass = isLight ? 'text-zinc-400' : 'text-zinc-700';
                            if (isActive) stepColorClass = isCyber ? 'bg-fuchsia-500/10 text-fuchsia-400 ring-fuchsia-500/30' : 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/30';
                            if (isDone) stepColorClass = isLight ? 'text-zinc-400' : 'text-zinc-500';

                            return (
                                <motion.div
                                    key={i}
                                    className="relative group flex flex-col items-center gap-2"
                                    animate={{ scale: isActive ? 1.1 : 1 }}
                                >
                                    <div className={`p-2.5 rounded-xl transition-all duration-500 ${isActive ? `ring-1 ${isLight ? 'bg-white shadow-sm' : ''} shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]` : ''} ${stepColorClass}`}>
                                        {isDone ? <CheckCircle2 size={16} /> : <s.icon size={16} strokeWidth={isActive ? 2 : 1.5} />}
                                    </div>
                                    {isActive && (
                                        <div className={`absolute inset-x-0 -bottom-3 h-0.5 blur-[2px] rounded-full ${isCyber ? 'bg-fuchsia-500/50' : 'bg-indigo-500/50'}`} />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Only show wave at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-10 opacity-30 pointer-events-none">
                        <svg className="w-full h-full" preserveAspectRatio="none">
                            <motion.path
                                d="M0,20 Q20,10 40,20 T80,20 T120,20 T160,20 T200,20 T240,20 T280,20 T320,20 T360,20 T400,20"
                                fill="none"
                                stroke={waveGradient}
                                strokeWidth="2"
                                animate={{
                                    d: [
                                        "M0,20 Q20,15 40,20 T80,20 T120,20 T160,20 T200,20 T240,20 T280,20 T320,20 T360,20 T400,20",
                                        "M0,20 Q20,25 40,20 T80,20 T120,20 T160,20 T200,20 T240,20 T280,20 T320,20 T360,20 T400,20",
                                        "M0,20 Q20,15 40,20 T80,20 T120,20 T160,20 T200,20 T240,20 T280,20 T320,20 T360,20 T400,20"
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            <defs>
                                <linearGradient id="light-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="dark-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="cyber-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#d946ef" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#d946ef" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;

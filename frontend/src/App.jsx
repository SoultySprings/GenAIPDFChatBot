
import React, { createContext, useContext, useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Zap } from 'lucide-react';

export const ThemeContext = createContext();

const Particle = ({ x, y, size, theme }) => {
  const [isPresent, setIsPresent] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsPresent(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isPresent) return null;

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0, x, y }}
      animate={{
        opacity: 0,
        scale: 1,
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`absolute rounded-full pointer-events-none ${theme === 'cyberpunk' ? 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)]' :
        theme === 'light' ? 'bg-indigo-400' : 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]'
        }`}
      style={{ width: size, height: size, zIndex: 9999 }}
    />
  );
};

const MouseParticles = ({ theme }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Throttle creation for performance
      if (Math.random() > 0.4) return;

      const newParticle = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 6 + 3
      };

      setParticles(prev => {
        const sliced = prev.slice(-25); // Limit max particles
        return [...sliced, newParticle];
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} size={p.size} theme={theme} />
      ))}
    </div>
  );
};

const Background = ({ theme }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base Gradient */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'light' ? 'bg-indigo-50' :
        theme === 'cyberpunk' ? 'bg-[#050014]' : 'bg-[#0f172a]'
        }`} />

      {/* Moving Orbs */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.2, 0.9, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className={`absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-40 mix-blend-screen transition-colors duration-1000 ${theme === 'light' ? 'bg-purple-300' : 'bg-purple-900'
          }`}
      />
      <motion.div
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 100, -50, 0],
          scale: [1, 1.1, 0.8, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
        className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-40 mix-blend-screen transition-colors duration-1000 ${theme === 'light' ? 'bg-blue-300' :
          theme === 'cyberpunk' ? 'bg-fuchsia-900' : 'bg-blue-900'
          }`}
      />

      {/* Grid overlay for Cyberpunk */}
      {theme === 'cyberpunk' && (
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      )}
    </div>
  );
};

const ThemeToggle = ({ theme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);

  const modes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'cyberpunk', icon: Zap, label: 'Neon' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeMode = modes.find(m => m.id === theme) || modes[0];

  return (
    <div className="absolute top-6 right-6 z-50" ref={containerRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border shadow-lg transition-all duration-300 ${theme === 'light' ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white' :
            theme === 'cyberpunk' ? 'bg-black/40 border-fuchsia-500/30 text-fuchsia-400 hover:bg-black/60 shadow-[0_0_15px_rgba(217,70,239,0.3)]' :
              'bg-slate-800/80 border-white/10 text-gray-200 hover:bg-slate-800'
          }`}
      >
        <activeMode.icon size={18} fill={theme !== 'dark' ? "currentColor" : "none"} />
        <span className="text-sm font-semibold pr-1">{activeMode.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-36 rounded-xl border backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col p-1 ${theme === 'light' ? 'bg-white/90 border-gray-100' :
                theme === 'cyberpunk' ? 'bg-[#050505]/90 border-fuchsia-500/30' :
                  'bg-[#0f172a]/90 border-white/10'
              }`}
          >
            {modes.map((mode) => {
              const isActive = theme === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setTheme(mode.id);
                    setIsOpen(false);
                  }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                      ? (theme === 'light' ? 'bg-indigo-50 text-indigo-600' :
                        theme === 'cyberpunk' ? 'bg-fuchsia-500/20 text-fuchsia-400' :
                          'bg-white/10 text-white')
                      : (theme === 'light' ? 'text-gray-600 hover:bg-gray-50' :
                        'text-gray-400 hover:bg-white/5 hover:text-gray-200')
                    }`}
                >
                  <mode.icon size={16} className={isActive ? (theme === 'cyberpunk' ? "drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" : "") : ""} />
                  {mode.label}
                  {isActive && <motion.div layoutId="activeDot" className={`absolute right-3 w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-indigo-500' :
                      theme === 'cyberpunk' ? 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,1)]' :
                        'bg-blue-500'
                    }`} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'cyberpunk');

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`relative w-full h-screen overflow-hidden flex items-center justify-center transition-colors duration-500 font-outfit`}>
        <Background theme={theme} />
        <MouseParticles theme={theme} />
        <ThemeToggle theme={theme} setTheme={setTheme} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full h-full p-4 md:p-6"
        >
          <ChatInterface />
        </motion.div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;

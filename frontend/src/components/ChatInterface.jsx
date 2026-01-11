import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BrainCircuit, Bot, User, Trash2, AlertTriangle, MessageSquare, Plus, Menu, RefreshCw, Terminal, Upload, Database, FileText } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThemeContext } from '../App';
import LoadingScreen from './LoadingScreen';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Helper to format timestamps
const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ThinkingIndicator = ({ theme }) => (
    <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl w-fit mb-6 shadow-lg border backdrop-blur-md",
            theme === 'light' ? "bg-white/60 border-purple-100 text-purple-600" :
                theme === 'cyberpunk' ? "bg-purple-900/20 border-purple-500/30 text-purple-300 shadow-purple-900/10" :
                    "bg-slate-800/50 border-white/10 text-blue-300"
        )}
    >
        <div className="relative">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-current rounded-full opacity-30 border-t-transparent"
            />
        </div>
        <span className="text-sm font-medium tracking-wide">Neural Reasoning Active</span>
        <div className="flex space-x-1 ml-1">
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-current"
                />
            ))}
        </div>
    </motion.div>
);

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, theme, itemType }) => {
    if (!isOpen) return null;

    const titles = {
        msg: "Delete Message?",
        session: "Delete Conversation?",
        doc: "Delete Document?"
    };

    const descriptions = {
        msg: "The message will be lost.",
        session: "The entire chat history for this session will be permanently removed.",
        doc: "This file will be removed from your Knowledge Base."
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={cn(
                    "w-full max-w-sm p-6 rounded-2xl shadow-2xl border relative overflow-hidden",
                    theme === 'light' ? "bg-white border-gray-200" :
                        theme === 'cyberpunk' ? "bg-black/90 border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.3)]" :
                            "bg-slate-900 border-white/10"
                )}
            >
                {theme === 'cyberpunk' && (
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-600/20 blur-[50px] rounded-full pointer-events-none" />
                )}

                <div className="flex flex-col items-center text-center gap-4">
                    <div className={cn(
                        "p-3 rounded-full mb-2",
                        theme === 'light' ? "bg-red-50 text-red-500" : "bg-red-500/10 text-red-400"
                    )}>
                        <AlertTriangle size={32} />
                    </div>

                    <div>
                        <h3 className={cn("text-lg font-bold mb-1", theme === 'light' ? "text-gray-900" : "text-white")}>
                            {titles[itemType] || "Delete Item?"}
                        </h3>
                        <p className={cn("text-sm", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                            This action cannot be undone.
                            {descriptions[itemType]}
                        </p>
                    </div>

                    <div className="flex gap-3 w-full mt-2">
                        <button
                            onClick={onClose}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                                theme === 'light' ? "bg-gray-100 text-gray-700 hover:bg-gray-200" :
                                    "bg-white/5 text-gray-300 hover:bg-white/10"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:shadow-red-500/25",
                                "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                            )}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children, theme, maxWidth = "max-w-md" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={cn(
                    "w-full rounded-2xl shadow-2xl border relative overflow-hidden flex flex-col max-h-[80vh]",
                    maxWidth,
                    theme === 'light' ? "bg-white border-gray-200" :
                        theme === 'cyberpunk' ? "bg-black/90 border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.2)]" :
                            "bg-slate-900 border-white/10"
                )}
            >
                {/* Header */}
                <div className={cn(
                    "px-6 py-4 border-b flex items-center justify-between shrink-0",
                    theme === 'light' ? "border-gray-100 bg-gray-50/50" : "border-white/5 bg-white/5"
                )}>
                    <h3 className={cn("text-lg font-bold", theme === 'light' ? "text-gray-900" : "text-white")}>{title}</h3>
                    <button onClick={onClose} className={cn("p-1.5 rounded-lg transition-colors", theme === 'light' ? "hover:bg-gray-200 text-gray-500" : "hover:bg-white/10 text-gray-400")}>
                        <Plus size={20} className="rotate-45" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

// Sidebar Component
const Sidebar = ({ sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession, isOpen, toggleSidebar, theme, onOpenKB, onOpenLogs }) => {
    return (
        <motion.div
            initial={false}
            animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
            className={cn(
                "flex-shrink-0 h-full flex flex-col border-r transition-colors duration-500 relative z-30 overflow-hidden",
                theme === 'light' ? "bg-slate-50 border-slate-200" :
                    theme === 'cyberpunk' ? "bg-[#09090b] border-white/5" :
                        "bg-[#0F172A] border-white/5"
            )}
        >
            <div className="flex flex-col h-full w-[280px]">
                {/* Logo Area */}
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                            theme === 'light' ? "bg-indigo-600 text-white" :
                                theme === 'cyberpunk' ? "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]" :
                                    "bg-blue-600 text-white"
                        )}>
                            <Sparkles size={18} fill="currentColor" />
                        </div>
                        <span className={cn(
                            "font-bold text-lg tracking-tight drop-shadow-sm",
                            theme === 'light' ? "bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 drop-shadow-[0_1px_0_rgba(255,255,255,1)]" : "bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]"
                        )}>
                            Antigravity
                        </span>
                    </div>

                    <button
                        onClick={onNewChat}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border shadow-sm",
                            theme === 'light' ?
                                "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300" :
                                theme === 'cyberpunk' ?
                                    "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-fuchsia-500/50 hover:shadow-[0_0_10px_rgba(217,70,239,0.2)]" :
                                    "bg-white/5 border-white/5 text-gray-200 hover:bg-white/10"
                        )}
                    >
                        <Plus size={16} />
                        <span>New chat</span>
                    </button>
                </div>

                {/* Navigation Sections */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin">

                    {/* Section: General */}
                    <div>
                        <h3 className={cn(
                            "text-xs font-semibold px-2 mb-2 uppercase tracking-wider",
                            theme === 'light' ? "text-gray-400" : "text-gray-500"
                        )}>
                            Control Center
                        </h3>
                        <div className="space-y-0.5">
                            <button
                                onClick={onOpenKB}
                                className={cn("w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors text-left",
                                    theme === 'light' ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-white/5")}>
                                <BrainCircuit size={16} />
                                <span>Knowledge Base</span>
                            </button>
                            <button
                                onClick={onOpenLogs}
                                className={cn("w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors text-left",
                                    theme === 'light' ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-white/5")}>
                                <Terminal size={16} />
                                <span>System Logs</span>
                            </button>
                        </div>
                    </div>

                    {/* Section: Recent Chats */}
                    <div>
                        <h3 className={cn(
                            "text-xs font-semibold px-2 mb-2 uppercase tracking-wider",
                            theme === 'light' ? "text-gray-400" : "text-gray-500"
                        )}>
                            Recent Chats
                        </h3>
                        <div className="space-y-0.5">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => onSelectSession(session.id)}
                                    className={cn(
                                        "group flex items-center justify-between px-2 py-2 rounded-md text-sm cursor-pointer transition-all duration-200",
                                        session.id === currentSessionId ?
                                            (theme === 'light' ? "bg-gray-100 text-gray-900 font-medium" :
                                                theme === 'cyberpunk' ? "bg-fuchsia-500/10 text-fuchsia-300 border-l-2 border-fuchsia-500" :
                                                    "bg-white/10 text-white") :
                                            (theme === 'light' ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900" :
                                                "text-gray-400 hover:bg-white/5 hover:text-gray-200")
                                    )}
                                >
                                    <div className="flex items-center gap-2 truncate flex-1">
                                        <MessageSquare size={16} className={session.id === currentSessionId ? "opacity-100" : "opacity-50"} />
                                        <span className="truncate">
                                            {session.messages.length > 0 && session.messages[0].role === 'user'
                                                ? session.messages[0].content
                                                : "New Conversation"}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteSession(session);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 hover:text-red-500 text-gray-400 transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const Message = ({ message, theme, onDelete }) => {
    const isUser = message.role === 'user';
    const isError = message.error || (message.content && message.content.includes("cognitive batteries are drained"));

    // Custom renderers for ReactMarkdown
    const components = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <div className="rounded-xl overflow-hidden my-4 shadow-sm border border-black/5 relative group-code">
                    <div className={cn("flex items-center justify-between px-4 py-2 border-b backdrop-blur-md",
                        theme === 'light' ? "bg-gray-50/80 border-gray-200/50" : "bg-white/5 border-white/5")}>
                        <span className="text-xs font-mono tracking-wider uppercase flex items-center gap-2 opacity-70">
                            <Terminal size={12} className={theme === 'light' ? "text-gray-500" : "text-gray-400"} />
                            {match[1]}
                        </span>
                        <div className="flex gap-1.5 opacity-50 group-hover-code:opacity-100 transition-opacity">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        </div>
                    </div>
                    <SyntaxHighlighter
                        style={theme === 'light' ? oneLight : vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '1.5rem', background: theme === 'light' ? '#ffffff' : '#0f172a' }}
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code className={cn("px-1.5 py-0.5 rounded-md text-sm font-mono border",
                    theme === 'light' ? "bg-gray-100 text-gray-800 border-gray-200" : "bg-white/10 text-gray-200 border-white/10"
                )} {...props}>
                    {children}
                </code>
            );
        },
        h1: ({ node, ...props }) => <h1 className={cn("text-2xl font-bold mt-6 mb-3 border-b pb-2", theme === 'light' ? "text-gray-900 border-gray-200" : "text-white border-white/10")} {...props} />,
        h2: ({ node, ...props }) => <h2 className={cn("text-xl font-bold mt-5 mb-2", theme === 'light' ? "text-gray-800" : "text-white/90")} {...props} />,
        p: ({ node, ...props }) => <p className={cn("mb-4 last:mb-0 leading-7", theme === 'light' ? "text-gray-600" : "text-gray-300")} {...props} />,
        a: ({ node, ...props }) => <a className="text-indigo-500 hover:text-indigo-600 hover:underline underline-offset-4 transition-colors font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className={cn("border-l-4 pl-4 py-1 my-4 italic", theme === 'light' ? "border-gray-200 text-gray-500" : "border-white/20 text-gray-400")} {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
                "flex gap-4 mb-8 max-w-4xl mx-auto group",
                isUser ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar */}
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border self-start",
                isUser ?
                    (theme === 'light' ? "bg-white border-gray-200 text-gray-700" : "bg-white/10 border-white/10 text-white") :
                    (isError ? "bg-red-500/10 border-red-500/20 text-red-500" :
                        theme === 'light' ? "bg-indigo-600 text-white border-indigo-600" :
                            theme === 'cyberpunk' ? "bg-fuchsia-600 text-white border-fuchsia-500" : "bg-blue-600 text-white border-blue-500")
            )}>
                {isError ? <AlertTriangle size={14} /> : isUser ? <User size={14} /> : <Sparkles size={14} fill="currentColor" />}
            </div>

            <div className={cn("relative group/msg min-w-0 max-w-[85%]", isUser ? "items-end" : "items-start")}>
                {/* User Name / Bot Name */}
                <div className={cn("text-[10px] font-semibold uppercase tracking-wider mb-1 opacity-50 px-1",
                    isUser ? "text-right" : "text-left",
                    theme === 'light' ? "text-gray-500" : "text-gray-400"
                )}>
                    {isUser ? "You" : "Antigravity AI"}
                </div>

                <div className={cn(
                    "p-4 sm:p-5 rounded-2xl text-[15px] leading-7 shadow-sm border transition-all duration-200",
                    isUser ?
                        (theme === 'light' ? "bg-white border-gray-200 text-gray-900" :
                            "bg-white/10 border-white/10 text-white") :
                        (isError ?
                            (theme === 'light' ? "bg-red-50 border-red-100 text-red-900" : "bg-red-900/10 border-red-500/20 text-red-200") :
                            theme === 'light' ? "bg-gray-50 border-gray-200/60 text-gray-900" :
                                theme === 'cyberpunk' ? "bg-black/40 border-white/10 text-gray-100 backdrop-blur-md" :
                                    "bg-slate-800/50 border-white/5 text-gray-100 backdrop-blur-md")
                )}>
                    {/* Render content */}
                    {isError ? (
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className={cn("font-semibold text-sm", theme === 'light' ? "text-red-700" : "text-red-400")}>System Error</p>
                                <p className="text-sm opacity-90">{message.content}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="markdown-body">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}

                    {message.reasoning && !isError && (
                        <div className={cn(
                            "mt-4 pt-3 border-t text-xs",
                            theme === 'light' ? "border-gray-200/60" : "border-white/10"
                        )}>
                            <details className="group/details">
                                <summary className="cursor-pointer list-none flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity select-none font-medium">
                                    <BrainCircuit size={12} />
                                    <span>Process Log</span>
                                </summary>
                                <div className={cn("mt-2 pl-3 border-l-2 py-1 text-xs leading-relaxed opacity-80 font-mono",
                                    theme === 'light' ? "border-gray-200 text-gray-500" : "border-white/10 text-gray-400")}>
                                    {message.reasoning}
                                </div>
                            </details>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className={cn("absolute top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200 flex gap-2",
                    isUser ? "-left-8" : "-right-8"
                )}>
                    <button
                        onClick={() => onDelete(message)}
                        className={cn("p-1.5 rounded-md transition-colors",
                            theme === 'light' ? "hover:bg-red-50 text-gray-400 hover:text-red-500" : "hover:bg-white/10 text-gray-500 hover:text-red-400"
                        )}
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default function ChatInterface() {
    const { theme } = useContext(ThemeContext);

    // Sessions State
    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem('chat_sessions');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { console.error(e); }
        }
        // Default init session
        return [{
            id: 'init-1',
            timestamp: Date.now(),
            messages: [{ id: 'msg-1', role: 'assistant', content: 'Greeting, Traveler. I am the Sentinel of the Code. Ask me anything about your JavaScript document.' }]
        }];
    });

    const [currentSessionId, setCurrentSessionId] = useState(() => {
        return localStorage.getItem('current_session_id') || (sessions[0]?.id) || 'init-1';
    });

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [deleteModal, setDeleteModal] = useState({ open: false, target: null, type: null }); // type: 'msg' or 'session'
    const scrollRef = useRef(null);

    // Persistence
    useEffect(() => {
        localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }, [sessions]);

    // Ingested Documents State
    const [ingestedDocs, setIngestedDocs] = useState(() => {
        // Mock initial documents since backend doesn't list them yet
        return [
            { id: 'core', name: 'Knowledge_Base_Core.md', size: '2.5 MB', date: new Date().toLocaleDateString(), type: 'system' }
        ];
    });

    const [showKB, setShowKB] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        localStorage.setItem('current_session_id', currentSessionId);
    }, [currentSessionId]);

    // Derived state
    const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
    const messages = currentSession?.messages || [];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading, currentSessionId]);

    const handleNewChat = () => {
        const newSession = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            title: 'New Conversation',
            messages: [{
                id: Date.now().toString() + '-init',
                role: 'assistant',
                content: 'Greeting, Traveler. I am the Sentinel of the Code. Ask me anything about your JavaScript document.'
            }]
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        if (window.innerWidth < 640) setSidebarOpen(false); // Auto close on mobile
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), role: 'user', content: input };

        // Update session messages
        setSessions(prev => prev.map(session =>
            session.id === currentSessionId
                ? { ...session, messages: [...session.messages, userMsg], timestamp: Date.now() }
                : session
        ));

        const query = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/chat', { query });
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.answer,
                reasoning: response.data.reasoning
            };
            setSessions(prev => prev.map(session =>
                session.id === currentSessionId
                    ? { ...session, messages: [...session.messages, aiMsg] }
                    : session
            ));
        } catch (error) {
            const errorMsg = { id: Date.now().toString(), role: 'assistant', content: "Connection severed. The backend appears dormant." };
            setSessions(prev => prev.map(session =>
                session.id === currentSessionId
                    ? { ...session, messages: [...session.messages, errorMsg] }
                    : session
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // Deletion Logic
    const confirmDeleteMsg = (msg) => setDeleteModal({ open: true, target: msg, type: 'msg' });
    const confirmDeleteSession = (session) => setDeleteModal({ open: true, target: session, type: 'session' });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.post('http://127.0.0.1:8000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Success message
            const successMsg = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `**${file.name}** has been successfully ingested into the Knowledge Base. You can now ask questions about it!`
            };

            // Add to ingested documents list
            setIngestedDocs(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    name: file.name,
                    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                    date: new Date().toLocaleDateString(),
                    type: 'pdf'
                }
            ]);

            setSessions(prev => prev.map(session =>
                session.id === currentSessionId
                    ? { ...session, messages: [...session.messages, successMsg] }
                    : session
            ));

        } catch (error) {
            console.error("Upload error:", error);
            const errorMsg = {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Upload failed. Please try again or check the backend console."
            };
            setSessions(prev => prev.map(session =>
                session.id === currentSessionId
                    ? { ...session, messages: [...session.messages, errorMsg] }
                    : session
            ));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteDoc = (doc) => {
        setDeleteModal({ open: true, target: doc, type: 'doc' });
    };

    const handleConfirmDelete = () => {
        if (deleteModal.type === 'msg') {
            setSessions(prev => prev.map(session =>
                session.id === currentSessionId
                    ? { ...session, messages: session.messages.filter(m => m.id !== deleteModal.target.id) }
                    : session
            ));
        } else if (deleteModal.type === 'session') {
            const remaining = sessions.filter(s => s.id !== deleteModal.target.id);
            setSessions(remaining);
            if (currentSessionId === deleteModal.target.id) {
                setCurrentSessionId(remaining[0]?.id || '');
                if (remaining.length === 0) handleNewChat();
            }
        } else if (deleteModal.type === 'doc') {
            setIngestedDocs(prev => prev.filter(d => d.id !== deleteModal.target.id));
        }
        setDeleteModal({ open: false, target: null, type: null });
    };

    return (
        <div className={cn(
            "flex h-full w-full rounded-3xl overflow-hidden relative transition-all duration-500 shadow-2xl",
            theme === 'light' ? "bg-white border-2 border-slate-100" :
                theme === 'cyberpunk' ? "bg-[#050505] border border-white/5 shadow-2xl shadow-purple-900/20" :
                    "bg-[#0B1120] border border-white/5"
        )}>
            <AnimatePresence>
                {isUploading && <LoadingScreen theme={theme} />}
            </AnimatePresence>

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={setCurrentSessionId}
                onNewChat={handleNewChat}
                onDeleteSession={confirmDeleteSession}
                theme={theme}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onOpenKB={() => setShowKB(true)}
                onOpenLogs={() => setShowLogs(true)}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative min-w-0">

                {/* Header */}
                <div className={cn(
                    "h-20 px-8 flex items-center justify-between z-20 transition-colors duration-500 border-b",
                    theme === 'light' ? "bg-white border-slate-100" :
                        theme === 'cyberpunk' ? "bg-[#050505] border-white/5" :
                            "bg-[#0B1120] border-white/5"
                )}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={cn(
                                "p-2 rounded-lg transition-colors hidden sm:block",
                                theme === 'light' ? "hover:bg-gray-100 text-gray-500" : "hover:bg-white/10 text-gray-400"
                            )}
                        >
                            <Menu size={20} />
                        </button>

                        <div className="flex flex-col">


                            {/* Title */}
                            <div className="flex items-center gap-3">
                                <h1 className={cn("font-bold text-xl tracking-tight drop-shadow-sm",
                                    theme === 'light' ? "bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 drop-shadow-[0_1px_0_rgba(255,255,255,1)]" : "bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]"
                                )}>
                                    Gemini 2.5 RAG Core
                                </h1>

                                {/* Status Indicator */}
                                <div className={cn(
                                    "hidden sm:flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-medium border",
                                    theme === 'light' ? "bg-white border-gray-200 text-gray-700 shadow-sm" :
                                        "bg-white/5 border-white/10 text-gray-300"
                                )}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span>System Operational</span>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-8 scrollbar-hide relative z-10 scroll-smooth">
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg, i) => (
                            <Message key={msg.id || i} message={msg} theme={theme} onDelete={confirmDeleteMsg} />
                        ))}
                        {isLoading && <ThinkingIndicator theme={theme} />}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4 mt-20">
                                <MessageSquare size={48} />
                                <p>Start a new conversation...</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input */}
                <div className={cn(
                    "px-4 py-6 sm:px-10 sm:py-8 z-20 transition-colors duration-500",
                    theme === 'light' ? "bg-white" :
                        theme === 'cyberpunk' ? "bg-[#050505]" :
                            "bg-[#0B1120]"
                )}>
                    <motion.div
                        layout
                        className={cn(
                            "relative flex items-center gap-3 p-2 pl-6 rounded-[1.5rem] border transition-all duration-300 group max-w-4xl mx-auto",
                            theme === 'light' ? "bg-white border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.05)] focus-within:shadow-[0_8px_30px_rgba(99,102,241,0.2)] focus-within:border-indigo-300" :
                                theme === 'cyberpunk' ? "bg-black/40 border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.1)] focus-within:border-fuchsia-400 focus-within:shadow-[0_0_30px_rgba(217,70,239,0.3)] focus-within:bg-black/60" :
                                    "bg-slate-800/80 border-white/10 shadow-lg focus-within:border-blue-400/50 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "p-2 rounded-xl transition-colors hover:bg-black/10 dark:hover:bg-white/10",
                                theme === 'light' ? "text-gray-500" : "text-gray-400"
                            )}
                            title="Upload PDF Book"
                        >
                            <Upload size={20} />
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask anything..."
                            className={cn(
                                "flex-1 bg-transparent border-none outline-none text-base font-medium placeholder:font-normal h-12 tracking-wide",
                                theme === 'light' ? "text-gray-900 placeholder:text-gray-400" : "text-white placeholder:text-gray-500"
                            )}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSend}
                            disabled={isLoading}
                            className={cn(
                                "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg",
                                isLoading ? "opacity-50 cursor-not-allowed grayscale" :
                                    (theme === 'light' ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-200 hover:shadow-indigo-300" :
                                        theme === 'cyberpunk' ? "bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:shadow-[0_0_25px_rgba(217,70,239,0.6)]" :
                                            "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-blue-900/30 hover:shadow-blue-500/40")
                            )}
                        >
                            {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={22} />}
                        </motion.button>
                    </motion.div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {deleteModal.open && (
                    <DeleteConfirmationModal
                        isOpen={deleteModal.open}
                        theme={theme}
                        itemType={deleteModal.type}
                        onClose={() => setDeleteModal({ open: false, target: null, type: null })}
                        onConfirm={handleConfirmDelete}
                    />
                )}
            </AnimatePresence>

            {/* KB and Logs Modals */}
            <AnimatePresence>
                {showKB && (
                    <Modal isOpen={showKB} onClose={() => setShowKB(false)} title="Knowledge Base" theme={theme} maxWidth="max-w-2xl">
                        <div className="space-y-4">
                            <div className={cn("p-4 rounded-xl border flex items-center justify-between shadow-sm",
                                theme === 'light' ? "bg-white border-gray-200" : "bg-white/5 border-white/10")}>
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", theme === 'light' ? "bg-gray-100 text-gray-600" : "bg-white/10 text-gray-300")}><Bot size={20} /></div>
                                    <div>
                                        <h4 className={cn("font-bold text-sm", theme === 'light' ? "text-gray-900" : "text-white")}>Vector Store Status</h4>
                                        <p className={cn("text-xs", theme === 'light' ? "text-gray-500" : "text-gray-400")}>Index Optimized • {ingestedDocs.length} Documents</p>
                                    </div>
                                </div>
                                <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                    theme === 'light' ? "bg-green-50 text-green-700 border-green-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}>
                                    Active
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className={cn("text-xs font-bold uppercase tracking-wider px-2 mt-6 mb-3", theme === 'light' ? "text-gray-400" : "text-gray-500")}>Ingested Documents</h4>
                                {ingestedDocs.map(doc => (
                                    <div key={doc.id} className={cn("flex items-center justify-between p-3 rounded-lg border group transition-all duration-200",
                                        theme === 'light' ? "bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-md hover:border-gray-200" :
                                            "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10")}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", doc.type === 'system' ?
                                                (theme === 'light' ? "bg-gray-100 text-gray-500" : "bg-white/10 text-gray-400") :
                                                (theme === 'light' ? "bg-red-50 text-red-500" : "bg-red-500/10 text-red-400"))}>
                                                {doc.type === 'system' ? <Database size={16} /> : <FileText size={16} />}
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-semibold", theme === 'light' ? "text-gray-700" : "text-gray-200")}>{doc.name}</p>
                                                <p className={cn("text-[10px] font-medium", theme === 'light' ? "text-gray-400" : "text-gray-500")}>{doc.size} • {doc.date}</p>
                                            </div>
                                        </div>
                                        {doc.type !== 'system' && (
                                            <button onClick={() => handleDeleteDoc(doc)} className={cn("p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                                                theme === 'light' ? "hover:bg-red-50 text-gray-400 hover:text-red-600" : "hover:bg-red-500/20 text-gray-500 hover:text-red-400")}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Modal>
                )}
                {showLogs && (
                    <Modal isOpen={showLogs} onClose={() => setShowLogs(false)} title="System Logs" theme={theme} maxWidth="max-w-3xl">
                        <div className={cn("p-4 rounded-xl border font-mono text-xs h-64 overflow-y-auto space-y-1.5 shadow-inner",
                            theme === 'light' ? "bg-gray-50 border-gray-200 text-gray-600" :
                                "bg-black/40 border-white/10 text-gray-400")}>
                            <p><span className="opacity-50 mr-2">&gt;</span><span className={cn("font-bold", theme === 'light' ? "text-indigo-600" : "text-indigo-400")}>[SYSTEM_INIT]</span> Core services initialized successfully.</p>
                            <p><span className="opacity-50 mr-2">&gt;</span><span className={cn("font-bold", theme === 'light' ? "text-indigo-600" : "text-indigo-400")}>[VECTOR_DB]</span> Connected to ChromaDB instance.</p>
                            <p><span className="opacity-50 mr-2">&gt;</span><span className={cn("font-bold", theme === 'light' ? "text-indigo-600" : "text-indigo-400")}>[LLM_LINK]</span> Gemini 2.5 Flash API connection established.</p>
                            <p><span className="opacity-50 mr-2">&gt;</span><span className="text-yellow-500 font-bold">[WARN]</span> No GPU detected, switching to CPU inference mode.</p>
                            <p><span className="opacity-50 mr-2">&gt;</span><span className={cn("font-bold", theme === 'light' ? "text-indigo-600" : "text-indigo-400")}>[RAG_CORE]</span> Knowledge base ingestion complete. 24 chunks indexed.</p>
                            <p><span className="opacity-50 mr-2">&gt;</span><span className={cn("font-bold", theme === 'light' ? "text-indigo-600" : "text-indigo-400")}>[NETWORK]</span> Socket listener active on port 8000.</p>
                            {ingestedDocs.map(doc => (
                                <p key={doc.id}><span className="opacity-50 mr-2">&gt;</span><span className="text-blue-500 font-bold">[UPLOAD]</span> Processed file: {doc.name} ({doc.size})</p>
                            ))}
                            <p className="animate-pulse"><span className="opacity-50 mr-2">&gt;</span><span className="text-emerald-500 font-bold">[MONITOR]</span> Watching for incoming queries...</p>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

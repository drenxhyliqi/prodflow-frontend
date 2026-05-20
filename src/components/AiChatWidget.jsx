import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";
import { TbSparkles } from "react-icons/tb";

const STORAGE_KEY = "ai_chat_messages";

function inlineFormat(text) {
    const parts = [];
    const rx = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;
    let last = 0, match, k = 0;
    while ((match = rx.exec(text)) !== null) {
        if (match.index > last) parts.push(text.slice(last, match.index));
        const t = match[0];
        if      (t.startsWith("**")) parts.push(<strong key={k++}>{t.slice(2, -2)}</strong>);
        else if (t.startsWith("*"))  parts.push(<em key={k++}>{t.slice(1, -1)}</em>);
        else                         parts.push(<code key={k++} style={{ background:"#F1F5F9", padding:"1px 4px", borderRadius:"3px", fontFamily:"monospace", fontSize:"11px" }}>{t.slice(1,-1)}</code>);
        last = match.index + t.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length === 0 ? text : parts;
}

function renderMarkdown(text) {
    if (!text) return null;
    const lines = text.split("\n");
    const els = [];
    let i = 0, k = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (/^[-*] /.test(line)) {
            const items = [];
            while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
            els.push(<ul key={k++} style={{ margin:"4px 0 4px 4px", paddingLeft:"14px" }}>{items.map((it,j) => <li key={j}>{inlineFormat(it)}</li>)}</ul>);
            continue;
        }
        if (/^\d+\. /.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /,"")); i++; }
            els.push(<ol key={k++} style={{ margin:"4px 0 4px 4px", paddingLeft:"14px" }}>{items.map((it,j) => <li key={j}>{inlineFormat(it)}</li>)}</ol>);
            continue;
        }
        if (line.trim() === "") { if (els.length) els.push(<br key={k++} />); i++; continue; }
        els.push(<span key={k++} style={{ display:"block" }}>{inlineFormat(line)}</span>);
        i++;
    }
    return <>{els}</>;
}

function formatTime(ts) {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}

function errorMessage(err) {
    if (!err.response) return "No connection to server. Check if the backend is running.";
    const s = err.response.status;
    if (s === 401) return "Session expired. Please refresh the page.";
    if (s === 422) return "Invalid request sent to AI. Check your input.";
    if (s === 429) return "Too many requests. Please wait a moment.";
    if (s >= 500)  return "Server error. Try again in a moment.";
    return "Couldn't reach AI. Please try again.";
}

export default function AiChatWidget() {
    const [companyId, setCompanyId]         = useState(() => Number(localStorage.getItem("active_company_id") || 1));
    const [open, setOpen]                   = useState(false);
    const [messages, setMessages]           = useState(() => {
        try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; }
        catch { return []; }
    });
    const [input, setInput]                 = useState("");
    const [loading, setLoading]             = useState(false);
    const [unread, setUnread]               = useState(0);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [copiedIdx, setCopiedIdx]         = useState(null);
    const [alerts, setAlerts]               = useState([]);
    const [showAlerts, setShowAlerts]       = useState(false);

    const bottomRef    = useRef(null);
    const chipsRef     = useRef(null);
    const messagesRef  = useRef(null);
    const abortRef     = useRef(null);
    const lastMsgRef   = useRef("");
    const openRef      = useRef(open);
    const dismissedRef = useRef(new Set());

    useEffect(() => { openRef.current = open; }, [open]);

    const quickActions = [
        { label: "Who is on leave today?",   msg: "Who is on vacation leave today?" },
        { label: "Expiring contracts soon?", msg: "Are there any contracts expiring soon?" },
        { label: "Sales vs last month",      msg: "How are sales this month compared to last month?" },
        { label: "Full company analysis",    msg: "Give me a full analysis of the company" },
        { label: "Active production plans?", msg: "What are the active production plans?" },
        { label: "Pending leave requests?",  msg: "Are there any pending leave requests?" },
        { label: "Profit this month?",       msg: "What is the profit this month?" },
        { label: "Full staff list",          msg: "Give me the full list of staff" },
    ];

    const ALERT_STYLE = {
        danger:  { background:"#fef2f2", borderLeft:"3px solid #ef4444", color:"#991b1b" },
        warning: { background:"#fffbeb", borderLeft:"3px solid #f59e0b", color:"#92400e" },
        info:    { background:"#eff6ff", borderLeft:"3px solid #3b82f6", color:"#1e40af" },
    };

    const fetchAlerts = async (cid) => {
        try {
            const { data } = await axios.post("/api/ai/alerts", { company_id: cid });
            if (data.count > 0) {
                const visible = data.alerts.filter(a => !dismissedRef.current.has(a.message));
                setAlerts(visible);
            } else {
                setAlerts([]);
                setShowAlerts(false);
            }
        } catch {
            setAlerts([]);
        }
    };

    const dismissAlert = (message) => {
        dismissedRef.current.add(message);
        setAlerts(prev => prev.filter(a => a.message !== message));
    };

    useEffect(() => {
        const onCompanyChange = (e) => {
            const newId = Number(e.detail.companyId);
            setCompanyId(newId);
            dismissedRef.current = new Set();
            setAlerts([]);
            setMessages(prev => [...prev, {
                role: "system-notice",
                content: `Company changed to "${e.detail.companyName}". Data is now for this company.`,
                timestamp: Date.now(),
            }]);
            if (openRef.current) fetchAlerts(newId);
        };
        window.addEventListener("company-changed", onCompanyChange);
        return () => window.removeEventListener("company-changed", onCompanyChange);
    }, []);

    useEffect(() => {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    }, [messages]);

    useEffect(() => {
        if (!showScrollBtn) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }, [open]);

    useEffect(() => {
        if (open) {
            setUnread(0);
            fetchAlerts(companyId);
        }
    }, [open]);

    const handleScroll = (e) => {
        const el = e.currentTarget;
        setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    };

    const copyMessage = (text, idx) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1500);
        });
    };

    const abort = () => { abortRef.current?.abort(); setLoading(false); };

    const send = async (text) => {
        const message = text || input;
        if (!message.trim() || loading) return;

        lastMsgRef.current = message;

        const history = messages
            .filter(m => m.role === "user" || m.role === "assistant")
            .slice(-20)
            .map(m => ({ role: m.role, content: m.content }));

        setMessages(prev => [...prev, { role: "user", content: message, timestamp: Date.now() }]);
        setInput("");
        setLoading(true);
        abortRef.current = new AbortController();

        try {
            const { data } = await axios.post("/api/ai/chat-data", {
                message,
                company_id: Number(companyId),
                history,
            }, { signal: abortRef.current.signal });

            setMessages(prev => [...prev, { role: "assistant", content: data.reply, timestamp: Date.now() }]);
            if (!openRef.current) setUnread(prev => prev + 1);
        } catch (err) {
            if (axios.isCancel(err)) return;
            console.error("[AiChat] request failed:", err.message);
            console.error("[AiChat] status:", err.response?.status);
            console.error("[AiChat] response data:", err.response?.data);
            setMessages(prev => [...prev, { role: "error", content: errorMessage(err), timestamp: Date.now() }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Mobile backdrop */}
            {open && <div className="ai-backdrop" onClick={() => setOpen(false)} />}

            {/* FAB */}
            <div className="ai-fab">
                {!open && (
                    <div style={{
                        position:     "absolute",
                        inset:        "-10px",
                        borderRadius: "50%",
                        background:   "#2662D9",
                        animation:    "ai-pulse 1.8s ease-in-out infinite",
                        pointerEvents:"none",
                    }} />
                )}
                <button
                    onClick={() => setOpen(o => !o)}
                    style={{
                        position:        "relative",
                        background:      "#2662D9",
                        color:           "white",
                        border:          "none",
                        borderRadius:    "50%",
                        width:           "52px",
                        height:          "52px",
                        padding:         0,
                        cursor:          "pointer",
                        boxShadow:       "0 4px 16px rgba(38,98,217,0.4)",
                        display:         "flex",
                        alignItems:      "center",
                        justifyContent:  "center",
                    }}
                >
                    {open ? <AiOutlineClose size={20} /> : <TbSparkles size={22} />}
                    {!open && unread > 0 && (
                        <span style={{
                            position:       "absolute",
                            top:            "-6px",
                            right:          "-6px",
                            background:     "#EF4444",
                            color:          "white",
                            borderRadius:   "50%",
                            width:          "20px",
                            height:         "20px",
                            fontSize:       "11px",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            fontWeight:     700,
                        }}>{unread > 9 ? "9+" : unread}</span>
                    )}
                </button>
            </div>

            {/* Chat panel */}
            {open && (
                <div className="ai-panel">

                    {/* Header */}
                    <div style={{
                        padding:        "16px 20px",
                        background:     "#275bc3",
                        display:        "flex",
                        justifyContent: "space-between",
                        alignItems:     "center",
                        color:          "white",
                    }}>
                        <div>
                            <div style={{ fontWeight:700, fontSize:"15px", display:"flex", alignItems:"center", gap:"8px" }}>
                                <span style={{ width:"8px", height:"8px", background:"#22C55E", borderRadius:"50%", display:"inline-block" }}/>
                                Prodflow Assistant
                            </div>
                            {/* <div style={{ fontSize:"11px", opacity:0.8, marginTop:"2px" }}>Powered by GPT-4o mini</div> */}
                        </div>
                        <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                            {alerts.length > 0 && (
                                <button
                                    onClick={() => setShowAlerts(v => !v)}
                                    style={{ position:"relative", background: showAlerts ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"white", cursor:"pointer", fontSize:"11px", borderRadius:"6px", padding:"4px 10px", display:"flex", alignItems:"center", gap:"5px" }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                    </svg>
                                    <span style={{ background:"#ef4444", borderRadius:"10px", padding:"1px 5px", fontSize:"10px", fontWeight:700 }}>{alerts.length}</span>
                                </button>
                            )}
                            <button
                                onClick={() => { setMessages([]); try { sessionStorage.removeItem(STORAGE_KEY); } catch {} }}
                                style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"white", cursor:"pointer", fontSize:"11px", borderRadius:"6px", padding:"4px 8px" }}
                            >Clear</button>
                            <button
                                onClick={() => setOpen(false)}
                                style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"white", cursor:"pointer", borderRadius:"50%", width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center" }}
                            ><AiOutlineClose size={16} /></button>
                        </div>
                    </div>

                    {/* Alerts panel */}
                    {showAlerts && alerts.length > 0 && (
                        <div style={{ borderBottom:"1px solid #E2E8F0", background:"#fafafa" }}>
                            {alerts.map((a, i) => {
                                const s = ALERT_STYLE[a.type] || ALERT_STYLE.info;
                                return (
                                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"7px 12px", ...s, borderBottom: i < alerts.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                                        <span style={{ flex:1, fontSize:"12px", lineHeight:1.4 }}>{a.message}</span>
                                        <button onClick={() => dismissAlert(a.message)} style={{ flexShrink:0, background:"none", border:"none", cursor:"pointer", color:"inherit", opacity:0.5, padding:"0 0 0 6px", display:"flex", alignItems:"center" }}><AiOutlineClose size={13} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Messages */}
                    <div
                        ref={messagesRef}
                        onScroll={handleScroll}
                        style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:"10px", background:"#F8FAFC", position:"relative" }}
                    >
                        {messages.length === 0 && (
                            <div style={{ textAlign:"center", color:"#64748B", fontSize:"13px", marginTop:"8px" }}>
                                Hi! Ask me anything about your business data.
                            </div>
                        )}

                        {messages.map((m, i) => {
                            if (m.role === "system-notice") return (
                                <div key={i} style={{ textAlign:"center", fontSize:"11px", color:"#2662D9", background:"#EFF4FF", border:"1px solid #BFCFFA", borderRadius:"8px", padding:"6px 12px", margin:"4px 0" }}>
                                    {m.content}
                                </div>
                            );

                            const isUser      = m.role === "user";
                            const isError     = m.role === "error";
                            const isAssistant = m.role === "assistant";

                            return (
                                <div key={i} className="ai-msg-outer" style={{ display:"flex", flexDirection:"column", alignItems: isUser ? "flex-end" : "flex-start" }}>
                                    <div style={{ maxWidth:"80%" }}>
                                        <div style={{
                                            padding:      "10px 14px",
                                            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            fontSize:     "13px",
                                            lineHeight:   1.6,
                                            background:   isUser ? "#2662D9" : isError ? "#FEE2E2" : "white",
                                            color:        isUser ? "white" : isError ? "#DC2626" : "#1E293B",
                                            boxShadow:    "0 1px 4px rgba(0,0,0,0.08)",
                                        }}>
                                            {isAssistant ? renderMarkdown(m.content) : m.content}
                                        </div>

                                        {isError && (
                                            <button
                                                onClick={() => send(lastMsgRef.current)}
                                                style={{ display:"block", marginTop:"6px", background:"none", border:"1px solid #DC2626", color:"#DC2626", borderRadius:"6px", padding:"3px 10px", fontSize:"11px", cursor:"pointer", width:"100%" }}
                                            >Try again</button>
                                        )}
                                    </div>

                                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"3px", padding:"0 2px" }}>
                                        {isAssistant && (
                                            <button
                                                className="ai-copy-btn"
                                                onClick={() => copyMessage(m.content, i)}
                                                style={{ background:"none", border:"none", cursor:"pointer", fontSize:"10px", color: copiedIdx === i ? "#22C55E" : "#94A3B8", padding:0 }}
                                            >{copiedIdx === i ? "Copied" : "Copy"}</button>
                                        )}
                                        {m.timestamp && (
                                            <span style={{ fontSize:"10px", color:"#94A3B8" }}>{formatTime(m.timestamp)}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div style={{ display:"flex", gap:"4px", padding:"4px 8px" }}>
                                {[0,1,2].map(i => (
                                    <div key={i} style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#94A3B8", animation:`bounce 1s ease ${i*0.15}s infinite` }}/>
                                ))}
                            </div>
                        )}

                        {showScrollBtn && (
                            <button
                                onClick={() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); setShowScrollBtn(false); }}
                                style={{
                                    position:       "absolute",
                                    bottom:         "10px",
                                    right:          "10px",
                                    background:     "white",
                                    border:         "1px solid #E2E8F0",
                                    borderRadius:   "50%",
                                    width:          "32px",
                                    height:         "32px",
                                    cursor:         "pointer",
                                    boxShadow:      "0 2px 8px rgba(0,0,0,0.15)",
                                    fontSize:       "16px",
                                    display:        "flex",
                                    alignItems:     "center",
                                    justifyContent: "center",
                                    color:          "#334155",
                                    zIndex:         10,
                                }}
                            ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
                        )}

                        <div ref={bottomRef}/>
                    </div>

                    {/* Chips bar */}
                    <div style={{ position:"relative", borderTop:"1px solid #E2E8F0", background:"#FAFAFA" }}>
                        <div ref={chipsRef} className="ai-chips-bar" style={{ display:"flex", gap:"6px", overflowX:"auto", padding:"8px 40px" }}>
                            {quickActions.map((a) => (
                                <button
                                    key={a.label}
                                    onClick={() => send(a.msg)}
                                    disabled={loading}
                                    style={{ flexShrink:0, padding:"5px 11px", borderRadius:"20px", border:"1px solid #E2E8F0", background:"white", cursor: loading ? "not-allowed" : "pointer", fontSize:"11px", color:"#334155", whiteSpace:"nowrap", opacity: loading ? 0.5 : 1 }}
                                >{a.label}</button>
                            ))}
                        </div>
                        <div onClick={() => chipsRef.current?.scrollBy({ left:-160, behavior:"smooth" })} style={{ position:"absolute", left:0, top:0, bottom:0, width:"36px", background:"linear-gradient(to left, transparent, #FAFAFA 65%)", display:"flex", alignItems:"center", paddingLeft:"4px", cursor:"pointer" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </div>
                        <div onClick={() => chipsRef.current?.scrollBy({ left:160, behavior:"smooth" })} style={{ position:"absolute", right:0, top:0, bottom:0, width:"36px", background:"linear-gradient(to right, transparent, #FAFAFA 65%)", display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:"4px", cursor:"pointer" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                    </div>

                    {/* Input */}
                    <div style={{ padding:"12px", borderTop:"1px solid #E2E8F0", display:"flex", gap:"8px", background:"white" }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                            placeholder="Ask anything about your data..."
                            disabled={loading}
                            style={{ flex:1, padding:"10px 14px", borderRadius:"10px", border:"1px solid #E2E8F0", fontSize:"13px", outline:"none", background:"#F8FAFC" }}
                        />
                        {loading ? (
                            <button onClick={abort} style={{ background:"#FEE2E2", color:"#DC2626", border:"none", borderRadius:"10px", padding:"10px 14px", cursor:"pointer", fontSize:"13px", fontWeight:600, whiteSpace:"nowrap" }}>Stop</button>
                        ) : (
                            <button onClick={() => send()} style={{ background:"#2662D9", color:"white", border:"none", borderRadius:"10px", padding:"10px 16px", cursor:"pointer", fontSize:"16px" }}>-&gt;</button>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-5px); }
                }
                @keyframes ai-pulse {
                    0%   { transform: scale(1);    opacity: 0.5; }
                    50%  { transform: scale(1.55); opacity: 0.12; }
                    100% { transform: scale(1);    opacity: 0.5; }
                }

                /* FAB */
                .ai-fab {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 1000;
                }

                /* Panel */
                .ai-panel {
                    position:       fixed;
                    bottom:         80px;
                    right:          24px;
                    width:          380px;
                    height:         560px;
                    z-index:        999;
                    background:     white;
                    border-radius:  16px;
                    box-shadow:     0 8px 40px rgba(0,0,0,0.15);
                    display:        flex;
                    flex-direction: column;
                    overflow:       hidden;
                }

                /* Backdrop (mobile only) */
                .ai-backdrop {
                    display: none;
                }

                /* Scrollbar */
                .ai-chips-bar::-webkit-scrollbar { display: none; }
                .ai-chips-bar { -ms-overflow-style: none; scrollbar-width: none; }
                .ai-copy-btn  { opacity: 0; transition: opacity 0.15s; }
                .ai-msg-outer:hover .ai-copy-btn { opacity: 1; }

                /* ── Mobile ── */
                @media (max-width: 640px) {
                    .ai-fab {
                        bottom: 16px;
                        right:  16px;
                    }
                    .ai-panel {
                        bottom:        0;
                        right:         0;
                        left:          0;
                        width:         100%;
                        height:        88dvh;
                        border-radius: 20px 20px 0 0;
                    }
                    .ai-backdrop {
                        display:    block;
                        position:   fixed;
                        inset:      0;
                        background: rgba(0,0,0,0.4);
                        z-index:    998;
                    }
                    .ai-copy-btn { opacity: 1 !important; }
                }

                /* ── Tablet ── */
                @media (min-width: 641px) and (max-width: 1024px) {
                    .ai-panel {
                        width:  340px;
                        height: 520px;
                    }
                }
            `}</style>
        </>
    );
}

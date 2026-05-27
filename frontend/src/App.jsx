import { useState, useRef, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BACKEND_URL = "https://medicalassistant-pp3n.onrender.com"; // 👈 Apna Render URL yahan dalo
const USE_BACKEND = true; // true karo jab backend deploy ho jaye

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const SYMPTOM_CHIPS = ["🤒 Fever", "🤕 Headache", "💔 Chest Pain", "😮‍💨 Cough", "😴 Fatigue", "🤢 Nausea", "🦴 Joint Pain", "😵 Dizziness"];

const SYSTEM_PROMPT = `You are MediBot — a warm, knowledgeable medical assistant. 
Your role:
- Ask about symptoms clearly and gently
- Suggest possible conditions based on symptoms
- Give first-aid tips and general health advice
- Recommend when to see a doctor (always err on side of caution)
- Give diet and lifestyle tips when relevant
- NEVER diagnose definitively — always say "this could be" or "possibly"
- Always end serious concerns with: "Please consult a doctor for proper diagnosis"
- Be conversational, warm, and empathetic
- Keep answers concise (3-5 lines max)`;

const formatTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

// ─── API CALL ─────────────────────────────────────────────────────────────────
async function getAIResponse(messages) {
  if (USE_BACKEND) {
    const lastMsg = messages[messages.length - 1].content;
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: lastMsg }),
    });
    const data = await res.json();
    return data.answer;
  } else {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-20),
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "Kuch error aa gaya, dobara try karo.";
  }
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function LoginScreen({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError("");
    if (!form.email || !form.password) return setError("Saari fields bharo!");
    if (!isLogin && !form.name) return setError("Naam bhi bharo!");
    if (form.password.length < 6) return setError("Password kam se kam 6 characters ka ho!");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onAuth({ name: form.name || form.email.split("@")[0], email: form.email });
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f4c75 0%, #1b6ca8 40%, #16a085 100%)",
      fontFamily: "'Outfit', sans-serif", padding: "20px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-input { width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 15px; font-family: 'Outfit', sans-serif; background: #f8fafc; transition: all 0.2s; outline: none; color: #1a202c; }
        .auth-input:focus { border-color: #1b6ca8; background: white; box-shadow: 0 0 0 3px rgba(27,108,168,0.1); }
        .auth-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #1b6ca8, #16a085); border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s; }
        .auth-btn:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(27,108,168,0.35); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="fade-in" style={{
        background: "white", borderRadius: "24px", padding: "40px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "70px", height: "70px", borderRadius: "20px",
            background: "linear-gradient(135deg, #1b6ca8, #16a085)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", margin: "0 auto 16px", boxShadow: "0 8px 25px rgba(27,108,168,0.3)"
          }}>🏥</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#1a202c", marginBottom: "6px" }}>
            MediBot
          </h1>
          <p style={{ color: "#718096", fontSize: "14px" }}>Your Personal Health Assistant</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#f7fafc", borderRadius: "12px", padding: "4px", marginBottom: "24px" }}>
          {["Login", "Sign Up"].map((t, i) => (
            <button key={t} onClick={() => { setIsLogin(i === 0); setError(""); }}
              style={{
                flex: 1, padding: "10px", border: "none", borderRadius: "10px", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "14px", transition: "all 0.2s",
                background: (i === 0) === isLogin ? "white" : "transparent",
                color: (i === 0) === isLogin ? "#1b6ca8" : "#718096",
                boxShadow: (i === 0) === isLogin ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
              }}>{t}</button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {!isLogin && (
            <input className="auth-input" placeholder="Apna naam" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          )}
          <input className="auth-input" type="email" placeholder="Email address" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="auth-input" type="password" placeholder="Password (6+ characters)" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handle()} />

          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "10px", padding: "12px", color: "#e53e3e", fontSize: "14px" }}>
              ⚠️ {error}
            </div>
          )}

          <button className="auth-btn" onClick={handle} disabled={loading}>
            {loading ? <span className="pulse">Loading...</span> : isLogin ? "Login →" : "Create Account →"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#a0aec0" }}>
          🔒 Demo mode — no real data stored
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "12px",
        background: "linear-gradient(135deg, #1b6ca8, #16a085)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0
      }}>🏥</div>
      <div style={{
        background: "white", borderRadius: "18px 18px 18px 4px",
        padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
      }}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: "#1b6ca8", opacity: 0.7,
              animation: `bounce 1.2s ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end", gap: "10px", marginBottom: "16px",
      animation: "msgIn 0.3s ease"
    }}>
      {!isUser && (
        <div style={{
          width: "36px", height: "36px", borderRadius: "12px",
          background: "linear-gradient(135deg, #1b6ca8, #16a085)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", flexShrink: 0
        }}>🏥</div>
      )}
      {isUser && (
        <div style={{
          width: "36px", height: "36px", borderRadius: "12px",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", flexShrink: 0
        }}>👤</div>
      )}
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div style={{
          padding: "13px 17px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser ? "linear-gradient(135deg, #1b6ca8, #16a085)" : "white",
          color: isUser ? "white" : "#2d3748",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          fontSize: "14.5px", lineHeight: "1.6", fontWeight: "400"
        }}>
          {msg.content}
        </div>
        <span style={{ fontSize: "11px", color: "#a0aec0", marginTop: "4px", paddingLeft: "4px" }}>
          {msg.time}
        </span>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! 🙏 Main MediBot hoon — aapka personal health assistant. Aaj main aapki kya madad kar sakta hoon? Apne symptoms batao ya koi health question poochho!",
      time: formatTime()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const query = text || input.trim();
    if (!query || loading) return;
    setInput("");

    const userMsg = { role: "user", content: query, time: formatTime() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.slice(-20).map(m => ({ role: m.role, content: m.content }));
      const answer = await getAIResponse(apiMessages);
      setMessages(prev => [...prev, { role: "assistant", content: answer, time: formatTime() }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Kuch error aa gaya. Internet check karo aur dobara try karo.",
        time: formatTime()
      }]);
    }
    setLoading(false);
  };

  if (!user) return <LoginScreen onAuth={setUser} />;

  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: "'Outfit', sans-serif", background: "#f0f4f8", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        .chip { padding: 8px 14px; border: 1.5px solid #bee3f8; border-radius: 20px; background: #ebf8ff; color: #2b6cb0; font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .chip:hover { background: #1b6ca8; color: white; border-color: #1b6ca8; transform: translateY(-1px); }
        .send-btn { padding: 13px 22px; background: linear-gradient(135deg, #1b6ca8, #16a085); border: none; border-radius: 14px; color: white; font-size: 18px; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .send-btn:hover { opacity: 0.9; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .msg-input { flex: 1; padding: 14px 18px; border: 2px solid #e2e8f0; border-radius: 14px; font-size: 15px; font-family: 'Outfit', sans-serif; background: white; outline: none; transition: all 0.2s; color: #2d3748; }
        .msg-input:focus { border-color: #1b6ca8; box-shadow: 0 0 0 3px rgba(27,108,168,0.08); }
        .sidebar { width: 260px; background: linear-gradient(180deg, #0f4c75 0%, #1b6ca8 100%); display: flex; flex-direction: column; padding: 20px; color: white; }
        @media (max-width: 700px) { .sidebar { display: none; } }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🏥</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600 }}>MediBot</div>
            <div style={{ fontSize: "11px", opacity: 0.7 }}>Health Assistant</div>
          </div>
        </div>

        {/* User card */}
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "14px", padding: "14px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👤</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>{user.name}</div>
              <div style={{ fontSize: "11px", opacity: 0.7 }}>{user.email}</div>
            </div>
          </div>
        </div>

        {/* Quick symptoms */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", opacity: 0.6, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Symptoms</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {SYMPTOM_CHIPS.slice(0, 6).map(s => (
              <button key={s} onClick={() => send(s.replace(/^\S+\s/, ""))}
                style={{
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px", padding: "9px 12px", color: "white", cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif", fontSize: "13px", textAlign: "left", transition: "all 0.15s"
                }}
                onMouseOver={e => e.target.style.background = "rgba(255,255,255,0.18)"}
                onMouseOut={e => e.target.style.background = "rgba(255,255,255,0.08)"}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: "rgba(255,200,0,0.15)", border: "1px solid rgba(255,200,0,0.3)", borderRadius: "10px", padding: "10px 12px", fontSize: "11px", opacity: 0.9, lineHeight: "1.5" }}>
          ⚠️ Not a substitute for professional medical advice. Always consult a doctor.
        </div>

        {/* Logout */}
        <button onClick={() => setUser(null)}
          style={{
            marginTop: "12px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "10px", padding: "10px", color: "white", cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", fontSize: "13px", transition: "all 0.15s"
          }}
          onMouseOver={e => e.target.style.background = "rgba(255,100,100,0.25)"}
          onMouseOut={e => e.target.style.background = "rgba(255,255,255,0.08)"}
        >🚪 Logout</button>
      </div>

      {/* Main Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          background: "white", padding: "16px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between", boxShadow: "0 1px 12px rgba(0,0,0,0.06)", flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "13px", background: "linear-gradient(135deg, #1b6ca8, #16a085)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏥</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#1a202c" }}>MediBot Assistant</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#48bb78" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#48bb78" }} />
                Online — Always here to help
              </div>
            </div>
          </div>
          <div style={{ fontSize: "13px", color: "#718096" }}>👋 Hello, {user.name}!</div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column" }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Symptom chips */}
        <div style={{ padding: "0 20px 12px", display: "flex", gap: "8px", overflowX: "auto", flexShrink: 0 }}>
          {SYMPTOM_CHIPS.map(s => (
            <button key={s} className="chip" onClick={() => send(s.replace(/^\S+\s/, ""))}>{s}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 20px 20px", background: "white", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              className="msg-input"
              placeholder="Apne symptoms batao ya koi sawaal poochho..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
            <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
              {loading ? "⏳" : "➤"}
            </button>
          </div>
          <div style={{ textAlign: "center", fontSize: "11px", color: "#a0aec0", marginTop: "8px" }}>
            ⚕️ AI-powered | Not a substitute for professional medical advice
          </div>
        </div>
      </div>
    </div>
  );
}
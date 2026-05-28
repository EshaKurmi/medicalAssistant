import { useState, useRef, useEffect, useCallback } from "react";

const BACKEND_URL = "https://medicalassistant-pp3n.onrender.com";
const USE_BACKEND = true;

const SYMPTOM_CHIPS = [
  { icon: "🌡️", label: "Fever" }, { icon: "🤕", label: "Headache" },
  { icon: "💔", label: "Chest Pain" }, { icon: "😮‍💨", label: "Cough" },
  { icon: "😴", label: "Fatigue" }, { icon: "🤢", label: "Nausea" },
  { icon: "🦴", label: "Joint Pain" }, { icon: "😵", label: "Dizziness" },
];

const TABS = [
  { icon: "💬", label: "Chat" },
  { icon: "📋", label: "History" },
  { icon: "⚖️", label: "BMI" },
  { icon: "💊", label: "Reminders" },
  { icon: "🏥", label: "Doctors" },
  { icon: "💧", label: "Water" },
  { icon: "😤", label: "Stress" },
  { icon: "❤️", label: "Vitals" },
];

const HEALTH_TIPS = [
  "💧 Drink 8 glasses of water daily for optimal health.",
  "🚶 Walk 30 minutes daily to boost heart health.",
  "😴 7-8 hours of sleep is essential for recovery.",
  "🥗 Eat more fruits and vegetables every day.",
  "🧘 Practice deep breathing to reduce stress.",
  "☀️ Get 15 minutes of sunlight daily for Vitamin D.",
  "🦷 Brush teeth twice a day for oral health.",
  "📵 Reduce screen time before bed for better sleep.",
];

const formatTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const formatDate = () => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ── API WITH TIMEOUT FIX ──────────────────────────────────────────────────────
async function getAIResponse(messages) {
  if (USE_BACKEND) {
    const lastMsg = messages[messages.length - 1].content;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: lastMsg }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      return data.answer;
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === "AbortError") {
        return "⏳ Server warm ho raha hai — 30 seconds baad dobara try karo!";
      }
      return "⚠️ Error aa gaya. Internet check karo aur dobara try karo.";
    }
  }
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07070f; --s1: rgba(255,255,255,0.03); --s2: rgba(255,255,255,0.06);
    --b1: rgba(255,255,255,0.07); --b2: rgba(255,255,255,0.13);
    --acc: #c084fc; --acc2: #818cf8; --acc3: #22d3ee;
    --txt: rgba(255,255,255,0.92); --txt2: rgba(255,255,255,0.45); --txt3: rgba(255,255,255,0.18);
    --red: #f87171; --green: #34d399; --yellow: #fbbf24; --blue: #38bdf8;
    --grad: linear-gradient(135deg,#c084fc,#818cf8,#22d3ee);
    --grad2: linear-gradient(135deg,#7c3aed,#4338ca);
  }
  ::-webkit-scrollbar{width:2px} ::-webkit-scrollbar-thumb{background:rgba(192,132,252,0.25);border-radius:4px}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  @keyframes glow{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:0.6;transform:scale(1.05)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes msg-in{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes slide-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}
  @keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2);opacity:0}}
  @keyframes tab-in{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
  @keyframes count-up{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
  .glass{background:var(--s1);backdrop-filter:blur(24px);border:1px solid var(--b1)}
  .glass2{background:var(--s2);backdrop-filter:blur(24px);border:1px solid var(--b2)}
  .chip{padding:7px 14px;border-radius:99px;cursor:pointer;white-space:nowrap;font-family:'Cabinet Grotesk',sans-serif;font-size:12px;font-weight:500;background:rgba(192,132,252,0.08);border:1px solid rgba(192,132,252,0.2);color:rgba(192,132,252,0.9);transition:all 0.2s}
  .chip:hover{background:rgba(192,132,252,0.2);border-color:rgba(192,132,252,0.5);transform:translateY(-2px);box-shadow:0 6px 20px rgba(192,132,252,0.15)}
  .send-btn{width:48px;height:48px;border-radius:14px;border:none;cursor:pointer;background:var(--grad2);color:white;font-size:17px;transition:all 0.2s;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .send-btn:hover:not(:disabled){transform:scale(1.08) translateY(-1px);box-shadow:0 10px 30px rgba(124,58,237,0.4)}
  .send-btn:disabled{opacity:0.3;cursor:not-allowed}
  .msg-input{flex:1;padding:13px 18px;background:var(--s1);border:1px solid var(--b1);border-radius:14px;color:var(--txt);font-size:14px;font-family:'Cabinet Grotesk',sans-serif;outline:none;transition:all 0.25s}
  .msg-input:focus{border-color:rgba(192,132,252,0.4);background:rgba(192,132,252,0.05);box-shadow:0 0 0 3px rgba(192,132,252,0.08)}
  .msg-input::placeholder{color:var(--txt3)}
  .tab-btn{flex:1;padding:9px 6px;border:none;cursor:pointer;border-radius:11px;font-family:'Cabinet Grotesk',sans-serif;font-size:11px;font-weight:700;transition:all 0.2s;white-space:nowrap;letter-spacing:0.3px}
  .input-field{width:100%;padding:12px 16px;background:var(--s1);border:1px solid var(--b1);border-radius:12px;color:var(--txt);font-size:14px;font-family:'Cabinet Grotesk',sans-serif;outline:none;transition:all 0.2s}
  .input-field:focus{border-color:rgba(192,132,252,0.4);box-shadow:0 0 0 3px rgba(192,132,252,0.08)}
  .input-field::placeholder{color:var(--txt3)}
  .action-btn{padding:12px 20px;border-radius:12px;border:none;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;font-weight:700;font-size:14px;background:var(--grad2);color:white;transition:all 0.2s;width:100%}
  .action-btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(124,58,237,0.35)}
  .action-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
  .sidebar-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid transparent;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;font-size:13px;font-weight:500;color:var(--txt2);transition:all 0.2s;background:transparent;width:100%}
  .sidebar-item:hover{background:var(--s2);border-color:var(--b2);color:var(--txt)}
  @media(max-width:768px){.sidebar{display:none!important}}
`;

function Particles() {
  const colors = ["#c084fc","#818cf8","#22d3ee","#f472b6","#34d399"];
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",zIndex:0,pointerEvents:"none"}}>
      {[...Array(22)].map((_,i)=>(
        <div key={i} style={{position:"absolute",borderRadius:"50%",width:`${Math.random()*3+1}px`,height:`${Math.random()*3+1}px`,background:colors[i%5],left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,opacity:Math.random()*0.35+0.08,animation:`float ${Math.random()*9+6}s ease-in-out infinite`,animationDelay:`${Math.random()*6}s`}}/>
      ))}
      <div style={{position:"fixed",top:"-15%",left:"-10%",width:"600px",height:"600px",borderRadius:"50%",background:"radial-gradient(circle,rgba(192,132,252,0.1) 0%,transparent 65%)",animation:"glow 7s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:"-15%",right:"-10%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(34,211,238,0.08) 0%,transparent 65%)",animation:"glow 9s ease-in-out infinite 2s",pointerEvents:"none"}}/>
    </div>
  );
}

function Logo({size=40}) {
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <div style={{position:"absolute",inset:0,borderRadius:size*0.3,background:"linear-gradient(135deg,#c084fc,#818cf8,#22d3ee)",animation:"spin 8s linear infinite",opacity:0.85}}/>
      <div style={{position:"absolute",inset:2,borderRadius:size*0.27,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.44}}>⚕️</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:10,animation:"msg-in 0.3s ease",marginBottom:16}}>
      <Logo size={34}/>
      <div className="glass" style={{borderRadius:"18px 18px 18px 4px",padding:"14px 20px"}}>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--acc)",animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}
        </div>
      </div>
    </div>
  );
}

function Message({msg}) {
  const isUser = msg.role==="user";
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(msg.content);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return (
    <div style={{display:"flex",flexDirection:isUser?"row-reverse":"row",alignItems:"flex-end",gap:10,marginBottom:16,animation:"msg-in 0.35s cubic-bezier(0.16,1,0.3,1)"}}>
      <div style={{width:34,height:34,borderRadius:11,flexShrink:0,background:isUser?"linear-gradient(135deg,#6366f1,#8b5cf6)":"linear-gradient(135deg,#7c3aed,#22d3ee)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{isUser?"👤":"⚕️"}</div>
      <div style={{maxWidth:"72%",display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start",gap:4}}>
        <div style={{padding:"12px 16px",borderRadius:isUser?"18px 18px 4px 18px":"18px 18px 18px 4px",background:isUser?"linear-gradient(135deg,rgba(99,102,241,0.22),rgba(139,92,246,0.22))":"var(--s1)",border:isUser?"1px solid rgba(99,102,241,0.22)":"1px solid var(--b1)",color:"var(--txt)",fontSize:14,lineHeight:1.75,fontFamily:"'Cabinet Grotesk',sans-serif",backdropFilter:"blur(12px)"}}>
          {msg.content}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:"var(--txt3)",fontFamily:"'Space Mono',monospace"}}>{msg.time}</span>
          <button onClick={copy} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:copied?"var(--green)":"var(--txt3)",transition:"all 0.2s",padding:"2px 6px",borderRadius:6,fontFamily:"'Cabinet Grotesk',sans-serif"}}>
            {copied?"✓ Copied":"⎘ Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WaterTracker() {
  const today = new Date().toDateString();
  const [glasses,setGlasses]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("water-tracker")||"{}");return d.date===today?d.count:0;}catch{return 0;}});
  const goal=8;
  const add=()=>{const n=Math.min(glasses+1,goal);setGlasses(n);localStorage.setItem("water-tracker",JSON.stringify({date:today,count:n}));};
  const reset=()=>{setGlasses(0);localStorage.setItem("water-tracker",JSON.stringify({date:today,count:0}));};
  const pct=Math.round((glasses/goal)*100);
  return (
    <div style={{padding:24,animation:"tab-in 0.3s ease"}}>
      <h2 style={{fontFamily:"'Clash Display',sans-serif",fontSize:22,color:"var(--txt)",marginBottom:6}}>💧 Water Tracker</h2>
      <p style={{color:"var(--txt2)",fontSize:13,marginBottom:28,fontFamily:"'Cabinet Grotesk',sans-serif"}}>Stay hydrated — goal: {goal} glasses/day</p>
      <div style={{display:"flex",justifyContent:"center",marginBottom:32}}>
        <div style={{position:"relative",width:180,height:180}}>
          <svg width="180" height="180" style={{transform:"rotate(-90deg)"}}>
            <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(56,189,248,0.1)" strokeWidth="12"/>
            <circle cx="90" cy="90" r="75" fill="none" stroke="url(#waterGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${2*Math.PI*75}`} strokeDashoffset={`${2*Math.PI*75*(1-pct/100)}`} style={{transition:"stroke-dashoffset 0.5s ease"}}/>
            <defs><linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#38bdf8"/></linearGradient></defs>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:42,fontFamily:"'Clash Display',sans-serif",fontWeight:700,color:"var(--acc3)",lineHeight:1}}>{glasses}</div>
            <div style={{fontSize:13,color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif"}}>of {goal} glasses</div>
            <div style={{fontSize:12,color:"var(--acc3)",fontWeight:700,fontFamily:"'Cabinet Grotesk',sans-serif",marginTop:4}}>{pct}%</div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:24}}>
        {[...Array(goal)].map((_,i)=>(
          <div key={i} style={{width:44,height:44,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,background:i<glasses?"rgba(34,211,238,0.15)":"var(--s1)",border:i<glasses?"1px solid rgba(34,211,238,0.3)":"1px solid var(--b1)",transition:"all 0.3s"}}>
            {i<glasses?"💧":"○"}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button className="action-btn" onClick={add} disabled={glasses>=goal} style={{flex:2}}>+ Add Glass {glasses>=goal?"🎉":""}</button>
        <button onClick={reset} style={{flex:1,padding:"12px 16px",borderRadius:12,border:"1px solid var(--b2)",background:"var(--s1)",color:"var(--txt2)",cursor:"pointer",fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:14}}>Reset</button>
      </div>
      {glasses>=goal&&<div style={{marginTop:16,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:14,padding:14,textAlign:"center",animation:"slide-up 0.4s ease"}}>
        <p style={{color:"var(--green)",fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700}}>🎉 Daily goal achieved! Great job!</p>
      </div>}
    </div>
  );
}

function StressChecker() {
  const questions=["How often do you feel overwhelmed?","How well are you sleeping?","How is your appetite?","How often do you feel anxious?","How is your energy level?"];
  const opts=[["Never","Rarely","Sometimes","Often","Always"],["Very well","Well","Okay","Poorly","Very poorly"],["Normal","Slightly off","Reduced","Very low","No appetite"],["Never","Rarely","Sometimes","Often","Always"],["Very high","High","Moderate","Low","Very low"]];
  const [answers,setAnswers]=useState(Array(5).fill(null));
  const [result,setResult]=useState(null);
  const setAns=(i,v)=>setAnswers(a=>{const n=[...a];n[i]=v;return n;});
  const calc=()=>{
    if(answers.some(a=>a===null))return;
    const score=answers.reduce((s,v)=>s+v,0);
    const pct=Math.round((score/20)*100);
    let level,color,advice;
    if(pct<=25){level="Low Stress ✓";color="var(--green)";advice="Great! You're managing stress well.";}
    else if(pct<=50){level="Moderate Stress";color="var(--yellow)";advice="Consider taking breaks and practicing mindfulness.";}
    else if(pct<=75){level="High Stress";color="#fb923c";advice="Try yoga, deep breathing. Consider professional help.";}
    else{level="Very High Stress ⚠️";color="var(--red)";advice="Please speak with a mental health professional. You matter!";}
    setResult({pct,level,color,advice});
  };
  return (
    <div style={{padding:24,animation:"tab-in 0.3s ease"}}>
      <h2 style={{fontFamily:"'Clash Display',sans-serif",fontSize:22,color:"var(--txt)",marginBottom:6}}>😤 Stress Checker</h2>
      <p style={{color:"var(--txt2)",fontSize:13,marginBottom:24,fontFamily:"'Cabinet Grotesk',sans-serif"}}>Answer honestly for accurate results</p>
      <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:20}}>
        {questions.map((q,i)=>(
          <div key={i} className="glass2" style={{borderRadius:16,padding:16}}>
            <p style={{color:"var(--txt)",fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:14,marginBottom:10,fontWeight:500}}>{i+1}. {q}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {opts[i].map((o,j)=>(
                <button key={j} onClick={()=>setAns(i,j)} style={{padding:"6px 12px",borderRadius:99,border:"1px solid",borderColor:answers[i]===j?"rgba(192,132,252,0.5)":"var(--b1)",background:answers[i]===j?"rgba(192,132,252,0.15)":"var(--s1)",color:answers[i]===j?"var(--acc)":"var(--txt2)",cursor:"pointer",fontSize:12,fontFamily:"'Cabinet Grotesk',sans-serif",transition:"all 0.2s"}}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="action-btn" onClick={calc} disabled={answers.some(a=>a===null)}>Check My Stress Level</button>
      {result&&(
        <div className="glass2" style={{borderRadius:20,padding:24,textAlign:"center",marginTop:20,animation:"slide-up 0.4s ease"}}>
          <div style={{fontSize:48,fontFamily:"'Clash Display',sans-serif",fontWeight:700,color:result.color,marginBottom:8}}>{result.pct}%</div>
          <div style={{fontSize:18,fontWeight:700,color:result.color,fontFamily:"'Cabinet Grotesk',sans-serif",marginBottom:12}}>{result.level}</div>
          <p style={{color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:14,lineHeight:1.6}}>{result.advice}</p>
        </div>
      )}
    </div>
  );
}

function VitalsTracker() {
  const [vitals,setVitals]=useState({bp_sys:"",bp_dia:"",pulse:"",temp:"",spo2:""});
  const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem("vitals-log")||"[]");}catch{return [];}});
  const save=()=>{
    if(!vitals.bp_sys&&!vitals.pulse)return;
    const entry={...vitals,date:formatDate(),time:formatTime(),id:Date.now()};
    const updated=[entry,...saved].slice(0,10);
    setSaved(updated);localStorage.setItem("vitals-log",JSON.stringify(updated));
    setVitals({bp_sys:"",bp_dia:"",pulse:"",temp:"",spo2:""});
  };
  const getBPStatus=(s,d)=>{
    if(!s||!d)return null;
    const sv=parseInt(s),dv=parseInt(d);
    if(sv<120&&dv<80)return{label:"Normal ✓",color:"var(--green)"};
    if(sv<130&&dv<80)return{label:"Elevated",color:"var(--yellow)"};
    if(sv<140||dv<90)return{label:"High Stage 1",color:"#fb923c"};
    return{label:"High Stage 2",color:"var(--red)"};
  };
  const bpStatus=getBPStatus(vitals.bp_sys,vitals.bp_dia);
  return (
    <div style={{padding:24,animation:"tab-in 0.3s ease"}}>
      <h2 style={{fontFamily:"'Clash Display',sans-serif",fontSize:22,color:"var(--txt)",marginBottom:6}}>❤️ Vitals Tracker</h2>
      <p style={{color:"var(--txt2)",fontSize:13,marginBottom:24,fontFamily:"'Cabinet Grotesk',sans-serif"}}>Log and monitor your health metrics</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        {[["bp_sys","Systolic BP","e.g. 120","💉"],["bp_dia","Diastolic BP","e.g. 80","💉"],["pulse","Pulse (bpm)","e.g. 72","💓"],["temp","Temp (°F)","e.g. 98.6","🌡️"],["spo2","SpO2 (%)","e.g. 98","🫁"]].map(([k,l,p,ic])=>(
          <div key={k}>
            <label style={{fontSize:11,color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif",display:"block",marginBottom:6}}>{ic} {l}</label>
            <input className="input-field" type="number" placeholder={p} value={vitals[k]} onChange={e=>setVitals(v=>({...v,[k]:e.target.value}))} style={{padding:"10px 14px",fontSize:13}}/>
          </div>
        ))}
      </div>
      {bpStatus&&<div style={{marginBottom:14,padding:"10px 14px",borderRadius:12,background:`${bpStatus.color}15`,border:`1px solid ${bpStatus.color}30`}}>
        <span style={{fontSize:12,color:bpStatus.color,fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:700}}>BP Status: {bpStatus.label}</span>
      </div>}
      <button className="action-btn" onClick={save}>Save Vitals</button>
      {saved.length>0&&(
        <div style={{marginTop:20}}>
          <p style={{fontSize:11,color:"var(--txt3)",fontFamily:"'Cabinet Grotesk',sans-serif",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>Recent Logs</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {saved.slice(0,5).map(e=>(
              <div key={e.id} className="glass" style={{borderRadius:14,padding:"12px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,color:"var(--acc)",fontFamily:"'Space Mono',monospace"}}>{e.date} {e.time}</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {e.bp_sys&&<span style={{fontSize:12,color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif",background:"var(--s2)",padding:"3px 8px",borderRadius:6}}>BP: {e.bp_sys}/{e.bp_dia}</span>}
                  {e.pulse&&<span style={{fontSize:12,color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif",background:"var(--s2)",padding:"3px 8px",borderRadius:6}}>Pulse: {e.pulse}</span>}
                  {e.temp&&<span style={{fontSize:12,color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif",background:"var(--s2)",padding:"3px 8px",borderRadius:6}}>Temp: {e.temp}°F</span>}
                  {e.spo2&&<span style={{fontSize:12,color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif",background:"var(--s2)",padding:"3px 8px",borderRadius:6}}>SpO2: {e.spo2}%</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BMICalculator() {
  const [h,setH]=useState(""); const [w,setW]=useState(""); const [bmi,setBmi]=useState(null);
  const calc=()=>{const hm=parseFloat(h)/100;const wkg=parseFloat(w);if(!hm||!wkg)return;setBmi((wkg/(hm*hm)).toFixed(1));};
  const cat=bmi?parseFloat(bmi)<18.5?{label:"Underweight",color:"var(--blue)",tip:"Increase calorie intake with nutritious foods."}:parseFloat(bmi)<25?{label:"Normal Weight ✓",color:"var(--green)",tip:"Great! Maintain your healthy lifestyle."}:parseFloat(bmi)<30?{label:"Overweight",color:"var(--yellow)",tip:"Consider light exercise and a balanced diet."}:{label:"Obese",color:"var(--red)",tip:"Please consult a doctor for a personalized plan."}:null;
  return (
    <div style={{padding:24,animation:"tab-in 0.3s ease"}}>
      <h2 style={{fontFamily:"'Clash Display',sans-serif",fontSize:22,color:"var(--txt)",marginBottom:6}}>⚖️ BMI Calculator</h2>
      <p style={{color:"var(--txt2)",fontSize:13,marginBottom:24,fontFamily:"'Cabinet Grotesk',sans-serif"}}>Calculate your Body Mass Index</p>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
        {[["Height (cm)","e.g. 170",h,setH],["Weight (kg)","e.g. 65",w,setW]].map(([l,p,v,s])=>(
          <div key={l}>
            <label style={{fontSize:11,color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.8px"}}>{l}</label>
            <input className="input-field" type="number" placeholder={p} value={v} onChange={e=>s(e.target.value)}/>
          </div>
        ))}
        <button className="action-btn" onClick={calc}>Calculate BMI</button>
      </div>
      {bmi&&cat&&(
        <div className="glass2" style={{borderRadius:20,padding:24,textAlign:"center",animation:"slide-up 0.4s ease"}}>
          <div style={{fontSize:56,fontFamily:"'Clash Display',sans-serif",fontWeight:700,color:cat.color,lineHeight:1}}>{bmi}</div>
          <div style={{fontSize:16,color:cat.color,fontWeight:700,fontFamily:"'Cabinet Grotesk',sans-serif",marginTop:8,marginBottom:12}}>{cat.label}</div>
          <p style={{color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:13,lineHeight:1.6}}>{cat.tip}</p>
        </div>
      )}
    </div>
  );
}

function MedicineReminder() {
  const [reminders,setReminders]=useState(()=>{try{return JSON.parse(localStorage.getItem("medibot-reminders")||"[]");}catch{return [];}});
  const [form,setForm]=useState({name:"",time:"",freq:"Daily",dose:""});
  const save=()=>{
    if(!form.name||!form.time)return;
    const updated=[...reminders,{...form,id:Date.now(),taken:false}];
    setReminders(updated);localStorage.setItem("medibot-reminders",JSON.stringify(updated));
    setForm({name:"",time:"",freq:"Daily",dose:""});
  };
  const del=(id)=>{const u=reminders.filter(r=>r.id!==id);setReminders(u);localStorage.setItem("medibot-reminders",JSON.stringify(u));};
  const toggle=(id)=>{const u=reminders.map(r=>r.id===id?{...r,taken:!r.taken}:r);setReminders(u);localStorage.setItem("medibot-reminders",JSON.stringify(u));};
  return (
    <div style={{padding:24,animation:"tab-in 0.3s ease"}}>
      <h2 style={{fontFamily:"'Clash Display',sans-serif",fontSize:22,color:"var(--txt)",marginBottom:6}}>💊 Medicine Reminders</h2>
      <p style={{color:"var(--txt2)",fontSize:13,marginBottom:24,fontFamily:"'Cabinet Grotesk',sans-serif"}}>Never miss your medication again</p>
      <div className="glass2" style={{borderRadius:18,padding:20,marginBottom:20}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input className="input-field" placeholder="Medicine name (e.g. Paracetamol 500mg)" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input className="input-field" placeholder="Dosage (e.g. 1 tablet)" value={form.dose} onChange={e=>setForm(f=>({...f,dose:e.target.value}))}/>
          <div style={{display:"flex",gap:10}}>
            <input className="input-field" type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} style={{flex:1}}/>
            <select className="input-field" value={form.freq} onChange={e=>setForm(f=>({...f,freq:e.target.value}))} style={{flex:1}}>
              {["Daily","Twice Daily","3x Daily","Weekly","As Needed"].map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
          <button className="action-btn" onClick={save}>+ Add Reminder</button>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {reminders.length===0&&<p style={{color:"var(--txt3)",fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:13,textAlign:"center",padding:24}}>No reminders yet 💊</p>}
        {reminders.map(r=>(
          <div key={r.id} className="glass" style={{borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",opacity:r.taken?0.5:1,transition:"all 0.3s"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>toggle(r.id)} style={{width:32,height:32,borderRadius:10,border:"1px solid",borderColor:r.taken?"var(--green)":"var(--b2)",background:r.taken?"rgba(52,211,153,0.15)":"var(--s1)",color:r.taken?"var(--green)":"var(--txt3)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s"}}>
                {r.taken?"✓":"○"}
              </button>
              <div>
                <div style={{color:r.taken?"var(--txt2)":"var(--txt)",fontWeight:700,fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:14,textDecoration:r.taken?"line-through":"none"}}>{r.name}</div>
                <div style={{color:"var(--txt3)",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{r.time} • {r.freq}{r.dose?` • ${r.dose}`:""}</div>
              </div>
            </div>
            <button onClick={()=>del(r.id)} style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.15)",borderRadius:8,padding:"5px 10px",color:"#f87171",cursor:"pointer",fontSize:11,fontFamily:"'Cabinet Grotesk',sans-serif"}}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatHistory({history,onLoad,onClear}) {
  return (
    <div style={{padding:24,animation:"tab-in 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <h2 style={{fontFamily:"'Clash Display',sans-serif",fontSize:22,color:"var(--txt)",marginBottom:4}}>📋 Chat History</h2>
          <p style={{color:"var(--txt2)",fontSize:13,fontFamily:"'Cabinet Grotesk',sans-serif"}}>{history.length} saved sessions</p>
        </div>
        {history.length>0&&<button onClick={onClear} style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:"8px 14px",color:"#f87171",cursor:"pointer",fontSize:12,fontFamily:"'Cabinet Grotesk',sans-serif"}}>Clear All</button>}
      </div>
      {history.length===0&&<div style={{textAlign:"center",padding:40,color:"var(--txt3)",fontFamily:"'Cabinet Grotesk',sans-serif"}}>No saved chats. Start chatting! 💬</div>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {history.map((s,i)=>(
          <div key={i} className="glass" style={{borderRadius:16,padding:18,cursor:"pointer",transition:"all 0.2s"}} onClick={()=>onLoad(s)}
            onMouseOver={e=>e.currentTarget.style.borderColor="rgba(192,132,252,0.3)"}
            onMouseOut={e=>e.currentTarget.style.borderColor="var(--b1)"}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:11,color:"var(--acc)",fontFamily:"'Space Mono',monospace"}}>{s.date}</span>
              <span style={{fontSize:11,color:"var(--txt3)",fontFamily:"'Cabinet Grotesk',sans-serif"}}>{s.messages.length} msgs</span>
            </div>
            <p style={{color:"var(--txt2)",fontSize:13,fontFamily:"'Cabinet Grotesk',sans-serif",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
              {s.messages.find(m=>m.role==="user")?.content||"Chat session"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoctorsNearby() {
  const [city,setCity]=useState(""); const [spec,setSpec]=useState("General Physician"); const [done,setDone]=useState(false);
  const open=()=>{if(!city)return;window.open(`https://www.google.com/maps/search/${encodeURIComponent(`${spec} near ${city}`)}`, "_blank");setDone(true);};
  return (
    <div style={{padding:24,animation:"tab-in 0.3s ease"}}>
      <h2 style={{fontFamily:"'Clash Display',sans-serif",fontSize:22,color:"var(--txt)",marginBottom:6}}>🏥 Find Doctors</h2>
      <p style={{color:"var(--txt2)",fontSize:13,marginBottom:24,fontFamily:"'Cabinet Grotesk',sans-serif"}}>Find specialists near you instantly</p>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
        <input className="input-field" placeholder="Your city (e.g. Mumbai)" value={city} onChange={e=>setCity(e.target.value)}/>
        <select className="input-field" value={spec} onChange={e=>setSpec(e.target.value)}>
          {["General Physician","Cardiologist","Neurologist","Orthopedic","Dermatologist","Pediatrician","Gynecologist","Psychiatrist","ENT Specialist","Ophthalmologist","Diabetologist","Gastroenterologist"].map(s=><option key={s}>{s}</option>)}
        </select>
        <button className="action-btn" onClick={open}>🔍 Find on Google Maps</button>
        {done&&<div style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:12,padding:12,textAlign:"center"}}><p style={{color:"var(--green)",fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:13}}>✓ Opened Google Maps!</p></div>}
      </div>
      <div className="glass" style={{borderRadius:16,padding:18}}>
        <p style={{fontSize:11,color:"var(--txt3)",fontFamily:"'Cabinet Grotesk',sans-serif",textTransform:"uppercase",letterSpacing:"1px",marginBottom:14}}>🚨 Emergency Numbers</p>
        {[["🚑 Ambulance","108"],["👮 Police","100"],["🔥 Fire","101"],["👩 Women Helpline","1091"],["🧓 Senior Citizen","14567"],["☎️ Health Helpline","104"]].map(([n,num])=>(
          <div key={n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--b1)"}}>
            <span style={{color:"var(--txt2)",fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:13}}>{n}</span>
            <a href={`tel:${num}`} style={{color:"var(--acc)",fontFamily:"'Space Mono',monospace",fontSize:15,fontWeight:700,textDecoration:"none"}}>{num}</a>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginScreen({onAuth}) {
  const [isLogin,setIsLogin]=useState(true);
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const [tip]=useState(()=>HEALTH_TIPS[Math.floor(Math.random()*HEALTH_TIPS.length)]);
  const handle=async()=>{
    setError("");
    if(!form.email||!form.password)return setError("Saari fields bharo!");
    if(!isLogin&&!form.name)return setError("Naam bhi bharo!");
    if(form.password.length<6)return setError("Password 6+ characters ka ho!");
    setLoading(true);
    await new Promise(r=>setTimeout(r,900));
    onAuth({name:form.name||form.email.split("@")[0],email:form.email});
    setLoading(false);
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",padding:20,position:"relative",overflow:"hidden"}}>
      <Particles/>
      <div className="glass" style={{borderRadius:28,padding:44,width:"100%",maxWidth:420,position:"relative",zIndex:1,boxShadow:"0 40px 100px rgba(0,0,0,0.6)",animation:"slide-up 0.5s cubic-bezier(0.16,1,0.3,1)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{margin:"0 auto 16px"}}><Logo size={66}/></div>
          <h1 style={{fontFamily:"'Clash Display',sans-serif",fontSize:30,fontWeight:700,color:"var(--txt)",marginBottom:6,letterSpacing:"-1px"}}>MediBot</h1>
          <p style={{color:"var(--txt2)",fontSize:13,fontFamily:"'Cabinet Grotesk',sans-serif"}}>AI-Powered Health Assistant</p>
        </div>
        <div style={{background:"rgba(192,132,252,0.08)",border:"1px solid rgba(192,132,252,0.15)",borderRadius:12,padding:"10px 14px",marginBottom:20}}>
          <p style={{fontSize:12,color:"rgba(192,132,252,0.8)",fontFamily:"'Cabinet Grotesk',sans-serif",lineHeight:1.5}}>{tip}</p>
        </div>
        <div style={{display:"flex",background:"rgba(255,255,255,0.03)",borderRadius:14,padding:4,marginBottom:20,border:"1px solid var(--b1)"}}>
          {["Login","Sign Up"].map((t,i)=>(
            <button key={t} className="tab-btn" onClick={()=>{setIsLogin(i===0);setError("");}}
              style={{background:(i===0)===isLogin?"rgba(192,132,252,0.15)":"transparent",color:(i===0)===isLogin?"var(--acc)":"var(--txt3)",border:(i===0)===isLogin?"1px solid rgba(192,132,252,0.25)":"1px solid transparent"}}>{t}</button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {!isLogin&&<input className="input-field" placeholder="Your name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>}
          <input className="input-field" type="email" placeholder="Email address" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          <input className="input-field" type="password" placeholder="Password (6+ chars)" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handle()}/>
          {error&&<div style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:12,padding:"11px 14px",color:"#f87171",fontSize:13,fontFamily:"'Cabinet Grotesk',sans-serif"}}>⚠️ {error}</div>}
          <button className="action-btn" onClick={handle} disabled={loading} style={{padding:15,fontSize:15}}>{loading?"Please wait...":isLogin?"Continue →":"Create Account →"}</button>
        </div>
        <p style={{textAlign:"center",marginTop:18,fontSize:11,color:"var(--txt3)",fontFamily:"'Cabinet Grotesk',sans-serif"}}>🔒 Demo mode • No data stored on servers</p>
      </div>
    </div>
  );
}

export default function App() {
  const [user,setUser]=useState(null);
  const [activeTab,setActiveTab]=useState(0);
  const [messages,setMessages]=useState([{role:"assistant",content:"Namaste! 🙏 Main MediBot hoon — aapka personal AI health assistant.\n\nMain aapki help kar sakta hoon:\n• Symptoms analyze karna\n• Health tips dena\n• BMI calculate karna\n• Medicines track karna\n• Doctors dhundhna\n\nAaj aapki kya madad kar sakta hoon?",time:formatTime()}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [listening,setListening]=useState(false);
  const [chatHistory,setChatHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("medibot-history")||"[]");}catch{return [];}});
  const [dailyTip]=useState(()=>HEALTH_TIPS[new Date().getDay()%HEALTH_TIPS.length]);
  const bottomRef=useRef(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  const startListening=useCallback(()=>{
    if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){alert("Use Chrome for voice input!");return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR();rec.lang="en-IN";rec.continuous=false;rec.interimResults=false;
    rec.onstart=()=>setListening(true);
    rec.onresult=e=>{setInput(e.results[0][0].transcript);setListening(false);};
    rec.onerror=()=>setListening(false);rec.onend=()=>setListening(false);
    rec.start();
  },[]);

  const send=async(text)=>{
    const query=text||input.trim();
    if(!query||loading)return;
    setInput("");
    const userMsg={role:"user",content:query,time:formatTime()};
    const newMsgs=[...messages,userMsg];
    setMessages(newMsgs);setLoading(true);
    try{
      const answer=await getAIResponse(newMsgs.slice(-20).map(m=>({role:m.role,content:m.content})));
      const final=[...newMsgs,{role:"assistant",content:answer,time:formatTime()}];
      setMessages(final);
      if(final.length>=2){const s={date:formatDate(),time:formatTime(),messages:final};const u=[s,...chatHistory].slice(0,20);setChatHistory(u);localStorage.setItem("medibot-history",JSON.stringify(u));}
    }catch{setMessages(p=>[...p,{role:"assistant",content:"⚠️ Error aa gaya. Dobara try karo.",time:formatTime()}]);}
    setLoading(false);
  };

  if(!user)return <LoginScreen onAuth={setUser}/>;

  const tabContent=()=>{
    switch(activeTab){
      case 1:return <ChatHistory history={chatHistory} onLoad={s=>{setMessages(s.messages);setActiveTab(0);}} onClear={()=>{setChatHistory([]);localStorage.removeItem("medibot-history");}}/>;
      case 2:return <BMICalculator/>;
      case 3:return <MedicineReminder/>;
      case 4:return <DoctorsNearby/>;
      case 5:return <WaterTracker/>;
      case 6:return <StressChecker/>;
      case 7:return <VitalsTracker/>;
      default:return null;
    }
  };

  return (
    <div style={{height:"100vh",display:"flex",background:"var(--bg)",overflow:"hidden",fontFamily:"'Cabinet Grotesk',sans-serif",position:"relative"}}>
      <style>{CSS}</style>
      <Particles/>

      {/* SIDEBAR */}
      <div className="sidebar glass" style={{width:252,flexShrink:0,display:"flex",flexDirection:"column",padding:"18px 12px",borderRight:"1px solid var(--b1)",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,padding:"0 6px"}}>
          <Logo size={36}/>
          <div>
            <div style={{fontFamily:"'Clash Display',sans-serif",fontSize:15,fontWeight:700,color:"var(--txt)",letterSpacing:"-0.5px"}}>MediBot</div>
            <div style={{fontSize:9,color:"var(--txt3)",letterSpacing:"1px"}}>AI HEALTH ASSISTANT</div>
          </div>
        </div>
        <div style={{background:"rgba(192,132,252,0.08)",border:"1px solid rgba(192,132,252,0.13)",borderRadius:14,padding:"11px 13px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>👤</div>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:"var(--txt)"}}>{user.name}</div>
              <div style={{fontSize:10,color:"var(--txt3)"}}>{user.email}</div>
            </div>
          </div>
        </div>
        <div style={{fontSize:9,color:"var(--txt3)",marginBottom:8,padding:"0 6px",textTransform:"uppercase",letterSpacing:"1.5px",fontWeight:700}}>Menu</div>
        <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:16,flex:1,overflow:"auto"}}>
          {TABS.map((t,i)=>(
            <button key={t.label} className="sidebar-item" onClick={()=>setActiveTab(i)}
              style={{background:activeTab===i?"rgba(192,132,252,0.12)":"transparent",borderColor:activeTab===i?"rgba(192,132,252,0.25)":"transparent",color:activeTab===i?"var(--acc)":"var(--txt2)",fontWeight:activeTab===i?700:500}}>
              <span style={{fontSize:15}}>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{background:"rgba(192,132,252,0.06)",border:"1px solid rgba(192,132,252,0.12)",borderRadius:12,padding:"10px 12px",marginBottom:10}}>
          <p style={{fontSize:11,color:"rgba(192,132,252,0.5)",lineHeight:1.5}}>💡 {dailyTip}</p>
        </div>
        <div style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.1)",borderRadius:12,padding:"9px 12px",marginBottom:10}}>
          <p style={{fontSize:11,color:"rgba(251,191,36,0.5)",lineHeight:1.5}}>⚠️ Not a substitute for professional advice.</p>
        </div>
        <button onClick={()=>setUser(null)} style={{padding:9,borderRadius:12,border:"1px solid rgba(248,113,113,0.12)",background:"rgba(248,113,113,0.05)",color:"rgba(248,113,113,0.6)",cursor:"pointer",fontSize:13,fontFamily:"'Cabinet Grotesk',sans-serif",transition:"all 0.2s"}}
          onMouseOver={e=>{e.target.style.background="rgba(248,113,113,0.12)";e.target.style.color="#f87171";}}
          onMouseOut={e=>{e.target.style.background="rgba(248,113,113,0.05)";e.target.style.color="rgba(248,113,113,0.6)";}}>
          🚪 Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",zIndex:1}}>
        <div className="glass" style={{padding:"13px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--b1)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <Logo size={40}/>
            <div>
              <div style={{fontFamily:"'Clash Display',sans-serif",fontWeight:700,fontSize:16,color:"var(--txt)",letterSpacing:"-0.5px"}}>MediBot Assistant</div>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--green)"}}>
                <div style={{position:"relative",width:7,height:7}}>
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"var(--green)",animation:"ping 1.5s ease-out infinite"}}/>
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"var(--green)"}}/>
                </div>
                Online — Always here for you
              </div>
            </div>
          </div>
          <div style={{fontSize:13,color:"var(--txt2)"}}>👋 <span style={{color:"var(--acc)",fontWeight:700}}>{user.name}</span></div>
        </div>

        <div style={{display:"flex",padding:"8px 14px",gap:4,borderBottom:"1px solid var(--b1)",flexShrink:0,overflowX:"auto"}}>
          {TABS.map((t,i)=>(
            <button key={t.label} className="tab-btn" onClick={()=>setActiveTab(i)}
              style={{background:activeTab===i?"rgba(192,132,252,0.15)":"transparent",color:activeTab===i?"var(--acc)":"var(--txt3)",border:activeTab===i?"1px solid rgba(192,132,252,0.25)":"1px solid transparent",fontWeight:activeTab===i?700:500,minWidth:"fit-content",padding:"8px 12px"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab===0?(
          <>
            <div style={{flex:1,overflowY:"auto",padding:"20px 22px",display:"flex",flexDirection:"column"}}>
              {messages.map((msg,i)=><Message key={i} msg={msg}/>)}
              {loading&&<TypingIndicator/>}
              <div ref={bottomRef}/>
            </div>
            <div style={{padding:"0 18px 10px",display:"flex",gap:8,overflowX:"auto",flexShrink:0}}>
              {SYMPTOM_CHIPS.map(s=><button key={s.label} className="chip" onClick={()=>send(s.label)}>{s.icon} {s.label}</button>)}
            </div>
            <div style={{padding:"10px 18px 20px",borderTop:"1px solid var(--b1)",flexShrink:0}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <button onClick={startListening} style={{width:48,height:48,borderRadius:14,border:"1px solid",borderColor:listening?"var(--acc)":"var(--b1)",background:listening?"rgba(192,132,252,0.15)":"var(--s1)",color:listening?"var(--acc)":"var(--txt3)",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s",flexShrink:0}}>🎤</button>
                <input className="msg-input" placeholder="Apne symptoms batao ya sawaal poochho..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
                <button className="send-btn" onClick={()=>send()} disabled={loading||!input.trim()}>{loading?"⏳":"➤"}</button>
              </div>
              <div style={{textAlign:"center",fontSize:11,color:"var(--txt3)",marginTop:8}}>⚕️ AI-powered • Not a substitute for professional medical advice</div>
            </div>
          </>
        ):(
          <div style={{flex:1,overflowY:"auto"}}>{tabContent()}</div>
        )}
      </div>
    </div>
  );
}
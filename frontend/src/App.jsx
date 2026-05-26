import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function App() {

const [input,setInput]=useState("");
const [loading,setLoading]=useState(false);
const chatEndRef=useRef(null);

const [chat,setChat]=useState([
{
role:"assistant",
text:"👋 Hello! I am your Medical AI Assistant"
}
]);

useEffect(()=>{
chatEndRef.current?.scrollIntoView({behavior:"smooth"});
},[chat]);

async function send(){

if(!input.trim()) return;

const msg=input;

setChat(prev=>[
...prev,
{role:"user",text:msg}
]);

setInput("");
setLoading(true);

try{

const res=await fetch(
"https://medicalassistant-61kf.onrender.com/chat",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
query:msg
})
}
);

const data=await res.json();

setChat(prev=>[
...prev,
{role:"assistant",text:data.answer}
]);

}
catch{

setChat(prev=>[
...prev,
{role:"assistant",text:"⚠️ Server Error"}
]);

}

setLoading(false);

}

return(

<div className="min-h-screen flex items-center justify-center bg-black text-white">

{/* glow background */}
<div className="absolute w-[400px] h-[400px] bg-green-500 blur-[150px] opacity-30 rounded-full top-10 left-10"></div>
<div className="absolute w-[400px] h-[400px] bg-cyan-500 blur-[150px] opacity-30 rounded-full bottom-10 right-10"></div>

<div className="w-full max-w-3xl z-10">

<motion.div
initial={{opacity:0,y:-30}}
animate={{opacity:1,y:0}}
className="text-center text-4xl font-bold mb-4"
>
🩺 Medical AI Assistant
</motion.div>

{/* chat box */}
<div className="h-[600px] overflow-y-auto p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">

{chat.map((c,i)=>(
<motion.div
key={i}
initial={{opacity:0,y:10}}
animate={{opacity:1,y:0}}
className={`mb-3 flex ${c.role==="user"?"justify-end":"justify-start"}`}
>
<div className={`px-4 py-2 rounded-2xl max-w-[70%] ${
c.role==="user"
?"bg-green-500 text-black"
:"bg-white/10"
}`}>
{c.text}
</div>
</motion.div>
))}

{loading && (
<div className="text-gray-400">Typing...</div>
)}

<div ref={chatEndRef}></div>

</div>

{/* input */}
<div className="flex gap-2 mt-4">

<input
value={input}
onChange={(e)=>setInput(e.target.value)}
placeholder="Ask your medical question..."
className="flex-1 p-4 rounded-2xl bg-white/10 border border-white/20 outline-none"
/>

<button
onClick={send}
className="bg-gradient-to-r from-green-400 to-cyan-400 text-black px-6 rounded-2xl"
>
<Send />
</button>

</div>

</div>

</div>

);

}
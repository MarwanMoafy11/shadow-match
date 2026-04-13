import React, { useMemo, useRef, useState } from 'react';

const rounds = [5,5,4,6,5];

function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

export default function App(){
  const [round,setRound]=useState(0);
  const [msg,setMsg]=useState('');
  const timer=useRef(null);
  const count = rounds[round];
  const items = useMemo(()=>shuffle(Array.from({length:count},(_,i)=>i+1)),[round]);
  const targets = useMemo(()=>shuffle(items),[round]);
  const [done,setDone]=useState([]);
  const [drag,setDrag]=useState(null);
  const [finished,setFinished]=useState(false);
  const [selected,setSelected]=useState(null);
  const ghost = useRef(null);
  const clap = useRef(null);

  const show=(t)=>{ setMsg(t); clearTimeout(timer.current); timer.current=setTimeout(()=>setMsg(''),1800); };
  const unlockAudio=()=>{ try { const Ctx = window.AudioContext || window.webkitAudioContext; if(!window.__ctx) window.__ctx = new Ctx(); if(window.__ctx.state==='suspended') window.__ctx.resume(); } catch(e){} };
  const noiseBurst=(delay=0,dur=0.18)=>{ try { const ctx = window.__ctx; if(!ctx) return; const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate); const data = buffer.getChannelData(0); for(let i=0;i<data.length;i++){ data[i] = (Math.random()*2-1) * (1-i/data.length); } const src = ctx.createBufferSource(); src.buffer = buffer; const filter = ctx.createBiquadFilter(); filter.type='highpass'; filter.frequency.value=1200; const g = ctx.createGain(); g.gain.value=0.0001; src.connect(filter); filter.connect(g); g.connect(ctx.destination); const t = ctx.currentTime + delay; g.gain.exponentialRampToValueAtTime(0.25, t+0.01); g.gain.exponentialRampToValueAtTime(0.0001, t+dur); src.start(t); src.stop(t+dur); } catch(e){} };
  const playClap=()=>{ unlockAudio(); if(clap.current){ clap.current.currentTime=0; clap.current.play().catch(()=>{}); } };

  const drop=(id)=>{
    const active = drag ?? selected;
    if(active===null || done.includes(id)) return;
    if(active===id){
      const next=[...done,id]; setDone(next); show('⭐ رائع');
      if(next.length===count){ playClap();
        setTimeout(()=>{
          if(round<rounds.length-1){ setRound(r=>r+1); setDone([]); }
          else { setFinished(true); show('🎉 ممتاز'); }
        },1200);
      }
    } else show('❌ حاول تاني');
    setDrag(null); setSelected(null);
  };

  if(finished) return <div className='min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-green-100 p-6 flex items-center justify-center text-center'><div className='bg-white p-10 rounded-3xl shadow-2xl max-w-xl'><div className='text-6xl mb-4'>🏆</div><h1 className='text-4xl font-bold mb-4'>مبروك 🎉</h1><p className='text-2xl mb-6'>أنت كده حليت كل التحديات 👏🔥</p><button onClick={()=>{setRound(0);setDone([]);setFinished(false);}} className='px-6 py-3 bg-green-500 text-white rounded-2xl text-xl font-bold'>🔄 العب من جديد</button></div></div>;

  return <div className='min-h-screen bg-gradient-to-br from-pink-100 via-sky-100 to-yellow-100 p-3 md:p-6 text-center overflow-x-hidden overscroll-none' style={{touchAction:'none'}}>
    {msg && <div className='fixed top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow text-2xl font-bold z-50'>{msg}</div>}
    <h1 className='text-2xl md:text-4xl font-bold mb-2'>🎮 لعبة توصيل الظل</h1>
    <p className='mb-4 text-base md:text-xl'>الجولة {round+1} / {rounds.length}</p>

    <div className='max-w-5xl mx-auto space-y-3'>
      {targets.map((id,rowIndex)=><div key={id} className='grid grid-cols-2 gap-3 items-center'>
        <div draggable={!done.includes(items[rowIndex])} onDragStart={() => setDrag(items[rowIndex])} onTouchStart={(e) => { const t=e.touches[0]; setDrag(items[rowIndex]); if(ghost.current){ghost.current.style.display='block'; ghost.current.style.left=t.clientX+"px"; ghost.current.style.top=t.clientY+"px";} }} onTouchMove={(e)=>{e.preventDefault(); const t=e.touches[0]; if(ghost.current){ghost.current.style.left=t.clientX+"px"; ghost.current.style.top=t.clientY+"px";}}} onTouchEnd={(e)=>{const t=e.changedTouches[0]; const el=document.elementFromPoint(t.clientX,t.clientY); const box=el?.closest('[data-drop]'); if(box) drop(Number(box.getAttribute('data-drop'))); else setDrag(null); if(ghost.current) ghost.current.style.display='none';}} onClick={() => setSelected(items[rowIndex])} className={`bg-white rounded-2xl p-2 shadow h-20 md:h-32 flex items-center justify-center cursor-grab ${done.includes(items[rowIndex])?'opacity-30':''}`}>
          <img src={`/images/round${round+1}/item${items[rowIndex]}.png`} className='max-h-full object-contain' />
        </div>
        <div data-drop={id} onDragOver={(e)=>e.preventDefault()} onDrop={()=>drop(id)} onClick={()=>drop(id)} className='bg-white rounded-2xl p-2 shadow h-20 md:h-32 flex items-center justify-center'>
          {done.includes(id) ? <img src={`/images/round${round+1}/item${id}.png`} className='max-h-full object-contain' /> : <img src={`/images/round${round+1}/shadow${id}.png`} className='max-h-full object-contain' onError={(e)=>{e.currentTarget.src=`/images/round${round+1}/item${id}.png`; e.currentTarget.className='max-h-full object-contain opacity-20 grayscale brightness-0';}} />}
        </div>
      </div>)}
    </div>

    <audio ref={clap} src='/sounds/clap.mp3' preload='auto' />
    <div ref={ghost} className='fixed hidden pointer-events-none z-50 w-12 h-12 md:w-16 md:h-16 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow'></div><p className='mt-6 text-gray-600'>اسحب الصورة وضعها فوق الظل الصحيح</p>
  </div>;
}

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

  const show=(t)=>{ setMsg(t); clearTimeout(timer.current); timer.current=setTimeout(()=>setMsg(''),1800); };

  const drop=(id)=>{
    const active = drag ?? selected;
    if(active===null || done.includes(id)) return;
    if(active===id){
      const next=[...done,id]; setDone(next); show('⭐ رائع');
      if(next.length===count){
        setTimeout(()=>{
          if(round<rounds.length-1){ setRound(r=>r+1); setDone([]); }
          else { setFinished(true); show('🎉 ممتاز'); }
        },1200);
      }
    } else show('❌ حاول تاني');
    setDrag(null); setSelected(null);
  };

  if(finished) return <div className='min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-green-100 p-6 flex items-center justify-center text-center'><div className='bg-white p-10 rounded-3xl shadow-2xl max-w-xl'><div className='text-6xl mb-4'>🏆</div><h1 className='text-4xl font-bold mb-4'>مبروك 🎉</h1><p className='text-2xl mb-6'>أنت كده حليت كل التحديات 👏🔥</p><button onClick={()=>{setRound(0);setDone([]);setFinished(false);}} className='px-6 py-3 bg-green-500 text-white rounded-2xl text-xl font-bold'>🔄 العب من جديد</button></div></div>;

  return <div className='min-h-screen bg-gradient-to-br from-pink-100 via-sky-100 to-yellow-100 p-3 md:p-6 text-center overflow-x-hidden'>
    {msg && <div className='fixed top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow text-2xl font-bold z-50'>{msg}</div>}
    <h1 className='text-2xl md:text-4xl font-bold mb-2'>🎮 لعبة توصيل الظل</h1>
    <p className='mb-4 text-base md:text-xl'>الجولة {round+1} / {rounds.length}</p>

    <div className='grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 max-w-4xl mx-auto'>
      {items.map(id => (
        <div key={id} draggable={!done.includes(id)} onDragStart={() => setDrag(id)} onTouchStart={(e) => { const t=e.touches[0]; setDrag(id); if(ghost.current){ghost.current.style.display='block'; ghost.current.style.left=t.clientX+'px'; ghost.current.style.top=t.clientY+'px';}}} onTouchMove={(e)=>{e.preventDefault(); const t=e.touches[0]; if(ghost.current){ghost.current.style.left=t.clientX+'px'; ghost.current.style.top=t.clientY+'px';}}} onTouchEnd={(e)=>{const t=e.changedTouches[0]; const el=document.elementFromPoint(t.clientX,t.clientY); const box=el?.closest('[data-drop]'); if(box) drop(Number(box.getAttribute('data-drop'))); else setDrag(null); if(ghost.current) ghost.current.style.display='none';}} onClick={() => setSelected(id)} className={`bg-white rounded-2xl p-3 shadow h-24 md:h-36 flex items-center justify-center cursor-grab active:scale-95 ${done.includes(id)?'opacity-30':''}`}>
          <img src={`/images/round${round+1}/item${id}.png`} className='max-h-full object-contain' onError={(e)=>e.currentTarget.parentElement.innerHTML='ضع الصورة هنا'} />
        </div>
      ))}
    </div>

    <div className='mt-4 md:mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto'>
      {targets.map(id=><div key={id} data-drop={id} onDragOver={(e)=>e.preventDefault()} onDrop={()=>drop(id)} onClick={()=>drop(id)} className='bg-white rounded-2xl p-3 shadow h-24 md:h-36 flex items-center justify-center'>
        {done.includes(id)
          ? <img src={`/images/round${round+1}/item${id}.png`} className='max-h-full object-contain' />
          : <img src={`/images/round${round+1}/shadow${id}.png`} className='max-h-full object-contain' onError={(e)=>{e.currentTarget.src=`/images/round${round+1}/item${id}.png`; e.currentTarget.className='max-h-full object-contain opacity-20 grayscale brightness-0';}} />}
      </div>)}
    </div>

    <div ref={ghost} className='fixed hidden pointer-events-none z-50 w-14 h-14 md:w-20 md:h-20 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow'></div><p className='mt-6 text-gray-600'>اسحب الصورة وضعها فوق الظل الصحيح</p>
  </div>;
}

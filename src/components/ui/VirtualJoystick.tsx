import { useRef, useState } from "react";

type StickSide = "move" | "look";
type Props = { side: StickSide; label: string };

export default function VirtualJoystick({ side, label }: Props) {
  const [offset,setOffset]=useState({x:0,y:0});
  const activePointer=useRef<number|null>(null);
  const base=useRef<HTMLDivElement>(null);
  const emit=(x:number,y:number,active:boolean)=>{
    window.dispatchEvent(new CustomEvent("game-joystick",{detail:{side,x,y,active}}));
  };
  const update=(clientX:number,clientY:number)=>{
    const rect=base.current?.getBoundingClientRect();
    if(!rect)return;
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    const dx=clientX-cx,dy=clientY-cy;
    const radius=rect.width*.34;
    const length=Math.hypot(dx,dy)||1;
    const scale=Math.min(1,radius/length);
    const x=dx*scale/radius,y=dy*scale/radius;
    setOffset({x:x*radius,y:y*radius});
    emit(x,y,true);
  };
  const stop=()=>{
    activePointer.current=null;
    setOffset({x:0,y:0});
    emit(0,0,false);
  };
  return <div className={`virtual-stick ${side}-stick`} ref={base} aria-label={label}
    onPointerDown={e=>{e.preventDefault();activePointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);update(e.clientX,e.clientY);}}
    onPointerMove={e=>{if(activePointer.current===e.pointerId)update(e.clientX,e.clientY);}}
    onPointerUp={e=>{if(activePointer.current===e.pointerId)stop();}}
    onPointerCancel={stop} onLostPointerCapture={stop}>
    <span className="stick-label">{label}</span>
    <div className="stick-ring"><div className="stick-knob" style={{transform:`translate(${offset.x}px,${offset.y}px)`}} /></div>
  </div>;
}

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";
import { loadPlayerPosition, savePlayerPosition } from "../storage/progress";



function AcademyBuilding({ position, label, color = "#c9c5d6" }: { position: [number,number,number]; label: string; color?: string }) {
  return <group position={position}>
    <mesh position={[0, 2.2, 0]} castShadow receiveShadow><boxGeometry args={[11, 4.4, 5]} /><meshStandardMaterial color={color} roughness={0.86} /></mesh>
    <mesh position={[0, 4.55, 0]} castShadow><boxGeometry args={[11.4, .35, 5.35]} /><meshStandardMaterial color="#35334c" roughness={.75} /></mesh>
    <mesh position={[0, .35, 2.54]}><boxGeometry args={[2.1, 2.8, .12]} /><meshStandardMaterial color="#514663" /></mesh>
    {[-4,-2,0,2,4].map((x) => <group key={x} position={[x,2.45,2.57]}>
      <mesh><boxGeometry args={[1.05,1.3,.12]} /><meshStandardMaterial color="#293c55" metalness={.25} roughness={.25} /></mesh>
      <mesh position={[0,0,.075]}><boxGeometry args={[.08,1.3,.035]} /><meshStandardMaterial color="#e2c9a8" /></mesh>
      <mesh position={[0,0,.08]}><boxGeometry args={[1.05,.07,.035]} /><meshStandardMaterial color="#e2c9a8" /></mesh>
    </group>)}
    <Text position={[0,4.95,2.75]} fontSize={.34} color="#f6e8d2" anchorX="center" anchorY="middle">{label}</Text>
  </group>;
}

function Tree({ position, scale = 1 }: { position: [number,number,number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[0,.85,0]} castShadow><cylinderGeometry args={[.16,.23,1.7,7]} /><meshStandardMaterial color="#695044" /></mesh>
    <mesh position={[0,2.1,0]} castShadow><icosahedronGeometry args={[1.05,1]} /><meshStandardMaterial color="#527b68" roughness={1} flatShading /></mesh>
    <mesh position={[.45,2.45,.08]} castShadow><icosahedronGeometry args={[.62,1]} /><meshStandardMaterial color="#71977b" roughness={1} flatShading /></mesh>
  </group>;
}

type RectObstacle = { x:number; z:number; halfX:number; halfZ:number };
const BUILDING_COLLIDERS:RectObstacle[] = [
  {x:0,z:-12,halfX:5.8,halfZ:2.9},
  {x:-12,z:-1,halfX:5.8,halfZ:2.9},
  {x:12,z:-1,halfX:5.8,halfZ:2.9},
  {x:-29,z:-20,halfX:5.8,halfZ:2.9},
  {x:29,z:14,halfX:5.8,halfZ:2.9},
  {x:-29,z:14,halfX:5.8,halfZ:2.9},
  {x:29,z:-35,halfX:5.8,halfZ:2.9}
];
function isBlocked(x:number,z:number) {
  const radius=.48;
  if(BUILDING_COLLIDERS.some(o=>Math.abs(x-o.x)<o.halfX+radius && Math.abs(z-o.z)<o.halfZ+radius && !(Math.abs(x-o.x)<1.35 && z>o.z+o.halfZ-0.15 && z<o.z+o.halfZ+1.35))) return true;
  if([-5,5].some(gateX=>Math.hypot(x-gateX,z-43)<1.05)) return true;
  const treesX=[-9,-6,6,9], treesZ=[-10,-3,5,12];
  if(treesX.some(tx=>treesZ.some(tz=>Math.hypot(x-tx,z-tz)<.72))) return true;
  return false;
}

function Player({ inside = false }: { inside?: boolean }) {
  const isInteriorBlocked = (x:number,z:number) => Math.abs(x)>10.25 || z < -9.25 || (z>9.25 && Math.abs(x)>3.1);
  const group = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const initialPosition = useRef(loadPlayerPosition());
  const velocity = useRef(new THREE.Vector3());
  const verticalVelocity = useRef(0);
  const grounded = useRef(true);
  const pressed = useRef(new Set<string>());
  const moveStick = useRef({x:0,y:0});
  const cameraDrag = useRef<{pointerId:number;x:number;y:number}|null>(null);
  const cameraOrbit = useRef({yaw:0,pitch:0.42});
  const actions = useRef({jump:false,run:false});
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","ShiftLeft","ShiftRight","Space"].includes(event.code)) {
        event.preventDefault();
        pressed.current.add(event.code);
      }
    };
    const up = (event: KeyboardEvent) => pressed.current.delete(event.code);
    const clear = () => { pressed.current.clear(); moveStick.current={x:0,y:0}; cameraDrag.current=null; actions.current={jump:false,run:false}; };
    const savePosition = () => { if (group.current) savePlayerPosition({ x: group.current.position.x, z: group.current.position.z }); };
    const restorePosition = () => { if (!group.current) return; const saved = loadPlayerPosition(); group.current.position.set(saved.x, 0, saved.z); velocity.current.set(0, 0, 0); verticalVelocity.current=0; grounded.current=true; };
    const joystick = (event:Event) => {
      const detail=(event as CustomEvent<{side:"move";x:number;y:number;active:boolean}>).detail;
      if(detail?.side==="move") moveStick.current=detail.active?{x:detail.x,y:detail.y}:{x:0,y:0};
    };
    const action = (event:Event) => {
      const detail=(event as CustomEvent<{action:"jump"|"run";active:boolean}>).detail;
      if(detail?.action==="jump") actions.current.jump=detail.active;
      if(detail?.action==="run") actions.current.run=detail.active;
    };
    const pointerDown = (event:PointerEvent) => {
      if(event.pointerType!=="touch" || event.clientX < window.innerWidth*0.45) return;
      const target=event.target as HTMLElement|null;
      if(target?.closest("button,.interaction-card,.hud-top")) return;
      cameraDrag.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY};
    };
    const pointerMove = (event:PointerEvent) => {
      const drag=cameraDrag.current;
      if(!drag || drag.pointerId!==event.pointerId) return;
      const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
      drag.x=event.clientX; drag.y=event.clientY;
      cameraOrbit.current.yaw -= dx*0.006;
      cameraOrbit.current.pitch=THREE.MathUtils.clamp(cameraOrbit.current.pitch+dy*0.004,0.12,0.9);
    };
    const pointerUp = (event:PointerEvent) => { if(cameraDrag.current?.pointerId===event.pointerId) cameraDrag.current=null; };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    window.addEventListener("game-joystick",joystick);
    window.addEventListener("tsc-player-action",action);
    window.addEventListener("tsc-save-position",savePosition);
    window.addEventListener("tsc-load-position",restorePosition);
    window.addEventListener("beforeunload",savePosition);
    window.addEventListener("pointerdown",pointerDown);
    window.addEventListener("pointermove",pointerMove);
    window.addEventListener("pointerup",pointerUp);
    window.addEventListener("pointercancel",pointerUp);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      window.removeEventListener("game-joystick",joystick);
      window.removeEventListener("tsc-player-action",action);
      window.removeEventListener("tsc-save-position",savePosition);
      window.removeEventListener("tsc-load-position",restorePosition);
      window.removeEventListener("beforeunload",savePosition);
      window.removeEventListener("pointerdown",pointerDown);
      window.removeEventListener("pointermove",pointerMove);
      window.removeEventListener("pointerup",pointerUp);
      window.removeEventListener("pointercancel",pointerUp);
    };
  }, []);
  useFrame((state, delta) => {
    if (!group.current) return;
    const dt=Math.min(delta,.05);
    const keys = pressed.current;
    const right = keys.has("KeyD") || keys.has("ArrowRight");
    const left = keys.has("KeyA") || keys.has("ArrowLeft");
    const forward = keys.has("KeyW") || keys.has("ArrowUp");
    const backward = keys.has("KeyS") || keys.has("ArrowDown");
    const running = keys.has("ShiftLeft") || keys.has("ShiftRight") || actions.current.run;
    const localX = Number(right)-Number(left)+moveStick.current.x;
    const localZ = Number(backward)-Number(forward)+moveStick.current.y;
    const yaw = cameraOrbit.current.yaw;
    const direction = new THREE.Vector3(localX*Math.cos(yaw)+localZ*Math.sin(yaw),0,-localX*Math.sin(yaw)+localZ*Math.cos(yaw));
    if (direction.lengthSq() > 1) direction.normalize();
    const moving=direction.lengthSq()>.025;
    const speed = running ? 8 : 4.6;
    velocity.current.lerp(direction.multiplyScalar(speed), Math.min(1,dt*10));
    const nextX=THREE.MathUtils.clamp(group.current.position.x+velocity.current.x*dt,-58,58);
    const nextZ=THREE.MathUtils.clamp(group.current.position.z+velocity.current.z*dt,-58,58);
    if(!(inside ? isInteriorBlocked(nextX,group.current.position.z) : isBlocked(nextX,group.current.position.z))) group.current.position.x=nextX;
    else velocity.current.x=0;
    if(!(inside ? isInteriorBlocked(group.current.position.x,nextZ) : isBlocked(group.current.position.x,nextZ))) group.current.position.z=nextZ;
    else velocity.current.z=0;
    if ((keys.has("Space") || actions.current.jump) && grounded.current) { verticalVelocity.current=7.2; grounded.current=false; }
    verticalVelocity.current-=19*dt;
    group.current.position.y+=verticalVelocity.current*dt;
    if(group.current.position.y<=0){group.current.position.y=0;verticalVelocity.current=0;grounded.current=true;}
    const horizontalSpeed=Math.hypot(velocity.current.x,velocity.current.z);
    if (horizontalSpeed > .12) group.current.rotation.y = Math.atan2(velocity.current.x,velocity.current.z);
    const cycle=state.clock.elapsedTime*(running?13:9);
    const stride=moving?Math.sin(cycle)*Math.min(1,horizontalSpeed/(running?8:4.6)):0;
    if(leftLeg.current) leftLeg.current.rotation.x=stride*.72;
    if(rightLeg.current) rightLeg.current.rotation.x=-stride*.72;
    if(leftArm.current) leftArm.current.rotation.x=-stride*.48;
    if(rightArm.current) rightArm.current.rotation.x=stride*.48;
    if(torso.current){torso.current.position.y=moving?Math.abs(Math.sin(cycle*2))*.035:0;torso.current.rotation.z=moving?Math.sin(cycle)*.025:0;}
    const cameraDistance = 9;
    const desiredCamera = new THREE.Vector3(group.current.position.x + Math.sin(cameraOrbit.current.yaw)*cameraDistance,group.current.position.y + 2.4 + Math.sin(cameraOrbit.current.pitch)*cameraDistance,group.current.position.z + Math.cos(cameraOrbit.current.yaw)*cameraDistance);
    state.camera.position.lerp(desiredCamera,1-Math.exp(-dt*5));
    state.camera.lookAt(group.current.position.x,1.35+group.current.position.y,group.current.position.z-1.8);
  });
  return <group ref={group} position={[initialPosition.current.x,0,initialPosition.current.z]}>
    <group ref={torso}>
      <mesh position={[0,1.28,0]} castShadow><capsuleGeometry args={[.34,.72,5,10]}/><meshStandardMaterial color="#e9d9e7" roughness={.72}/></mesh>
      <mesh position={[0,2.02,0]} castShadow><sphereGeometry args={[.34,18,16]}/><meshStandardMaterial color="#f0c8a9" roughness={.8}/></mesh>
      <mesh position={[0,2.2,.02]} castShadow><sphereGeometry args={[.35,16,10,0,Math.PI*2,0,Math.PI*.55]}/><meshStandardMaterial color="#303047" roughness={.95}/></mesh>
      <mesh position={[0,1.68,.02]}><boxGeometry args={[.48,.12,.38]}/><meshStandardMaterial color="#d7b5d5"/></mesh>
      <group ref={leftArm} position={[-.43,1.58,0]}><mesh position={[0,-.32,0]} castShadow><capsuleGeometry args={[.105,.48,4,7]}/><meshStandardMaterial color="#e9d9e7"/></mesh></group>
      <group ref={rightArm} position={[.43,1.58,0]}><mesh position={[0,-.32,0]} castShadow><capsuleGeometry args={[.105,.48,4,7]}/><meshStandardMaterial color="#e9d9e7"/></mesh></group>
      <group ref={leftLeg} position={[-.19,.88,0]}><mesh position={[0,-.34,0]} castShadow><capsuleGeometry args={[.13,.48,4,7]}/><meshStandardMaterial color="#66557c"/></mesh><mesh position={[0,-.61,.1]} castShadow><boxGeometry args={[.25,.13,.42]}/><meshStandardMaterial color="#29283b"/></mesh></group>
      <group ref={rightLeg} position={[.19,.88,0]}><mesh position={[0,-.34,0]} castShadow><capsuleGeometry args={[.13,.48,4,7]}/><meshStandardMaterial color="#66557c"/></mesh><mesh position={[0,-.61,.1]} castShadow><boxGeometry args={[.25,.13,.42]}/><meshStandardMaterial color="#29283b"/></mesh></group>
    </group>
  </group>;
}

function StudentNPC({ name, outfit, start, route, onTalk }: {
  name:string; outfit:string; start:[number,number,number];
  route:[number,number,number][]; onTalk:(label:string)=>void;
}) {
  const root=useRef<THREE.Group>(null);
  const leftLeg=useRef<THREE.Group>(null),rightLeg=useRef<THREE.Group>(null);
  const leftArm=useRef<THREE.Group>(null),rightArm=useRef<THREE.Group>(null);
  const step=useRef(0);
  const phase=useRef(0);
  useEffect(()=>{step.current=0;},[route]);
  useFrame((_,delta)=>{
    if(!root.current) return;
    const target=route[step.current];
    const dx=target[0]-root.current.position.x;
    const dz=target[2]-root.current.position.z;
    const distance=Math.hypot(dx,dz);
    let walking=false;
    if(distance<.18) step.current=(step.current+1)%route.length;
    else {
      const speed=1.05;
      root.current.position.x += dx/distance*speed*delta;
      root.current.position.z += dz/distance*speed*delta;
      root.current.rotation.y=Math.atan2(dx,dz);
      walking=true;
    }
    phase.current += delta*7;
    const swing=walking?Math.sin(phase.current)*.55:0;
    if(leftLeg.current) leftLeg.current.rotation.x=swing;
    if(rightLeg.current) rightLeg.current.rotation.x=-swing;
    if(leftArm.current) leftArm.current.rotation.x=-swing*.65;
    if(rightArm.current) rightArm.current.rotation.x=swing*.65;
  });
  return <group ref={root} position={start} onClick={(e)=>{e.stopPropagation();onTalk("TALK: "+name);}}>
    <mesh position={[0,1.05,0]} castShadow><capsuleGeometry args={[.34,.85,5,10]}/><meshStandardMaterial color={outfit} roughness={.78}/></mesh>
    <mesh position={[0,1.95,0]} castShadow><sphereGeometry args={[.31,18,16]}/><meshStandardMaterial color="#edc5a8" roughness={.8}/></mesh>
    <mesh position={[0,2.1,.025]} castShadow><sphereGeometry args={[.32,16,10,0,Math.PI*2,0,Math.PI*.55]}/><meshStandardMaterial color="#343044" roughness={.95}/></mesh>
    <group ref={leftArm} position={[-.4,1.48,0]}><mesh position={[0,-.28,0]} castShadow><capsuleGeometry args={[.09,.42,4,7]}/><meshStandardMaterial color={outfit}/></mesh></group>
    <group ref={rightArm} position={[.4,1.48,0]}><mesh position={[0,-.28,0]} castShadow><capsuleGeometry args={[.09,.42,4,7]}/><meshStandardMaterial color={outfit}/></mesh></group>
    <group ref={leftLeg} position={[-.17,.55,0]}><mesh position={[0,-.2,0]} castShadow><capsuleGeometry args={[.12,.36,4,7]}/><meshStandardMaterial color="#343044"/></mesh></group>
    <group ref={rightLeg} position={[.17,.55,0]}><mesh position={[0,-.2,0]} castShadow><capsuleGeometry args={[.12,.36,4,7]}/><meshStandardMaterial color="#343044"/></mesh></group>
    <Text position={[0,2.55,0]} fontSize={.27} color="#fff0d9" outlineWidth={.02} outlineColor="#201a30" anchorX="center">{name}</Text>
  </group>;
}

function InteractiveMarker({ position, label, onSelect }: { position:[number,number,number]; label:string; onSelect:(label:string)=>void }) {
  return <group position={position} onClick={(e)=>{e.stopPropagation();onSelect(label);}}>
    <Float speed={1.4} rotationIntensity={.08} floatIntensity={.18}>
      <mesh position={[0,1.3,0]}><sphereGeometry args={[.2,16,16]} /><meshBasicMaterial color="#d8a8ff" /></mesh>
      <Text position={[0,1.75,0]} fontSize={.35} color="#fff0d9" outlineWidth={.025} outlineColor="#201a30" anchorX="center">{label}</Text>
    </Float>
    <mesh position={[0,.15,0]}><cylinderGeometry args={[.48,.48,.25,20]} /><meshStandardMaterial color="#a88ac2" emissive="#4d2868" emissiveIntensity={.35} /></mesh>
  </group>;
}

const NPC_ROUTES = {
  aikoCourtyard: [[-3,0,15],[3,0,15],[3,0,23],[-3,0,23]] as [number,number,number][],
  aikoLunch: [[-3,0,15],[-29,0,-13],[-25,0,-13]] as [number,number,number][],
  aikoLibrary: [[-3,0,15],[12,0,2],[16,0,2]] as [number,number,number][],
  renCourtyard: [[6,0,19],[10,0,19],[10,0,26],[6,0,26]] as [number,number,number][],
  renSports: [[6,0,19],[29,0,22],[34,0,22]] as [number,number,number][],
  renClubs: [[6,0,19],[29,0,-10],[34,0,-10]] as [number,number,number][],
  mikaCourtyard: [[-9,0,19],[-6,0,19],[-6,0,25],[-9,0,25]] as [number,number,number][],
  mikaLunch: [[-9,0,19],[-29,0,-13],[-25,0,-13]] as [number,number,number][],
  mikaLibrary: [[-9,0,19],[12,0,2],[16,0,2]] as [number,number,number][]
};

function World({ onInteract, interior, gameMinutes }: { onInteract:(label:string)=>void; interior:string|null; gameMinutes:number }) {
  if(interior) return <>
    <color attach="background" args={["#1b1b2b"]} />
    <fog attach="fog" args={["#1b1b2b",24,48]} />
    <ambientLight intensity={1.05} />
    <directionalLight position={[-5,12,7]} intensity={1.5} castShadow />
    <mesh position={[0,-.12,0]} receiveShadow><boxGeometry args={[22,.24,20]}/><meshStandardMaterial color="#9a8d82" roughness={.9}/></mesh>
    <mesh position={[0,4.2,-10]}><boxGeometry args={[22,8,.35]}/><meshStandardMaterial color="#d2c8c2"/></mesh>
    <mesh position={[-11,4.2,0]}><boxGeometry args={[.35,8,20]}/><meshStandardMaterial color="#d2c8c2"/></mesh>
    <mesh position={[11,4.2,0]}><boxGeometry args={[.35,8,20]}/><meshStandardMaterial color="#d2c8c2"/></mesh>
    <mesh position={[-7,4.2,10]}><boxGeometry args={[8,8,.35]}/><meshStandardMaterial color="#d2c8c2"/></mesh>
    <mesh position={[7,4.2,10]}><boxGeometry args={[8,8,.35]}/><meshStandardMaterial color="#d2c8c2"/></mesh>
    <mesh position={[0,3.1,-9.72]}><boxGeometry args={[7,2.2,.08]}/><meshStandardMaterial color="#23443e" roughness={.65}/></mesh>
    <Text position={[0,5.3,-9.6]} fontSize={.72} color="#f6e8d2" anchorX="center">{interior.toUpperCase()}</Text>
    {[-5,0,5].map(x=><group key={x} position={[x,0,-5]}>
      <mesh position={[0,1.35,0]} castShadow><boxGeometry args={[3.1,.18,1.5]}/><meshStandardMaterial color="#9b7659"/></mesh>
      <mesh position={[0,.68,.85]}><boxGeometry args={[.8,1.25,.12]}/><meshStandardMaterial color="#5b4851"/></mesh>
      <mesh position={[0,.62,1.65]}><boxGeometry args={[1.1,.12,.9]}/><meshStandardMaterial color="#735b4e"/></mesh>
    </group>)}
    {[-5,0,5].map(x=><group key={x} position={[x,0,1]}>
      <mesh position={[0,1.35,0]} castShadow><boxGeometry args={[3.1,.18,1.5]}/><meshStandardMaterial color="#9b7659"/></mesh>
      <mesh position={[0,.68,.85]}><boxGeometry args={[.8,1.25,.12]}/><meshStandardMaterial color="#5b4851"/></mesh>
      <mesh position={[0,.62,1.65]}><boxGeometry args={[1.1,.12,.9]}/><meshStandardMaterial color="#735b4e"/></mesh>
    </group>)}
    <InteractiveMarker position={[0,0,8.4]} label="EXIT" onSelect={onInteract}/>
    <Player inside />
  </>;
  return <>
    <color attach="background" args={["#a9b9cb"]} />
    <fog attach="fog" args={["#a9b9cb",28,65]} />
    <ambientLight intensity={1.15} />
    <directionalLight position={[-12,18,8]} intensity={2.1} castShadow shadow-mapSize={[1024,1024]} />
    <hemisphereLight args={["#dce9ff","#7b806f",.65]} />
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.08,0]} receiveShadow><planeGeometry args={[200,200]} /><meshStandardMaterial color="#758c78" roughness={1} /></mesh>
    <mesh position={[0,-.015,1]} receiveShadow><boxGeometry args={[17,.08,29]} /><meshStandardMaterial color="#c3b7a5" roughness={1} /></mesh>
    <mesh position={[0,.01,5]}><boxGeometry args={[4,.06,22]} /><meshStandardMaterial color="#d6cbb8" /></mesh>
    <AcademyBuilding position={[0,0,-12]} label="HOSHINO ACADEMY" color="#d5d0d7" />
    <AcademyBuilding position={[-12,0,-1]} label="LIBRARY" color="#c7c5d0" />
    <AcademyBuilding position={[12,0,-1]} label="CLASSROOMS" color="#d4c8c1" />
    {/* Connected campus wings */}
    <AcademyBuilding position={[-29,0,-20]} label="CAFETERIA" color="#d6c4ad" />
    <AcademyBuilding position={[29,0,14]} label="GYMNASIUM" color="#c5d0d4" />
    <AcademyBuilding position={[-29,0,14]} label="DORMITORY" color="#c9c1d7" />
    <AcademyBuilding position={[29,0,-35]} label="ARTS & CLUBS" color="#d3c5c9" />
    {/* Walkable campus paths connecting the main courtyard to each zone */}
    <mesh position={[-21,.005,0]}><boxGeometry args={[3,.045,65]} /><meshStandardMaterial color="#c3b7a5" roughness={1}/></mesh>
    <mesh position={[21,.005,0]}><boxGeometry args={[3,.045,65]} /><meshStandardMaterial color="#c3b7a5" roughness={1}/></mesh>
    {/* Main entrance gate */}
    <group position={[0,0,43]}>
      {[-5,5].map(x=><mesh key={x} position={[x,2.8,0]} castShadow><boxGeometry args={[1.2,5.6,1.2]}/><meshStandardMaterial color="#c8b7aa"/></mesh>)}
      <mesh position={[0,5.35,0]} castShadow><boxGeometry args={[11.5,.8,1.4]}/><meshStandardMaterial color="#49425d"/></mesh>
      <Text position={[0,5.45,.76]} fontSize={.48} color="#f6e8d2" anchorX="center">HOSHINO ACADEMY</Text>
    </group>
    {/* Outdoor sports field */}
    <group position={[29,0,-22]}>
      <mesh position={[0,.015,0]} receiveShadow><boxGeometry args={[24,.06,17]}/><meshStandardMaterial color="#4f805f" roughness={1}/></mesh>
      <mesh position={[0,.055,0]}><boxGeometry args={[.12,.025,15]}/><meshBasicMaterial color="#e8eadb"/></mesh>
      <mesh position={[0,.055,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[2.4,2.52,32]}/><meshBasicMaterial color="#e8eadb" side={THREE.DoubleSide}/></mesh>
      {[-10,10].map(x=><mesh key={x} position={[x,1,0]}><boxGeometry args={[.18,2,.18]}/><meshStandardMaterial color="#f1eee3"/></mesh>)}
    </group>
    <mesh position={[0,.16,-5]} castShadow><cylinderGeometry args={[2.1,2.1,.32,32]} /><meshStandardMaterial color="#b4a9a5" /></mesh>
    <mesh position={[0,.48,-5]}><cylinderGeometry args={[1.55,1.55,.35,32]} /><meshStandardMaterial color="#83b7c5" metalness={0.1} roughness={0.22} /></mesh>
    <mesh position={[0,.9,-5]}><cylinderGeometry args={[.08,.08,.8,12]} /><meshStandardMaterial color="#d5e7ee" /></mesh>
    {[-9,-6,6,9].map((x)=>[-10,-3,5,12].map((z)=><Tree key={x+"-"+z} position={[x,0,z]} scale={.8+(Math.abs(x+z)%3)*.12}/>))}
    {[-3,3].map((x)=><group key={x} position={[x,0,3]}><mesh position={[0,.55,0]} castShadow><boxGeometry args={[2.4,.18,.7]} /><meshStandardMaterial color="#795b50" /></mesh><mesh position={[-.85,.28,0]}><boxGeometry args={[.12,.55,.6]} /><meshStandardMaterial color="#4c4544" /></mesh><mesh position={[.85,.28,0]}><boxGeometry args={[.12,.55,.6]} /><meshStandardMaterial color="#4c4544" /></mesh></group>)}
    <StudentNPC name="Aiko" outfit="#6c789f" start={[-3,0,15]} route={gameMinutes>=660&&gameMinutes<780?NPC_ROUTES.aikoLunch:gameMinutes>=780&&gameMinutes<900?NPC_ROUTES.aikoLibrary:NPC_ROUTES.aikoCourtyard} onTalk={onInteract}/>
    <StudentNPC name="Ren" outfit="#9a6d78" start={[6,0,19]} route={gameMinutes>=840?NPC_ROUTES.renClubs:gameMinutes>=720?NPC_ROUTES.renSports:NPC_ROUTES.renCourtyard} onTalk={onInteract}/>
    <StudentNPC name="Mika" outfit="#648b7d" start={[-9,0,19]} route={gameMinutes>=780&&gameMinutes<900?NPC_ROUTES.mikaLunch:gameMinutes>=540&&gameMinutes<660?NPC_ROUTES.mikaLibrary:NPC_ROUTES.mikaCourtyard} onTalk={onInteract}/>
    <InteractiveMarker position={[0,0,-8.2]} label="ACADEMY ENTRANCE" onSelect={onInteract}/>
    <InteractiveMarker position={[-12,0,2.7]} label="LIBRARY DOOR" onSelect={onInteract}/>
    <InteractiveMarker position={[12,0,2.7]} label="CLASSROOM DOOR" onSelect={onInteract}/>
    <InteractiveMarker position={[-29,0,-16.7]} label="CAFETERIA DOOR" onSelect={onInteract}/>
    <InteractiveMarker position={[29,0,17.7]} label="GYM DOOR" onSelect={onInteract}/>
    <InteractiveMarker position={[-29,0,17.7]} label="DORMITORY DOOR" onSelect={onInteract}/>
    <InteractiveMarker position={[29,0,-31.7]} label="CLUB DOOR" onSelect={onInteract}/>
    <InteractiveMarker position={[-12,0,2]} label="LIBRARY" onSelect={onInteract}/>
    <InteractiveMarker position={[12,0,2]} label="CLASSROOMS" onSelect={onInteract}/>
    <InteractiveMarker position={[0,0,-5]} label="FOUNTAIN" onSelect={onInteract}/>
    <InteractiveMarker position={[-29,0,-12]} label="CAFETERIA" onSelect={onInteract}/>
    <InteractiveMarker position={[29,0,22]} label="GYMNASIUM" onSelect={onInteract}/>
    <InteractiveMarker position={[-29,0,22]} label="DORMITORY" onSelect={onInteract}/>
    <InteractiveMarker position={[29,0,-11]} label="SPORTS FIELD" onSelect={onInteract}/>
    <InteractiveMarker position={[0,0,39]} label="MAIN GATE" onSelect={onInteract}/>
    <InteractiveMarker position={[29,0,-28]} label="ARTS & CLUBS" onSelect={onInteract}/>
    <Player />
  </>;
}

export function AcademyWorld({ onInteract, interior, gameMinutes }: { onInteract:(label:string)=>void; interior:string|null; gameMinutes:number }) {
  return <Canvas shadows dpr={[1,1.5]} camera={{position:[0,6,16],fov:52,near:.1,far:180}}><World onInteract={onInteract} interior={interior} gameMinutes={gameMinutes}/></Canvas>;
}


import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";
import { loadPlayerPosition, savePlayerPosition } from "../storage/progress";



function AcademyBuilding({ position, label, color = "#d8d0c4" }: { position: [number,number,number]; label: string; color?: string }) {
  const glass="#6e9eae", trim="#f2e5ce", roof="#343744", wood="#72564a";
  const isLibrary=label.includes("LIBRARY"), isGym=label.includes("GYM"), isCafe=label.includes("CAFETERIA"), isDorm=label.includes("DORMITORY"), isArts=label.includes("ARTS");
  return <group position={position}>
    {/* raised stone foundation and front approach */}
    <mesh position={[0,.22,0]} castShadow receiveShadow><boxGeometry args={[12.2,.44,6.2]}/><meshStandardMaterial color="#77716b" roughness={.94}/></mesh>
    <mesh position={[0,.55,0]} castShadow><boxGeometry args={[11.8,.24,5.9]}/><meshStandardMaterial color="#d6c8b4" roughness={.86}/></mesh>
    {/* two-storey main structure */}
    <mesh position={[0,3.35,0]} castShadow receiveShadow><boxGeometry args={[11.2,5.6,5.25]}/><meshStandardMaterial color={color} roughness={.78}/></mesh>
    <mesh position={[0,.92,2.68]}><boxGeometry args={[11.25,.22,.24]}/><meshStandardMaterial color={trim}/></mesh>
    <mesh position={[0,3.48,2.68]}><boxGeometry args={[11.4,.2,.24]}/><meshStandardMaterial color={trim}/></mesh>
    <mesh position={[0,6.12,0]} castShadow><boxGeometry args={[11.7,.3,5.7]}/><meshStandardMaterial color={roof} roughness={.78}/></mesh>
    {/* pitched roof with ridge and eaves */}
    <mesh position={[0,6.62,-1.32]} rotation={[-.43,0,0]} castShadow><boxGeometry args={[12.2,.22,3.45]}/><meshStandardMaterial color={roof} roughness={.72}/></mesh>
    <mesh position={[0,6.62,1.32]} rotation={[.43,0,0]} castShadow><boxGeometry args={[12.2,.22,3.45]}/><meshStandardMaterial color={roof} roughness={.72}/></mesh>
    <mesh position={[0,7.25,0]} castShadow><boxGeometry args={[12.25,.18,.2]}/><meshStandardMaterial color="#62575b"/></mesh>
    {/* upper and lower window bays with real frames and mullions */}
    {[1.95,4.55].map(y=>[-4.55,-2.65,2.65,4.55].map(x=><group key={y+"-"+x} position={[x,y,2.66]}>
      <mesh castShadow><boxGeometry args={[1.35,1.65,.16]}/><meshStandardMaterial color={trim}/></mesh>
      <mesh position={[0,0,.1]}><boxGeometry args={[1.1,1.4,.055]}/><meshStandardMaterial color={glass} metalness={.22} roughness={.18}/></mesh>
      <mesh position={[0,0,.15]}><boxGeometry args={[.055,1.4,.045]}/><meshStandardMaterial color={trim}/></mesh>
      <mesh position={[0,0,.15]}><boxGeometry args={[1.1,.055,.045]}/><meshStandardMaterial color={trim}/></mesh>
      <mesh position={[0,-.91,.16]}><boxGeometry args={[1.55,.11,.3]}/><meshStandardMaterial color={wood}/></mesh>
    </group>))}
    {/* central entrance, canopy and stairs */}
    <mesh position={[0,1.85,2.69]} castShadow><boxGeometry args={[1.8,2.55,.2]}/><meshStandardMaterial color="#493d43"/></mesh>
    <mesh position={[0,1.86,2.82]}><boxGeometry args={[1.43,2.22,.08]}/><meshStandardMaterial color="#a5c1c2" metalness={.16} roughness={.25}/></mesh>
    <mesh position={[.64,1.86,2.9]}><boxGeometry args={[.035,2.2,.035]}/><meshStandardMaterial color={trim}/></mesh>
    <mesh position={[0,3.22,2.98]} castShadow><boxGeometry args={[2.5,.18,1.15]}/><meshStandardMaterial color={roof}/></mesh>
    <mesh position={[0,.48,3.45]}><boxGeometry args={[3.4,.22,1.25]}/><meshStandardMaterial color="#b8aa98"/></mesh>
    <mesh position={[0,.25,3.75]}><boxGeometry args={[4,.22,.8]}/><meshStandardMaterial color="#a99a88"/></mesh>
    {/* veranda columns and balcony rail */}
    {[-5.25,5.25].map(x=><mesh key={x} position={[x,2.8,2.95]} castShadow><boxGeometry args={[.3,4.6,.32]}/><meshStandardMaterial color={trim}/></mesh>)}
    <mesh position={[0,3.75,3.02]}><boxGeometry args={[10.7,.1,.1]}/><meshStandardMaterial color={trim}/></mesh>
    {Array.from({length:13},(_,i)=><mesh key={i} position={[-5+i*.83,3.48,3.02]}><cylinderGeometry args={[.035,.035,.55,6]}/><meshStandardMaterial color={trim}/></mesh>)}
    {/* school name plaque */}
    <mesh position={[0,5.65,2.68]}><boxGeometry args={[4.4,.62,.16]}/><meshStandardMaterial color="#384a55" roughness={.5}/></mesh>
    <Text position={[0,5.66,2.78]} fontSize={.25} maxWidth={4.1} color="#fff0d5" anchorX="center" anchorY="middle">{label}</Text>
    {/* corner pilasters and wall-mounted details */}
    {[-5.4,5.4].map(x=><group key={"pilaster"+x} position={[x,3.35,2.67]}>
      <mesh><boxGeometry args={[.24,5.5,.28]}/><meshStandardMaterial color="#e8d9c5"/></mesh>
      <mesh position={[0,2.78,0]}><boxGeometry args={[.42,.16,.38]}/><meshStandardMaterial color="#bcae9d"/></mesh>
    </group>)}
    <mesh position={[-5.64,1.35,.2]}><boxGeometry args={[.12,.9,1.2]}/><meshStandardMaterial color="#a9b8ad"/></mesh>
    <mesh position={[5.64,1.35,.2]}><boxGeometry args={[.12,.9,1.2]}/><meshStandardMaterial color="#a9b8ad"/></mesh>
    {/* Distinct identity for each campus building */}
    {isLibrary && <group position={[-4.6,0,3.15]}>
      <mesh position={[0,4.35,0]} castShadow><boxGeometry args={[2.25,2.5,.38]}/><meshStandardMaterial color="#c2b4a4"/></mesh>
      <mesh position={[0,4.38,.23]}><boxGeometry args={[1.75,1.9,.08]}/><meshStandardMaterial color="#526d78"/></mesh>
      <mesh position={[0,4.4,.3]}><boxGeometry args={[.08,1.8,.04]}/><meshStandardMaterial color="#eadfc9"/></mesh>
      <mesh position={[0,4.4,.3]}><boxGeometry args={[1.7,.08,.04]}/><meshStandardMaterial color="#eadfc9"/></mesh>
    </group>}
    {isGym && <group position={[0,4.25,3.05]}>
      <mesh castShadow><cylinderGeometry args={[.82,.82,.18,32]}/><meshStandardMaterial color="#e4d9c5"/></mesh>
      <mesh position={[0,0,.12]}><cylinderGeometry args={[.63,.63,.08,32]}/><meshStandardMaterial color="#536f7b"/></mesh>
      <mesh position={[0,0,.18]}><ringGeometry args={[.25,.34,24]}/><meshBasicMaterial color="#f4e8d2" side={THREE.DoubleSide}/></mesh>
    </group>}
    {isCafe && <group position={[0,3.2,3.35]}>
      <mesh castShadow><boxGeometry args={[8.6,.18,1.35]}/><meshStandardMaterial color="#f0e2ca"/></mesh>
      {Array.from({length:9},(_,i)=><mesh key={i} position={[-3.8+i*.95,-.12,.03]}><boxGeometry args={[.45,.08,1.28]}/><meshStandardMaterial color={i%2?"#a65f58":"#f4e7d2"}/></mesh>)}
      {[-3.7,3.7].map(x=><mesh key={x} position={[x,-1.5,.05]}><cylinderGeometry args={[.07,.07,3,8]}/><meshStandardMaterial color="#64554a"/></mesh>)}
    </group>}
    {isDorm && <group position={[0,0,3.16]}>
      {[2.2,4.8].map(y=><group key={y}>
        <mesh position={[0,y,0]}><boxGeometry args={[9.2,.12,.8]}/><meshStandardMaterial color="#8a7666"/></mesh>
        <mesh position={[0,y+.5,.36]}><boxGeometry args={[9.2,.08,.08]}/><meshStandardMaterial color="#d9c9b2"/></mesh>
        {Array.from({length:12},(_,i)=><mesh key={i} position={[-4.4+i*.8,y+.25,.36]}><cylinderGeometry args={[.025,.025,.5,6]}/><meshStandardMaterial color="#d9c9b2"/></mesh>)}
      </group>)}
    </group>}
    {isArts && <group position={[0,4.1,3.05]}>
      {[-2.5,0,2.5].map((x,i)=><group key={x} position={[x,0,0}>
        <mesh><boxGeometry args={[1.35,.85,.08]}/><meshStandardMaterial color={["#9c6685","#527f83","#b48b58"][i]}/></mesh>
        <mesh position={[0,-.62,.02]} rotation={[0,0,Math.PI]}><coneGeometry args={[.68,.65,3]}/><meshStandardMaterial color={["#9c6685","#527f83","#b48b58"][i]}/></mesh>
      </group>)}
    </group>}
  </group>;
}
function Tree({ position, scale = 1 }: { position: [number,number,number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh position={[0,1.05,0]} castShadow><cylinderGeometry args={[.2,.32,2.1,9]}/><meshStandardMaterial color="#654735" roughness={1}/></mesh>
    <mesh position={[0,2.05,0]} castShadow><icosahedronGeometry args={[1.15,2]}/><meshStandardMaterial color="#315d49" roughness={1}/></mesh>
    <mesh position={[-.55,2.35,.12]} castShadow><icosahedronGeometry args={[.76,1]}/><meshStandardMaterial color="#477b58" roughness={1}/></mesh>
    <mesh position={[.58,2.42,-.08]} castShadow><icosahedronGeometry args={[.82,1]}/><meshStandardMaterial color="#5d8a61" roughness={1}/></mesh>
    <mesh position={[0,2.9,.12]} castShadow><icosahedronGeometry args={[.62,1]}/><meshStandardMaterial color="#71976a" roughness={1}/></mesh>
    <mesh position={[0,.12,0]} receiveShadow><cylinderGeometry args={[.65,.72,.22,12]}/><meshStandardMaterial color="#9b8b72"/></mesh>
  </group>;
}
function CampusLamp({position}:{position:[number,number,number]}) {
  return <group position={position}>
    <mesh position={[0,1.7,0]} castShadow><cylinderGeometry args={[.07,.11,3.4,8]}/><meshStandardMaterial color="#353b45" metalness={.55} roughness={.4}/></mesh>
    <mesh position={[0,3.42,0]} castShadow><boxGeometry args={[.62,.12,.62]}/><meshStandardMaterial color="#343541" metalness={.35}/></mesh>
    <mesh position={[0,3.62,0]}><sphereGeometry args={[.19,12,12]}/><meshStandardMaterial color="#ffe4a6" emissive="#ffc86a" emissiveIntensity={.65}/></mesh>
    <mesh position={[0,.12,0]}><cylinderGeometry args={[.28,.32,.24,10]}/><meshStandardMaterial color="#55515a"/></mesh>
  </group>;
}
function CampusShrub({position,scale=1}:{position:[number,number,number];scale?:number}) {
  return <group position={position} scale={scale}>
    <mesh position={[0,.38,0]} castShadow><sphereGeometry args={[.55,12,10]}/><meshStandardMaterial color="#426b4e" roughness={1}/></mesh>
    <mesh position={[-.34,.28,.08]} castShadow><sphereGeometry args={[.38,10,9]}/><meshStandardMaterial color="#527b55" roughness={1}/></mesh>
    <mesh position={[.34,.3,-.08]} castShadow><sphereGeometry args={[.4,10,9]}/><meshStandardMaterial color="#365d47" roughness={1}/></mesh>
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

function Player({ inside = false, playerPosition, onPositionChange }: { inside?: boolean; playerPosition: { current: THREE.Vector3 }; onPositionChange:(position:{x:number;z:number})=>void }) {
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
  const jumpWasPressed = useRef(false);
  const positionPublishTimer = useRef(0);
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
    playerPosition.current.copy(group.current.position);
    const dt=Math.min(delta,.05);
    positionPublishTimer.current+=dt;
    if(positionPublishTimer.current>=.2){positionPublishTimer.current=0;onPositionChange({x:group.current.position.x,z:group.current.position.z});}
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
    const jumpPressed=keys.has("Space") || actions.current.jump;
    if (jumpPressed && !jumpWasPressed.current && grounded.current) { verticalVelocity.current=7.2; grounded.current=false; }
    jumpWasPressed.current=jumpPressed;
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
      {/* backpack */}
      <mesh position={[0,1.2,-.27]} castShadow><boxGeometry args={[.48,.62,.22]}/><meshStandardMaterial color="#76546c" roughness={.8}/></mesh>
      <mesh position={[0,1.45,-.4]}><boxGeometry args={[.32,.2,.04]}/><meshStandardMaterial color="#d8b6c8"/></mesh>
      {/* tailored blazer and shirt */}
      <mesh position={[0,1.2,0]} castShadow><capsuleGeometry args={[.31,.72,8,18]}/><meshStandardMaterial color="#26354d" roughness={.62}/></mesh>
      <mesh position={[0,1.49,.13]} castShadow><boxGeometry args={[.34,.5,.29]}/><meshStandardMaterial color="#f3eee5" roughness={.82}/></mesh>
      <mesh position={[0,1.47,.29]}><coneGeometry args={[.055,.36,4]}/><meshStandardMaterial color="#a64f68" roughness={.55}/></mesh>
      <mesh position={[-.13,1.57,.2]} rotation={[0,0,-.4]}><boxGeometry args={[.18,.18,.08]}/><meshStandardMaterial color="#f3eee5"/></mesh>
      <mesh position={[.13,1.57,.2]} rotation={[0,0,.4]}><boxGeometry args={[.18,.18,.08]}/><meshStandardMaterial color="#f3eee5"/></mesh>
      <mesh position={[0,1.18,.29]}><boxGeometry args={[.08,.08,.035]}/><meshStandardMaterial color="#d5b879" metalness={.55}/></mesh>
      {/* head and hair */}
      <mesh position={[0,1.93,0]} castShadow><sphereGeometry args={[.3,32,28]}/><meshStandardMaterial color="#e7b99d" roughness={.76}/></mesh>
      <mesh position={[0,2.1,-.035]} castShadow><sphereGeometry args={[.325,32,24,0,Math.PI*2,0,Math.PI*.59]}/><meshStandardMaterial color="#292832" roughness={.88}/></mesh>
      {[-.23,-.12,0,.12,.23].map((x,i)=><mesh key={i} position={[x,2.02,.11]} rotation={[0,0,(i-2)*-.18]} castShadow><capsuleGeometry args={[.075,.27+(i%2)*.1,6,10]}/><meshStandardMaterial color="#292832" roughness={.9}/></mesh>)}
      {[-.105,.105].map(x=><group key={x} position={[x,1.96,.274]}>
        <mesh><sphereGeometry args={[.052,16,16]}/><meshStandardMaterial color="#fff9ef"/></mesh>
        <mesh position={[0,0,.041]}><sphereGeometry args={[.026,12,12]}/><meshStandardMaterial color="#303747"/></mesh>
        <mesh position={[0,.035,.045]}><boxGeometry args={[.09,.018,.018]}/><meshStandardMaterial color="#4a3540"/></mesh>
      </group>)}
      <mesh position={[0,1.87,.29]}><sphereGeometry args={[.022,10,10]}/><meshStandardMaterial color="#bd826e"/></mesh>
      <mesh position={[0,1.78,.285]}><boxGeometry args={[.075,.016,.018]}/><meshStandardMaterial color="#985e68"/></mesh>
      <mesh position={[-.3,1.92,0]}><sphereGeometry args={[.07,12,12]}/><meshStandardMaterial color="#e7b99d"/></mesh>
      <mesh position={[.3,1.92,0]}><sphereGeometry args={[.07,12,12]}/><meshStandardMaterial color="#e7b99d"/></mesh>
      {/* articulated sleeves and hands */}
      <group ref={leftArm} position={[-.39,1.54,0]}><mesh position={[0,-.27,0]} castShadow><capsuleGeometry args={[.105,.45,7,12]}/><meshStandardMaterial color="#26354d"/></mesh><mesh position={[0,-.55,.025]}><sphereGeometry args={[.095,14,14]}/><meshStandardMaterial color="#e7b99d"/></mesh><mesh position={[0,-.12,.01]}><torusGeometry args={[.105,.025,6,12]}/><meshStandardMaterial color="#f1e9de"/></mesh></group>
      <group ref={rightArm} position={[.39,1.54,0]}><mesh position={[0,-.27,0]} castShadow><capsuleGeometry args={[.105,.45,7,12]}/><meshStandardMaterial color="#26354d"/></mesh><mesh position={[0,-.55,.025]}><sphereGeometry args={[.095,14,14]}/><meshStandardMaterial color="#e7b99d"/></mesh><mesh position={[0,-.12,.01]}><torusGeometry args={[.105,.025,6,12]}/><meshStandardMaterial color="#f1e9de"/></mesh></group>
      {/* trousers, knees and polished shoes */}
      <group ref={leftLeg} position={[-.17,.82,0]}><mesh position={[0,-.34,0]} castShadow><capsuleGeometry args={[.13,.5,7,12]}/><meshStandardMaterial color="#34384b" roughness={.7}/></mesh><mesh position={[0,-.62,.1]} castShadow><boxGeometry args={[.28,.15,.44]}/><meshStandardMaterial color="#171b27" roughness={.35}/></mesh><mesh position={[0,-.52,.17]}><boxGeometry args={[.2,.025,.08]}/><meshStandardMaterial color="#c7b6a2" metalness={.4}/></mesh></group>
      <group ref={rightLeg} position={[.17,.82,0]}><mesh position={[0,-.34,0]} castShadow><capsuleGeometry args={[.13,.5,7,12]}/><meshStandardMaterial color="#34384b" roughness={.7}/></mesh><mesh position={[0,-.62,.1]} castShadow><boxGeometry args={[.28,.15,.44]}/><meshStandardMaterial color="#171b27" roughness={.35}/></mesh><mesh position={[0,-.52,.17]}><boxGeometry args={[.2,.025,.08]}/><meshStandardMaterial color="#c7b6a2" metalness={.4}/></mesh></group>
    </group>
  </group>;
}

function StudentNPC({ name, outfit, start, route, onTalk, playerPosition }: {
  name:string; outfit:string; start:[number,number,number];
  route:[number,number,number][]; onTalk:(label:string)=>void; playerPosition:{current:THREE.Vector3};
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
  const hairColor=name==="Aiko"?"#3a273a":name==="Ren"?"#292b32":"#79533e";
  const skinColor=name==="Mika"?"#d7a184":"#e7b99d";
  const accent=name==="Ren"?"#6d91ad":name==="Mika"?"#6b9b83":"#b45d79";
  return <group ref={root} position={start} onClick={(e)=>{e.stopPropagation();const nearby=!!root.current&&playerPosition.current.distanceTo(root.current.position)<=5.5;onTalk(nearby?"TALK: "+name:"TOO FAR — MOVE CLOSER");}}>
    <mesh position={[0,1.2,-.25]} castShadow><boxGeometry args={[.46,.6,.2]}/><meshStandardMaterial color="#65516d"/></mesh>
    <mesh position={[0,1.17,0]} castShadow><capsuleGeometry args={[.3,.76,8,16]}/><meshStandardMaterial color={outfit} roughness={.65}/></mesh>
    <mesh position={[0,1.49,.13]}><boxGeometry args={[.34,.48,.27]}/><meshStandardMaterial color="#f4eee4"/></mesh>
    <mesh position={[0,1.47,.275]}><coneGeometry args={[.055,.34,4]}/><meshStandardMaterial color={accent}/></mesh>
    <mesh position={[0,1.94,0]} castShadow><sphereGeometry args={[.29,32,26]}/><meshStandardMaterial color={skinColor} roughness={.76}/></mesh>
    <mesh position={[0,2.11,-.03]} castShadow><sphereGeometry args={[.32,28,22,0,Math.PI*2,0,Math.PI*.59]}/><meshStandardMaterial color={hairColor} roughness={.88}/></mesh>
    {[-.23,-.12,0,.12,.23].map((x,i)=><mesh key={i} position={[x,2.03,.1]} rotation={[0,0,(i-2)*-.16]} castShadow><capsuleGeometry args={[.07,.26+(i%2)*.11,6,10]}/><meshStandardMaterial color={hairColor}/></mesh>)}
    {[-.105,.105].map(x=><group key={x} position={[x,1.97,.265]}><mesh><sphereGeometry args={[.05,14,14]}/><meshStandardMaterial color="#fff9ef"/></mesh><mesh position={[0,0,.04]}><sphereGeometry args={[.024,12,12]}/><meshStandardMaterial color="#303747"/></mesh></group>)}
    <mesh position={[0,1.87,.285]}><sphereGeometry args={[.022,8,8]}/><meshStandardMaterial color="#bd826e"/></mesh>
    <mesh position={[0,1.78,.28]}><boxGeometry args={[.07,.016,.018]}/><meshStandardMaterial color="#985e68"/></mesh>
    <group ref={leftArm} position={[-.38,1.53,0]}><mesh position={[0,-.28,0]} castShadow><capsuleGeometry args={[.09,.43,6,10]}/><meshStandardMaterial color={outfit}/></mesh><mesh position={[0,-.54,.02]}><sphereGeometry args={[.09,12,12]}/><meshStandardMaterial color={skinColor}/></mesh></group>
    <group ref={rightArm} position={[.38,1.53,0]}><mesh position={[0,-.28,0]} castShadow><capsuleGeometry args={[.09,.43,6,10]}/><meshStandardMaterial color={outfit}/></mesh><mesh position={[0,-.54,.02]}><sphereGeometry args={[.09,12,12]}/><meshStandardMaterial color={skinColor}/></mesh></group>
    <group ref={leftLeg} position={[-.16,.55,0]}><mesh position={[0,-.2,0]} castShadow><capsuleGeometry args={[.12,.36,6,10]}/><meshStandardMaterial color="#33384a"/></mesh><mesh position={[0,-.42,.09]}><boxGeometry args={[.24,.12,.34]}/><meshStandardMaterial color="#171b27"/></mesh></group>
    <group ref={rightLeg} position={[.16,.55,0]}><mesh position={[0,-.2,0]} castShadow><capsuleGeometry args={[.12,.36,6,10]}/><meshStandardMaterial color="#33384a"/></mesh><mesh position={[0,-.42,.09]}><boxGeometry args={[.24,.12,.34]}/><meshStandardMaterial color="#171b27"/></mesh></group>
    <Text position={[0,2.62,0]} fontSize={.24} color="#fff4e5" outlineWidth={.025} outlineColor="#20202c" anchorX="center">{name}</Text>
  </group>;
}

function InteractiveMarker({ position, label, onSelect, playerPosition }: { position:[number,number,number]; label:string; onSelect:(label:string)=>void; playerPosition:{current:THREE.Vector3} }) {
  return <group position={position} onClick={(e)=>{e.stopPropagation();const target=new THREE.Vector3(...position);onSelect(playerPosition.current.distanceTo(target)<=6.5?label:"TOO FAR — MOVE CLOSER");}}>
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

function World({ onInteract, interior, gameMinutes, onPositionChange }: { onInteract:(label:string)=>void; interior:string|null; gameMinutes:number; onPositionChange:(position:{x:number;z:number})=>void }) {
  const playerPosition=useRef(new THREE.Vector3());
  if(interior) {
    const isLibrary=interior.toLowerCase().includes("library");
    const isCafe=interior.toLowerCase().includes("cafe");
    const wall=isLibrary?"#d8cbb9":isCafe?"#e3d4bf":"#d9d5cb";
    const desk=isCafe?"#80604c":"#8a6a50";
    return <>
      <color attach="background" args={["#aab7bf"]}/>
      <fog attach="fog" args={["#aab7bf",28,58]}/>
      <ambientLight intensity={1.35}/>
      <directionalLight position={[-5,12,7]} intensity={1.7} castShadow shadow-mapSize={[1024,1024]}/>
      <hemisphereLight args={["#e8f1ff","#887b6c",.55]}/>
      <mesh position={[0,-.12,0]} receiveShadow><boxGeometry args={[22,.24,20]}/><meshStandardMaterial color="#9b9389" roughness={.88}/></mesh>
      {/* tiled floor with contrasting perimeter */}
      <mesh position={[0,.015,0]}><boxGeometry args={[21.5,.035,19.5]}/><meshStandardMaterial color="#c9bca9" roughness={.84}/></mesh>
      {Array.from({length:10},(_,i)=><mesh key={"tile-z"+i} position={[0,.04,-9+i*2]}><boxGeometry args={[21,.018,.035]}/><meshStandardMaterial color="#a99f93"/></mesh>)}
      {Array.from({length:11},(_,i)=><mesh key={"tile-x"+i} position={[-10+i*2,.04,0]}><boxGeometry args={[.035,.018,19]}/><meshStandardMaterial color="#a99f93"/></mesh>)}
      {/* walls and warm timber framing */}
      <mesh position={[0,4.2,-10]}><boxGeometry args={[22,8,.35]}/><meshStandardMaterial color={wall}/></mesh>
      <mesh position={[-11,4.2,0]}><boxGeometry args={[.35,8,20]}/><meshStandardMaterial color={wall}/></mesh>
      <mesh position={[11,4.2,0]}><boxGeometry args={[.35,8,20]}/><meshStandardMaterial color={wall}/></mesh>
      <mesh position={[-7,4.2,10]}><boxGeometry args={[8,8,.35]}/><meshStandardMaterial color={wall}/></mesh>
      <mesh position={[7,4.2,10]}><boxGeometry args={[8,8,.35]}/><meshStandardMaterial color={wall}/></mesh>
      {[-9,-4,4,9].map(x=><mesh key={x} position={[x,4.2,-9.76]}><boxGeometry args={[.14,8,.18]}/><meshStandardMaterial color="#826c59"/></mesh>)}
      <mesh position={[0,7.95,0]}><boxGeometry args={[22,.2,20]}/><meshStandardMaterial color="#eee8dc"/></mesh>
      {[-8,-4,0,4,8].map(x=><group key={"light"+x} position={[x,7.65,-1]}>
        <mesh><boxGeometry args={[1.7,.08,.55]}/><meshStandardMaterial color="#fff0ca" emissive="#ffdfa0" emissiveIntensity={.3}/></mesh>
      </group>)}
      {/* daylight windows along the side wall */}
      {[-6,0,6].map(x=><group key={"window"+x} position={[x,4.7,-9.77]}>
        <mesh><boxGeometry args={[3.1,2.35,.1]}/><meshStandardMaterial color="#e9e0d1"/></mesh>
        <mesh position={[0,0,.07]}><boxGeometry args={[2.8,2.05,.06]}/><meshStandardMaterial color="#7fa5b1" metalness={.15} roughness={.25}/></mesh>
        <mesh position={[0,0,.12]}><boxGeometry args={[.07,2.05,.05]}/><meshStandardMaterial color="#e8dfd0"/></mesh>
      </group>)}
      {/* front teaching wall, board and clock */}
      <mesh position={[0,3.2,-9.72]}><boxGeometry args={[7.6,2.35,.12]}/><meshStandardMaterial color="#294b47" roughness={.68}/></mesh>
      <Text position={[0,3.2,-9.62]} fontSize={.55} maxWidth={7} color="#f3eee2" anchorX="center" anchorY="middle">{isLibrary?"READ • LEARN • DISCOVER":isCafe?"HOSHINO CAFETERIA":"HOSHINO ACADEMY"}</Text>
      <mesh position={[8.8,6.2,-9.58]}><cylinderGeometry args={[.42,.42,.1,32]}/><meshStandardMaterial color="#f3e7d0"/></mesh>
      <Text position={[8.8,6.2,-9.48]} fontSize={.22} color="#4b4240" anchorX="center" anchorY="middle">10:10</Text>
      {isLibrary ? <>
        {[-8,-5,5,8].map(x=><group key={"shelf"+x} position={[x,0,-5]}>
          <mesh position={[0,1.55,0]} castShadow><boxGeometry args={[1.8,3.1,.55]}/><meshStandardMaterial color="#684b3e"/></mesh>
          {[.55,1.35,2.15].map(y=><mesh key={y} position={[0,y,.31]}><boxGeometry args={[1.68,.09,.08]}/><meshStandardMaterial color="#d2b48c"/></mesh>)}
          {Array.from({length:12},(_,i)=><mesh key={i} position={[-.72+(i%6)*.28,.82+Math.floor(i/6)*.8,.36]}><boxGeometry args={[.18,.52,.12]}/><meshStandardMaterial color={["#a65c55","#557d83","#c49a57","#687b60"][i%4]}/></mesh>)}
        </group>)}
      </> : isCafe ? <>
        {[-5,0,5].map(x=><group key={"table"+x} position={[x,0,-2]}>
          <mesh position={[0,1.05,0]} castShadow><cylinderGeometry args={[1.05,1.05,.16,24]}/><meshStandardMaterial color="#b18b65"/></mesh>
          <mesh position={[0,.53,0]}><cylinderGeometry args={[.12,.16,1,12]}/><meshStandardMaterial color="#615044"/></mesh>
          {[-1.2,1.2].map(z=><mesh key={z} position={[0,.48,z]}><boxGeometry args={[.55,.9,.5]}/><meshStandardMaterial color="#5b6e69"/></mesh>)}
        </group>)}
      </> : <>
        {[-5,0,5].map(x=><group key={x} position={[x,0,-4]}>
          <mesh position={[0,1.35,0]} castShadow><boxGeometry args={[3.1,.18,1.5]}/><meshStandardMaterial color={desk}/></mesh>
          <mesh position={[0,.68,.85]}><boxGeometry args={[.8,1.25,.12]}/><meshStandardMaterial color="#5b4851"/></mesh>
          <mesh position={[0,.62,1.65]}><boxGeometry args={[1.1,.12,.9]}/><meshStandardMaterial color="#735b4e"/></mesh>
          <mesh position={[-1.35,1.5,0]}><boxGeometry args={[.04,.02,1.2]}/><meshStandardMaterial color="#e9e0d2"/></mesh>
        </group>)}
        {[-5,0,5].map(x=><group key={"backdesk"+x} position={[x,0,2]}>
          <mesh position={[0,1.35,0]} castShadow><boxGeometry args={[3.1,.18,1.5]}/><meshStandardMaterial color={desk}/></mesh>
          <mesh position={[0,.68,.85]}><boxGeometry args={[.8,1.25,.12]}/><meshStandardMaterial color="#5b4851"/></mesh>
          <mesh position={[0,.62,1.65]}><boxGeometry args={[1.1,.12,.9]}/><meshStandardMaterial color="#735b4e"/></mesh>
        </group>)}
      </>}
      <InteractiveMarker position={[0,0,8.4]} label="EXIT" onSelect={onInteract} playerPosition={playerPosition}/>
      <Player inside playerPosition={playerPosition} onPositionChange={onPositionChange}/>
    </>;
  }
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
    {/* Landscaped campus details */}
    {[-15,-8,8,15].map((x)=><CampusLamp key={"lamp-a"+x} position={[x,0,27]}/>)}
    {[-15,-8,8,15].map((x)=><CampusLamp key={"lamp-b"+x} position={[x,0,-31]}/>)}
    {[-16,-12,12,16].map((x)=><CampusShrub key={"shrub-a"+x} position={[x,0,8]} scale={.8}/>)}
    {[-16,-12,12,16].map((x)=><CampusShrub key={"shrub-b"+x} position={[x,0,-7]} scale={.9}/>)}
    {[-7,7].map((x)=><group key={"walkway-edge"+x} position={[x,.03,5]}>
      <mesh><boxGeometry args={[.22,.12,22]}/><meshStandardMaterial color="#e5d8c2"/></mesh>
    </group>)}
    <mesh position={[0,.025,8]} receiveShadow><boxGeometry args={[20,.08,1.1]}/><meshStandardMaterial color="#b6aa98"/></mesh>
    <mesh position={[0,.025,26]} receiveShadow><boxGeometry args={[20,.08,1.1]}/><meshStandardMaterial color="#b6aa98"/></mesh>
    {/* Formal courtyard plaza and landscaped borders */}
    <mesh position={[0,.012,14]} receiveShadow><boxGeometry args={[22,.09,20]}/><meshStandardMaterial color="#b9aa96" roughness={.92}/></mesh>
    {Array.from({length:11},(_,i)=><mesh key={"plaza-z"+i} position={[0,.065,5+i*1.8]}><boxGeometry args={[21.8,.025,.045]}/><meshStandardMaterial color="#968c7e"/></mesh>)}
    {Array.from({length:12},(_,i)=><mesh key={"plaza-x"+i} position={[-10+i*1.8,.065,14]}><boxGeometry args={[.045,.025,19.8]}/><meshStandardMaterial color="#968c7e"/></mesh>)}
    {[-10,10].map(x=><group key={"planter"+x} position={[x,0,15]}>
      <mesh position={[0,.35,0]} castShadow><boxGeometry args={[2.3,.7,7.5]}/><meshStandardMaterial color="#a18f7c"/></mesh>
      <mesh position={[0,.74,0]}><boxGeometry args={[2.05,.12,7.2]}/><meshStandardMaterial color="#526b4d"/></mesh>
      {[-2.5,-1.2,0,1.2,2.5].map(z=><CampusShrub key={z} position={[0,.78,z]} scale={.52}/>)}
    </group>)}
    {[-7,7].map(x=><group key={"bench"+x} position={[x,0,11]}>
      <mesh position={[0,.55,0]} castShadow><boxGeometry args={[2.5,.16,.65]}/><meshStandardMaterial color="#795a48"/></mesh>
      <mesh position={[0,.95,-.25]}><boxGeometry args={[2.5,.65,.13]}/><meshStandardMaterial color="#795a48"/></mesh>
      {[-.9,.9].map(z=><mesh key={z} position={[0,.27,z*.15]}><boxGeometry args={[.14,.55,.14]}/><meshStandardMaterial color="#45444a"/></mesh>)}
    </group>)}
    {/* Boundary walls and planted campus edges */}
    {[-42,42].map(x=><mesh key={"boundary-x"+x} position={[x,1.1,0]} castShadow><boxGeometry args={[.45,2.2,88]}/><meshStandardMaterial color="#c2b7a8"/></mesh>)}
    <mesh position={[0,1.1,-43]} castShadow><boxGeometry args={[84,.45,2.2]}/><meshStandardMaterial color="#c2b7a8"/></mesh>
    {[-36,-28,-20,-12,12,20,28,36].map(x=><CampusShrub key={"edge"+x} position={[x,0,40]} scale={.72}/>)}
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
    <StudentNPC name="Aiko" outfit="#6c789f" start={[-3,0,15]} route={gameMinutes>=660&&gameMinutes<780?NPC_ROUTES.aikoLunch:gameMinutes>=780&&gameMinutes<900?NPC_ROUTES.aikoLibrary:NPC_ROUTES.aikoCourtyard} onTalk={onInteract} playerPosition={playerPosition}/>
    <StudentNPC name="Ren" outfit="#9a6d78" start={[6,0,19]} route={gameMinutes>=840?NPC_ROUTES.renClubs:gameMinutes>=720?NPC_ROUTES.renSports:NPC_ROUTES.renCourtyard} onTalk={onInteract} playerPosition={playerPosition}/>
    <StudentNPC name="Mika" outfit="#648b7d" start={[-9,0,19]} route={gameMinutes>=780&&gameMinutes<900?NPC_ROUTES.mikaLunch:gameMinutes>=540&&gameMinutes<660?NPC_ROUTES.mikaLibrary:NPC_ROUTES.mikaCourtyard} onTalk={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[0,0,-8.2]} label="ACADEMY ENTRANCE" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[-12,0,2.7]} label="LIBRARY DOOR" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[12,0,2.7]} label="CLASSROOM DOOR" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[-29,0,-16.7]} label="CAFETERIA DOOR" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[29,0,17.7]} label="GYM DOOR" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[-29,0,17.7]} label="DORMITORY DOOR" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[29,0,-31.7]} label="CLUB DOOR" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[-12,0,2]} label="LIBRARY" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[12,0,2]} label="CLASSROOMS" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[0,0,-5]} label="FOUNTAIN" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[-29,0,-12]} label="CAFETERIA" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[29,0,22]} label="GYMNASIUM" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[-29,0,22]} label="DORMITORY" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[29,0,-11]} label="SPORTS FIELD" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[0,0,39]} label="MAIN GATE" onSelect={onInteract} playerPosition={playerPosition}/>
    <InteractiveMarker position={[29,0,-28]} label="ARTS & CLUBS" onSelect={onInteract} playerPosition={playerPosition}/>
    <Player playerPosition={playerPosition} onPositionChange={onPositionChange}/>
  </>;
}

export function AcademyWorld({ onInteract, interior, gameMinutes, onPositionChange }: { onInteract:(label:string)=>void; interior:string|null; gameMinutes:number; onPositionChange:(position:{x:number;z:number})=>void }) {
  return <Canvas shadows dpr={[1,1.5]} camera={{position:[0,6,16],fov:52,near:.1,far:180}}><World onInteract={onInteract} interior={interior} gameMinutes={gameMinutes} onPositionChange={onPositionChange}/></Canvas>;
}


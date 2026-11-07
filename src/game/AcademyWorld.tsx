import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Float, Text, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

type Control = "forward" | "backward" | "left" | "right" | "run";
const controlMap = [
  { name: "forward" as Control, keys: ["ArrowUp", "KeyW"] },
  { name: "backward" as Control, keys: ["ArrowDown", "KeyS"] },
  { name: "left" as Control, keys: ["ArrowLeft", "KeyA"] },
  { name: "right" as Control, keys: ["ArrowRight", "KeyD"] },
  { name: "run" as Control, keys: ["ShiftLeft", "ShiftRight"] }
];

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

function Player() {
  const group = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const [, get] = useKeyboardControls<Control>();
  const cameraTarget = useRef(new THREE.Vector3());
  useFrame((state, delta) => {
    if (!group.current) return;
    const input = get();
    const direction = new THREE.Vector3(Number(input.right)-Number(input.left),0,Number(input.backward)-Number(input.forward));
    if (direction.lengthSq() > 0) direction.normalize();
    const speed = input.run ? 6.8 : 3.8;
    velocity.current.lerp(direction.multiplyScalar(speed), Math.min(1,delta*10));
    group.current.position.addScaledVector(velocity.current,delta);
    group.current.position.x = THREE.MathUtils.clamp(group.current.position.x,-16,16);
    group.current.position.z = THREE.MathUtils.clamp(group.current.position.z,-13,17);
    if (velocity.current.lengthSq() > .05) group.current.rotation.y = Math.atan2(velocity.current.x,velocity.current.z);
    const bob = Math.sin(state.clock.elapsedTime*10)*.035*Math.min(1,velocity.current.length());
    group.current.position.y = Math.abs(bob);
    cameraTarget.current.set(group.current.position.x,group.current.position.y+2.8,group.current.position.z+7);
    state.camera.position.lerp(new THREE.Vector3(group.current.position.x,5.5,group.current.position.z+8.8),1-Math.exp(-delta*3.2));
    state.camera.lookAt(group.current.position.x,1.25,group.current.position.z-1.8);
  });
  return <group ref={group} position={[0,0,7]}>
    <mesh position={[0,1.05,0]} castShadow><capsuleGeometry args={[.38,.8,5,10]} /><meshStandardMaterial color="#e9d9e7" roughness={.72} /></mesh>
    <mesh position={[0,1.95,0]} castShadow><sphereGeometry args={[.34,18,16]} /><meshStandardMaterial color="#f0c8a9" roughness={.8} /></mesh>
    <mesh position={[0,2.12,.02]} castShadow><sphereGeometry args={[.35,16,10,0,Math.PI*2,0,Math.PI*.55]} /><meshStandardMaterial color="#303047" roughness={.95} /></mesh>
    <mesh position={[0,.48,0]} castShadow><boxGeometry args={[.72,.18,.42]} /><meshStandardMaterial color="#66557c" /></mesh>
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

function World({ onInteract }: { onInteract:(label:string)=>void }) {
  return <>
    <color attach="background" args={["#a9b9cb"]} />
    <fog attach="fog" args={["#a9b9cb",28,65]} />
    <ambientLight intensity={1.15} />
    <directionalLight position={[-12,18,8]} intensity={2.1} castShadow shadow-mapSize={[1024,1024]} />
    <hemisphereLight args={["#dce9ff","#7b806f",.65]} />
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.08,0]} receiveShadow><planeGeometry args={[100,100]} /><meshStandardMaterial color="#758c78" roughness={1} /></mesh>
    <mesh position={[0,-.015,1]} receiveShadow><boxGeometry args={[17,.08,29]} /><meshStandardMaterial color="#c3b7a5" roughness={1} /></mesh>
    <mesh position={[0,.01,5]}><boxGeometry args={[4,.06,22]} /><meshStandardMaterial color="#d6cbb8" /></mesh>
    <AcademyBuilding position={[0,0,-12]} label="HOSHINO ACADEMY" color="#d5d0d7" />
    <AcademyBuilding position={[-12,0,-1]} label="LIBRARY" color="#c7c5d0" />
    <AcademyBuilding position={[12,0,-1]} label="CLASSROOMS" color="#d4c8c1" />
    <mesh position={[0,.16,-5]} castShadow><cylinderGeometry args={[2.1,2.1,.32,32]} /><meshStandardMaterial color="#b4a9a5" /></mesh>
    <mesh position={[0,.48,-5]}><cylinderGeometry args={[1.55,1.55,.35,32]} /><meshStandardMaterial color="#83b7c5" metalness:.1 roughness:.22 /></mesh>
    <mesh position={[0,.9,-5]}><cylinderGeometry args={[.08,.08,.8,12]} /><meshStandardMaterial color="#d5e7ee" /></mesh>
    {[-9,-6,6,9].map((x)=>[-10,-3,5,12].map((z)=><Tree key={x+"-"+z} position={[x,0,z]} scale={.8+(Math.abs(x+z)%3)*.12}/>))}
    {[-3,3].map((x)=><group key={x} position={[x,0,3]}><mesh position={[0,.55,0]} castShadow><boxGeometry args={[2.4,.18,.7]} /><meshStandardMaterial color="#795b50" /></mesh><mesh position={[-.85,.28,0]}><boxGeometry args={[.12,.55,.6]} /><meshStandardMaterial color="#4c4544" /></mesh><mesh position={[.85,.28,0]}><boxGeometry args={[.12,.55,.6]} /><meshStandardMaterial color="#4c4544" /></mesh></group>)}
    <InteractiveMarker position={[-12,0,2]} label="LIBRARY" onSelect={onInteract}/>
    <InteractiveMarker position={[12,0,2]} label="CLASSROOMS" onSelect={onInteract}/>
    <InteractiveMarker position={[0,0,-5]} label="FOUNTAIN" onSelect={onInteract}/>
    <Player />
  </>;
}

export function AcademyWorld({ onInteract }: { onInteract:(label:string)=>void }) {
  return <KeyboardControls map={controlMap}><Canvas shadows dpr={[1,1.5]} camera={{position:[0,6,16],fov:52,near:.1,far:100}}>
    <World onInteract={onInteract}/>
  </Canvas></KeyboardControls>;
}

export { controlMap };

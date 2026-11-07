import { useEffect, useState } from "react";
import { AcademyWorld } from "../game/AcademyWorld";
import VirtualJoystick from "../components/ui/VirtualJoystick";
import { defaultSettings, loadSettings, saveSettings, type GameSettings } from "../storage/settings";
import { loadGame, saveGame } from "../storage/progress";
import { increaseFriendship, loadFriendships, resetFriendships, saveFriendships, type FriendshipMap } from "../storage/relationships";
import { completeMission, loadMissions, resetMissions, saveMissions, MISSION_LABELS, type MissionId, type MissionMap } from "../storage/missions";
import { loadProgression, resetProgression, saveProgression, awardExperience, type PlayerProgression } from "../storage/progression";

type Screen = "menu" | "game" | "settings" | "credits" | "load";
function playerAction(action:"jump"|"run",active:boolean){window.dispatchEvent(new CustomEvent("tsc-player-action",{detail:{action,active}}));}
export default function App() {
  const [screen,setScreen]=useState<Screen>("menu");
  const [settings,setSettings]=useState<GameSettings>(loadSettings);
  const [notice,setNotice]=useState("");
  const [interaction,setInteraction]=useState("");
  const [playerMapPosition,setPlayerMapPosition]=useState({x:0,z:18});
  const [interior,setInterior]=useState<string|null>(null);
  const [dialogue,setDialogue]=useState("");
  const [friendships,setFriendships]=useState<FriendshipMap>(loadFriendships);
  const [missions,setMissions]=useState<MissionMap>(loadMissions);
  const [progression,setProgression]=useState<PlayerProgression>(loadProgression);
  const handleInteract=(label:string)=>{
    setInteraction(label);
    const missionId:MissionId|null=label==="TALK: Aiko"?"meet-aiko":label==="LIBRARY"||label==="LIBRARY DOOR"?"visit-library":label==="CAFETERIA"||label==="CAFETERIA DOOR"?"visit-cafeteria":null;
    if(missionId) setMissions((current)=>{if(current[missionId])return current;const updated=completeMission(current,missionId);saveMissions(updated);setProgression((value)=>{const earned=awardExperience(value,50);saveProgression(earned);return earned;});return updated;});
  };
  const [savedAt,setSavedAt]=useState<number|null>(()=>loadGame()?.savedAt??null);
  const chooseDialogue=(name:string,message:string)=>{
    setDialogue(message);
    setFriendships((current)=>{
      const next=increaseFriendship(current,name,5);
      saveFriendships(next);
      return next;
    });
  };
  const [gameMinutes,setGameMinutes]=useState<number>(()=>loadGame()?.gameMinutes??465);
  const persistGame=()=>{window.dispatchEvent(new Event("tsc-save-position"));const saved=saveGame(interior,gameMinutes);setSavedAt(saved.savedAt);setNotice("Journey saved on this device.");};
  const resumeGame=()=>{const saved=loadGame();if(!saved){setNotice("No saved journey yet. Start a new game first.");return;}setInterior(saved.interior);setGameMinutes(saved.gameMinutes);setScreen("game");setNotice("");window.dispatchEvent(new Event("tsc-load-position"));setSavedAt(saved.savedAt);};
  const startNewGame=()=>{localStorage.removeItem("tsc-player-position-v1");localStorage.removeItem("tsc-save-v1");setSavedAt(null);setGameMinutes(465);setInterior(null);setInteraction("");setDialogue("");setFriendships(resetFriendships());setMissions(resetMissions());setProgression(resetProgression());setScreen("game");setNotice("");window.dispatchEvent(new Event("tsc-load-position"));};
  const updateSettings=(next:GameSettings)=>{setSettings(next);saveSettings(next);};
  useEffect(()=>{if(screen!=="game")return;const timer=window.setInterval(()=>setGameMinutes(value=>(value+1)%1440),1000);return()=>window.clearInterval(timer);},[screen]);
  const formatGameTime=(minutes:number)=>{const hour=Math.floor(minutes/60)%24;const minute=minutes%60;return `${String(hour%12||12).padStart(2,"0")}:${String(minute).padStart(2,"0")} ${hour>=12?"PM":"AM"}`;};
  const schedule=[{at:480,end:540,name:"Homeroom",place:"Classrooms"},{at:540,end:600,name:"Mathematics",place:"Classrooms"},{at:600,end:660,name:"Science",place:"Classrooms"},{at:660,end:720,name:"Morning break",place:"Courtyard"},{at:720,end:780,name:"Lunch",place:"Cafeteria"},{at:780,end:840,name:"English",place:"Classrooms"},{at:840,end:900,name:"Clubs & activities",place:"Arts & Clubs"},{at:900,end:960,name:"Free time",place:"Campus"}];
  const currentPeriod=schedule.find(item=>gameMinutes>=item.at&&gameMinutes<item.end)??(gameMinutes<480?{name:"Before classes",place:"Courtyard"}:{name:"School day finished",place:"Campus"});
  const goMenu=()=>{setScreen("menu");setNotice("");setInteraction("");setInterior(null);setDialogue("");};
  return <main className="game-root">
    {(screen==="menu"||screen==="game")&&<div className="world-layer"><AcademyWorld onInteract={handleInteract} interior={interior} gameMinutes={gameMinutes} onPositionChange={setPlayerMapPosition}/></div>}
    {screen==="menu"&&<section className="title-screen">
      <div className="title-topline"><span>AN ORIGINAL ANIME SCHOOL-LIFE ADVENTURE</span><span>EARLY ACCESS · BUILD 0.2</span></div>
      <div className="title-copy"><div className="crest">✦ HOSHINO ACADEMY ✦</div><h1>THE SCHOOL<br/><em>CHRONICLES</em></h1><p>YOUR DAYS. YOUR CHOICES. YOUR STORY.</p><div className="title-rule"/></div>
      <nav className="main-menu" aria-label="Main menu">
        <button className="primary" onClick={startNewGame}> <span>01</span> NEW GAME <b>↗</b></button>
        <button onClick={resumeGame}><span>02</span> CONTINUE <b>◇</b></button>
        <button onClick={()=>setScreen("load")}><span>03</span> LOAD GAME <b>▤</b></button>
        <button onClick={()=>setScreen("settings")}><span>04</span> SETTINGS <b>⚙</b></button>
        <button onClick={()=>setScreen("credits")}><span>05</span> CREDITS <b>✧</b></button>
      </nav>
      <div className="title-bottom"><span>THIRD-PERSON 3D WORLD</span><span>WASD / ARROWS TO MOVE · SHIFT TO RUN</span><span>WEB + ANDROID IN DEVELOPMENT</span></div>
      {notice&&<div className="toast" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
      <div className="world-hint">LIVE 3D ACADEMY ENVIRONMENT</div>
    </section>}
    {screen==="game"&&<section className="game-hud">
      <header className="hud-top"><div className="brand-mark">SC <span>THE SCHOOL CHRONICLES</span></div><div className="hud-location">HOSHINO ACADEMY <i>•</i> MAIN COURTYARD</div><div className="hud-actions"><button onClick={persistGame}>SAVE <span>◇</span></button><button onClick={()=>{persistGame();goMenu();}}>PAUSE / MENU <span>Ⅱ</span></button></div></header>
      <div className="objective"><small>DAY 01 · {formatGameTime(gameMinutes)} · {currentPeriod.name.toUpperCase()}</small><strong>{gameMinutes>=480&&gameMinutes<960?`Now: ${currentPeriod.name}`:"Explore the academy"}</strong><span>Next destination: {currentPeriod.place} · 1 game minute / real second</span></div>
      <aside className="progress-card" aria-label="Player progression"><div><small>PLAYER LEVEL</small><strong>LV. {progression.level}</strong><span>{progression.experience} XP</span></div><div className="progress-track"><i style={{width:`${progression.experience%100}%`}} /></div><small>{100-(progression.experience%100)} XP TO NEXT LEVEL</small></aside>
      <aside className="mini-map" aria-label="Campus minimap"><div className="mini-map-heading">CAMPUS MAP <span>LIVE</span></div><div className="mini-map-grid"><i className="map-road map-road-v1"/><i className="map-road map-road-v2"/><i className="map-road map-road-h1"/><i className="map-zone" style={{left:"39%",top:"35%"}}>H</i><i className="map-point" style={{left:"39%",top:"48%"}}>F</i><i className="map-point" style={{left:"29%",top:"49%"}}>L</i><i className="map-point" style={{left:"50%",top:"49%"}}>C</i><i className="map-point" style={{left:"25%",top:"59%"}}>D</i><i className="map-point" style={{left:"75%",top:"59%"}}>G</i><i className="map-point" style={{left:"75%",top:"31%"}}>A</i><i className="map-point" style={{left:"50%",top:"13%"}}>M</i><i className="map-player" style={{left:`${Math.max(4,Math.min(96,(playerMapPosition.x+58)/116*100))}%`,top:`${Math.max(4,Math.min(96,(58-playerMapPosition.z)/116*100))}%`}}/></div><div className="mini-map-legend">● YOU　 L LIBRARY　 C CLASS　 G GYM</div></aside>
      <aside className="mission-card" aria-label="Campus missions"><small>CAMPUS MISSIONS · {Object.values(missions).filter(Boolean).length}/3</small>{(Object.entries(MISSION_LABELS) as [MissionId,string][]).map(([id,label])=><div key={id} className={missions[id]?"completed":""}><span>{missions[id]?"✓":"○"}</span>{label}</div>)}</aside>
      {(interaction||interior)&&<div className="interaction-card"><small>{interior?"BUILDING INTERIOR":"YOU DISCOVERED"}</small><strong>{interior??interaction}</strong><p>{({LIBRARY:"A quiet place filled with books and stories.",CLASSROOMS:"The heart of academy life. Classes begin here.",FOUNTAIN:"A peaceful fountain in the centre of campus.", "TOO FAR — MOVE CLOSER":"Walk closer to interact with students and campus locations.",CAFETERIA:"Meet friends and take a break between classes.",GYMNASIUM:"The indoor sports and fitness centre.",DORMITORY:"Student residence and common rooms.", "SPORTS FIELD":"Outdoor grounds for games and school tournaments.","MAIN GATE":"The main entrance to Hoshino Academy.","ARTS & CLUBS":"Creative studios and after-school club rooms.","ACADEMY ENTRANCE":"Main entrance. The inside area is being prepared.","LIBRARY DOOR":"Library entrance found. Interior access is being built.","CLASSROOM DOOR":"Classroom wing entrance found. Interior access is being built.","CAFETERIA DOOR":"Cafeteria entrance found. Interior access is being built.","GYM DOOR":"Gymnasium entrance found. Interior access is being built.","DORMITORY DOOR":"Dormitory entrance found. Interior access is being built.","CLUB DOOR":"Club wing entrance found. Interior access is being built."} as Record<string,string>)[interaction] ?? "Explore this part of the academy."}</p>{interaction.startsWith("TALK: ")&&<div className="npc-dialogue">
          <small className="friendship-status">FRIENDSHIP · {friendships[interaction.replace("TALK: ","")]??0}/100</small>
          <p>{dialogue || "A student from Hoshino Academy is ready to chat."}</p>
          <div className="dialogue-choices">
            <button onClick={()=>chooseDialogue(interaction.replace("TALK: ",""),"Good morning! I’m getting ready for the first homeroom. See you in class.")}>Good morning! <span>+5</span></button>
            <button onClick={()=>chooseDialogue(interaction.replace("TALK: ",""),"Today: 08:00 Homeroom · 09:00 Mathematics · 10:00 Science · 11:00 Break.")}>Ask about today's timetable <span>+5</span></button>
            <button onClick={()=>chooseDialogue(interaction.replace("TALK: ",""),"The library, cafeteria and sports field are all open to explore.")}>Ask for campus tips <span>+5</span></button>
          </div>
        </div>}{interior
        ? <button onClick={()=>{setInterior(null);setInteraction("");}}>EXIT BUILDING</button>
        : interaction.endsWith("DOOR")
          ? <button onClick={()=>{setInterior(interaction.replace(" DOOR",""));setInteraction("");}}>ENTER BUILDING</button>
          : null}
        <button onClick={()=>setInteraction("")}>CLOSE</button></div>}
      <div className="controls-help"><span>W A S D <small>MOVE</small></span><span>SHIFT <small>RUN</small></span><span>CLICK GLOWING MARKERS <small>INTERACT</small></span></div>
      <div className="joystick-controls"><VirtualJoystick side="move" label="MOVE"/><div className="camera-drag-hint">DRAG TO LOOK</div><div className="mobile-action-buttons"><button aria-label="Jump" onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);playerAction("jump",true);}} onPointerUp={()=>playerAction("jump",false)} onPointerCancel={()=>playerAction("jump",false)} onLostPointerCapture={()=>playerAction("jump",false)}>↑<small>JUMP</small></button><button aria-label="Run" onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);playerAction("run",true);}} onPointerUp={()=>playerAction("run",false)} onPointerCancel={()=>playerAction("run",false)} onLostPointerCapture={()=>playerAction("run",false)}>»<small>RUN</small></button></div></div>
      <div className="game-footer"><span>DAY 01 · {formatGameTime(gameMinutes)}</span><span>MONDAY · {currentPeriod.name.toUpperCase()} <span>ACADEMY LIFE SIMULATION</span></span></div>
      {notice&&<div className="toast">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
    </section>}
    {screen==="settings"&&<section className="panel-screen"><button className="back" onClick={goMenu}>← BACK TO TITLE</button><p className="eyebrow">PREFERENCES</p><h2>SETTINGS</h2><div className="settings-card">
      {(["masterVolume","musicVolume","effectsVolume"] as const).map(key=><label className="setting" key={key}><span>{key==="masterVolume"?"MASTER VOLUME":key==="musicVolume"?"MUSIC VOLUME":"SOUND EFFECTS"}</span><strong>{settings[key]}%</strong><input type="range" min="0" max="100" value={settings[key]} onChange={e=>updateSettings({...settings,[key]:Number(e.target.value)})}/></label>)}
      <label className="setting"><span>DIALOGUE SPEED</span><select value={settings.dialogueSpeed} onChange={e=>updateSettings({...settings,dialogueSpeed:e.target.value as GameSettings["dialogueSpeed"]})}><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option></select></label>
      <button className="action-button" onClick={()=>updateSettings(defaultSettings)}>RESTORE DEFAULTS</button><p className="muted">Preferences are saved locally on this device.</p>
    </div></section>}
    {screen==="load"&&<section className="panel-screen"><button className="back" onClick={goMenu}>← BACK TO TITLE</button><p className="eyebrow">YOUR JOURNEY</p><h2>LOAD GAME</h2><div className="settings-card empty"><div className="empty-glyph">◇</div>{savedAt?<><h3>Journey found</h3><p>Last saved: {new Date(savedAt).toLocaleString()}</p><button className="action-button" onClick={resumeGame}>LOAD JOURNEY</button></>:<><h3>No saved journey</h3><p>Start exploring, then use SAVE to store your campus location on this device.</p><button className="action-button" onClick={()=>setScreen("game")}>ENTER THE ACADEMY</button></>}</div></section>}
    {screen==="credits"&&<section className="panel-screen"><button className="back" onClick={goMenu}>← BACK TO TITLE</button><p className="eyebrow">THE PEOPLE BEHIND THE STORY</p><h2>CREDITS</h2><div className="settings-card empty"><h3>THE SCHOOL CHRONICLES</h3><p>Original concept and game direction</p><strong className="credit-name">Vanshu</strong><hr/><p>Built with React, Three.js, React Three Fiber and TypeScript.</p><small>Independent project · Development build 0.2</small></div></section>}
  </main>;
}
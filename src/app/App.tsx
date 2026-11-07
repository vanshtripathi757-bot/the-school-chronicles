import { useState } from "react";
import { AcademyWorld } from "../game/AcademyWorld";
import VirtualJoystick from "../components/ui/VirtualJoystick";
import { defaultSettings, loadSettings, saveSettings, type GameSettings } from "../storage/settings";

type Screen = "menu" | "game" | "settings" | "credits" | "load";
export default function App() {
  const [screen,setScreen]=useState<Screen>("menu");
  const [settings,setSettings]=useState<GameSettings>(loadSettings);
  const [notice,setNotice]=useState("");
  const [interaction,setInteraction]=useState("");
  const updateSettings=(next:GameSettings)=>{setSettings(next);saveSettings(next);};
  const goMenu=()=>{setScreen("menu");setNotice("");setInteraction("");};
  return <main className="game-root">
    {(screen==="menu"||screen==="game")&&<div className="world-layer"><AcademyWorld onInteract={setInteraction}/></div>}
    {screen==="menu"&&<section className="title-screen">
      <div className="title-topline"><span>AN ORIGINAL ANIME SCHOOL-LIFE ADVENTURE</span><span>EARLY ACCESS · BUILD 0.2</span></div>
      <div className="title-copy"><div className="crest">✦ HOSHINO ACADEMY ✦</div><h1>THE SCHOOL<br/><em>CHRONICLES</em></h1><p>YOUR DAYS. YOUR CHOICES. YOUR STORY.</p><div className="title-rule"/></div>
      <nav className="main-menu" aria-label="Main menu">
        <button className="primary" onClick={()=>{setScreen("game");setNotice("");}}> <span>01</span> NEW GAME <b>↗</b></button>
        <button onClick={()=>setNotice("No saved journey yet. Start a new game to explore the academy.")}><span>02</span> CONTINUE <b>◇</b></button>
        <button onClick={()=>setScreen("load")}><span>03</span> LOAD GAME <b>▤</b></button>
        <button onClick={()=>setScreen("settings")}><span>04</span> SETTINGS <b>⚙</b></button>
        <button onClick={()=>setScreen("credits")}><span>05</span> CREDITS <b>✧</b></button>
      </nav>
      <div className="title-bottom"><span>THIRD-PERSON 3D WORLD</span><span>WASD / ARROWS TO MOVE · SHIFT TO RUN</span><span>WEB + ANDROID IN DEVELOPMENT</span></div>
      {notice&&<div className="toast" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
      <div className="world-hint">LIVE 3D ACADEMY ENVIRONMENT</div>
    </section>}
    {screen==="game"&&<section className="game-hud">
      <header className="hud-top"><div className="brand-mark">SC <span>THE SCHOOL CHRONICLES</span></div><div className="hud-location">HOSHINO ACADEMY <i>•</i> MAIN COURTYARD</div><button onClick={goMenu}>PAUSE / MENU <span>Ⅱ</span></button></header>
      <div className="objective"><small>YOUR FIRST DAY</small><strong>Explore the academy</strong><span>Walk around and discover the campus.</span></div>
      {interaction&&<div className="interaction-card"><small>YOU DISCOVERED</small><strong>{interaction}</strong><p>{({LIBRARY:"A quiet place filled with books and stories.",CLASSROOMS:"The heart of academy life. Classes begin here.",FOUNTAIN:"A peaceful fountain in the centre of campus.",CAFETERIA:"Meet friends and take a break between classes.",GYMNASIUM:"The indoor sports and fitness centre.",DORMITORY:"Student residence and common rooms.", "SPORTS FIELD":"Outdoor grounds for games and school tournaments.","MAIN GATE":"The main entrance to Hoshino Academy.","ARTS & CLUBS":"Creative studios and after-school club rooms."} as Record<string,string>)[interaction] ?? "Explore this part of the academy."}</p><button onClick={()=>setInteraction("")}>CLOSE</button></div>}
      <div className="controls-help"><span>W A S D <small>MOVE</small></span><span>SHIFT <small>RUN</small></span><span>CLICK GLOWING MARKERS <small>INTERACT</small></span></div>
      <div className="joystick-controls"><VirtualJoystick side="move" label="MOVE"/><div className="camera-drag-hint">DRAG TO LOOK</div></div>
      <div className="game-footer"><span>DAY 01</span><span>MONDAY · 08:00 AM</span><span>ACADEMY LIFE SIMULATION</span></div>
      {notice&&<div className="toast">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
    </section>}
    {screen==="settings"&&<section className="panel-screen"><button className="back" onClick={goMenu}>← BACK TO TITLE</button><p className="eyebrow">PREFERENCES</p><h2>SETTINGS</h2><div className="settings-card">
      {(["masterVolume","musicVolume","effectsVolume"] as const).map(key=><label className="setting" key={key}><span>{key==="masterVolume"?"MASTER VOLUME":key==="musicVolume"?"MUSIC VOLUME":"SOUND EFFECTS"}</span><strong>{settings[key]}%</strong><input type="range" min="0" max="100" value={settings[key]} onChange={e=>updateSettings({...settings,[key]:Number(e.target.value)})}/></label>)}
      <label className="setting"><span>DIALOGUE SPEED</span><select value={settings.dialogueSpeed} onChange={e=>updateSettings({...settings,dialogueSpeed:e.target.value as GameSettings["dialogueSpeed"]})}><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option></select></label>
      <button className="action-button" onClick={()=>updateSettings(defaultSettings)}>RESTORE DEFAULTS</button><p className="muted">Preferences are saved locally on this device.</p>
    </div></section>}
    {screen==="load"&&<section className="panel-screen"><button className="back" onClick={goMenu}>← BACK TO TITLE</button><p className="eyebrow">YOUR JOURNEY</p><h2>LOAD GAME</h2><div className="settings-card empty"><div className="empty-glyph">◇</div><h3>No saved journey</h3><p>Save slots will be added as the story and progression systems are built.</p><button className="action-button" onClick={()=>setScreen("game")}>ENTER THE ACADEMY</button></div></section>}
    {screen==="credits"&&<section className="panel-screen"><button className="back" onClick={goMenu}>← BACK TO TITLE</button><p className="eyebrow">THE PEOPLE BEHIND THE STORY</p><h2>CREDITS</h2><div className="settings-card empty"><h3>THE SCHOOL CHRONICLES</h3><p>Original concept and game direction</p><strong className="credit-name">Vanshu</strong><hr/><p>Built with React, Three.js, React Three Fiber and TypeScript.</p><small>Independent project · Development build 0.2</small></div></section>}
  </main>;
}
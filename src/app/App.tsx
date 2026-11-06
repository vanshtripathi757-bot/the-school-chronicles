import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { createGame } from "../game/Game";
import { defaultSettings, loadSettings, saveSettings, type GameSettings } from "../storage/settings";

type Screen = "menu" | "game" | "settings" | "credits" | "load";
const hasSave = () => false; // Phase 1 has storage foundation only; save slots arrive in Phase 8.

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [notice, setNotice] = useState("");
  const gameHost = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (screen !== "game" || !gameHost.current || gameRef.current) return;
    const game = createGame(gameHost.current);
    gameRef.current = game;
    return () => { game.destroy(true); gameRef.current = null; };
  }, [screen]);

  const updateSettings = (next: GameSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const startNewGame = () => { setNotice(""); setScreen("game"); };
  const goBack = () => { setNotice(""); setScreen("menu"); };

  return (
    <main className="app-shell">
      {screen === "menu" && <section className="menu-screen">
        <div className="menu-atmosphere" aria-hidden="true" />
        <div className="menu-title-block">
          <p className="menu-crest">✦  THE ACADEMY  ✦</p>
          <h1>THE SCHOOL<br/><span>CHRONICLES</span></h1>
          <p className="tagline">AN ELITE ACADEMY STORY</p>
        </div>
        <nav className="main-menu" aria-label="Main menu">
          <button className="menu-button primary" onClick={startNewGame}><span className="menu-arrow">▶</span> NEW GAME</button>
          <button className="menu-button" onClick={() => hasSave() ? setScreen("game") : setNotice("No saved game found yet. Start a New Game to begin.")}>CONTINUE</button>
          <button className="menu-button" onClick={() => setScreen("load")}>LOAD GAME</button>
          <button className="menu-button" onClick={() => setScreen("settings")}>SETTINGS</button>
          <button className="menu-button" onClick={() => setScreen("credits")}>CREDITS</button>
          {notice && <p className="notice" role="status">{notice}</p>}
        </nav>
        <div className="menu-footer"><span>EST. 2026</span><span>V. 0.1.0</span></div>
      </section>}

      {screen === "game" && <section className="game-screen">
        <header className="game-topbar"><span>THE SCHOOL CHRONICLES</span><button onClick={goBack}>← MAIN MENU</button></header>
        <div className="game-canvas" ref={gameHost} />
      </section>}

      {screen === "settings" && <section className="sub-screen">
        <button className="back-button" onClick={goBack}>← BACK</button>
        <p className="eyebrow">PREFERENCES</p><h2>SETTINGS</h2>
        <div className="settings-panel">
          {(["masterVolume", "musicVolume", "effectsVolume"] as const).map((key) => <label className="setting-row" key={key}>
            <span>{key === "masterVolume" ? "Master volume" : key === "musicVolume" ? "Music volume" : "Sound effects"}</span>
            <strong>{settings[key]}%</strong>
            <input type="range" min="0" max="100" value={settings[key]} onChange={e => updateSettings({ ...settings, [key]: Number(e.target.value) })}/>
          </label>)}
          <label className="setting-row"><span>Dialogue speed preference</span>
            <select value={settings.dialogueSpeed} onChange={e => updateSettings({ ...settings, dialogueSpeed: e.target.value as GameSettings["dialogueSpeed"] })}>
              <option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option>
            </select>
          </label>
          <button className="secondary-button" onClick={() => updateSettings(defaultSettings)}>RESTORE DEFAULTS</button>
          <p className="helper">Preferences are saved locally in this browser.</p>
        </div>
      </section>}

      {screen === "load" && <section className="sub-screen">
        <button className="back-button" onClick={goBack}>← BACK</button><p className="eyebrow">YOUR JOURNEY</p><h2>LOAD GAME</h2>
        <div className="empty-state"><span className="empty-icon">◇</span><h3>No save slots yet</h3><p>Save slots and full save management are planned for Phase 8.</p><button className="secondary-button" onClick={startNewGame}>START NEW GAME</button></div>
      </section>}

      {screen === "credits" && <section className="sub-screen credits-screen">
        <button className="back-button" onClick={goBack}>← BACK</button><p className="eyebrow">THE PEOPLE BEHIND THE STORY</p><h2>CREDITS</h2>
        <div className="credits-card"><h3>THE SCHOOL CHRONICLES</h3><p>Original game concept and project direction</p><p className="credit-name">Vanshu</p><hr/><p>Built with React, TypeScript, Vite and Phaser 3.</p><small>Phase 1 Foundation · Version 0.1.0</small></div>
      </section>}
    </main>
  );
}
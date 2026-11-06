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
      {screen === "menu" && <section className="menu-screen generated-menu">
        <img className="menu-art" src="/images/academy-main-menu.webp" alt="The School Chronicles anime academy at sunset" />
        <div className="menu-hotspots" aria-label="Main menu">
          <button className="hotspot profile-hotspot" aria-label="Profile" onClick={() => setNotice("Player profile will be available with character creation.")} />
          <button className="hotspot trophy-hotspot" aria-label="Achievements" onClick={() => setNotice("Academy achievements will unlock during gameplay.")} />
          <button className="hotspot settings-hotspot" aria-label="Settings" onClick={() => setScreen("settings")} />
          <button className="hotspot newgame-hotspot" aria-label="New Game" onClick={startNewGame} />
          <button className="hotspot continue-hotspot" aria-label="Continue" onClick={() => hasSave() ? setScreen("game") : setNotice("No saved game found yet. Start a New Game to begin.")} />
          <button className="hotspot load-hotspot" aria-label="Load Game" onClick={() => setScreen("load")} />
          <button className="hotspot menu-settings-hotspot" aria-label="Settings" onClick={() => setScreen("settings")} />
          <button className="hotspot credits-hotspot" aria-label="Credits" onClick={() => setScreen("credits")} />
          <button className="hotspot quit-hotspot" aria-label="Quit" onClick={() => setNotice("You can close this browser tab to leave the game.")} />
        </div>
        {notice && <div className="menu-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
        <div className="rotate-prompt" aria-live="polite">
          <div className="rotate-symbol">▱</div><p>THE SCHOOL CHRONICLES</p>
          <h2>PLEASE ROTATE YOUR DEVICE</h2>
          <span>THIS GAME IS DESIGNED FOR LANDSCAPE MODE</span>
        </div>
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
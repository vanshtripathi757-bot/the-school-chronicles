import { useEffect, useState } from "react";
import { canGenerateStory, loadStoryDirector, saveStoryDirector, type StoryDirectorState, type StoryPack } from "../storage/storyDirector";

type Props = { experience: number; completedMissions: number; onReward: (amount: number) => void };
export default function StoryDirectorPanel({ experience, completedMissions, onReward }: Props) {
  const [state, setState] = useState<StoryDirectorState>(loadStoryDirector);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selection, setSelection] = useState<number | null>(null);

  const generate = async (automatic = false) => {
    if (busy || (!automatic && !canGenerateStory(state))) return;
    setBusy(true);
    setMessage("Gemini is preparing the next chapter activity…");
    try {
      const response = await fetch("/api/story-director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience,
          completedMissions,
          seenIds: state.items.map(item => item.id)
        })
      });
      const payload = await response.json() as { pack?: StoryPack; error?: string };
      if (!response.ok || !payload.pack) throw new Error(payload.error || "Could not create new content.");
      const next = { ...state, lastGeneratedAt: Date.now(), items: [...state.items, payload.pack].slice(-12) };
      setState(next);
      saveStoryDirector(next);
      setMessage("A new activity is ready. It will unlock as your journey progresses.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Story Director is temporarily unavailable.");
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (canGenerateStory(state)) void generate(true);
    // Run once on game entry; generated content is persisted locally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const available = state.items.filter(item => !item.completed && experience >= item.unlockAtXp);
  const current = available[0];
  const nextLocked = state.items.find(item => !item.completed && experience < item.unlockAtXp);
  const complete = (item: StoryPack, answered: boolean) => {
    const next = { ...state, items: state.items.map(entry => entry.id === item.id ? { ...entry, completed: true, answered } : entry) };
    setState(next); saveStoryDirector(next); setSelection(null);
    onReward(answered ? 25 : 20);
    setMessage(answered ? "Correct answer recorded. Your story has progressed." : "Story event completed. New progress saved.");
  };

  return <aside className="story-director-card" aria-label="AI Story Director">
    <div className="story-director-top"><div><small>GEMINI · STORY DIRECTOR</small><strong>Next chapter activity</strong></div><span>{busy ? "CREATING" : "ACTIVE"}</span></div>
    {current ? <>
      <small className="story-kind">{current.kind.toUpperCase()} · {current.chapter}</small>
      <h3>{current.title}</h3><p>{current.summary}</p><p>{current.storyText}</p>
      <small>LOCATION · {current.location}</small>
      <strong className="story-question">{current.question}</strong>
      <div className="story-options">{current.options.map((option,index)=><button key={index} className={selection===index?"selected":""} onClick={()=>setSelection(index)}>{String.fromCharCode(65+index)}. {option}</button>)}</div>
      {selection!==null && <div className="story-feedback">{selection===current.correctOption ? "Correct. " : "Not quite. "}{current.explanation}<button onClick={()=>complete(current,true)}>SUBMIT ANSWER</button></div>}
      <button className="story-complete" onClick={()=>complete(current,false)}>COMPLETE STORY SCENE</button>
    </> : nextLocked ? <><h3>{nextLocked.title}</h3><p>{nextLocked.summary}</p><div className="story-lock">LOCKED · UNLOCKS AT {nextLocked.unlockAtXp} XP</div></> :
      <><h3>Your next adventure is being prepared</h3><p>New quizzes, tests, school events and story missions arrive gradually. Complete activities to unlock them.</p></>}
    {message && <p className="story-director-message" role="status">{message}</p>}
    <button className="story-generate" disabled={busy || !canGenerateStory(state)} onClick={()=>void generate(false)}>{busy ? "PREPARING…" : canGenerateStory(state) ? "GENERATE NEXT ACTIVITY" : "NEXT GENERATION IN 24 HOURS"}</button>
  </aside>;
}

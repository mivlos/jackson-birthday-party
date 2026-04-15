"use client";

import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

/* ────────────────── TYPES ────────────────── */
interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  emoji: string;
  notes: string;
  done: boolean;
}

interface Guest {
  id: string;
  name: string;
  emoji: string;
  arrived: boolean;
  gift: string;
  dietaryNote: string;
}

interface PartyData {
  timeline: TimelineEvent[];
  guests: Guest[];
  photos: number;
  partyStarted: boolean;
}

/* ────────────────── DEFAULTS ────────────────── */
const BIRTHDAY = new Date("2026-05-02T00:00:00");

const defaultTimeline: TimelineEvent[] = [
  { id: "t1", time: "09:00", title: "Set up decorations", emoji: "🎈", notes: "Balloons, banners, tablecloth", done: false },
  { id: "t2", time: "10:00", title: "Pick up cake", emoji: "🎂", notes: "Dinosaur cake from Mimi's Bakehouse", done: false },
  { id: "t3", time: "11:00", title: "Party bags ready", emoji: "🎁", notes: "12 bags — sweets, stickers, small toy", done: false },
  { id: "t4", time: "12:00", title: "Guests arrive!", emoji: "🦁", notes: "Welcome at the door — name tags ready", done: false },
  { id: "t5", time: "12:15", title: "Free play / garden games", emoji: "⚽", notes: "Football, frisbee, obstacle course", done: false },
  { id: "t6", time: "13:00", title: "Party games", emoji: "🏆", notes: "Musical statues → Treasure hunt → Pass the parcel", done: false },
  { id: "t7", time: "13:45", title: "Food time!", emoji: "🍕", notes: "Pizza, sandwiches, fruit, juice boxes", done: false },
  { id: "t8", time: "14:15", title: "CAKE & Happy Birthday! 🎶", emoji: "🎂", notes: "7 candles! Get camera ready!", done: false },
  { id: "t9", time: "14:30", title: "More play / wind down", emoji: "🎮", notes: "Colouring, Lego table, garden", done: false },
  { id: "t10", time: "15:00", title: "Party bags & goodbye!", emoji: "👋", notes: "Thank everyone, hand out bags at the door", done: false },
];

const defaultGuests: Guest[] = [
  { id: "g1", name: "Archie", emoji: "🦊", arrived: false, gift: "", dietaryNote: "" },
  { id: "g2", name: "Finn", emoji: "🐻", arrived: false, gift: "", dietaryNote: "" },
  { id: "g3", name: "Isla", emoji: "🦄", arrived: false, gift: "", dietaryNote: "" },
  { id: "g4", name: "Leo", emoji: "🦁", arrived: false, gift: "", dietaryNote: "" },
  { id: "g5", name: "Millie", emoji: "🐰", arrived: false, gift: "", dietaryNote: "" },
  { id: "g6", name: "Oscar", emoji: "🐯", arrived: false, gift: "", dietaryNote: "" },
  { id: "g7", name: "Ruby", emoji: "🦋", arrived: false, gift: "", dietaryNote: "" },
  { id: "g8", name: "Theo", emoji: "🐼", arrived: false, gift: "", dietaryNote: "" },
  { id: "g9", name: "Poppy", emoji: "🌸", arrived: false, gift: "", dietaryNote: "" },
  { id: "g10", name: "Caleb", emoji: "🦕", arrived: false, gift: "", dietaryNote: "" },
];

/* ────────────────── HELPERS ────────────────── */
function getCountdown() {
  const now = new Date();
  const diff = BIRTHDAY.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function fireConfetti() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { y: 0.7 } }), 250);
}

const STORAGE_KEY = "jackson-7th-birthday-party";

function loadData(): PartyData {
  if (typeof window === "undefined") return { timeline: defaultTimeline, guests: defaultGuests, photos: 0, partyStarted: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { timeline: defaultTimeline, guests: defaultGuests, photos: 0, partyStarted: false };
}

function saveData(data: PartyData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ────────────────── TABS ────────────────── */
type Tab = "countdown" | "timeline" | "guests" | "stats";

const tabs: { id: Tab; label: string; emoji: string }[] = [
  { id: "countdown", label: "Countdown", emoji: "⏳" },
  { id: "timeline", label: "Timeline", emoji: "📋" },
  { id: "guests", label: "Guests", emoji: "👥" },
  { id: "stats", label: "Stats", emoji: "📊" },
];

/* ────────────────── COMPONENT ────────────────── */
export default function Home() {
  const [data, setData] = useState<PartyData>(loadData);
  const [tab, setTab] = useState<Tab>("countdown");
  const [countdown, setCountdown] = useState(getCountdown());
  const [addGuestName, setAddGuestName] = useState("");
  const [addEventTitle, setAddEventTitle] = useState("");
  const [addEventTime, setAddEventTime] = useState("");

  // Countdown ticker
  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Persist
  useEffect(() => { saveData(data); }, [data]);

  const update = useCallback((partial: Partial<PartyData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const toggleTimelineItem = (id: string) => {
    const newTimeline = data.timeline.map(e =>
      e.id === id ? { ...e, done: !e.done } : e
    );
    const justCompleted = newTimeline.find(e => e.id === id)?.done;
    if (justCompleted) fireConfetti();
    update({ timeline: newTimeline });
  };

  const toggleGuestArrival = (id: string) => {
    const newGuests = data.guests.map(g =>
      g.id === id ? { ...g, arrived: !g.arrived } : g
    );
    const justArrived = newGuests.find(g => g.id === id)?.arrived;
    if (justArrived) fireConfetti();
    update({ guests: newGuests });
  };

  const updateGuestGift = (id: string, gift: string) => {
    update({ guests: data.guests.map(g => g.id === id ? { ...g, gift } : g) });
  };

  const updateGuestDiet = (id: string, dietaryNote: string) => {
    update({ guests: data.guests.map(g => g.id === id ? { ...g, dietaryNote } : g) });
  };

  const addGuest = () => {
    if (!addGuestName.trim()) return;
    const emojis = ["🐶", "🐱", "🐸", "🐵", "🦊", "🐧", "🐢", "🦉", "🐝"];
    const newGuest: Guest = {
      id: `g-${Date.now()}`,
      name: addGuestName.trim(),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      arrived: false,
      gift: "",
      dietaryNote: "",
    };
    update({ guests: [...data.guests, newGuest] });
    setAddGuestName("");
  };

  const removeGuest = (id: string) => {
    update({ guests: data.guests.filter(g => g.id !== id) });
  };

  const addTimelineEvent = () => {
    if (!addEventTitle.trim() || !addEventTime.trim()) return;
    const newEvent: TimelineEvent = {
      id: `t-${Date.now()}`,
      time: addEventTime,
      title: addEventTitle.trim(),
      emoji: "📌",
      notes: "",
      done: false,
    };
    const newTimeline = [...data.timeline, newEvent].sort((a, b) => a.time.localeCompare(b.time));
    update({ timeline: newTimeline });
    setAddEventTitle("");
    setAddEventTime("");
  };

  const arrivedCount = data.guests.filter(g => g.arrived).length;
  const doneCount = data.timeline.filter(e => e.done).length;
  const progress = data.timeline.length > 0 ? Math.round((doneCount / data.timeline.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              <span className="animate-float inline-block">🦁</span>{" "}
              Jackson&apos;s 7th Birthday
            </h1>
            <p className="text-xs text-zinc-500">Friday 2nd May 2026 — Party Day Command Centre</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-amber-400 font-mono">{progress}% done</div>
            <div className="w-16 h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* Countdown Tab */}
        {tab === "countdown" && (
          <div className="space-y-6">
            {countdown ? (
              <div className="animate-pulse-glow bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
                <p className="text-sm text-zinc-400 mb-3">🎉 Countdown to Party Day</p>
                <div className="flex justify-center gap-4">
                  {[
                    { val: countdown.days, label: "Days" },
                    { val: countdown.hours, label: "Hours" },
                    { val: countdown.minutes, label: "Mins" },
                    { val: countdown.seconds, label: "Secs" },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <div className="text-3xl font-bold text-amber-400 font-mono">{String(val).padStart(2, "0")}</div>
                      <div className="text-xs text-zinc-500 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-zinc-400">
                  Jackson turns <span className="text-amber-400 font-bold">7!</span> 🦁
                </p>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
                <p className="text-4xl mb-2">🎉🦁🎂</p>
                <p className="text-2xl font-bold text-amber-400">IT&apos;S PARTY DAY!</p>
                <p className="text-sm text-zinc-400 mt-2">Happy 7th Birthday, Jackson!</p>
                <button
                  onClick={() => { fireConfetti(); fireConfetti(); }}
                  className="mt-4 bg-amber-500 text-zinc-950 font-bold px-6 py-2 rounded-xl hover:bg-amber-400 transition"
                >
                  🎉 Celebrate!
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{arrivedCount}/{data.guests.length}</div>
                <div className="text-xs text-zinc-500 mt-1">Guests</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-violet-400">{doneCount}/{data.timeline.length}</div>
                <div className="text-xs text-zinc-500 mt-1">Tasks</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-sky-400">{data.photos}</div>
                <div className="text-xs text-zinc-500 mt-1">Photos 📸</div>
              </div>
            </div>

            {/* Photo Counter */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">📸 Photo Counter</p>
                <p className="text-xs text-zinc-500">Tap + each time you snap a photo</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => update({ photos: Math.max(0, data.photos - 1) })}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold transition"
                >−</button>
                <span className="text-xl font-bold text-sky-400 font-mono w-8 text-center">{data.photos}</span>
                <button
                  onClick={() => { update({ photos: data.photos + 1 }); }}
                  className="w-8 h-8 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold transition"
                >+</button>
              </div>
            </div>

            {/* Party theme */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="font-semibold mb-2">🦕 Party Theme: Dinosaur Adventure</p>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>🎈 Green & orange balloons</li>
                <li>🎂 Dinosaur cake from Mimi&apos;s Bakehouse</li>
                <li>🎁 Dino-themed party bags</li>
                <li>🏆 Treasure hunt: &quot;Find the Lost Dinosaur Egg&quot;</li>
                <li>🎵 Dinosaur playlist on Spotify</li>
              </ul>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {tab === "timeline" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">📋 Party Timeline</h2>
              <span className="text-xs text-zinc-500">{doneCount}/{data.timeline.length} done</span>
            </div>
            {data.timeline.map((event, i) => (
              <div
                key={event.id}
                onClick={() => toggleTimelineItem(event.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  event.done
                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition ${
                    event.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-600"
                  }`}>
                    {event.done ? "✓" : i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-400">{event.time}</span>
                    <span className={event.done ? "line-through text-zinc-500" : "font-semibold"}>
                      {event.emoji} {event.title}
                    </span>
                  </div>
                  {event.notes && (
                    <p className="text-xs text-zinc-500 mt-1">{event.notes}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Add event */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mt-4">
              <p className="text-sm font-semibold mb-2">➕ Add Event</p>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={addEventTime}
                  onChange={e => setAddEventTime(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm w-24 text-zinc-100"
                />
                <input
                  type="text"
                  placeholder="Event title..."
                  value={addEventTitle}
                  onChange={e => setAddEventTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTimelineEvent()}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm flex-1 text-zinc-100 placeholder:text-zinc-600"
                />
                <button
                  onClick={addTimelineEvent}
                  className="bg-amber-500 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-sm hover:bg-amber-400 transition"
                >Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Guests Tab */}
        {tab === "guests" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">👥 Guest List</h2>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                arrivedCount === data.guests.length && data.guests.length > 0
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-zinc-800 text-zinc-400"
              }`}>
                {arrivedCount}/{data.guests.length} arrived
              </span>
            </div>
            {data.guests.map(guest => (
              <div
                key={guest.id}
                className={`p-3 rounded-xl border transition-all ${
                  guest.arrived
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleGuestArrival(guest.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition ${
                        guest.arrived ? "bg-emerald-500/20" : "bg-zinc-800"
                      }`}
                    >
                      {guest.arrived ? "✅" : guest.emoji}
                    </button>
                    <span className={`font-semibold ${guest.arrived ? "text-emerald-400" : ""}`}>
                      {guest.name}
                    </span>
                    {guest.arrived && <span className="text-xs text-emerald-500">Here!</span>}
                  </div>
                  <button
                    onClick={() => removeGuest(guest.id)}
                    className="text-zinc-600 hover:text-rose-400 text-xs transition"
                  >✕</button>
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Gift..."
                    value={guest.gift}
                    onChange={e => updateGuestGift(guest.id, e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs flex-1 text-zinc-100 placeholder:text-zinc-600"
                  />
                  <input
                    type="text"
                    placeholder="Dietary..."
                    value={guest.dietaryNote}
                    onChange={e => updateGuestDiet(guest.id, e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs flex-1 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>
              </div>
            ))}

            {/* Add guest */}
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Add a guest..."
                value={addGuestName}
                onChange={e => setAddGuestName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addGuest()}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm flex-1 text-zinc-100 placeholder:text-zinc-600"
              />
              <button
                onClick={addGuest}
                className="bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-lg text-sm hover:bg-amber-400 transition"
              >Add</button>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {tab === "stats" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">📊 Party Dashboard</h2>

            {/* Progress bar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Party Progress</span>
                <span className="text-amber-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-500 to-emerald-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-3xl mb-1">📋</div>
                <div className="text-2xl font-bold text-amber-400">{doneCount}/{data.timeline.length}</div>
                <div className="text-xs text-zinc-500">Tasks Complete</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-3xl mb-1">👥</div>
                <div className="text-2xl font-bold text-emerald-400">{arrivedCount}/{data.guests.length}</div>
                <div className="text-xs text-zinc-500">Guests Arrived</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-3xl mb-1">📸</div>
                <div className="text-2xl font-bold text-sky-400">{data.photos}</div>
                <div className="text-xs text-zinc-500">Photos Taken</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-3xl mb-1">🎁</div>
                <div className="text-2xl font-bold text-violet-400">
                  {data.guests.filter(g => g.gift.trim()).length}
                </div>
                <div className="text-xs text-zinc-500">Gifts Logged</div>
              </div>
            </div>

            {/* Gift log */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="font-semibold mb-2">🎁 Gift Log</p>
              {data.guests.filter(g => g.gift.trim()).length === 0 ? (
                <p className="text-xs text-zinc-500">No gifts logged yet — add them in the Guests tab!</p>
              ) : (
                <div className="space-y-1">
                  {data.guests.filter(g => g.gift.trim()).map(g => (
                    <div key={g.id} className="flex items-center gap-2 text-sm">
                      <span>{g.emoji}</span>
                      <span className="text-zinc-400">{g.name}:</span>
                      <span className="text-zinc-100">{g.gift}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dietary needs */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="font-semibold mb-2">🍽️ Dietary Notes</p>
              {data.guests.filter(g => g.dietaryNote.trim()).length === 0 ? (
                <p className="text-xs text-zinc-500">No dietary notes — add them in the Guests tab if needed.</p>
              ) : (
                <div className="space-y-1">
                  {data.guests.filter(g => g.dietaryNote.trim()).map(g => (
                    <div key={g.id} className="flex items-center gap-2 text-sm">
                      <span>{g.emoji}</span>
                      <span className="text-zinc-400">{g.name}:</span>
                      <span className="text-rose-300">{g.dietaryNote}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                if (confirm("Reset all party data? This cannot be undone.")) {
                  setData({ timeline: defaultTimeline, guests: defaultGuests, photos: 0, partyStarted: false });
                }
              }}
              className="w-full py-2 text-sm text-zinc-500 hover:text-rose-400 border border-zinc-800 rounded-xl transition"
            >
              🔄 Reset All Data
            </button>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-zinc-950/90 backdrop-blur border-t border-zinc-800 z-50">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-center transition ${
                tab === t.id ? "text-amber-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <div className="text-lg">{t.emoji}</div>
              <div className="text-xs mt-0.5">{t.label}</div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

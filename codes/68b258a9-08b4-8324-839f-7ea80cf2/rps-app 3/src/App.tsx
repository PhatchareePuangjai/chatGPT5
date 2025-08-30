import React, { useEffect, useMemo, useRef, useState } from "react";
import Confetti from "./components/Confetti";
import { useLocalStorage } from "./hooks/useLocalStorage";

type MoveKey = "rock" | "paper" | "scissors";
type RoundResult = "win" | "lose" | "draw";

const MOVES: { key: MoveKey; label: string; emoji: string }[] = [
  { key: "rock", label: "ค้อน", emoji: "🪨" },
  { key: "paper", label: "กระดาษ", emoji: "📄" },
  { key: "scissors", label: "กรรไกร", emoji: "✂️" },
];

const beats: Record<MoveKey, MoveKey> = { rock: "scissors", scissors: "paper", paper: "rock" };
const decide = (a: MoveKey, b: MoveKey): RoundResult => (a === b ? "draw" : beats[a] === b ? "win" : "lose");
const randomMove = (): MoveKey => MOVES[Math.floor(Math.random() * MOVES.length)].key;

export default function App() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("rps_theme", "light");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const [mode, setMode] = useLocalStorage<"single" | "local">("rps_mode", "single");
  const [bestOf, setBestOf] = useLocalStorage<number>("rps_bestOf", 3);
  const winNeed = useMemo(() => Math.floor(bestOf / 2) + 1, [bestOf]);

  const [rounds, setRounds] = useState<{ p: MoveKey; o: MoveKey; r: RoundResult }[]>([]);
  const [p1Sel, setP1Sel] = useState<MoveKey | null>(null);
  const [p2Sel, setP2Sel] = useState<MoveKey | null>(null);
  const [localStep, setLocalStep] = useState<"p1" | "p2">("p1");
  const [locked, setLocked] = useState(false);

  const [stats, setStats] = useLocalStorage<{ win: number; lose: number; draw: number }>("rps_stats", {
    win: 0, lose: 0, draw: 0
  });

  const pScore = rounds.filter(r => r.r === "win").length;
  const oScore = rounds.filter(r => r.r === "lose").length;
  const isOver = pScore >= winNeed || oScore >= winNeed;
  const [fireConfetti, setFireConfetti] = useState(false);
  const announceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (locked || isOver) return;
      if (["r","p","s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        const map: Record<string, MoveKey> = { r: "rock", p: "paper", s: "scissors" };
        handlePick(map[e.key.toLowerCase()]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, isOver, localStep, mode]);

  function reset(keep = true) {
    setRounds([]);
    setP1Sel(null);
    setP2Sel(null);
    setLocalStep("p1");
    setLocked(false);
    setFireConfetti(false);
    if (!keep) { setMode("single"); setBestOf(3); }
  }

  function handlePick(move: MoveKey) {
    if (locked || isOver) return;
    setLocked(true);

    if (mode === "single") {
      const opp = randomMove();
      const res = decide(move, opp);
      setRounds(prev => [...prev, { p: move, o: opp, r: res }]);
      setTimeout(() => {
        setLocked(false);
        postRound(res);
      }, 200);
    } else {
      if (localStep === "p1") {
        setP1Sel(move);
        setLocalStep("p2");
        setLocked(false);
      } else {
        setP2Sel(move);
        const res = decide(p1Sel ?? move, move);
        setRounds(prev => [...prev, { p: p1Sel ?? move, o: move, r: res }]);
        setP1Sel(null); setP2Sel(null); setLocalStep("p1");
        setTimeout(() => { setLocked(false); postRound(res); }, 200);
      }
    }
    if ("vibrate" in navigator) (navigator as any).vibrate?.(20);
  }

  function postRound(res: RoundResult) {
    const text = res === "win" ? "ชนะ!" : res === "lose" ? "แพ้" : "เสมอ";
    announceRef.current?.setAttribute("data-msg", text);
    if (isOverNext(res)) {
      setStats(s => ({
        win: s.win + (res === "win" ? 1 : 0),
        lose: s.lose + (res === "lose" ? 1 : 0),
        draw: s.draw + (res === "draw" ? 1 : 0),
      }));
      if (res === "win") setFireConfetti(true);
      setTimeout(() => setFireConfetti(false), 1200);
    }
  }

  function isOverNext(last: RoundResult) {
    const ps = pScore + (last === "win" ? 1 : 0);
    const os = oScore + (last === "lose" ? 1 : 0);
    return ps >= winNeed || os >= winNeed;
  }

  function Badge({ children }: { children: React.ReactNode }) {
    return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium dark:bg-slate-800 dark:text-slate-200">{children}</span>;
  }

  function MoveButton({ m, disabled }: { m: typeof MOVES[number]; disabled?: boolean }) {
    return (
      <button
        onClick={() => handlePick(m.key)}
        disabled={!!disabled}
        className={`group flex items-center gap-2 rounded-2xl border px-4 py-3 transition active:scale-[.98]
          ${disabled ? "opacity-40 cursor-not-allowed" : "hover:shadow"}
          border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900`}
        aria-label={`เลือก ${m.label}`}
      >
        <span className="text-2xl">{m.emoji}</span>
        <span className="font-semibold">{m.label}</span>
      </button>
    );
  }

  function RoundPill({ r }: { r: RoundResult }) {
    const map: Record<RoundResult, string> = {
      win: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      lose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
      draw: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
    const txt = r === "win" ? "Win" : r === "lose" ? "Lose" : "Draw";
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[r]}`}>{txt}</span>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-2xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">เกมเป่ายิ้งฉุบ (Rock • Paper • Scissors)</h1>
          <div className="flex items-center gap-2">
            <Badge>Best of {bestOf}</Badge>
            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-900"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "light" ? "🌞" : "🌙"}
            </button>
          </div>
        </header>

        <section className="mb-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 text-sm font-semibold">โหมด</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`rounded-xl px-3 py-2 text-left transition ${mode === "single" ? "ring-2 ring-slate-300 dark:ring-slate-600 bg-slate-50 dark:bg-slate-800" : "hover:shadow"}`}
                onClick={() => setMode("single")}
              >
                <div className="font-semibold">ผู้เล่นเดี่ยว</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">แข่งกับคอมพิวเตอร์</div>
              </button>
              <button
                className={`rounded-xl px-3 py-2 text-left transition ${mode === "local" ? "ring-2 ring-slate-300 dark:ring-slate-600 bg-slate-50 dark:bg-slate-800" : "hover:shadow"}`}
                onClick={() => setMode("local")}
              >
                <div className="font-semibold">ผู้เล่น 2 คน</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">สลับกันเลือก</div>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 text-sm font-semibold">จำนวนรอบ (Best of)</div>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {[3,5,7].map(n => (
                <button
                  key={n}
                  className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${bestOf===n?"bg-white dark:bg-slate-900 shadow":"hover:shadow"}`}
                  onClick={() => setBestOf(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">ต้องชนะ {winNeed} รอบเพื่อจบเกม</div>
          </div>
        </section>

        <section className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <Confetti fire={fireConfetti} />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs text-slate-500">ผู้เล่น</div>
              <div className={`rounded-xl border px-4 py-3 text-lg font-semibold transition ${pScore>oScore?"border-emerald-300 dark:border-emerald-700":"border-slate-200 dark:border-slate-700"}`}>
                คะแนน: {pScore}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-500">{mode==="single"?"คอมพิวเตอร์":"ผู้เล่น 2"}</div>
              <div className={`rounded-xl border px-4 py-3 text-lg font-semibold transition ${oScore>pScore?"border-rose-300 dark:border-rose-700":"border-slate-200 dark:border-slate-700"}`}>
                คะแนน: {oScore}
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden>
            <div className="h-full bg-emerald-400 transition-[width]" style={{ width: `${(pScore / winNeed) * 100}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {MOVES.map(m => (
              <MoveButton key={m.key} m={m} disabled={locked || isOver || (mode==="local" && localStep==="p2")} />
            ))}
          </div>

          {mode === "local" && (
            <div className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">
              {localStep === "p1" ? "ผู้เล่น 1 เลือกอยู่…" : "ผู้เล่น 2 เลือกอยู่…"}
            </div>
          )}

          {rounds.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {rounds.map((r, i) => (
                <div key={i} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-slate-700">
                  <span>{i+1}.</span>
                  <span>{MOVES.find(m => m.key===r.p)?.emoji}</span>
                  <span>vs</span>
                  <span>{MOVES.find(m => m.key===r.o)?.emoji}</span>
                  <RoundPill r={r.r} />
                </div>
              ))}
            </div>
          )}

          <div className="sr-only" aria-live="polite" ref={announceRef} />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-600 dark:text-slate-400">เคล็ดลับ: ใช้คีย์บอร์ด R / P / S</div>
            <div className="flex gap-2">
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-900" onClick={() => reset(true)}>เริ่มรอบใหม่</button>
              <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 dark:bg-white dark:text-slate-900" onClick={() => reset(false)}>เริ่มเกมใหม่</button>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-2 text-sm font-semibold">สถิติเซสชัน</div>
          <div className="flex gap-3 text-sm">
            <Badge>ชนะ {stats.win}</Badge>
            <Badge>แพ้ {stats.lose}</Badge>
            <Badge>เสมอ {stats.draw}</Badge>
          </div>
          <button className="mt-3 text-xs underline underline-offset-4 opacity-80 hover:opacity-100" onClick={() => setStats({ win:0, lose:0, draw:0 })}>ล้างสถิติ</button>
        </section>
      </div>
    </div>
  );
}

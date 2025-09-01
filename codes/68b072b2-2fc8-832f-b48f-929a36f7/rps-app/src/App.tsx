import React, { useEffect, useMemo, useState } from "react";

// 🪨📄✂️ Rock-Paper-Scissors - Single & Local Multiplayer
// - Tailwind CSS for styling
// - Mobile-first, keyboard-friendly (R/P/S)
// - Best of 3/5/7 with early finish at ceil(N/2)
// - New Game / Exit (back to home)

const MOVES = [
  { key: "rock", label: "ค้อน", emoji: "🪨" },
  { key: "paper", label: "กระดาษ", emoji: "📄" },
  { key: "scissors", label: "กรรไกร", emoji: "✂️" },
] as const;

/** @typedef {"rock"|"paper"|"scissors"} MoveKey */
/** @typedef {"win"|"lose"|"draw"} RoundResult */

function decideResult(p1 /** @type {MoveKey} */, p2 /** @type {MoveKey} */) {
  if (p1 === p2) return "draw";
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "scissors" && p2 === "paper") ||
    (p1 === "paper" && p2 === "rock")
  )
    return "win";
  return "lose";
}

function randomMove() /** @returns {MoveKey} */ {
  const idx = Math.floor(Math.random() * MOVES.length);
  return MOVES[idx].key;
}

// ========== Self Tests ==========
// Lightweight tests executed once on mount (console only). Do not modify runtime state.
const ENABLE_SELF_TESTS = true;
function runSelfTests() {
  /** @type {Array<{name:string, pass:boolean, message?:string}>} */
  const results = [];
  const t = (name, cond, message = "") =>
    results.push({ name, pass: !!cond, message });

  // Expected matrix using independent rule definition (not decideResult)
  /** @type {Record<MoveKey, MoveKey>} */
  const beats = { rock: "scissors", scissors: "paper", paper: "rock" };
  /** @type {(a:MoveKey,b:MoveKey)=>RoundResult} */
  const expected = (a, b) =>
    a === b ? "draw" : beats[a] === b ? "win" : "lose";

  /** @type {MoveKey[]} */
  const all = ["rock", "paper", "scissors"];
  for (const a of all) {
    for (const b of all) {
      const name = `${a} vs ${b}`;
      t(name, decideResult(a, b) === expected(a, b));
    }
  }

  // Win threshold logic: ceil(N/2)
  const wt = (n) => Math.floor(n / 2) + 1;
  t("BestOf 3 -> 2", wt(3) === 2);
  t("BestOf 5 -> 3", wt(5) === 3);
  t("BestOf 7 -> 4", wt(7) === 4);

  // Symmetry check on a sample pair
  t(
    "Symmetry: Rock beats Scissors; Scissors loses to Rock",
    decideResult("rock", "scissors") === "win" &&
      decideResult("scissors", "rock") === "lose"
  );

  const passed = results.filter((r) => r.pass).length;
  // eslint-disable-next-line no-console
  console.groupCollapsed(`RPS Self Tests: ${passed}/${results.length} passed`);
  for (const r of results) {
    // eslint-disable-next-line no-console
    console[r.pass ? "log" : "error"](
      `${r.pass ? "✓" : "✗"} ${r.name}${r.message ? ` – ${r.message}` : ""}`
    );
  }
  // eslint-disable-next-line no-console
  console.groupEnd();
}

export default function RockPaperScissorsApp() {
  const [screen, setScreen] = useState(/** @type {"home"|"game"} */ "home");
  const [mode, setMode] = useState(/** @type {"single"|"local"} */ "single");
  const [bestOf, setBestOf] = useState(3);

  // Game state
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [rounds, setRounds] = useState(
    /** @type {Array<{p1: MoveKey, p2: MoveKey, result: RoundResult}>} */ []
  );
  const [locked, setLocked] = useState(false); // prevent double clicks during evaluation

  // Local multiplayer turn state
  const [localStep, setLocalStep] = useState(
    /** @type {"p1"|"p2"|"result"} */ "p1"
  );
  const [p1Choice, setP1Choice] = useState(/** @type {MoveKey|null} */ null);
  const [p2Choice, setP2Choice] = useState(/** @type {MoveKey|null} */ null);

  const winThreshold = useMemo(() => Math.floor(bestOf / 2) + 1, [bestOf]);
  const gameOver = playerScore >= winThreshold || opponentScore >= winThreshold;

  const lastRound = rounds[rounds.length - 1];

  function resetGame(keepModeAndBest = true) {
    setPlayerScore(0);
    setOpponentScore(0);
    setRounds([]);
    setLocked(false);
    setLocalStep("p1");
    setP1Choice(null);
    setP2Choice(null);
    if (!keepModeAndBest) {
      setMode("single");
      setBestOf(3);
    }
  }

  function startGame() {
    resetGame(true);
    setScreen("game");
  }

  function exitToHome() {
    resetGame(true);
    setScreen("home");
  }

  // Keyboard shortcuts: R / P / S for quick selection (only during game & not locked & not gameOver)
  useEffect(() => {
    function onKey(e) {
      if (screen !== "game" || locked || gameOver) return;
      const k = e.key.toLowerCase();
      const mapping = /** @type {Record<string, MoveKey>} */ {
        r: "rock",
        p: "paper",
        s: "scissors",
      };
      if (k in mapping) {
        if (mode === "single") handleSingleRound(mapping[k]);
        if (mode === "local") handleLocalSelect(mapping[k]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, locked, gameOver, mode, localStep, p1Choice]);

  // Run self-tests once
  useEffect(() => {
    if (ENABLE_SELF_TESTS) runSelfTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushRound(p1, p2) {
    const res = decideResult(p1, p2);
    setRounds((prev) => [...prev, { p1, p2, result: res }]);
    if (res === "win") setPlayerScore((s) => s + 1);
    if (res === "lose") setOpponentScore((s) => s + 1);
  }

  // Single player round
  function handleSingleRound(move /** @type {MoveKey} */) {
    if (locked || gameOver) return;
    setLocked(true);
    const ai = randomMove();
    // Small suspense delay
    setTimeout(() => {
      pushRound(move, ai);
      setLocked(false);
    }, 250);
  }

  // Local multiplayer step-by-step selection
  function handleLocalSelect(move /** @type {MoveKey} */) {
    if (locked || gameOver) return;
    if (localStep === "p1") {
      setP1Choice(move);
      setLocalStep("p2");
      return;
    }
    if (localStep === "p2") {
      setP2Choice(move);
      setLocked(true);
      setTimeout(() => {
        if (p1Choice == null) return; // safety
        pushRound(p1Choice, move);
        setLocked(false);
        setLocalStep("p1");
        setP1Choice(null);
        setP2Choice(null);
      }, 150);
    }
  }

  function resultBanner() {
    if (!lastRound) return null;
    const map = { win: "คุณชนะ!", lose: "คุณแพ้", draw: "เสมอ" };
    const color =
      lastRound.result === "win"
        ? "bg-green-500"
        : lastRound.result === "lose"
        ? "bg-rose-500"
        : "bg-slate-500";
    return (
      <div
        className={`mt-4 w-full rounded-2xl ${color} text-white px-4 py-3 text-center text-lg font-semibold shadow`}
        role="status"
        aria-live="polite"
      >
        ผลรอบนี้: {map[lastRound.result]}
      </div>
    );
  }

  function winnerBanner() {
    if (!gameOver) return null;
    const youWin = playerScore > opponentScore;
    return (
      <div
        className={`mt-4 w-full rounded-2xl ${
          youWin ? "bg-emerald-600" : "bg-rose-600"
        } text-white px-4 py-3 text-center text-xl font-bold shadow`}
        role="status"
        aria-live="assertive"
      >
        เกมจบแล้ว — {youWin ? "คุณชนะเกมนี้!" : "คู่ต่อสู้ชนะเกมนี้"}
      </div>
    );
  }

  function ChoiceButton({ move, onClick, disabled }) {
    const item = MOVES.find((m) => m.key === move);
    return (
      <button
        disabled={disabled}
        onClick={onClick}
        className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-lg shadow-sm transition active:scale-[.98]
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow"}`}
        aria-label={`เลือก ${item?.label}`}
      >
        <span className="text-2xl">{item?.emoji}</span>
        <span className="font-medium">{item?.label}</span>
      </button>
    );
  }

  function ModeBadge() {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
        <span className="align-middle">โหมด:</span>
        <span className="align-middle rounded-full bg-white px-2 py-0.5 shadow-sm">
          {mode === "single" ? "ผู้เล่นเดี่ยว" : "ผู้เล่น 2 คน (สลับกันเลือก)"}
        </span>
      </div>
    );
  }

  function BestOfSelector() {
    const options = [3, 5, 7];
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Best of</span>
        <div className="flex rounded-xl bg-slate-100 p-1">
          {options.map((n) => (
            <button
              key={n}
              onClick={() => setBestOf(n)}
              className={`rounded-lg px-3 py-1 text-sm transition ${
                bestOf === n
                  ? "bg-white shadow"
                  : "opacity-70 hover:opacity-100"
              }`}
              aria-pressed={bestOf === n}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function Scoreboard() {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">คุณ</div>
          <div className="text-3xl font-bold">{playerScore}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">คู่ต่อสู้</div>
          <div className="text-3xl font-bold">{opponentScore}</div>
        </div>
      </div>
    );
  }

  function HistoryList() {
    if (rounds.length === 0) return null;
    const last5 = rounds.slice(-5).reverse();
    const label = (k /** @type {MoveKey} */) =>
      MOVES.find((m) => m.key === k)?.label;
    const emoji = (k /** @type {MoveKey} */) =>
      MOVES.find((m) => m.key === k)?.emoji;
    return (
      <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
        <div className="mb-2 text-sm font-medium text-slate-600">
          ประวัติ 5 รอบล่าสุด
        </div>
        <ul className="divide-y text-sm">
          {last5.map((r, idx) => (
            <li key={idx} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-slate-100 px-2 py-1">
                  #{rounds.length - idx}
                </span>
                <span>
                  คุณ: {emoji(r.p1)} {label(r.p1)}
                </span>
                <span className="text-slate-400">vs</span>
                <span>
                  คู่ต่อสู้: {emoji(r.p2)} {label(r.p2)}
                </span>
              </div>
              <span
                className={`rounded-lg px-2 py-1 ${
                  r.result === "win"
                    ? "bg-emerald-100 text-emerald-700"
                    : r.result === "lose"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {r.result === "win"
                  ? "ชนะ"
                  : r.result === "lose"
                  ? "แพ้"
                  : "เสมอ"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function Controls() {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => resetGame(true)}
          className="rounded-2xl border bg-white px-4 py-2 font-medium shadow-sm hover:shadow"
        >
          เริ่มใหม่ (ตั้งค่าเดิม)
        </button>
        <button
          onClick={exitToHome}
          className="rounded-2xl border bg-white px-4 py-2 font-medium shadow-sm hover:shadow"
        >
          ออก (กลับหน้าแรก)
        </button>
      </div>
    );
  }

  // ========== Screens ==========
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
        <div className="mx-auto max-w-xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              เกมเป่ายิ้งฉุบ (Rock • Paper • Scissors)
            </h1>
            <div className="rounded-full bg-slate-200 px-3 py-1 text-xs">
              Demo Web
            </div>
          </header>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-700">
                เลือกโหมด
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  className={`rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
                    mode === "single"
                      ? "bg-slate-50 ring-2 ring-slate-300"
                      : "hover:shadow"
                  }`}
                  onClick={() => setMode("single")}
                >
                  <div className="text-lg font-semibold">ผู้เล่นเดี่ยว</div>
                  <div className="text-sm text-slate-600">
                    แข่งกับคอมพิวเตอร์ (สุ่มเลือก)
                  </div>
                </button>
                <button
                  className={`rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
                    mode === "local"
                      ? "bg-slate-50 ring-2 ring-slate-300"
                      : "hover:shadow"
                  }`}
                  onClick={() => setMode("local")}
                >
                  <div className="text-lg font-semibold">
                    ผู้เล่น 2 คน (Local)
                  </div>
                  <div className="text-sm text-slate-600">
                    ผลัดกันเลือกบนเครื่องเดียวกัน
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-700">
                จำนวนรอบ
              </div>
              <BestOfSelector />
              <div className="mt-2 text-xs text-slate-500">
                ผู้ที่ถึง {winThreshold} แต้มก่อน ชนะเกม
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={startGame}
                className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-md transition hover:brightness-110 active:scale-[.98]"
              >
                เริ่มเกม
              </button>
            </div>
          </div>

          <footer className="mt-10 text-center text-xs text-slate-500">
            กด R/P/S เพื่อเลือกเร็วระหว่างเล่น
          </footer>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
      <div className="mx-auto max-w-2xl p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">เป่ายิ้งฉุบ — Best of {bestOf}</h2>
          <ModeBadge />
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-medium text-slate-600">
                เลือกท่าของคุณ
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MOVES.map((m) => (
                  <ChoiceButton
                    key={m.key}
                    move={m.key}
                    onClick={() =>
                      mode === "single"
                        ? handleSingleRound(m.key)
                        : handleLocalSelect(m.key)
                    }
                    disabled={locked || gameOver}
                  />
                ))}
              </div>
              {mode === "local" && (
                <div className="mt-2 text-xs text-slate-500">
                  ขั้นตอน:{" "}
                  {localStep === "p1"
                    ? "ผู้เล่น 1 เลือก"
                    : localStep === "p2"
                    ? "ผู้เล่น 2 เลือก"
                    : "ดูผลลัพธ์"}
                </div>
              )}
              {resultBanner()}
              {winnerBanner()}
            </div>

            <HistoryList />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 text-sm font-medium text-slate-600">
                คะแนน
              </div>
              <Scoreboard />
              <div className="mt-2 text-xs text-slate-500">
                ต้องถึง {winThreshold} แต้มก่อนเพื่อชนะเกม
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 text-sm font-medium text-slate-600">
                ปุ่มควบคุม
              </div>
              <Controls />
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm text-xs text-slate-500">
              เคล็ดลับ: ใช้คีย์บอร์ด R (ค้อน) / P (กระดาษ) / S (กรรไกร)
              เพื่อเลือกอย่างรวดเร็ว
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

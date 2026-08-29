"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TaskGroup, WorkSession, Nudge, TimerSettings, TimerMode, TimerStatus } from "@/types";
import { calculateBurnoutScore, calculateShipScore, getNudgeContext } from "@/lib/scoring";
import {
  getTaskGroups, addTaskGroup, updateTaskGroup, removeTaskGroup,
  getSessions, addSession, getTodaySessions,
  getTimerSettings, setTimerSettings as saveTimerSettings,
  getBreakdownCount, incrementBreakdownCount,
  getStreak, recordActivity,
} from "@/lib/storage";
import { isPro, TIERS, trackEvent } from "@/lib/tiun";
import TaskList from "@/components/TaskList";
import AINudge from "@/components/AINudge";

/* ── Inline Timer Hook ────────────────────────────────── */
function useTimer(settings: TimerSettings, onComplete: (s: WorkSession) => void) {
  const [mode, setMode] = useState<TimerMode>("work");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60);
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  const total = mode === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60;
  const progress = ((total - secondsLeft) / total) * 100;
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const complete = useCallback(() => {
    if (!sessionStart) return;
    onComplete({ id: crypto.randomUUID(), mode, startedAt: sessionStart, endedAt: Date.now(), durationMinutes: Math.round((Date.now() - sessionStart) / 60000) });
    try { const c = new AudioContext(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = mode === "work" ? 523 : 659; o.type = "sine"; g.gain.setValueAtTime(.3, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + 1); o.start(); o.stop(c.currentTime + 1); } catch {}
    const next: TimerMode = mode === "work" ? "break" : "work";
    setMode(next); setSecondsLeft(next === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60);
    setStatus("idle"); setSessionStart(null);
  }, [sessionStart, mode, onComplete, settings]);

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setSecondsLeft(p => { if (p <= 1) { complete(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(id);
  }, [status, complete]);

  useEffect(() => { if (status === "idle") setSecondsLeft(mode === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60); }, [settings, mode, status]);

  return {
    mode, status, secondsLeft, progress, fmt,
    setMode: (m: TimerMode) => { if (status === "idle") { setMode(m); setSecondsLeft(m === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60); } },
    start: () => { setStatus("running"); if (!sessionStart) setSessionStart(Date.now()); },
    pause: () => setStatus("paused"),
    reset: () => { setStatus("idle"); setSecondsLeft(mode === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60); setSessionStart(null); },
    skip: complete,
  };
}

/* ── Sparkline ────────────────────────────────────────── */
function Sparkline({ color, seed = 0 }: { color: string; seed?: number }) {
  const pts = [40, 35, 45, 30, 50, 38, 55, 42, 60, 48, 65, 52, 58, 62, 55, 68];
  const shifted = pts.map((p, i) => p + ((seed * 7 + i * 3) % 20) - 10);
  const h = 40, w = 80;
  const max = Math.max(...shifted), min = Math.min(...shifted);
  const points = shifted.map((v, i) => {
    const x = (i / (shifted.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity: 0.5 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Star = ({ className = "w-4 h-4", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 48 48" fill="currentColor" className={className} style={style}>
    <path d="M24 2c2.2 13.8 7.9 19.6 22 22-14.1 2.4-19.8 8.2-22 22-2.2-13.8-7.9-19.6-22-22 14.1-2.4 19.8-8.2 22-22Z" />
  </svg>
);

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("dashboard");
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [todaySessions, setTodaySessions] = useState<WorkSession[]>([]);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [timerSettings, setTimerSettingsState] = useState<TimerSettings>({ workMinutes: 25, breakMinutes: 5 });
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [period, setPeriod] = useState<"Week" | "Month" | "Year">("Week");

  useEffect(() => {
    setTaskGroups(getTaskGroups()); setSessions(getSessions()); setTodaySessions(getTodaySessions());
    setTimerSettingsState(getTimerSettings()); setStreak(getStreak()); setMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const burnout = calculateBurnoutScore(todaySessions, streak);
  const ship = calculateShipScore(taskGroups, todaySessions, burnout, streak);
  const { count: bdc } = getBreakdownCount();
  const maxBd = isPro() ? TIERS.pro.maxBreakdownsPerDay : TIERS.free.maxBreakdownsPerDay;
  const remBd = maxBd - bdc;

  const onSession = useCallback((session: WorkSession) => {
    addSession(session); setSessions(getSessions()); setTodaySessions(getTodaySessions());
    recordActivity(); setStreak(getStreak());
    trackEvent("session_completed", { mode: session.mode, duration: session.durationMinutes });
    reqNudge();
  }, []);

  const timer = useTimer(timerSettings, onSession);

  const onToggle = useCallback((gid: string, tid: string) => {
    updateTaskGroup(gid, g => ({ ...g, subTasks: g.subTasks.map(t => t.id === tid ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t) }));
    setTaskGroups(getTaskGroups()); recordActivity(); setStreak(getStreak()); trackEvent("task_toggled");
  }, []);

  const onAdd = useCallback(async (task: string) => {
    const res = await fetch("/api/breakdown", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task }) });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
    const { subTasks } = await res.json();
    addTaskGroup({ id: crypto.randomUUID(), originalTask: task, createdAt: Date.now(), subTasks: subTasks.map((s: { title: string; description: string; estimatedMinutes: number }) => ({ id: crypto.randomUUID(), ...s, completed: false })) });
    incrementBreakdownCount(); setTaskGroups(getTaskGroups());
  }, []);

  const onRemove = useCallback((gid: string) => { removeTaskGroup(gid); setTaskGroups(getTaskGroups()); }, []);
  const dismissNudge = useCallback((id: string) => { setNudges(p => p.filter(n => n.id !== id)); }, []);

  const reqNudge = useCallback(async () => {
    try {
      const ctx = getNudgeContext(getSessions(), burnout, ship, getTaskGroups());
      const res = await fetch("/api/nudge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context: ctx }) });
      if (!res.ok) return; const data = await res.json();
      const n: Nudge = { id: crypto.randomUUID(), message: data.message, type: data.type, timestamp: Date.now() };
      setNudges(p => [...p, n]); setTimeout(() => setNudges(p => p.filter(x => x.id !== n.id)), 15000);
    } catch {}
  }, [burnout, ship]);

  const focusCount = todaySessions.filter(s => s.mode === "work").length;
  const focusMins = todaySessions.filter(s => s.mode === "work").reduce((a, s) => a + s.durationMinutes, 0);
  const tasksTotal = taskGroups.reduce((a, g) => a + g.subTasks.length, 0);
  const tasksDone = taskGroups.reduce((a, g) => a + g.subTasks.filter(t => t.completed).length, 0);

  const radius = 90, circ = 2 * Math.PI * radius;
  const dashOff = circ - (timer.progress / 100) * circ;

  if (!mounted) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f6" }}>
      <Star className="w-8 h-8 animate-pulse" style={{ color: "#2bc4a8" }} />
    </div>
  );

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></svg> },
    { id: "tasks", label: "Tasks", icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { id: "history", label: "History", icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: "settings", label: "Settings", icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  const statCards = [
    { label: "Focus Sessions", value: focusCount, sub: "today", bg: "#e0f5ef", color: "#2bc4a8", seed: 1 },
    { label: "Minutes Focused", value: focusMins, sub: "total", bg: "#e0f0f9", color: "#4a9fd8", seed: 2 },
    { label: "Tasks Completed", value: tasksDone, sub: `of ${tasksTotal}`, bg: "#fef4e0", color: "#e8a838", seed: 3 },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f8f8f6", fontFamily: "'Onest', system-ui, sans-serif", color: "#1a1a1a" }}>

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex" style={{ width: 72, background: "#ffffff", borderRight: "1px solid #ebebeb", flexDirection: "column", alignItems: "center", paddingTop: 28, paddingBottom: 28, gap: 4 }}>
        <Link href="/" style={{ color: "#2bc4a8", marginBottom: 28, display: "block" }}>
          <Star className="w-7 h-7" />
        </Link>
        {nav.map(n => (
          <button key={n.id} onClick={() => setActivePage(n.id)} title={n.label}
            style={{
              width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
              background: activePage === n.id ? "#e0f5ef" : "transparent",
              color: activePage === n.id ? "#2bc4a8" : "#b0b0a8",
              border: "none", cursor: "pointer", transition: "all 0.2s",
            }}>
            {n.icon}
          </button>
        ))}
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 44px" }}>

          {activePage === "dashboard" && (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>Ship without burning out</h1>
                  <p style={{ color: "#9a9a90", fontSize: 14, marginTop: 6 }}>
                    {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    {streak > 0 && <span style={{ marginLeft: 12, color: "#2bc4a8", fontWeight: 500 }}>🔥 {streak} day streak</span>}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 0, background: "#ffffff", borderRadius: 12, padding: 4, border: "1px solid #ebebeb" }}>
                  {(["Week", "Month", "Year"] as const).map(p => (
                    <button key={p} onClick={() => setPeriod(p)} style={{
                      padding: "7px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
                      background: period === p ? "#2bc4a8" : "transparent",
                      color: period === p ? "#fff" : "#9a9a90",
                      transition: "all 0.2s",
                    }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>
                {statCards.map(s => (
                  <div key={s.label} style={{
                    background: s.bg, borderRadius: 20, padding: "28px 28px 20px",
                    position: "relative", overflow: "hidden",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: s.color, opacity: 0.7, margin: 0 }}>{s.label}</p>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8 }}>
                      <div>
                        <span style={{ fontSize: 44, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</span>
                        <span style={{ fontSize: 13, color: s.color, opacity: 0.5, marginLeft: 8 }}>{s.sub}</span>
                      </div>
                      <Sparkline color={s.color} seed={s.seed} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Timer + Right Panel */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 28 }}>
                {/* Timer */}
                <div style={{ background: "#fff", borderRadius: 24, padding: "36px 40px", border: "1px solid #ebebeb" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Focus Timer</h2>
                    <div style={{ display: "flex", gap: 0, background: "#f4f4f0", borderRadius: 10, padding: 3 }}>
                      {(["work", "break"] as TimerMode[]).map(m => (
                        <button key={m} onClick={() => timer.setMode(m)} style={{
                          padding: "5px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
                          background: timer.mode === m ? "#fff" : "transparent",
                          color: timer.mode === m ? "#1a1a1a" : "#9a9a90",
                          boxShadow: timer.mode === m ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                          transition: "all 0.2s",
                        }}>
                          {m === "work" ? "Focus" : "Break"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ position: "relative", width: 200, height: 200, marginBottom: 24 }}>
                      <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r={radius} fill="none" stroke="#f0f0ec" strokeWidth="5" />
                        <circle cx="100" cy="100" r={radius} fill="none"
                          stroke={timer.mode === "work" ? "#2bc4a8" : "#4a9fd8"}
                          strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={circ} strokeDashoffset={dashOff}
                          style={{ transition: "stroke-dashoffset 1s ease" }} />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 48, fontWeight: 600, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{timer.fmt(timer.secondsLeft)}</span>
                        <span style={{ fontSize: 11, color: "#b0b0a8", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 500, marginTop: 4 }}>
                          {timer.mode === "work" ? "Focus" : "Break"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      {timer.status === "idle" && (
                        <button onClick={timer.start} style={{
                          padding: "10px 36px", borderRadius: 50, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
                          background: timer.mode === "work" ? "#2bc4a8" : "#4a9fd8", color: "#fff",
                        }}>Start</button>
                      )}
                      {timer.status === "running" && (
                        <>
                          <button onClick={timer.pause} style={{ padding: "10px 24px", borderRadius: 50, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", background: "#f4f4f0", color: "#1a1a1a" }}>Pause</button>
                          <button onClick={timer.skip} style={{ padding: "10px 20px", borderRadius: 50, fontSize: 14, border: "1px solid #ebebeb", cursor: "pointer", background: "transparent", color: "#9a9a90" }}>Skip</button>
                        </>
                      )}
                      {timer.status === "paused" && (
                        <>
                          <button onClick={timer.start} style={{ padding: "10px 24px", borderRadius: 50, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", background: "#2bc4a8", color: "#fff" }}>Resume</button>
                          <button onClick={timer.reset} style={{ padding: "10px 20px", borderRadius: 50, fontSize: 14, border: "1px solid #ebebeb", cursor: "pointer", background: "transparent", color: "#9a9a90" }}>Reset</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Ship Score */}
                  <div style={{
                    background: "linear-gradient(135deg, #2bc4a8 0%, #1ea88e 100%)",
                    borderRadius: 24, padding: "28px 28px 24px", color: "#fff", position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ position: "absolute", bottom: -30, left: -10, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0, opacity: 0.8 }}>Ship Score</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em" }}>{ship.score}</span>
                      <span style={{ fontSize: 14, opacity: 0.7 }}>/ 100</span>
                    </div>
                    <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8, margin: "8px 0 0" }}>+{ship.healthBonus} health bonus</p>
                  </div>

                  {/* Burnout Risk */}
                  <div style={{ background: "#fff", borderRadius: 24, padding: "24px 28px", border: "1px solid #ebebeb" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Burnout Risk</p>
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                        background: burnout.level === "green" ? "#e0f5ef" : burnout.level === "yellow" ? "#fef4e0" : "#fde8e8",
                        color: burnout.level === "green" ? "#2bc4a8" : burnout.level === "yellow" ? "#e8a838" : "#e05252",
                      }}>
                        {burnout.score}%
                      </span>
                    </div>
                    {[
                      { l: "Long sessions", v: burnout.factors.longSessions, m: 30 },
                      { l: "Late nights", v: burnout.factors.lateNightWork, m: 25 },
                      { l: "Skipped breaks", v: burnout.factors.skippedBreaks, m: 25 },
                    ].map(f => (
                      <div key={f.l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#9a9a90", width: 100, flexShrink: 0 }}>{f.l}</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f4f4f0", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 3, transition: "width 0.5s ease",
                            width: `${Math.max(4, (f.v / f.m) * 100)}%`,
                            background: f.v > f.m * 0.6 ? "#e05252" : "#2bc4a8",
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div style={{ background: "#fff", borderRadius: 24, padding: "24px 28px", border: "1px solid #ebebeb" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>Quick Actions</p>
                    <button onClick={reqNudge} style={{
                      width: "100%", padding: "11px 0", borderRadius: 14, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
                      background: "#2bc4a8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                      <Star className="w-4 h-4" /> Get AI Nudge
                    </button>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
                      {[
                        { label: "Browse all tasks", page: "tasks" },
                        { label: "View session history", page: "history" },
                        { label: "Timer settings", page: "settings" },
                      ].map(a => (
                        <button key={a.page} onClick={() => setActivePage(a.page)} style={{
                          background: "none", border: "none", cursor: "pointer", textAlign: "left" as const,
                          fontSize: 13, color: "#9a9a90", padding: "4px 0",
                        }}>
                          {a.label} →
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Breakdown */}
              <div style={{ background: "#fff", borderRadius: 24, padding: "28px 32px", border: "1px solid #ebebeb" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Task Breakdown</h2>
                  <span style={{ fontSize: 13, color: "#9a9a90" }}>{remBd} AI breakdowns left</span>
                </div>
                <TaskList taskGroups={taskGroups} onToggleTask={onToggle} onAddGroup={onAdd} onRemoveGroup={onRemove} remainingBreakdowns={remBd} />
              </div>
            </>
          )}

          {activePage === "tasks" && (
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 4 }}>Tasks</h1>
              <p style={{ color: "#9a9a90", fontSize: 14, marginBottom: 32 }}>Break down big tasks into shippable pieces</p>
              <div style={{ background: "#fff", borderRadius: 24, padding: "28px 32px", border: "1px solid #ebebeb" }}>
                <TaskList taskGroups={taskGroups} onToggleTask={onToggle} onAddGroup={onAdd} onRemoveGroup={onRemove} remainingBreakdowns={remBd} />
              </div>
            </div>
          )}

          {activePage === "history" && (
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 4 }}>History</h1>
              <p style={{ color: "#9a9a90", fontSize: 14, marginBottom: 32 }}>Your work sessions over time</p>
              {sessions.length === 0 ? (
                <div style={{ textAlign: "center" as const, padding: "60px 0", color: "#c4c4be" }}>
                  <p style={{ fontSize: 14, margin: 0 }}>No sessions recorded yet</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Start a focus session to begin tracking</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...sessions].reverse().slice(0, 50).map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "#fff", borderRadius: 18, border: "1px solid #ebebeb" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.mode === "work" ? "#2bc4a8" : "#4a9fd8" }} />
                        <div>
                          <p style={{ fontSize: 14, margin: 0, textTransform: "capitalize" as const }}>{s.mode} session</p>
                          <p style={{ fontSize: 12, color: "#9a9a90", margin: 0 }}>{new Date(s.startedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#9a9a90", fontVariantNumeric: "tabular-nums" }}>{s.durationMinutes}m</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activePage === "settings" && (
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 4 }}>Settings</h1>
              <p style={{ color: "#9a9a90", fontSize: 14, marginBottom: 32 }}>Customize your ShipZen experience</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "#fff", borderRadius: 24, padding: "28px 32px", border: "1px solid #ebebeb" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Timer</h3>
                  {[
                    { label: "Focus duration (minutes)", val: timerSettings.workMinutes, key: "workMinutes" as const, min: 1, max: 120 },
                    { label: "Break duration (minutes)", val: timerSettings.breakMinutes, key: "breakMinutes" as const, min: 1, max: 30 },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 13, color: "#9a9a90", display: "block", marginBottom: 6 }}>{f.label}</label>
                      <input type="number" min={f.min} max={f.max} value={f.val}
                        onChange={e => { const v = Math.max(f.min, Math.min(f.max, parseInt(e.target.value) || f.val)); const ns = { ...timerSettings, [f.key]: v }; setTimerSettingsState(ns); saveTimerSettings(ns); }}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 14, border: "1px solid #ebebeb", background: "#f8f8f6", color: "#1a1a1a", outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", borderRadius: 24, padding: "28px 32px", border: "1px solid #ebebeb" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>Plan</h3>
                  <p style={{ fontSize: 14, color: "#9a9a90", margin: 0 }}>{isPro() ? "Pro — Unlimited" : "Free — 3 breakdowns/day"}</p>
                  {!isPro() && <button style={{ padding: "10px 24px", background: "#2bc4a8", color: "#fff", border: "none", borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 12 }}>Upgrade to Pro</button>}
                </div>
                <div style={{ background: "#fff", borderRadius: 24, padding: "28px 32px", border: "1px solid #ebebeb" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>Data</h3>
                  <button onClick={() => { if (confirm("Delete all data?")) { localStorage.removeItem("shipzen-state"); window.location.reload(); } }}
                    style={{ padding: "10px 24px", color: "#e05252", border: "1px solid rgba(224,82,82,0.2)", borderRadius: 50, fontSize: 14, fontWeight: 500, cursor: "pointer", background: "transparent" }}>
                    Clear All Data
                  </button>
                </div>
              </div>

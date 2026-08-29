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

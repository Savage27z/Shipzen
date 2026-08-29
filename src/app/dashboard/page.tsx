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

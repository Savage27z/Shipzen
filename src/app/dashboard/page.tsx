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

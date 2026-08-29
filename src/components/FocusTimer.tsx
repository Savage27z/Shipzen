"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TimerMode, TimerStatus, TimerSettings, WorkSession } from "@/types";

interface FocusTimerProps {
  settings: TimerSettings;
  onSessionComplete: (session: WorkSession) => void;
  onTick?: (mode: TimerMode, secondsLeft: number) => void;
}

export default function FocusTimer({ settings, onSessionComplete, onTick }: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>("work");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60);
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = mode === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const playChime = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = mode === "work" ? 523.25 : 659.25;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch {
      // Audio not available
    }
  }, [mode]);

  const completeSession = useCallback(() => {
    if (!sessionStart) return;
    const session: WorkSession = {
      id: crypto.randomUUID(),
      mode,
      startedAt: sessionStart,
      endedAt: Date.now(),
      durationMinutes: Math.round((Date.now() - sessionStart) / 60000),
    };
    onSessionComplete(session);
    playChime();

    const nextMode: TimerMode = mode === "work" ? "break" : "work";
    setMode(nextMode);
    setSecondsLeft(nextMode === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60);
    setStatus("idle");
    setSessionStart(null);
  }, [sessionStart, mode, onSessionComplete, playChime, settings]);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, completeSession]);

  useEffect(() => {
    onTick?.(mode, secondsLeft);
  }, [mode, secondsLeft, onTick]);

  useEffect(() => {
    if (status === "idle") {
      setSecondsLeft(mode === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60);
    }
  }, [settings, mode, status]);

  const handleStart = () => {
    setStatus("running");
    if (!sessionStart) setSessionStart(Date.now());
  };
  const handlePause = () => setStatus("paused");
  const handleReset = () => {
    setStatus("idle");
    setSecondsLeft(mode === "work" ? settings.workMinutes * 60 : settings.breakMinutes * 60);
    setSessionStart(null);
  };
  const handleSkip = () => completeSession();

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6 relative z-10">
      {/* Mode toggle — glass pill on dark bg */}
      <div className="flex gap-1 p-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <button
          onClick={() => { if (status === "idle") { setMode("work"); setSecondsLeft(settings.workMinutes * 60); } }}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === "work" ? "bg-white text-[#111] shadow-sm" : "text-white/50 hover:text-white/80"
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => { if (status === "idle") { setMode("break"); setSecondsLeft(settings.breakMinutes * 60); } }}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === "break" ? "bg-white text-[#111] shadow-sm" : "text-white/50 hover:text-white/80"
          }`}
        >
          Break
        </button>
      </div>

      {/* Circular timer */}
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="100" cy="100" r={radius} fill="none"
            stroke={mode === "work" ? "#34d399" : "#60a5fa"}
            strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold text-white tabular-nums tracking-tight">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-xs text-white/40 uppercase tracking-widest mt-1.5 font-medium">
            {mode === "work" ? "Focus Time" : "Break Time"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {status === "idle" && (
          <button onClick={handleStart} className="px-8 py-2.5 bg-white hover:bg-white/90 text-[#111] rounded-full text-sm font-medium transition-all">
            Start
          </button>
        )}
        {status === "running" && (
          <>
            <button onClick={handlePause} className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-full text-sm font-medium transition-all backdrop-blur-sm">
              Pause
            </button>
            <button onClick={handleSkip} className="px-4 py-2.5 border border-white/10 hover:bg-white/5 text-white/60 rounded-full text-sm transition-all">
              Skip
            </button>
          </>
        )}
        {status === "paused" && (
          <>
            <button onClick={handleStart} className="px-6 py-2.5 bg-white hover:bg-white/90 text-[#111] rounded-full text-sm font-medium transition-all">
              Resume
            </button>
            <button onClick={handleReset} className="px-4 py-2.5 border border-white/10 hover:bg-white/5 text-white/60 rounded-full text-sm transition-all">
              Reset
            </button>
          </>
        )}
      </div>

      <audio ref={audioRef} />
    </div>
  );
}

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

    // Switch mode
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

  // Reset timer when settings change while idle
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

  const handleSkip = () => {
    completeSession();
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode indicator */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (status === "idle") {
              setMode("work");
              setSecondsLeft(settings.workMinutes * 60);
            }
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === "work"
              ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => {
            if (status === "idle") {
              setMode("break");
              setSecondsLeft(settings.breakMinutes * 60);
            }
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === "break"
              ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Break
        </button>
      </div>

      {/* Circular timer */}
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-zinc-800"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${
              mode === "work" ? "text-emerald-500" : "text-blue-500"
            }`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold text-zinc-100 tabular-nums">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            {mode === "work" ? "Focus Time" : "Break Time"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {status === "idle" && (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
          >
            Start
          </button>
        )}
        {status === "running" && (
          <>
            <button
              onClick={handlePause}
              className="px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-medium transition-all"
            >
              Pause
            </button>
            <button
              onClick={handleSkip}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl text-sm transition-all"
            >
              Skip →
            </button>
          </>
        )}
        {status === "paused" && (
          <>
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all"
            >
              Resume
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl text-sm transition-all"
            >
              Reset
            </button>
          </>
        )}
      </div>

      <audio ref={audioRef} />
    </div>
  );
}

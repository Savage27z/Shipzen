"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ── SVG Icons ──────────────────────────────────────────── */
const LogoMark = ({ size = "1em", color = "currentColor" }: { size?: string; color?: string }) => (
  <svg viewBox="0 0 48 48" fill={color} style={{ width: size, height: size, flexShrink: 0 }}>
    <path d="M24 2c2.2 13.8 7.9 19.6 22 22-14.1 2.4-19.8 8.2-22 22-2.2-13.8-7.9-19.6-22-22 14.1-2.4 19.8-8.2 22-22Z" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ArrowUpRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "1em", height: "1em" }}>
    <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.9l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.5z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
    <path d="M4 4l16 16M20 4 4 20" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CircleDot = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{ width: "1em", height: "1em" }}>
    <circle cx={12} cy={12} r={9} />
    <circle cx={12} cy={12} r={3.2} fill="currentColor" stroke="none" />
  </svg>
);

const ZenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} style={{ width: "1em", height: "1em" }}>
    <circle cx={12} cy={12} r={9.25} />
    <path d="M12 2.75c2.6 2.3 4 5.8 4 9.25s-1.4 6.95-4 9.25c-2.6-2.3-4-5.8-4-9.25s1.4-6.95 4-9.25z" />
    <path d="M2.75 12h18.5" />
  </svg>
);

/* ── Helpers ────────────────────────────────────────────── */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function formatClock() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  const meridiem = d.getHours() >= 12 ? "pm" : "am";
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const date = `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  return { time: `${h}:${m}${meridiem}`, date };
}

/* ── Data ───────────────────────────────────────────────── */
const HERO_CARDS = [
  { caption: "AI-Powered", title: "Break it down." },
  { caption: "Focus Tracking", title: "Ship with flow." },
  { caption: "Burnout Score", title: "Stay balanced." },
];

const PARTNERS = ["React", "Next.js", "TypeScript", "Tailwind", "Claude AI", "Vercel", "Node.js"];

const FEATURES = [
  {
    image: "/features/breakdown.jpg",
    category: "AI Engine",
    year: "Core",
    title: "Task Breakdown",
    description: "Paste any big task — Claude AI breaks it into bite-sized, shippable sub-tasks with time estimates.",
    tags: ["Claude AI", "Smart Parsing", "Time Estimates"],
  },
  {
    image: "/features/timer.jpg",
    category: "Productivity",
    year: "Core",
    title: "Focus Timer",
    description: "Pomodoro-style timer with work/break tracking and a visual timeline of your entire day.",
    tags: ["Pomodoro", "Work Timeline", "Session Logs"],
  },
  {
    image: "/features/burnout.jpg",
    category: "Wellness",
    year: "Core",
    title: "Burnout Score",
    description: "Real-time risk score (0-100) based on long sessions, late nights, skipped breaks, and consecutive work days.",
    tags: ["Risk Analysis", "Pattern Detection", "Alerts"],
  },
  {
    image: "/features/nudges.jpg",
    category: "AI Copilot",
    year: "Core",
    title: "AI Nudges",
    description: "Context-aware notifications that celebrate wins and catch you before you overdo it — powered by Claude.",
    tags: ["Smart Nudges", "Celebrations", "Wellness Tips"],
  },
];

const SERVICES = [
  { title: "Break It Down", desc: "Paste a big task, get shippable pieces in seconds." },
  { title: "Focus & Ship", desc: "Timer-driven sessions that keep you in the zone." },
  { title: "Track Wellness", desc: "Burnout risk scoring from your actual work patterns." },
  { title: "Stay Zen", desc: "AI nudges that help you ship without crashing." },
];

const STATS = [
  { value: 500, suffix: "+", label: "Tasks broken down" },
  { value: 98, suffix: "%", label: "Healthier work patterns" },
  { value: 25, suffix: "min", label: "Average focus session" },
  { value: 40, suffix: "%", label: "Less burnout reported" },
];

/* ── Main Component ─────────────────────────────────────── */
export default function LandingPage() {
  const [loaderDone, setLoaderDone] = useState(false);
  const [loaderExit, setLoaderExit] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [clockTime, setClockTime] = useState("9:41am");
  const [clockDate, setClockDate] = useState("28 August, 2026");

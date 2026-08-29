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

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
  const [heroCardIdx, setHeroCardIdx] = useState(0);
  const [statValues, setStatValues] = useState([0, 0, 0, 0]);

  const mainRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lenisRef = useRef<any>(null);

  // ── Loader ────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.position = "relative";
    document.documentElement.style.height = "100%";

    const FILL_MS = 1300;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / FILL_MS, 1);
      const eased = easeInOutCubic(t);
      setLoaderProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setLoaderExit(true);
          setTimeout(() => {
            setLoaderDone(true);
            document.documentElement.style.removeProperty("overflow");
            document.documentElement.style.removeProperty("position");
            document.documentElement.style.removeProperty("height");
          }, 700);
        }, 200);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Lenis smooth scroll ───────────────────────────────
  useEffect(() => {
    let raf: number;
    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({ smoothWheel: true });
      lenisRef.current = lenis;
      const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    });
    return () => { cancelAnimationFrame(raf); lenisRef.current?.destroy(); };
  }, []);

  // ── Adaptive grid scale-up ────────────────────────────
  useEffect(() => {
    function apply() {
      const FONT_BASE = 16, baseWidth = 1920, coef = 0.6666;
      const w = window.innerWidth;
      const widthReduction = ((baseWidth - w) / baseWidth) * 100;
      const size = FONT_BASE - (FONT_BASE * (widthReduction * coef)) / 100;
      if (size > FONT_BASE) document.documentElement.style.fontSize = size + "px";
      else document.documentElement.style.removeProperty("font-size");
    }
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // ── Clock ─────────────────────────────────────────────
  useEffect(() => {
    const update = () => { const c = formatClock(); setClockTime(c.time); setClockDate(c.date); };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Scroll reveals ────────────────────────────────────
  useEffect(() => {
    if (!loaderDone) return;
    const els = document.querySelectorAll<HTMLElement>(".reveal, .line-reveal-inner, .word-reveal-inner");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = parseInt(el.dataset.delay || "0", 10);
            setTimeout(() => el.classList.add("revealed"), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loaderDone]);

  // ── Stats count-up ────────────────────────────────────
  useEffect(() => {
    if (!loaderDone) return;
    const statsEl = document.getElementById("stats-section");
    if (!statsEl) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const animate = () => {
            const rect = statsEl.getBoundingClientRect();
            const vh = window.innerHeight;
            const progress = Math.min(1, Math.max(0, 1 - rect.top / vh));
            setStatValues(STATS.map((s) => Math.round(progress * s.value)));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          // keep observing for scroll-driven updates via scroll listener
          const onScroll = () => {
            const rect = statsEl.getBoundingClientRect();
            const vh = window.innerHeight;
            const progress = Math.min(1, Math.max(0, 1 - rect.top / vh));
            setStatValues(STATS.map((s) => Math.round(progress * s.value)));
          };
          window.addEventListener("scroll", onScroll, { passive: true });
          return () => window.removeEventListener("scroll", onScroll);
        }
      },
      { threshold: 0 }
    );
    observer.observe(statsEl);
    return () => observer.disconnect();
  }, [loaderDone]);

  // ── Liquid cursor reveal canvas (Lumora-style) ────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BRUSH_RADIUS = 100;
    const DECAY = 0.045;
    let w = 0, h = 0, raf: number;
    let mx = -9999, my = -9999;
    let prevMx = mx, prevMy = my;
    let hasMoved = false;
    let revealImg: HTMLImageElement | null = null;
    let maskCanvas: HTMLCanvasElement | null = null;
    let maskCtx: CanvasRenderingContext2D | null = null;

    // The mask is a grayscale canvas: white = reveal, decays to black over time
    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      w = rect.width * dpr;
      h = rect.height * dpr;
      canvas!.width = w;
      canvas!.height = h;
      canvas!.style.width = rect.width + "px";
      canvas!.style.height = rect.height + "px";

      if (!maskCanvas) {
        maskCanvas = document.createElement("canvas");
        maskCtx = maskCanvas.getContext("2d");
      }
      maskCanvas.width = w;
      maskCanvas.height = h;
    }

    function stampBrush(x: number, y: number) {
      if (!maskCtx) return;
      const grad = maskCtx.createRadialGradient(x, y, 0, x, y, BRUSH_RADIUS);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.5)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      maskCtx.fillStyle = grad;
      maskCtx.fillRect(x - BRUSH_RADIUS, y - BRUSH_RADIUS, BRUSH_RADIUS * 2, BRUSH_RADIUS * 2);
    }

    // Listen on the hero section so events aren't blocked by higher-z content
    const heroSection = canvas!.closest("section")!;

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      mx = (e.clientX - rect.left) * dpr;
      my = (e.clientY - rect.top) * dpr;
      hasMoved = true;
    }

    function onMouseLeave() {
      mx = -9999; my = -9999;
      prevMx = mx; prevMy = my;
      hasMoved = false;
    }

    function draw() {
      if (!maskCtx || !maskCanvas) { raf = requestAnimationFrame(draw); return; }

      // Decay the mask (fade existing strokes toward transparent)
      maskCtx.globalCompositeOperation = "destination-out";
      maskCtx.fillStyle = `rgba(0,0,0,${DECAY})`;
      maskCtx.fillRect(0, 0, w, h);
      maskCtx.globalCompositeOperation = "source-over";

      // Only stamp when cursor has actually moved
      if (hasMoved && mx > -9000) {
        // First entry — snap to cursor, don't draw a trail from off-screen
        if (prevMx < -9000) { prevMx = mx; prevMy = my; }
        const dx = mx - prevMx, dy = my - prevMy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const steps = Math.max(1, Math.floor(dist / 8));
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            stampBrush(prevMx + dx * t, prevMy + dy * t);
          }
          prevMx = mx;
          prevMy = my;
        }
        hasMoved = false;
      }

      // Composite: draw the reveal image masked by the brush trail
      ctx!.clearRect(0, 0, w, h);
      if (revealImg && revealImg.complete) {
        ctx!.save();
        ctx!.drawImage(maskCanvas, 0, 0);
        ctx!.globalCompositeOperation = "source-in";
        ctx!.drawImage(revealImg, 0, 0, w, h);
        ctx!.restore();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();

    // Load the reveal image
    const img = new Image();
    img.src = "/hero/reveal.jpg";
    img.onload = () => { revealImg = img; };

    draw();
    window.addEventListener("resize", resize);
    heroSection.addEventListener("mousemove", onMouseMove);
    heroSection.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      heroSection.removeEventListener("mousemove", onMouseMove);
      heroSection.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // ── Hero card carousel ────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setHeroCardIdx((i) => (i + 1) % HERO_CARDS.length), 3000);
    return () => clearInterval(id);
  }, []);

  // ── Scroll helpers ────────────────────────────────────
  const scrollToEl = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setTimeout(() => {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset, behavior: "smooth" });
    }, 50);
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
  };
  const closeMenu = () => {
    setMenuOpen(false);
    lenisRef.current?.start();
    document.documentElement.style.removeProperty("overflow");
  };
  const openModal = () => {
    setModalOpen(true);
    setModalSuccess(false);
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
  };
  const closeModal = () => {
    setModalOpen(false);
    lenisRef.current?.start();
    document.documentElement.style.removeProperty("overflow");
    setTimeout(() => setModalSuccess(false), 300);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeMenu(); closeModal(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Features", id: "works" },
    { label: "How It Works", id: "services" },
    { label: "About", id: "about" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Contact", action: "modal" },
  ];

  const handleNav = (item: typeof navItems[0]) => {
    closeMenu();
    if (item.action === "modal") { setTimeout(openModal, 100); return; }
    if (item.href) return; // Link handles it
    scrollToEl(item.id!);
  };

  return (
    <>
      {/* ── Skip link ───────────────────────────────────── */}
      <a href="#main" className="sr-only" style={{
        position: "fixed", left: "1rem", top: "1rem", zIndex: 60,
        borderRadius: ".875rem", background: "#0a0a0a", padding: ".5rem 1rem",
        fontSize: ".875rem", color: "#fff"
      }}>Skip to content</a>

      {/* ── Loader ──────────────────────────────────────── */}
      {!loaderDone && (
        <div className={`page-loader ${loaderExit ? "exit" : ""}`}>
          <div className="loader-content">
            <div className="loader-brand">
              <LogoMark size="1.875rem" color="#34d399" />
              ShipZen
            </div>
            <p className="loader-tagline">Ship smart. Stay zen.</p>
          </div>
          <div className="loader-progress">
            <div className="loader-track">
              <div className="loader-fill" style={{ width: `${loaderProgress}%` }} />
            </div>
            <div className="loader-meta">
              <span>Loading</span>
              <span className="loader-counter">{String(loaderProgress).padStart(3, "0")}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────── */}
      <header className={`site-header ${loaderDone ? "revealed" : ""}`}>
        <div className="shell header-inner">
          <button className="brand-btn" onClick={() => scrollToEl("home")}>
            <LogoMark size="1.25rem" color="#10b981" />
            ShipZen
          </button>

          <nav className="nav-primary">
            <ul style={{ display: "flex", gap: "2rem", listStyle: "none" }}>
              {navItems.map((item) =>
                item.href ? (
                  <li key={item.label}>
                    <Link href={item.href} style={{ opacity: 0.8, transition: "opacity .3s, transform .3s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >{item.label}</Link>
                  </li>
                ) : (
                  <li key={item.label}>
                    <button onClick={() => handleNav(item)}>{item.label}</button>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="clock-chip">
              <span className="clock-label">Local time</span>
              <span className="clock-time">{clockTime}</span>
              <span className="clock-sep">•</span>
              <span className="clock-date">{clockDate}</span>
            </div>
            <button className="menu-btn" onClick={openMenu}>
              <GridIcon />
              <span className="menu-label">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────── */}
      <main id="main" ref={mainRef}>

        {/* ── Hero ────────────────────────────────────── */}
        <section id="home" className="hero">
          <div className="hero-bg-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero/base.jpg" alt="" aria-hidden="true" draggable={false} />
            <canvas ref={canvasRef} className="hero-reveal-canvas" />
          </div>
          <div className="hero-vignette" />
          <div className={`hero-watermark ${loaderDone ? "revealed" : ""}`}>SHIPZEN</div>

          <div className="shell hero-grid">
            <div className="hero-left">
              <div className="reveal eyebrow light" data-delay="200">
                <span className="eyebrow-dot" style={{ background: "rgba(0,0,0,.4)" }} />
                Developer Productivity
              </div>

              <h1 className="hero-h1">
                <span className="line-reveal-line">
                  <span className="line-reveal-inner" data-delay={loaderDone ? "0" : "9999"}
                    style={loaderDone ? { transitionDelay: "250ms" } : undefined}
                    ref={(el) => { if (el && loaderDone) setTimeout(() => el.classList.add("revealed"), 250); }}>
                    Ship without
                  </span>
                </span>
                <span className="line-reveal-line">
                  <span className="line-reveal-inner" data-delay={loaderDone ? "0" : "9999"}
                    style={loaderDone ? { transitionDelay: "370ms" } : undefined}
                    ref={(el) => { if (el && loaderDone) setTimeout(() => el.classList.add("revealed"), 370); }}>
                    <span style={{ color: "#059669" }}>burning out.</span>
                  </span>
                </span>
              </h1>

              <div className="reveal rating-row" data-delay="650">
                <span className="rating-stars">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                </span>
                <span className="rating-text">Loved by 500+ developers</span>
              </div>

              <div className="reveal" data-delay="750" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <Link href="/dashboard" className="pill-btn">
                  <span className="pill-inner light with-arrow">
                    Open Dashboard
                    <span className="pill-arrow arrow-right"><ArrowRight /></span>
                  </span>
                </Link>
                <button className="pill-btn" onClick={() => scrollToEl("works")}>
                  <span className="pill-inner outline no-arrow">
                    See Features
                  </span>
                </button>
              </div>
            </div>

            <div className="hero-right">
              <div className="reveal scale-in hero-card" data-delay="400">
                <div className="hero-card-row" onClick={() => setHeroCardIdx((i) => (i + 1) % HERO_CARDS.length)}>
                  <div className="hero-card-tile">
                    <LogoMark size="1.875rem" color="#34d399" />
                  </div>
                  <div className="hero-card-panel">
                    <div style={{ position: "relative", minHeight: "3.25rem" }}>
                      <div className="hero-card-caption">{HERO_CARDS[heroCardIdx].caption}</div>
                      <div className="hero-card-title">{HERO_CARDS[heroCardIdx].title}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                      <div className="hero-card-dots">
                        {HERO_CARDS.map((_, i) => (
                          <div key={i} className={`hero-card-dot ${i === heroCardIdx ? "active" : "inactive"}`} />
                        ))}
                      </div>
                      <div className="hero-card-nav">
                        <button onClick={(e) => { e.stopPropagation(); setHeroCardIdx((i) => (i - 1 + HERO_CARDS.length) % HERO_CARDS.length); }}>
                          <span style={{ transform: "rotate(180deg)", display: "flex" }}><ArrowRight /></span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setHeroCardIdx((i) => (i + 1) % HERO_CARDS.length); }}>
                          <ArrowRight />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="shell hero-status reveal" data-delay="900">
            <span>Shipping since 2026</span>
            <span className="hero-status-center">Remote-first, worldwide</span>
            <span style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
              Scroll to explore <span>↓</span>
            </span>
          </div>
        </section>

        {/* ── About ───────────────────────────────────── */}
        <section id="about" className="about">
          <div className="shell about-grid">
            <div className="about-icon-block">
              <div className="about-big-icon"><ZenIcon /></div>
              <div className="reveal eyebrow light" style={{ position: "relative" }}>
                <span className="eyebrow-dot" style={{ background: "rgba(17,17,17,.5)" }} />
                The Platform
              </div>
              <div className="reveal" data-delay="100" style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "rgba(17,17,17,.7)", marginTop: "auto", paddingTop: "2rem" }}>
                <span style={{ fontSize: "1.5rem", color: "#111" }}><ZenIcon /></span>
                <span style={{ maxWidth: "14rem" }}>Helping developers stay productive across every time zone.</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              <h2 className="about-h2">
                <WordReveal text="We help developers break down complexity, stay focused, and " />
                <WordReveal text="ship healthy — powered by AI that actually cares about your wellbeing." muted />
              </h2>

              <div className="reveal about-footer" data-delay="200">
                <div>
                  <div style={{ fontSize: "0.875rem", color: "rgba(17,17,17,.45)", marginBottom: "0.5rem" }}>Find us online</div>
                  <div className="social-chips">
                    <button className="social-chip accent" title="Twitter"><XIcon /></button>
                    <button className="social-chip surface" title="GitHub"><CircleDot /></button>
                    <button className="social-chip surface" title="Discord"><CircleDot /></button>
                  </div>
                </div>
                <button className="pill-btn" onClick={() => scrollToEl("about")}>
                  <span className="pill-inner outline-dark with-arrow">
                    Learn More
                    <span className="pill-arrow arrow-right"><ArrowRight /></span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Create Band ─────────────────────────────── */}
        <section className="create-band">
          <ul className="shell create-band-list">
            {[
              { word: "Ship", variant: "tile-light" },
              { word: "Smart", variant: "tile-accent" },
              { icon: true, variant: "tile-dark" },
              { word: "Zen", variant: "tile-ghost" },
            ].map((item, i) => (
              <li key={i} className="reveal create-band-item" data-delay={String(i * 120)}>
                <div className={`create-band-tile ${item.variant}`}>
                  {item.icon ? <span style={{ fontSize: "2.25rem" }}><ArrowRight /></span> : item.word}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Features (Portfolio) ────────────────────── */}
        <section id="works" className="portfolio">
          <div className="shell portfolio-inner">
            <div className="portfolio-header">
              <div className="reveal eyebrow light portfolio-eyebrow">
                <span className="eyebrow-dot" style={{ background: "rgba(17,17,17,.5)" }} />
                Features
              </div>
              <h2 className="portfolio-h2">
                <span className="line-reveal-line">
                  <span className="line-reveal-inner" data-delay="120">Core Features</span>
                </span>
              </h2>
            </div>
            <div className="portfolio-grid">
              {FEATURES.map((feat, i) => (
                <div key={feat.title} className="reveal from-below" data-delay={String(i * 90)}>
                  <article className="feature-card">
                    <div className="feature-card-top">
                      <span>{feat.category} — {feat.year}</span>
                      <div className="feature-card-badge"><ArrowUpRight /></div>
                    </div>
                    <div className="feature-card-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={feat.image} alt={feat.title} className="feature-card-img" draggable={false} />
                    </div>
                    <div className="feature-card-bottom">
                      <h3>{feat.title}</h3>
                      <p>{feat.description}</p>
                      <div className="feature-card-tags">
                        {feat.tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ────────────────────────────────── */}
        <section id="services" className="services">
          <div className="shell services-inner">
            <div className="reveal eyebrow light">
              <span className="eyebrow-dot" style={{ background: "rgba(17,17,17,.5)" }} />
              How It Works
            </div>
            <h2 className="services-h2">
              <span className="line-reveal-line">
                <span className="line-reveal-inner" data-delay="120">What ShipZen does best</span>
              </span>
            </h2>
            <ul>
              {SERVICES.map((svc, i) => (
                <li key={svc.title} className="reveal service-row" data-delay={String(i * 80)}>
                  <div className="service-row-inner">
                    <span className="service-index">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="service-title">{svc.title}</h3>
                    <p className="service-desc">{svc.desc}</p>
                    <div className="service-badge"><ArrowUpRight /></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Stats ───────────────────────────────────── */}
        <section id="stats-section" className="stats">
          <div className="shell stats-outer">
            <div className="reveal scale-in stats-panel">

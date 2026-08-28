import Link from "next/link";

const features = [
  {
    icon: "⚡",
    title: "AI Task Breakdown",
    description:
      "Paste a big task, get bite-sized sub-tasks with time estimates. Powered by Claude.",
  },
  {
    icon: "🎯",
    title: "Focus Timer",
    description:
      "Pomodoro-style timer with work/break tracking. See your entire day as a visual timeline.",
  },
  {
    icon: "🧠",
    title: "Burnout Prevention",
    description:
      "Real-time burnout risk score based on your work patterns. Stay productive without crashing.",
  },
  {
    icon: "🚀",
    title: "Ship Score",
    description:
      "Gamified daily score that rewards shipping AND healthy habits. Build streaks that last.",
  },
  {
    icon: "✨",
    title: "AI Nudge Copilot",
    description:
      "Context-aware nudges that celebrate wins and catch you before you overdo it.",
  },
  {
    icon: "📊",
    title: "Work Analytics",
    description:
      "Visual timeline of your work patterns. Know when you're most productive.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">SZ</span>
            </div>
            <span className="font-bold text-lg text-zinc-100 tracking-tight">ShipZen</span>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
          >
            Open Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-8 animate-slide-up">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Built for developers who ship
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-100 mb-6 animate-slide-up stagger-1">
            Ship without
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400">
              burning out.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 animate-slide-up stagger-2">
            AI-powered task breakdown, focus tracking, and burnout prevention —
            everything a developer needs to stay productive <em>and</em> healthy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-3">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-2xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
            >
              Start Shipping 🚀
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 rounded-2xl font-medium text-lg transition-all"
            >
              See Features
            </a>
          </div>

          {/* Social proof placeholder */}
          <div className="mt-16 flex items-center justify-center gap-6 text-zinc-600 text-sm animate-fade-in stagger-4">
            <span>Free tier available</span>
            <span>•</span>
            <span>No account required</span>
            <span>•</span>
            <span>Powered by Claude AI</span>
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="rounded-xl bg-zinc-900/80 p-6 md:p-10">
              <div className="grid grid-cols-3 gap-6">
                {/* Mock timer */}
                <div className="col-span-2 bg-zinc-800/50 rounded-xl p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-mono font-bold text-emerald-400 tabular-nums">
                      24:37
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-widest mt-2">
                      Focus Time
                    </div>
                    <div className="mt-4 flex gap-2 justify-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="text-xs text-emerald-400">In the zone</div>
                    </div>
                  </div>
                </div>
                {/* Mock score */}
                <div className="space-y-4">
                  <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-400">12</div>
                    <div className="text-xs text-zinc-500">Burnout Risk</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      47
                    </div>
                    <div className="text-xs text-zinc-500">Ship Score</div>
                  </div>
                </div>
              </div>
              {/* Mock tasks */}
              <div className="mt-6 space-y-2">
                {["Set up database schema", "Create API endpoints", "Build login UI"].map(
                  (task, i) => (
                    <div
                      key={task}
                      className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 ${
                          i === 0
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-zinc-600"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          i === 0 ? "line-through text-zinc-500" : "text-zinc-300"
                        }`}
                      >
                        {task}
                      </span>
                      <span className="ml-auto text-xs text-zinc-600">
                        {[15, 30, 25][i]}m
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Everything you need to ship healthy
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Built by developers, for developers. No fluff — just tools that actually help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all hover:bg-zinc-900/80"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
            Ready to ship smarter?
          </h2>
          <p className="text-zinc-500 mb-8">
            Start with 3 free AI breakdowns per day. No sign-up required.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-2xl font-semibold text-lg transition-all hover:scale-105 active:scale-95"
          >
            Open Dashboard →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">SZ</span>
            </div>
            <span className="text-sm text-zinc-500">ShipZen — Ship without burning out</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <span>Built for HackWithUs x tiun x Microlaunch</span>
            <span>•</span>
            <span>Powered by Claude AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

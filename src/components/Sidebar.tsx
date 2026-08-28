"use client";

import { useState } from "react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "tasks", label: "Tasks", icon: "📋" },
  { id: "history", label: "History", icon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div className="md:hidden fixed top-0 left-0 z-40 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen bg-zinc-950 border-r border-zinc-800/50 transition-all duration-300 ${
          collapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "translate-x-0 w-56"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">SZ</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-zinc-100 tracking-tight">ShipZen</span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  // Close mobile sidebar
                  if (window.innerWidth < 768) setCollapsed(true);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activePage === item.id
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Collapse toggle (desktop) */}
          <div className="hidden md:block p-3 border-t border-zinc-800/50">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center p-2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

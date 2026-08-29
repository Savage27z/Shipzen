"use client";

import { useEffect, useState } from "react";
import { Nudge } from "@/types";

interface AINudgeProps {
  nudges: Nudge[];
  onDismiss: (id: string) => void;
}

const typeColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  warning: { bg: "#fef4e0", border: "#e8a83833", text: "#b8860b", icon: "#e8a838" },
  celebration: { bg: "#e0f5ef", border: "#2bc4a833", text: "#1a8a6e", icon: "#2bc4a8" },
  suggestion: { bg: "#e0f0f9", border: "#4a9fd833", text: "#2a7ab5", icon: "#4a9fd8" },
};

export default function AINudge({ nudges, onDismiss }: AINudgeProps) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    const newIds = nudges.map((n) => n.id).filter((id) => !visible.includes(id));
    if (newIds.length > 0) setVisible((prev) => [...prev, ...newIds]);
  }, [nudges, visible]);

  if (nudges.length === 0) return null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}>
      {nudges.slice(-3).map((nudge) => {
        const c = typeColors[nudge.type] || typeColors.suggestion;
        return (
          <div key={nudge.id} style={{
            background: c.bg, border: `1px solid ${c.border}`, borderRadius: 20, padding: "16px 18px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            animation: "fadeInUp 0.4s cubic-bezier(.16,1,.3,1)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${c.icon}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <svg viewBox="0 0 48 48" fill={c.icon} style={{ width: 12, height: 12 }}>
                  <path d="M24 2c2.2 13.8 7.9 19.6 22 22-14.1 2.4-19.8 8.2-22 22-2.2-13.8-7.9-19.6-22-22 14.1-2.4 19.8-8.2 22-22Z" />
                </svg>
              </div>
              <p style={{ fontSize: 14, flex: 1, color: c.text, margin: 0, lineHeight: 1.5 }}>{nudge.message}</p>
              <button onClick={() => onDismiss(nudge.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c4c4be", flexShrink: 0, padding: 0 }}>
                <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#b0b0a8", margin: "8px 0 0 36px" }}>ShipZen AI</p>
          </div>
        );
      })}
    </div>
  );
}

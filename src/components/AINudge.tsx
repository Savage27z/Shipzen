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

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

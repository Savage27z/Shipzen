// ─── Task Types ───────────────────────────────────────────────
export interface SubTask {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: number;
}

export interface TaskGroup {
  id: string;
  originalTask: string;
  subTasks: SubTask[];
  createdAt: number;
}

// ─── Timer Types ──────────────────────────────────────────────
export type TimerMode = "work" | "break";
export type TimerStatus = "idle" | "running" | "paused";

export interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
}

export interface WorkSession {
  id: string;
  mode: TimerMode;
  startedAt: number;
  endedAt: number;
  durationMinutes: number;
}

// ─── Scoring Types ────────────────────────────────────────────
export type BurnoutLevel = "green" | "yellow" | "red";

export interface BurnoutData {
  score: number;
  level: BurnoutLevel;
  factors: {
    longSessions: number;
    lateNightWork: number;
    skippedBreaks: number;
    consecutiveDays: number;
  };
}

export interface ShipScoreData {
  score: number;
  tasksCompleted: number;
  taskPoints: number;
  healthBonus: number;
  streakBonus: number;
  streakDays: number;
}

// ─── Nudge Types ──────────────────────────────────────────────
export interface Nudge {
  id: string;
  message: string;
  type: "warning" | "celebration" | "suggestion";
  timestamp: number;
}

// ─── Storage Types ────────────────────────────────────────────
export interface AppState {
  taskGroups: TaskGroup[];
  sessions: WorkSession[];
  timerSettings: TimerSettings;
  dailyBreakdownCount: number;
  lastBreakdownDate: string;
  streak: number;
  lastActiveDate: string;
}

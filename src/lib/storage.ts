import { AppState, TaskGroup, WorkSession, TimerSettings } from "@/types";

const STORAGE_KEY = "shipzen-state";

const DEFAULT_STATE: AppState = {
  taskGroups: [],
  sessions: [],
  timerSettings: { workMinutes: 25, breakMinutes: 5 },
  dailyBreakdownCount: 0,
  lastBreakdownDate: "",
  streak: 0,
  lastActiveDate: "",
};

function getState(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function setState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

function update(fn: (state: AppState) => AppState): AppState {
  const next = fn(getState());
  setState(next);
  return next;
}

// ─── Task Groups ──────────────────────────────────────────────
export function getTaskGroups(): TaskGroup[] {
  return getState().taskGroups;
}

export function addTaskGroup(group: TaskGroup): void {
  update((s) => ({ ...s, taskGroups: [group, ...s.taskGroups] }));
}

export function updateTaskGroup(id: string, updater: (g: TaskGroup) => TaskGroup): void {
  update((s) => ({
    ...s,
    taskGroups: s.taskGroups.map((g) => (g.id === id ? updater(g) : g)),
  }));
}

export function removeTaskGroup(id: string): void {
  update((s) => ({
    ...s,
    taskGroups: s.taskGroups.filter((g) => g.id !== id),
  }));
}

// ─── Work Sessions ────────────────────────────────────────────
export function getSessions(): WorkSession[] {
  return getState().sessions;
}

export function addSession(session: WorkSession): void {
  update((s) => ({ ...s, sessions: [...s.sessions, session] }));
}

export function getTodaySessions(): WorkSession[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = today.getTime();
  return getSessions().filter((s) => s.startedAt >= start);
}

// ─── Timer Settings ───────────────────────────────────────────
export function getTimerSettings(): TimerSettings {
  return getState().timerSettings;
}

export function setTimerSettings(settings: TimerSettings): void {
  update((s) => ({ ...s, timerSettings: settings }));
}

// ─── Breakdown Rate Limiting ──────────────────────────────────
export function getBreakdownCount(): { count: number; isNewDay: boolean } {
  const state = getState();
  const today = new Date().toDateString();
  if (state.lastBreakdownDate !== today) {
    return { count: 0, isNewDay: true };
  }
  return { count: state.dailyBreakdownCount, isNewDay: false };
}

export function incrementBreakdownCount(): void {
  const today = new Date().toDateString();
  update((s) => ({
    ...s,
    dailyBreakdownCount: s.lastBreakdownDate === today ? s.dailyBreakdownCount + 1 : 1,
    lastBreakdownDate: today,
  }));
}

// ─── Streak Tracking ─────────────────────────────────────────
export function getStreak(): number {
  const state = getState();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (state.lastActiveDate === today) return state.streak;
  if (state.lastActiveDate === yesterday) return state.streak; // will increment on activity
  return 0; // streak broken
}

export function recordActivity(): void {
  const today = new Date().toDateString();
  update((s) => {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (s.lastActiveDate === today) return s;
    const newStreak =
      s.lastActiveDate === yesterday ? s.streak + 1 : s.lastActiveDate === today ? s.streak : 1;
    return { ...s, streak: newStreak, lastActiveDate: today };
  });
}

// ─── Full State Access ────────────────────────────────────────
export function getFullState(): AppState {
  return getState();
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

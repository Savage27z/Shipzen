import { WorkSession, BurnoutData, BurnoutLevel, ShipScoreData, TaskGroup } from "@/types";

// ─── Burnout Score ────────────────────────────────────────────
export function calculateBurnoutScore(sessions: WorkSession[], streak: number): BurnoutData {
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = now - 7 * 86400000;

  const recentSessions = sessions.filter((s) => s.startedAt >= weekAgo);
  const todaySessions = sessions.filter((s) => s.startedAt >= todayStart.getTime());

  // Factor 1: Long work sessions without breaks (>60 min continuous)
  const longSessions = todaySessions.filter(
    (s) => s.mode === "work" && s.durationMinutes > 60
  ).length;
  const longSessionScore = Math.min(longSessions * 15, 30);

  // Factor 2: Late-night work (after 10pm)
  const lateNightSessions = recentSessions.filter((s) => {
    const hour = new Date(s.startedAt).getHours();
    return s.mode === "work" && hour >= 22;
  }).length;
  const lateNightScore = Math.min(lateNightSessions * 10, 25);

  // Factor 3: Skipped breaks — ratio of work to break sessions today
  const workSessions = todaySessions.filter((s) => s.mode === "work");
  const breakSessions = todaySessions.filter((s) => s.mode === "break");
  const workCount = workSessions.length;
  const breakCount = breakSessions.length;
  const skippedBreaks = workCount > 0 ? Math.max(0, workCount - breakCount - 1) : 0;
  const skippedBreakScore = Math.min(skippedBreaks * 10, 25);

  // Factor 4: Consecutive days without a full rest day
  const consecutiveDays = streak;
  const consecutiveDayScore = consecutiveDays > 7 ? 20 : consecutiveDays > 5 ? 10 : consecutiveDays > 3 ? 5 : 0;

  const score = Math.min(
    100,
    longSessionScore + lateNightScore + skippedBreakScore + consecutiveDayScore
  );

  const level: BurnoutLevel = score <= 30 ? "green" : score <= 60 ? "yellow" : "red";

  return {
    score,
    level,
    factors: {
      longSessions: longSessionScore,
      lateNightWork: lateNightScore,
      skippedBreaks: skippedBreakScore,
      consecutiveDays: consecutiveDayScore,
    },
  };
}

// ─── Ship Score ───────────────────────────────────────────────
export function calculateShipScore(
  taskGroups: TaskGroup[],
  sessions: WorkSession[],
  burnout: BurnoutData,
  streak: number
): ShipScoreData {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTs = todayStart.getTime();

  // Tasks completed today
  let tasksCompleted = 0;
  let taskPoints = 0;
  for (const group of taskGroups) {
    for (const sub of group.subTasks) {
      if (sub.completed && sub.completedAt && sub.completedAt >= todayTs) {
        tasksCompleted++;
        // Points based on estimated time: 1 point per 5 minutes
        taskPoints += Math.max(1, Math.round(sub.estimatedMinutes / 5));
      }
    }
  }

  // Health bonus: inverse of burnout score (healthy patterns = more points)
  const healthBonus = Math.round((100 - burnout.score) / 5); // 0-20 points

  // Streak bonus
  const streakBonus = Math.min(streak * 2, 20); // up to 20 points

  const score = taskPoints + healthBonus + streakBonus;

  return {
    score,
    tasksCompleted,
    taskPoints,
    healthBonus,
    streakBonus,
    streakDays: streak,
  };
}

// ─── Nudge Context ────────────────────────────────────────────
export function getNudgeContext(
  sessions: WorkSession[],
  burnout: BurnoutData,
  shipScore: ShipScoreData,
  taskGroups: TaskGroup[]
): string {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter((s) => s.startedAt >= todayStart.getTime());

  const totalWorkMinutes = todaySessions
    .filter((s) => s.mode === "work")
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const lastSession = todaySessions[todaySessions.length - 1];
  const minutesSinceLastBreak = lastSession
    ? Math.round((Date.now() - lastSession.endedAt) / 60000)
    : 0;

  const hour = new Date().getHours();

  return JSON.stringify({
    totalWorkMinutesToday: totalWorkMinutes,
    sessionsToday: todaySessions.length,
    burnoutScore: burnout.score,
    burnoutLevel: burnout.level,
    shipScore: shipScore.score,
    tasksCompletedToday: shipScore.tasksCompleted,
    streakDays: shipScore.streakDays,
    currentHour: hour,
    minutesSinceLastBreak,
    isLateNight: hour >= 22,
  });
}

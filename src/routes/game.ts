import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { levelForXp, rankForXp } from "../lib/xp";

export const gameRouter = Router();

const scoreSchema = z.object({
  mode: z.enum(["CONVERSION_CHALLENGE", "TOWER_DEFENSE", "MEMORY_MATCH", "SPEED_QUIZ"]),
  score: z.number().int().min(0),
  streakMax: z.number().int().min(0).optional(),
  meta: z.record(z.any()).optional(),
});

gameRouter.post("/score", requireAuth, async (req: AuthRequest, res) => {
  const parsed = scoreSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user!.sub;
  const { mode, score, streakMax = 0, meta } = parsed.data;

  // XP = 1 per score point, capped sensibly
  const xpEarned = Math.min(score, 500);

  const entry = await prisma.gameScore.create({
    data: {
      userId,
      mode,
      score,
      streakMax,
      xpEarned,
      meta: meta ? JSON.stringify(meta) : null,
    },
  });

  // Apply XP and recompute level/rank
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xpEarned }, lastActiveAt: new Date() },
  });
  const newLevel = levelForXp(user.xp);
  const newRank = rankForXp(user.xp);
  await prisma.user.update({ where: { id: userId }, data: { level: newLevel, rankCode: newRank } });

  await prisma.progressEvent.create({
    data: {
      userId,
      kind: "XP_GAIN",
      payload: JSON.stringify({ reason: mode, amount: xpEarned, score }),
    },
  });

  // Upsert leaderboard entry
  await prisma.leaderboardEntry.upsert({
    where: { userId_period: { userId, period: "ALL_TIME" } },
    create: { userId, period: "ALL_TIME", totalXp: user.xp },
    update: { totalXp: user.xp },
  });

  // Award simple achievements
  await maybeAwardAchievements(userId, { mode, score, streakMax });

  return res.json({ entry, xpEarned, level: newLevel, rankCode: newRank });
});

async function maybeAwardAchievements(
  userId: string,
  ctx: { mode: string; score: number; streakMax: number }
) {
  const all = await prisma.achievement.findMany();
  const have = new Set(
    (await prisma.userAchievement.findMany({ where: { userId } })).map((u) => u.achievementId)
  );

  const grants: string[] = [];
  for (const a of all) {
    if (have.has(a.id)) continue;
    if (a.code === "FIRST_GAME") grants.push(a.id);
    if (a.code === "STREAK_5" && ctx.streakMax >= 5) grants.push(a.id);
    if (a.code === "STREAK_10" && ctx.streakMax >= 10) grants.push(a.id);
    if (a.code === "SCORE_500" && ctx.score >= 500) grants.push(a.id);
  }

  for (const achievementId of grants) {
    await prisma.userAchievement.create({ data: { userId, achievementId } });
    await prisma.progressEvent.create({
      data: {
        userId,
        kind: "BADGE_EARNED",
        payload: JSON.stringify({ achievementId }),
      },
    });
  }
}

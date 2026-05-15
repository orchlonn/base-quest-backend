import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { xpToNextLevel } from "../lib/xp";

export const studentRouter = Router();

studentRouter.get("/profile", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    include: { achievements: { include: { achievement: true } } },
  });
  if (!user) return res.status(404).json({ error: "Not found" });

  const xpRange = xpToNextLevel(user.xp);
  return res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    xp: user.xp,
    level: user.level,
    streakDays: user.streakDays,
    rankCode: user.rankCode,
    xpRange,
    achievements: user.achievements.map((ua) => ({
      code: ua.achievement.code,
      title: ua.achievement.title,
      description: ua.achievement.description,
      iconKey: ua.achievement.iconKey,
      unlockedAt: ua.unlockedAt,
    })),
  });
});

studentRouter.get("/progress", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.sub;
  const [lessons, attempts, games, events] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId },
      include: { lesson: { select: { slug: true, title: true, topic: true } } },
    }),
    prisma.quizAttempt.findMany({ where: { userId }, orderBy: { takenAt: "desc" } }),
    prisma.gameScore.findMany({ where: { userId }, orderBy: { playedAt: "desc" }, take: 25 }),
    prisma.progressEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 25 }),
  ]);

  const pre = attempts.find((a) => a.kind === "PRE_TEST");
  const post = attempts.find((a) => a.kind === "POST_TEST");
  const improvement =
    pre && post ? Math.round(((post.score - pre.score) / Math.max(pre.score, 1)) * 100) : null;

  return res.json({
    lessons,
    quizAttempts: attempts,
    gameScores: games,
    events,
    summary: {
      preTestScore: pre?.score ?? null,
      postTestScore: post?.score ?? null,
      improvementPct: improvement,
    },
  });
});

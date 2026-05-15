import { Router } from "express";
import { prisma } from "../lib/prisma";

export const leaderboardRouter = Router();

leaderboardRouter.get("/", async (_req, res) => {
  const entries = await prisma.leaderboardEntry.findMany({
    where: { period: "ALL_TIME" },
    orderBy: { totalXp: "desc" },
    take: 50,
    include: { user: { select: { username: true, level: true, rankCode: true, avatarUrl: true } } },
  });

  return res.json(
    entries.map((e, i) => ({
      rank: i + 1,
      userId: e.userId,
      username: e.user.username,
      level: e.user.level,
      rankCode: e.user.rankCode,
      avatarUrl: e.user.avatarUrl,
      totalXp: e.totalXp,
    }))
  );
});

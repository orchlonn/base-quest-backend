import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const achievementsRouter = Router();

achievementsRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.sub;
  const [all, mine] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);
  const unlockedSet = new Set(mine.map((m) => m.achievementId));

  return res.json(
    all.map((a) => ({
      code: a.code,
      title: a.title,
      description: a.description,
      iconKey: a.iconKey,
      xpReward: a.xpReward,
      unlocked: unlockedSet.has(a.id),
    }))
  );
});

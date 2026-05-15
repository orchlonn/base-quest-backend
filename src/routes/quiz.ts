import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { levelForXp, rankForXp } from "../lib/xp";

export const quizRouter = Router();

const submitSchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), value: z.string() })),
});

async function gradeAttempt(
  kind: "PRE_TEST" | "POST_TEST",
  userId: string,
  answers: { questionId: string; value: string }[]
) {
  const ids = answers.map((a) => a.questionId);
  const questions = await prisma.question.findMany({ where: { id: { in: ids } } });
  const byId = new Map(questions.map((q) => [q.id, q]));

  const topicTotals: Record<string, { correct: number; total: number }> = {};
  let correctCount = 0;

  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    const bucket = (topicTotals[q.topic] ||= { correct: 0, total: 0 });
    bucket.total++;
    const correct = a.value.trim().toLowerCase() === q.answer.trim().toLowerCase();
    if (correct) {
      correctCount++;
      bucket.correct++;
    }
  }

  const totalItems = answers.length;
  const score = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
  const topicBreakdown = Object.fromEntries(
    Object.entries(topicTotals).map(([k, v]) => [k, v.total ? v.correct / v.total : 0])
  );

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      kind,
      score,
      totalItems,
      correctCount,
      topicBreakdown: JSON.stringify(topicBreakdown),
    },
  });

  // award XP for post-test
  if (kind === "POST_TEST") {
    const xpGain = correctCount * 15;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xpGain } },
    });
    const newLevel = levelForXp(user.xp);
    const newRank = rankForXp(user.xp);
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel, rankCode: newRank },
    });
    await prisma.progressEvent.create({
      data: {
        userId,
        kind: "XP_GAIN",
        payload: JSON.stringify({ reason: "POST_TEST", amount: xpGain }),
      },
    });
  }

  // Build recommendations based on weakest topics
  const weakest = Object.entries(topicBreakdown)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([t]) => t);

  const recommendedLessons = await prisma.lesson.findMany({
    where: { topic: { in: weakest } },
    orderBy: { order: "asc" },
  });

  return { attempt, recommendedLessons, topicBreakdown };
}

quizRouter.post("/pre-test/submit", requireAuth, async (req: AuthRequest, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const result = await gradeAttempt("PRE_TEST", req.user!.sub, parsed.data.answers);
  return res.json(result);
});

quizRouter.post("/post-test/submit", requireAuth, async (req: AuthRequest, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user!.sub;
  const result = await gradeAttempt("POST_TEST", userId, parsed.data.answers);

  const pre = await prisma.quizAttempt.findFirst({
    where: { userId, kind: "PRE_TEST" },
    orderBy: { takenAt: "desc" },
  });
  const improvementPct = pre
    ? Math.round(((result.attempt.score - pre.score) / Math.max(pre.score, 1)) * 100)
    : null;

  // Personalized feedback string
  const sorted = Object.entries(result.topicBreakdown).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0]?.[0] ?? null;
  const weakest = sorted[sorted.length - 1]?.[0] ?? null;
  const feedback = buildFeedback(result.attempt.score, strongest, weakest, improvementPct);

  return res.json({
    ...result,
    preTestScore: pre?.score ?? null,
    postTestScore: result.attempt.score,
    improvementPct,
    strongestTopic: strongest,
    weakestTopic: weakest,
    feedback,
  });
});

function buildFeedback(
  score: number,
  strongest: string | null,
  weakest: string | null,
  improvement: number | null
): string {
  const parts: string[] = [];
  if (score >= 90) parts.push("Outstanding work — you've mastered base conversions!");
  else if (score >= 70) parts.push("Great job! You're well on your way to becoming a Conversion Wizard.");
  else if (score >= 50) parts.push("Solid effort. A bit more practice and you'll level up fast.");
  else parts.push("Keep going — revisit the lessons and try the games to reinforce concepts.");

  if (strongest) parts.push(`Strongest area: ${strongest.toLowerCase()}.`);
  if (weakest && weakest !== strongest) parts.push(`Focus next on: ${weakest.toLowerCase()}.`);
  if (improvement != null) {
    if (improvement > 0) parts.push(`You improved by ${improvement}% from your pre-test.`);
    else if (improvement === 0) parts.push("You matched your pre-test score — try again to beat it!");
    else parts.push("Don't worry — try the lessons again and retake the quiz.");
  }
  return parts.join(" ");
}

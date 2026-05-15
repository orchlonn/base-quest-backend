import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const lessonsRouter = Router();

lessonsRouter.get("/", async (_req, res) => {
  const lessons = await prisma.lesson.findMany({ orderBy: { order: "asc" } });
  return res.json(lessons);
});

lessonsRouter.get("/:slug", async (req, res) => {
  const lesson = await prisma.lesson.findUnique({ where: { slug: req.params.slug } });
  if (!lesson) return res.status(404).json({ error: "Not found" });
  return res.json(lesson);
});

const progressSchema = z.object({
  lessonId: z.string(),
  completed: z.boolean().optional(),
  percent: z.number().int().min(0).max(100).optional(),
});

lessonsRouter.post("/progress", requireAuth, async (req: AuthRequest, res) => {
  const parsed = progressSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user!.sub;
  const { lessonId, completed = false, percent = 0 } = parsed.data;

  const entry = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, completed, percent },
    update: { completed, percent },
  });

  if (completed) {
    await prisma.progressEvent.create({
      data: {
        userId,
        kind: "LESSON_DONE",
        payload: JSON.stringify({ lessonId }),
      },
    });
  }

  return res.json(entry);
});

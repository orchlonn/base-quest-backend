import { Router } from "express";
import { prisma } from "../lib/prisma";

export const questionsRouter = Router();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickPool(kind: "PRE_TEST" | "POST_TEST", count = 10) {
  return prisma.question
    .findMany({ where: { poolKind: kind } })
    .then((qs) => shuffle(qs).slice(0, count));
}

// Public route: students fetch their quiz without seeing the answer
function strip(q: any) {
  const { answer, choices, ...rest } = q;
  return { ...rest, choices: choices ? JSON.parse(choices) : null };
}

questionsRouter.get("/pre-test", async (_req, res) => {
  const qs = await pickPool("PRE_TEST", 10);
  return res.json(qs.map(strip));
});

questionsRouter.get("/post-test", async (_req, res) => {
  const qs = await pickPool("POST_TEST", 10);
  return res.json(qs.map(strip));
});

import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { studentRouter } from "./routes/student";
import { lessonsRouter } from "./routes/lessons";
import { questionsRouter } from "./routes/questions";
import { quizRouter } from "./routes/quiz";
import { gameRouter } from "./routes/game";
import { achievementsRouter } from "./routes/achievements";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "base-quest-api" }));

app.use("/auth", authRouter);
app.use("/student", studentRouter);
app.use("/lessons", lessonsRouter);
app.use("/questions", questionsRouter);
app.use("/quiz", quizRouter);
app.use("/game", gameRouter);
app.use("/achievements", achievementsRouter);

// Central error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[error]", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`BaseQuest API listening on http://localhost:${PORT}`);
});

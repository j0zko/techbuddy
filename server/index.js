import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.js";
import diagnoseRouter from "./routes/diagnose.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/chat", chatRouter);
app.use("/api/diagnose", diagnoseRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`TechBuddy server listening on http://localhost:${PORT}`);
});

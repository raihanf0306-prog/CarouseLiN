import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { handleGeneratePrompts, handleAutofill } from "./server/geminiService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-prompts", async (req, res) => {
    try {
      const { formData, language } = req.body || {};
      const prompts = await handleGeneratePrompts(formData || {}, language || 'id');
      res.json({ success: true, prompts });
    } catch (err: any) {
      console.error("Error in /api/generate-prompts:", err);
      res.status(500).json({ error: err?.message || "Failed to generate prompts" });
    }
  });

  app.post("/api/autofill", async (req, res) => {
    try {
      const { mode, currentValues, context, language } = req.body || {};
      const result = await handleAutofill(mode, currentValues || {}, context, language || 'id');
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error("Error in /api/autofill:", err);
      res.status(500).json({ error: err?.message || "Failed to generate autofill" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

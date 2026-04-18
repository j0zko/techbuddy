import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  chatSystemPrompt,
  showMeSystemPrompt,
  diagnoseSystemPrompt,
} from "../prompts.js";

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL = "gemini-2.5-flash"; // Change to 'gemini-2.5-pro' if you want higher quality (slightly more expensive)

const showMeSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    intro: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" },
        },
        required: ["title", "body"],
      },
    },
    done_message: { type: "string" },
    escalate: { type: "boolean" },
  },
  required: ["title", "intro", "steps", "done_message", "escalate"],
};

const diagnoseSchema = {
  type: "object",
  properties: {
    overall_health: {
      type: "string",
      enum: ["good", "ok", "attention", "serious"],
    },
    summary: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          status: { type: "string", enum: ["good", "ok", "warn", "bad"] },
          message: { type: "string" },
        },
        required: ["area", "status", "message"],
      },
    },
    top_tip: { type: "string" },
    escalate: { type: "boolean" },
  },
  required: ["overall_health", "summary", "findings", "top_tip", "escalate"],
};

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

router.post("/", async (req, res, next) => {
  try {
    const {
      messages = [],
      mode = "chat",
      hardwareData = null,
    } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const cleanMessages = messages
      .filter((m) => m && typeof m.content === "string" && m.content.trim())
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    // Convert to Gemini format (assistant → model)
    const toGeminiHistory = (msgs) =>
      msgs.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    if (mode === "chat") {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: chatSystemPrompt,
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 200,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const history = toGeminiHistory(cleanMessages);
      const result = await model.generateContent({ contents: history });

      const reply = result.response.text();
      return res.json({ mode, reply });
    }

    if (mode === "showme") {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: showMeSystemPrompt,
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          responseMimeType: "application/json",
          responseSchema: showMeSchema,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const history = toGeminiHistory(cleanMessages);
      const result = await model.generateContent({ contents: history });

      const text = result.response.text();
      const parsed = tryParseJson(text);

      if (!parsed) {
        return res
          .status(502)
          .json({ error: "Could not parse Show Me response", raw: text });
      }
      return res.json({ mode, data: parsed });
    }

    if (mode === "diagnose") {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: diagnoseSystemPrompt,
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          responseMimeType: "application/json",
          responseSchema: diagnoseSchema,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const history = toGeminiHistory(cleanMessages);

      const userTurn = {
        role: "user",
        parts: [
          {
            text: `Here is the sanitized hardware data from the user's computer. Interpret it for a non-technical person and return the structured findings.\n\n${JSON.stringify(hardwareData ?? {}, null, 2)}`,
          },
        ],
      };

      const result = await model.generateContent({
        contents: [...history, userTurn],
      });

      const text = result.response.text();
      const parsed = tryParseJson(text);

      if (!parsed) {
        return res
          .status(502)
          .json({ error: "Could not parse Diagnose response", raw: text });
      }
      return res.json({ mode, data: parsed });
    }

    return res.status(400).json({ error: `Unknown mode: ${mode}` });
  } catch (err) {
    next(err);
  }
});

export default router;

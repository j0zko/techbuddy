import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import {
  chatSystemPrompt,
  showMeSystemPrompt,
  diagnoseSystemPrompt,
} from '../prompts.js';

const router = Router();
const client = new Anthropic();
const MODEL = 'claude-sonnet-4-0';

const showMeSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    intro: { type: 'string' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['title', 'body'],
        additionalProperties: false,
      },
    },
    done_message: { type: 'string' },
    escalate: { type: 'boolean' },
  },
  required: ['title', 'intro', 'steps', 'done_message', 'escalate'],
  additionalProperties: false,
};

const diagnoseSchema = {
  type: 'object',
  properties: {
    overall_health: {
      type: 'string',
      enum: ['good', 'ok', 'attention', 'serious'],
    },
    summary: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          area: { type: 'string' },
          status: { type: 'string', enum: ['good', 'ok', 'warn', 'bad'] },
          message: { type: 'string' },
        },
        required: ['area', 'status', 'message'],
        additionalProperties: false,
      },
    },
    top_tip: { type: 'string' },
    escalate: { type: 'boolean' },
  },
  required: ['overall_health', 'summary', 'findings', 'top_tip', 'escalate'],
  additionalProperties: false,
};

function extractText(message) {
  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

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

router.post('/', async (req, res, next) => {
  try {
    const { messages = [], mode = 'chat', hardwareData = null } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    const cleanMessages = messages
      .filter((m) => m && typeof m.content === 'string' && m.content.trim())
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    if (mode === 'chat') {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: chatSystemPrompt,
        messages: cleanMessages,
      });
      return res.json({ mode, reply: extractText(response) });
    }

    if (mode === 'showme') {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: showMeSystemPrompt,
        messages: cleanMessages,
        output_config: {
          format: {
            type: 'json_schema',
            schema: showMeSchema,
          },
        },
      });
      const text = extractText(response);
      const parsed = tryParseJson(text);
      if (!parsed) {
        return res.status(502).json({ error: 'Could not parse Show Me response', raw: text });
      }
      return res.json({ mode, data: parsed });
    }

    if (mode === 'diagnose') {
      const userTurn = {
        role: 'user',
        content: `Here is the sanitized hardware data from the user's computer. Interpret it for a non-technical person and return the structured findings.\n\n${JSON.stringify(hardwareData ?? {}, null, 2)}`,
      };
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: diagnoseSystemPrompt,
        messages: [...cleanMessages, userTurn],
        output_config: {
          format: {
            type: 'json_schema',
            schema: diagnoseSchema,
          },
        },
      });
      const text = extractText(response);
      const parsed = tryParseJson(text);
      if (!parsed) {
        return res.status(502).json({ error: 'Could not parse Diagnose response', raw: text });
      }
      return res.json({ mode, data: parsed });
    }

    return res.status(400).json({ error: `Unknown mode: ${mode}` });
  } catch (err) {
    next(err);
  }
});

export default router;

import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { callLLM } from '../services/aiProvider.js';
import { buildDataContext } from '../services/copilotContext.js';
import { logAction } from '../services/auditService.js';

const publicDemo = { allowedOrigin: process.env.DEMO_COPILOT_ORIGIN || 'landing' };

export async function chat(req, res, next) {
  try {
    // The public landing page gets a clearly-labeled demo flow:
    // an ephemeral session token names the scope and carries no user identity.
    let orgId = null;
    let user = null;
    const authz = req.headers.authorization || '';
    if (authz.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(authz.slice(7), config.jwtSecret);
        user = payload; // light auth (validated again in buildDataContext if needed)
        orgId = payload.organizationId || null;
      } catch {
        /* fall through to public demo */
      }
    }

    const { message, sessionToken } = req.body;
    if (!message || !String(message).trim()) return res.fail('Ask a question first.', 400);

    const dataContext = orgId
      ? await buildDataContext(orgId, String(message))
      : { demo: true };

    let reply;
    let grounded = false;

    if (config.ai.provider && config.ai.apiKey) {
      reply = await callLLM(message, dataContext);
      grounded = !!orgId;
    } else {
      reply = demoAnswer(String(message), dataContext);
    }

    await logAction({
      req,
      action: 'copilot.chat',
      details: `demo=${!grounded} len=${message.length}`,
    });

    res.ok({
      data: {
        reply,
        demo: !grounded,
        sessionToken:
          sessionToken ||
          jwt.sign({ scope: 'copilot-demo', origin: publicDemo.allowedOrigin }, config.jwtSecret, { expiresIn: '30m' }),
      },
    });
  } catch (err) {
    next(err);
  }
}

function demoAnswer(message, ctx) {
  const q = message.toLowerCase();
  if (q.includes('delay')) {
    return 'Demo: this answer comes from Buildora’s built-in sample scenarios, not a live AI provider. "Sayjal Viras" is behind because the marble supplier and painting draftman both slipped — critical path impact ≈ 5 months. Connect an AI provider (AI_API_KEY) to get real analysis.';
  }
  if (q.includes('boq')) {
    return 'Demo: Smart BOQ generation works live with company rates and previous project benchmarks. Configure AI_API_KEY to activate real generation.';
  }
  if (q.includes('pending payment') || q.includes('payment')) {
    return 'Demo: pending payments summary would aggregate receivables from live invoice data. Configure AI_API_KEY to activate real answers.';
  }
  return `Demo assistant: "Buildora Copilot demo mode is active. Ask about delays, BOQs, or payments — or set AI_PROVIDER + AI_API_KEY to connect a real model." (${ctx?.demo === true ? 'sample scope' : 'live scope'})`;
}

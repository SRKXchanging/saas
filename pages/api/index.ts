import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
    res.write(`data: ${JSON.stringify({ error: 'OPENAI_API_KEY is not set' })}\n\n`);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content:
            'Reply with a new business idea for AI Agents, formatted with headings, sub-headings and bullet points',
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        const lines = text.split('\n');
        for (const line of lines) {
          res.write(`data: ${line}\n`);
        }
        res.write('\n');
      }
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    console.error('OpenAI stream error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
  } finally {
    res.end();
  }
}

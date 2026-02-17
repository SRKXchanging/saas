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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/api/index.ts:handler',message:'API handler entered',data:{method:_req.method,url:_req.url},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  const apiKey = process.env.OPENAI_API_KEY;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/api/index.ts:apiKey',message:'API key check',data:{hasApiKey:!!apiKey},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  if (!apiKey) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/api/index.ts:noKey',message:'Returning SSE error (no 500)',data:{returning500:false},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/api/index.ts:headers',message:'SSE headers set',data:{headersSet:true},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

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

    let firstWrite = true;
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        if (firstWrite) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/api/index.ts:firstWrite',message:'First SSE write',data:{firstWrite:true},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
          // #endregion
          firstWrite = false;
        }
        const lines = text.split('\n');
        for (const line of lines) {
          res.write(`data: ${line}\n`);
        }
        res.write('\n');
      }
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/api/index.ts:catch',message:'OpenAI error',data:{error:String(err)},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    console.error('OpenAI stream error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
  } finally {
    res.end();
  }
}

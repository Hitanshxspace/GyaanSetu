// api/ai.js — Vercel serverless proxy for OpenRouter
// Add OPENROUTER_API_KEY in Vercel → Settings → Environment Variables
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not set.' });
  const { system, userText } = req.body;
  if (!userText) return res.status(400).json({ error: 'Missing userText.' });
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': 'https://gyansetu.vercel.app',
        'X-Title': 'GyanSetu'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        max_tokens: 1000,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: userText }
        ]
      }),
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

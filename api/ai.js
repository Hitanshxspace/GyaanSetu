// api/ai.js — server-side AI proxy
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'The AI service is not configured on the server.' });

  const endpoint = 'https://ai-gateway.vercel.sh/v1/chat/completions';
  const model = process.env.AI_GATEWAY_MODEL || 'google/gemini-2.5-flash';

  const { system, userText } = req.body || {};
  if (typeof userText !== 'string' || !userText.trim()) {
    return res.status(400).json({ error: 'Missing userText.' });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          ...(typeof system === 'string' && system.trim() ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: userText.trim() },
        ],
      }),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'AI Gateway request failed.' });
  }
}

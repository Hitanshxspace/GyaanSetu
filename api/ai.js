// Server-side AI proxy. The API key is never exposed to the browser.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Vercel AI is not configured for this deployment.' });

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
        max_tokens: 1400,
        temperature: 0.7,
        messages: [
          ...(typeof system === 'string' && system.trim() ? [{ role: 'system', content: system.trim() }] : []),
          { role: 'user', content: userText.trim() },
        ],
      }),
    });

    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { error: raw || 'Invalid AI response.' }; }
    if (!response.ok) {
      const detail = data?.error?.message || data?.error || `AI request failed (${response.status}).`;
      return res.status(response.status).json({ error: String(detail) });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error('[v0] AI proxy error:', error);
    return res.status(502).json({ error: 'Could not connect to the AI service.' });
  }
}

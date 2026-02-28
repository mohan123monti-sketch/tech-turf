import { body } from 'express-validator';

export const aiValidators = [
  body('message').isString().isLength({ min: 1, max: 2000 })
];

export async function aiChatHandler(req, res) {
  const { message } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'AI service is not configured on server'
    });
  }

  const systemPrompt = process.env.AI_SYSTEM_PROMPT ||
    'You are Nexus AI for Tech Turf. Be helpful, concise, and professional.';

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    return res.status(502).json({
      success: false,
      message: 'AI provider request failed',
      details: process.env.NODE_ENV === 'production' ? undefined : details
    });
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content || 'No response received.';

  res.json({
    success: true,
    reply
  });
}

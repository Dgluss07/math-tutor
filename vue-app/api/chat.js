import { Agent } from '@mastra/core/agent';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const mathTutorAgent = new Agent({
  name: 'MathTutor',
  instructions: `You are a concise math tutor. When answering:
- Give clear, step-by-step solutions
- Keep explanations brief and to the point
- Use proper mathematical notation
- Only answer math-related questions`,
  model: groq('llama-3.1-8b-instant'),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  try {
    const result = await mathTutorAgent.generate(messages);
    res.json({ content: result.text });
  } catch (err) {
    console.error('Agent error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate response' });
  }
}

import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const mathTutorAgent = new Agent({
  name: 'MathTutor',
  instructions: `You are a concise math tutor. When answering:
- Give clear, step-by-step solutions
- Keep explanations brief and to the point
- Use proper mathematical notation
- Only answer math-related questions
- If the question is not math-related, politely redirect the user`,
  model: groq('llama-3.1-8b-instant'),
});

export const mastra = new Mastra({
  agents: { mathTutorAgent },
});

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

import { mathTutorAgent } from './mastra.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
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
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

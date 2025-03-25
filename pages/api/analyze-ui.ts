import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a UI/UX design expert. Analyze the provided UI design and provide feedback on its design principles, usability, and aesthetics."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this UI design and provide detailed feedback:" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000,
    });

    // Extract the response
    const analysis = response.choices[0]?.message?.content || 'No analysis available';

    return res.status(200).json({ 
      analysis,
      score: {
        usability: Math.floor(Math.random() * 5) + 6,
        aesthetics: Math.floor(Math.random() * 5) + 6,
        accessibility: Math.floor(Math.random() * 5) + 6,
        consistency: Math.floor(Math.random() * 5) + 6,
        overall: Math.floor(Math.random() * 5) + 6,
      }
    });
  } catch (error) {
    console.error('Error analyzing UI:', error);
    return res.status(500).json({ error: 'Failed to analyze UI design' });
  }
}
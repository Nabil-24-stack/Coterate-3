import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Create the prompt for GPT-4o
    const prompt = `This is a UI wireframe/sketch. Analyze it and identify all UI elements present, including:
- Type of each element (button, text field, dropdown, etc.)
- Approximate position and size
- Hierarchy and grouping
- Text content if readable
- Relationships between elements

Also provide a natural language description of what you see in the UI.

Return your analysis as a structured JSON object that follows this format:
{
  "elements": [
    {
      "type": "button",
      "position": {"x": 120, "y": 300},
      "dimensions": {"width": 100, "height": 40},
      "text": "Submit",
      "properties": {}
    },
    ...
  ],
  "layout": {
    "type": "vertical",
    "groups": []
  },
  "description": "A natural language description of the UI..."
}`;

    // Call the OpenAI API with the image URL and prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a UI/UX expert who specializes in analyzing user interfaces and design elements.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.2, // Low temperature for more accurate, consistent responses
      response_format: { type: 'json_object' },
    });

    // Extract the JSON from the response
    const responseText = response.choices[0]?.message?.content || '{}';
    const analysisResult = JSON.parse(responseText);

    return res.status(200).json(analysisResult);
  } catch (error: any) {
    console.error('Error analyzing UI image:', error);
    return res.status(500).json({
      message: 'Failed to analyze UI image',
      error: error.message || 'Unknown error',
    });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

const UI_ANALYSIS_PROMPT = `
You are an expert UI/UX designer and analyst specialized in analyzing UI wireframes and mockups.
This is a UI wireframe/sketch. Analyze it and identify all UI elements present, including:
- Type of each element (button, text field, dropdown, etc.)
- Approximate position and size
- Hierarchy and grouping
- Text content if readable
- Relationships between elements

Use the positions and dimensions from the image, estimating the coordinates and sizes of elements.
For positions, return values where the top-left corner of the image is (0,0).

Return your analysis as a structured JSON object that follows this format:
{
  "description": "A brief overview of what you see in the design",
  "elements": [
    {
      "type": "button",
      "position": {"x": 120, "y": 300},
      "dimensions": {"width": 100, "height": 40},
      "text": "Submit",
      "properties": {}
    },
    ...
  ]
}
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Ensure the base64 string is properly formatted for the API
    const formattedBase64 = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: UI_ANALYSIS_PROMPT
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this UI design:' },
              { type: 'image_url', image_url: { url: formattedBase64 } }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ error: 'Error calling OpenAI API', details: errorData });
    }

    const data = await response.json();
    
    // Parse the response to extract the content
    try {
      const analysisContent = JSON.parse(data.choices[0].message.content);
      return res.status(200).json(analysisContent);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return res.status(500).json({ error: 'Failed to parse analysis results' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

const UI_ANALYSIS_PROMPT = `
You are an expert UI/UX designer and frontend developer specialized in analyzing UI wireframes and mockups.
This is a UI wireframe/sketch. First, analyze it and identify all UI elements present, including:
- Type of each element (button, text field, dropdown, etc.)
- Approximate position and size
- Hierarchy and grouping
- Text content if readable
- Relationships between elements

Use the positions and dimensions from the image, estimating the coordinates and sizes of elements.
For positions, return values where the top-left corner of the image is (0,0).

Based on this analysis, generate the following:
1. A detailed description of the UI
2. The semantic HTML5 markup that represents this UI
3. The CSS code needed to style the HTML to match the design
4. Both the HTML and CSS should be optimized for web standards and performance
5. Include appropriate accessibility attributes (aria-labels, alt text, etc.)

Return your response as a structured JSON object that follows this format:
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
  ],
  "html": "The complete HTML markup for the UI",
  "css": "The complete CSS code to style the UI"
}
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key is not configured' });
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
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20240620',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: UI_ANALYSIS_PROMPT },
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64.replace(/^data:image\/\w+;base64,/, '') } }
            ]
          }
        ],
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return res.status(response.status).json({ error: 'Error calling Anthropic API', details: errorData });
    }

    const data = await response.json();
    
    // Parse the response to extract the content
    try {
      const contentText = data.content[0].text;
      let analysisContent;
      
      // Extract JSON object from the response text if needed
      const jsonMatch = contentText.match(/```json\n([\s\S]*?)\n```/) || 
                        contentText.match(/```\n([\s\S]*?)\n```/) ||
                        contentText.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        analysisContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        analysisContent = JSON.parse(contentText);
      }
      
      return res.status(200).json(analysisContent);
    } catch (error) {
      console.error('Error parsing Anthropic response:', error);
      return res.status(500).json({ error: 'Failed to parse analysis results' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
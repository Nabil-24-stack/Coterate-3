import { DesignIteration } from '@/types';

const API_URL = 'https://api.openai.com/v1/chat/completions';

type AIAnalysisResponse = {
  elements: Array<{
    type: string;
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
    text?: string;
    properties: Record<string, any>;
  }>;
  layout: {
    type: string;
    groups: Array<any>;
  };
  description: string; // Natural language description
};

export async function analyzeUIDesign(design: DesignIteration): Promise<AIAnalysisResponse> {
  try {
    // Convert image URL to base64 for API
    const imageBase64 = await fetchImageAsBase64(design.imageUrl);
    
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert UI/UX designer with extensive knowledge of interface patterns and components.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `This is a UI wireframe/sketch. Analyze it and identify all UI elements present, including:
                - Type of each element (button, text field, dropdown, etc.)
                - Approximate position and size
                - Hierarchy and grouping
                - Text content if readable
                - Relationships between elements
                
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
                  "description": "A detailed natural language description of the UI..."
                }
                
                In addition to the structured JSON, include a natural language description that explains the overall UI, its purpose, and key interactions.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract the JSON response from the message content
    const content = data.choices[0].message.content;
    
    // Parse the JSON response - handle potential formatting issues
    let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                    content.match(/```\n([\s\S]*?)\n```/) ||
                    content.match(/\{[\s\S]*\}/);
                    
    let jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    
    // Clean the string if needed
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n|```\n|```/g, '');
    }
    
    const analysisResult = JSON.parse(jsonStr) as AIAnalysisResponse;
    
    return analysisResult;
  } catch (error) {
    console.error('Error analyzing UI design:', error);
    throw error;
  }
}

// Helper function to convert image URL to base64
async function fetchImageAsBase64(url: string): Promise<string> {
  // For local blob URLs, we need to fetch them first
  const response = await fetch(url);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = base64data.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
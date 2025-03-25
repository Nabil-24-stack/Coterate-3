/**
 * OpenAI API service for analyzing UI images
 */
import { UIElement, UIAnalysisResult } from '@/types';

/**
 * Analyzes a UI image using OpenAI's GPT-4o Vision model
 * @param imageUrl URL of the image to analyze
 * @returns UI analysis result with structured element data and description
 */
export async function analyzeUIImage(imageUrl: string): Promise<UIAnalysisResult> {
  try {
    const response = await fetch('/api/analyze-ui', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze UI image');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing UI image:', error);
    throw error;
  }
}
import { AIAnalysis } from '@/types';

/**
 * Converts an image URL to a base64 string
 * @param url The image URL to convert
 * @returns A Promise resolving to the base64 representation of the image
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    // For URLs created with URL.createObjectURL
    if (url.startsWith('blob:')) {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Extract the base64 part if it's a data URL
          const base64 = base64String.split(',')[1] || base64String;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    // For regular URLs
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract the base64 part if it's a data URL
        const base64 = base64String.split(',')[1] || base64String;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
}

/**
 * Sends an image to the OpenAI API for UI analysis
 * @param imageBase64 The base64-encoded image to analyze
 * @returns A Promise resolving to the analysis results
 */
export async function analyzeUIDesign(imageBase64: string): Promise<AIAnalysis> {
  try {
    const response = await fetch('/api/analyze-ui', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error analyzing UI: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data as AIAnalysis;
  } catch (error) {
    console.error('Error calling analyze API:', error);
    throw error;
  }
}
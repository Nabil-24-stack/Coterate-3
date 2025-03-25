export interface Position {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface Feedback {
  text: string;
  author: string;
  timestamp: string;
}

export interface AIAnalysisElement {
  type: string;
  text?: string;
  position: Position;
  dimensions: Dimension;
  properties: Record<string, any>;
}

export interface AIAnalysis {
  description: string;
  elements: AIAnalysisElement[];
}

export interface DesignIteration {
  id: string;
  name: string;
  imageUrl: string;
  pageId: string;
  position: Position;
  dimensions?: Dimension;
  feedback: Feedback | null;
  analysis?: AIAnalysis;
  timestamp: string;
}

export interface Page {
  id: string;
  name: string;
  number: number;
}
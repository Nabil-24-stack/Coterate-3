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
  title: string;
  description: string;
  score?: number;
  confidence?: number;
}

export interface AIAnalysis {
  elements: AIAnalysisElement[];
  overallScore?: number;
  timestamp: string;
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
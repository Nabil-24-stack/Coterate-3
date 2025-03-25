export interface Position {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface Feedback {
  comment: string;
  reviewer: string;
  timestamp: string;
}

export interface UIElement {
  type: string;
  position: Position;
  dimensions: Dimension;
  text?: string;
  properties: Record<string, any>;
}

export interface LayoutGroup {
  type: string;
  elements: string[];
  groups?: LayoutGroup[];
}

export interface UIAnalysisResult {
  elements: UIElement[];
  layout: {
    type: string;
    groups: LayoutGroup[];
  };
  description: string;
}

export interface AIAnalysis {
  elements: UIElement[];
  layout: {
    type: string;
    groups: any[];
  };
  description: string;
  timestamp: string;
}

export interface DesignIteration {
  id: string;
  name: string;
  pageId: string;
  imageUrl: string;
  position: Position;
  dimensions?: Dimension;
  feedback: Feedback | null;
  timestamp: string;
  aiAnalysis?: AIAnalysis;
}

export interface Page {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
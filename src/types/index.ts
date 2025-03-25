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

export interface DesignIteration {
  id: string;
  name: string;
  pageId: string;
  imageUrl: string;
  position: Position;
  dimensions?: Dimension;
  feedback: Feedback | null;
  timestamp: string;
}

export interface Page {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
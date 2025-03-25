# Coterate

A lightweight UI design annotation and feedback tool with canvas capabilities.

## New Feature: GPT-4o AI Analysis

The application now includes AI-powered design analysis using OpenAI's GPT-4o model. When you click the plus button next to a selected UI design, the system will:

1. Send the image to OpenAI's API for analysis
2. Process the visual elements and identify UI components
3. Return a structured breakdown of all UI elements
4. Display both a natural language description and a detailed list of identified components

### Setup Instructions

To use the AI analysis feature, you need to configure your OpenAI API key:

1. Create a `.env.local` file in the root directory
2. Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`
3. Restart the development server

Note: In the current build, we've included a mock API response to avoid build failures. To use the actual OpenAI integration in production, uncomment the OpenAI API code in `src/pages/api/analyze-ui.ts`.

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Interactive canvas with zoom and pan functionality
- Import designs by pasting images (Ctrl+V)
- Select and move design elements
- AI-powered UI analysis (with GPT-4o)
- Keyboard shortcuts for common actions:
  - Ctrl+0: Reset zoom
  - Ctrl+/Ctrl-: Zoom in/out
  - Delete/Backspace: Remove selected design
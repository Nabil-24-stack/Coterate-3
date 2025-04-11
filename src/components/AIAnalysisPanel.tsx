import React, { useState } from 'react';
import styled from 'styled-components';
import { AIAnalysis } from '@/types';

const AnalysisPanelContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 380px;
  max-height: calc(100vh - 40px);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  z-index: 100;
  padding: 16px;
  display: flex;
  flex-direction: column;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 12px;
  margin-bottom: 16px;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: 8px 16px;
  background: ${props => props.$isActive ? '#f0f0f0' : 'transparent'};
  border: none;
  border-bottom: ${props => props.$isActive ? '2px solid #007bff' : 'none'};
  color: ${props => props.$isActive ? '#007bff' : '#666'};
  font-weight: ${props => props.$isActive ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
    color: #007bff;
  }
`;

const DescriptionSection = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #555;
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #444;
`;

const ElementsSection = styled.div`
  margin-bottom: 16px;
`;

const ElementsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ElementItem = styled.li`
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
`;

const ElementType = styled.span`
  font-weight: 600;
  color: #007bff;
`;

const ElementProperty = styled.div`
  margin-top: 4px;
  display: flex;
  
  &:not(:last-child) {
    margin-bottom: 2px;
  }
`;

const PropertyLabel = styled.span`
  font-weight: 500;
  margin-right: 8px;
  min-width: 80px;
  color: #666;
`;

const PropertyValue = styled.span`
  color: #333;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #666;
  font-size: 14px;
`;

const CodePanel = styled.div`
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-x: auto;
  color: #333;
  line-height: 1.5;
`;

const ExportButton = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 8px;
  
  &:hover {
    background-color: #0056b3;
  }
`;

type TabType = 'analysis' | 'html' | 'css' | 'preview';

interface AIAnalysisPanelProps {
  analysis: AIAnalysis | null;
  isLoading: boolean;
  onClose: () => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ analysis, isLoading, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  
  if (isLoading) {
    return (
      <AnalysisPanelContainer>
        <PanelHeader>
          <PanelTitle>Analyzing UI...</PanelTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </PanelHeader>
        <LoadingIndicator>
          <div>Processing your UI design with AI...</div>
        </LoadingIndicator>
      </AnalysisPanelContainer>
    );
  }

  if (!analysis) {
    return null;
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <AnalysisPanelContainer>
      <PanelHeader>
        <PanelTitle>AI Analysis Results</PanelTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </PanelHeader>
      
      <TabContainer>
        <Tab 
          $isActive={activeTab === 'analysis'} 
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </Tab>
        {analysis.html && (
          <Tab 
            $isActive={activeTab === 'html'} 
            onClick={() => setActiveTab('html')}
          >
            HTML
          </Tab>
        )}
        {analysis.css && (
          <Tab 
            $isActive={activeTab === 'css'} 
            onClick={() => setActiveTab('css')}
          >
            CSS
          </Tab>
        )}
        {analysis.html && analysis.css && (
          <Tab 
            $isActive={activeTab === 'preview'} 
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </Tab>
        )}
      </TabContainer>
      
      {activeTab === 'analysis' && (
        <>
          <DescriptionSection>
            <SectionTitle>Overview</SectionTitle>
            <Description>{analysis.description}</Description>
          </DescriptionSection>
          
          <ElementsSection>
            <SectionTitle>Detected Elements ({analysis.elements.length})</SectionTitle>
            <ElementsList>
              {analysis.elements.map((element, index) => (
                <ElementItem key={index}>
                  <ElementType>{element.type}</ElementType>
                  {element.text && (
                    <ElementProperty>
                      <PropertyLabel>Text:</PropertyLabel>
                      <PropertyValue>{element.text}</PropertyValue>
                    </ElementProperty>
                  )}
                  <ElementProperty>
                    <PropertyLabel>Position:</PropertyLabel>
                    <PropertyValue>x: {element.position.x}, y: {element.position.y}</PropertyValue>
                  </ElementProperty>
                  <ElementProperty>
                    <PropertyLabel>Size:</PropertyLabel>
                    <PropertyValue>{element.dimensions.width}×{element.dimensions.height}</PropertyValue>
                  </ElementProperty>
                  {Object.keys(element.properties).length > 0 && (
                    <ElementProperty>
                      <PropertyLabel>Properties:</PropertyLabel>
                      <PropertyValue>
                        {Object.entries(element.properties).map(([key, value]) => (
                          <div key={key}>{key}: {String(value)}</div>
                        ))}
                      </PropertyValue>
                    </ElementProperty>
                  )}
                </ElementItem>
              ))}
            </ElementsList>
          </ElementsSection>
        </>
      )}
      
      {activeTab === 'html' && analysis.html && (
        <div>
          <SectionTitle>Generated HTML</SectionTitle>
          <CodePanel>{analysis.html}</CodePanel>
          <ExportButton onClick={() => copyToClipboard(analysis.html || '')}>
            Copy HTML
          </ExportButton>
        </div>
      )}
      
      {activeTab === 'css' && analysis.css && (
        <div>
          <SectionTitle>Generated CSS</SectionTitle>
          <CodePanel>{analysis.css}</CodePanel>
          <ExportButton onClick={() => copyToClipboard(analysis.css || '')}>
            Copy CSS
          </ExportButton>
        </div>
      )}
      
      {activeTab === 'preview' && analysis.html && analysis.css && (
        <div>
          <SectionTitle>Live Preview</SectionTitle>
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              height: '400px',
              overflow: 'auto',
              marginBottom: '16px'
            }}
          >
            <iframe
              srcDoc={`
                <html>
                  <head>
                    <style>${analysis.css}</style>
                  </head>
                  <body>
                    ${analysis.html}
                  </body>
                </html>
              `}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Preview"
            />
          </div>
          <ExportButton 
            onClick={() => 
              copyToClipboard(`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Generated UI</title>
                  <style>
                  ${analysis.css}
                  </style>
                </head>
                <body>
                ${analysis.html}
                </body>
                </html>
              `)
            }
          >
            Copy Full HTML Document
          </ExportButton>
        </div>
      )}
    </AnalysisPanelContainer>
  );
};

export default AIAnalysisPanel;
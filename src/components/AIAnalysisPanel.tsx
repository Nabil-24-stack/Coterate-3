import React from 'react';
import styled from 'styled-components';
import { AIAnalysis } from '@/types';

const AnalysisPanelContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 320px;
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

interface AIAnalysisPanelProps {
  analysis: AIAnalysis | null;
  isLoading: boolean;
  onClose: () => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ analysis, isLoading, onClose }) => {
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

  return (
    <AnalysisPanelContainer>
      <PanelHeader>
        <PanelTitle>AI Analysis Results</PanelTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </PanelHeader>
      
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
    </AnalysisPanelContainer>
  );
};

export default AIAnalysisPanel;
import React from 'react';
import styled from 'styled-components';
import { UIAnalysisResult } from '@/types';

const ResultContainer = styled.div<{ $scale: number; $position: { x: number; y: number } }>`
  position: absolute;
  left: ${props => props.$position.x}px;
  top: ${props => props.$position.y + 20}px;
  transform: translate(-50%, 0) scale(${props => 1 / props.$scale});
  transform-origin: top center;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 16px;
  max-width: 500px;
  width: 100%;
  z-index: 30;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
  margin-bottom: 12px;
`;

const ResultTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 20px;
  transition: color 0.2s;
  
  &:hover {
    color: #333;
  }
`;

const ResultDescription = styled.div`
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #555;
`;

const ElementsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border-top: 1px solid #eee;
  padding-top: 12px;
`;

const ElementItem = styled.div`
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ElementType = styled.span`
  font-weight: 600;
  margin-right: 8px;
  color: #007bff;
`;

const ElementDetails = styled.div`
  font-size: 12px;
  color: #777;
  margin-top: 4px;
`;

interface UIAnalysisResultsProps {
  result: UIAnalysisResult;
  position: { x: number; y: number };
  scale: number;
  onClose: () => void;
}

const UIAnalysisResults: React.FC<UIAnalysisResultsProps> = ({ 
  result, 
  position, 
  scale, 
  onClose 
}) => {
  return (
    <ResultContainer $position={position} $scale={scale}>
      <ResultHeader>
        <ResultTitle>UI Analysis</ResultTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </ResultHeader>
      
      <ResultDescription>
        {result.description}
      </ResultDescription>
      
      <ElementsList>
        {result.elements.map((element, index) => (
          <ElementItem key={index}>
            <ElementType>{element.type}</ElementType>
            {element.text && <span>"{element.text}"</span>}
            <ElementDetails>
              Position: x:{Math.round(element.position.x)}, y:{Math.round(element.position.y)} | 
              Size: {Math.round(element.dimensions.width)}×{Math.round(element.dimensions.height)}
            </ElementDetails>
          </ElementItem>
        ))}
      </ElementsList>
    </ResultContainer>
  );
};

export default UIAnalysisResults;
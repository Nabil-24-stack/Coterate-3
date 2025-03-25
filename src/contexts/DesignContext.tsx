import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DesignIteration, AIAnalysis } from '@/types';
import { usePageContext } from './PageContext';

interface DesignContextType {
  designs: DesignIteration[];
  addDesign: (design: Omit<DesignIteration, 'id' | 'timestamp'>) => string;
  removeDesign: (id: string) => void;
  updateDesignPosition: (id: string, position: { x: number; y: number }) => void;
  updateDesignAIAnalysis: (id: string, analysis: AIAnalysis) => void;
  getDesignsForCurrentPage: () => DesignIteration[];
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const useDesignContext = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesignContext must be used within a DesignProvider');
  }
  return context;
};

interface DesignProviderProps {
  children: ReactNode;
}

export const DesignProvider: React.FC<DesignProviderProps> = ({ children }) => {
  const [designs, setDesigns] = useState<DesignIteration[]>([]);
  const { currentPage } = usePageContext();

  const addDesign = (design: Omit<DesignIteration, 'id' | 'timestamp'>) => {
    const newId = uuidv4();
    const newDesign: DesignIteration = {
      ...design,
      id: newId,
      timestamp: new Date().toISOString(),
    };
    
    setDesigns(prev => [...prev, newDesign]);
    return newId;
  };
  
  const removeDesign = (id: string) => {
    setDesigns(prev => prev.filter(design => design.id !== id));
  };
  
  const updateDesignPosition = (id: string, position: { x: number; y: number }) => {
    setDesigns(prev => 
      prev.map(design => 
        design.id === id 
          ? { ...design, position } 
          : design
      )
    );
  };
  
  const updateDesignAIAnalysis = (id: string, analysis: AIAnalysis) => {
    setDesigns(prev => 
      prev.map(design => 
        design.id === id 
          ? { ...design, analysis } 
          : design
      )
    );
  };
  
  const getDesignsForCurrentPage = () => {
    return designs.filter(design => design.pageId === currentPage.id);
  };
  
  return (
    <DesignContext.Provider value={{ 
      designs, 
      addDesign, 
      removeDesign, 
      updateDesignPosition,
      updateDesignAIAnalysis,
      getDesignsForCurrentPage 
    }}>
      {children}
    </DesignContext.Provider>
  );
};
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DesignIteration, Position } from '@/types';
import { usePageContext } from './PageContext';

// Generate a random ID (since uuid is not available)
function generateId() {
  return `design-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface DesignContextType {
  designs: DesignIteration[];
  addDesign: (design: Omit<DesignIteration, 'id' | 'timestamp'>) => void;
  removeDesign: (id: string) => void;
  getDesignsForCurrentPage: () => DesignIteration[];
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export function useDesignContext() {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesignContext must be used within a DesignProvider');
  }
  return context;
}

interface DesignProviderProps {
  children: ReactNode;
}

export function DesignProvider({ children }: DesignProviderProps) {
  const [designs, setDesigns] = useState<DesignIteration[]>([]);
  const { currentPage } = usePageContext();

  const addDesign = (design: Omit<DesignIteration, 'id' | 'timestamp'>) => {
    const newDesign: DesignIteration = {
      ...design,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    
    setDesigns(prev => [...prev, newDesign]);
  };
  
  const removeDesign = (id: string) => {
    setDesigns(prev => prev.filter(design => design.id !== id));
  };
  
  const getDesignsForCurrentPage = () => {
    return designs.filter(design => design.pageId === currentPage.id);
  };

  const value = {
    designs,
    addDesign,
    removeDesign,
    getDesignsForCurrentPage,
  };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
} 
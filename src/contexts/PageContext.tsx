import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Page } from '@/types';

interface PageContextType {
  pages: Page[];
  currentPage: Page;
  addPage: (name: string) => void;
  setCurrentPage: (pageId: string) => void;
  renamePage: (pageId: string, newName: string) => void;
  deletePage: (pageId: string) => void;
}

const currentTimestamp = new Date().toISOString();

const defaultPage: Page = {
  id: 'page-1',
  name: 'Page 1',
  createdAt: currentTimestamp,
  updatedAt: currentTimestamp
};

const defaultValue: PageContextType = {
  pages: [defaultPage],
  currentPage: defaultPage,
  addPage: () => {},
  setCurrentPage: () => {},
  renamePage: () => {},
  deletePage: () => {}
};

const PageContext = createContext<PageContextType>(defaultValue);

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const [pages, setPages] = useState<Page[]>([defaultPage]);
  const [currentPage, setCurrentPageState] = useState<Page>(defaultPage);

  const addPage = (name: string) => {
    const timestamp = new Date().toISOString();
    const newPage: Page = {
      id: `page-${Date.now()}`,
      name,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    // Add the new page to the bottom of the list
    setPages([...pages, newPage]);
    setCurrentPageState(newPage); // Auto-select new page
  };

  const setCurrentPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setCurrentPageState(page);
    }
  };

  const renamePage = (pageId: string, newName: string) => {
    const timestamp = new Date().toISOString();
    const updatedPages = pages.map(page => 
      page.id === pageId 
        ? { ...page, name: newName, updatedAt: timestamp } 
        : page
    );
    setPages(updatedPages);
    
    // Update current page if it was renamed
    if (currentPage.id === pageId) {
      setCurrentPageState({ ...currentPage, name: newName, updatedAt: timestamp });
    }
  };

  const deletePage = (pageId: string) => {
    // Don't allow deleting if it's the only page
    if (pages.length <= 1) return;
    
    const updatedPages = pages.filter(page => page.id !== pageId);
    setPages(updatedPages);
    
    // If the current page is being deleted, select the first available page
    if (currentPage.id === pageId) {
      setCurrentPageState(updatedPages[0]);
    }
  };

  return (
    <PageContext.Provider value={{ 
      pages, 
      currentPage, 
      addPage, 
      setCurrentPage,
      renamePage,
      deletePage
    }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => useContext(PageContext);
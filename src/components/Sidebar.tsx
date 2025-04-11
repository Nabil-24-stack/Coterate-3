import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { usePageContext } from '@/contexts/PageContext';
import { useDesignContext } from '@/contexts/DesignContext';
import AIAnalysisPanel from './AIAnalysisPanel';
import { AIAnalysis } from '@/types';

const SidebarContainer = styled.div`
  width: 280px;
  height: 100%;
  background-color: #F8F8F8;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const NewButton = styled.button`
  margin: 16px;
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 500;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SectionTitle = styled.div`
  padding: 12px 16px 4px;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PageList = styled.div`
  overflow-y: auto;
`;

const DesignsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const PageItem = styled.div<{ $isActive: boolean }>`
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background-color: ${props => props.$isActive ? '#EFEFEF' : 'transparent'};
  position: relative;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const DesignItem = styled.div<{ $isSelected: boolean }>`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  background-color: ${props => props.$isSelected ? '#EFEFEF' : 'transparent'};
  position: relative;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const DesignThumbnail = styled.div`
  height: 100px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
`;

const DesignImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const DesignName = styled.div`
  font-size: 13px;
  font-weight: 500;
`;

const PageName = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const ActionButton = styled.button`
  opacity: 0.5;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
`;

const AnalyzeButton = styled.button`
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  right: 16px;
  margin-top: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  width: 100px;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const InputContainer = styled.div`
  margin: 8px 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const UserInfo = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: 600;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const UserPlan = styled.div`
  font-size: 12px;
  color: #888;
`;

const EmptyState = styled.div`
  padding: 24px 16px;
  text-align: center;
  color: #888;
  font-size: 13px;
`;

const Sidebar: React.FC = () => {
  const { pages, currentPage, addPage, setCurrentPage, renamePage, deletePage } = usePageContext();
  const { designs, getDesignsForCurrentPage, updateDesignAIAnalysis } = useDesignContext();
  const [isRenamingPage, setIsRenamingPage] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState<boolean>(false);
  
  const outsideClickRef = useRef<HTMLDivElement>(null);
  
  const currentDesigns = getDesignsForCurrentPage();
  
  // Client-side image compression utility
  const compressImageClientSide = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed base64 (JPEG, quality 0.8)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedBase64);
      };
      
      img.onerror = (err) => {
        console.error('Error loading image for compression:', err);
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = imageUrl;
    });
  };

  const handleAddPage = () => {
    // Add a new page with default title
    addPage("Untitled");
  };
  
  const handleRenamePage = (pageId: string) => {
    if (renameValue.trim()) {
      renamePage(pageId, renameValue);
      setIsRenamingPage(null);
      setRenameValue('');
      setOpenDropdown(null);
    }
  };
  
  const handleRenameKeyDown = (e: React.KeyboardEvent, pageId: string) => {
    if (e.key === 'Enter') {
      handleRenamePage(pageId);
    } else if (e.key === 'Escape') {
      setIsRenamingPage(null);
      setRenameValue('');
    }
  };
  
  const toggleDropdown = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === pageId ? null : pageId);
  };
  
  const startRenaming = (e: React.MouseEvent, pageId: string, pageName: string) => {
    e.stopPropagation();
    setIsRenamingPage(pageId);
    setRenameValue(pageName);
    setOpenDropdown(null);
  };
  
  const handleDeletePage = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    deletePage(pageId);
    setOpenDropdown(null);
  };
  
  const handleDesignSelect = (designId: string) => {
    setSelectedDesign(designId === selectedDesign ? null : designId);
  };
  
  const handleAnalyzeDesign = async (retryCount = 0) => {
    if (!selectedDesign) return;
    
    const design = designs.find(d => d.id === selectedDesign);
    if (!design) return;
    
    // Only set analyzing state on the first attempt
    if (retryCount === 0) {
      setIsAnalyzing(true);
      setShowAnalysisPanel(true);
      setAnalysisResult(null); // Clear previous results
    }
    
    try {
      // Compress image client-side first
      const compressedBase64DataUrl = await compressImageClientSide(design.imageUrl);
      const base64Image = compressedBase64DataUrl.split(',')[1]; // Extract base64 part
      
      console.log('Compressed image size (approx):', Math.round(base64Image.length * 0.75 / 1024), 'KB');
      
      // Call the API with the compressed image
      const response = await fetch('/api/analyze-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: base64Image // Send only the base64 string
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        updateDesignAIAnalysis(selectedDesign, data);
        setIsAnalyzing(false); // Analysis successful
      } else {
        // Handle specific errors like overload
        if (response.status === 529) {
          console.warn('Anthropic API overloaded (529).');
          const maxRetries = 2;
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff (1s, 2s)
            console.log(`Retrying analysis in ${delay / 1000}s... (Attempt ${retryCount + 1}/${maxRetries})`);
            setTimeout(() => handleAnalyzeDesign(retryCount + 1), delay);
            // Keep loading state active while retrying
            return; 
          } else {
            alert('The AI service is currently overloaded. Please try again in a few moments.');
            setIsAnalyzing(false);
          }
        } else {
          // Handle other errors
          const errorText = await response.text();
          console.error('Failed to analyze design:', response.status, errorText);
          try {
            const errorDetails = JSON.parse(errorText);
            alert(`Failed to analyze design: ${errorDetails.error || 'Unknown error'} (Status: ${response.status})`);
          } catch (parseError) {
            alert(`Failed to analyze design. Status: ${response.status}`);
          }
          setIsAnalyzing(false);
        }
      }
      
    } catch (error: any) {
      console.error('Error during analysis process:', error);
      alert(`An error occurred: ${error.message}`);
      setIsAnalyzing(false);
    }
  };
  
  const closeAnalysisPanel = () => {
    setShowAnalysisPanel(false);
    setAnalysisResult(null);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (outsideClickRef.current && !outsideClickRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <SidebarContainer ref={outsideClickRef}>
      <NewButton onClick={handleAddPage}>
        New Page
      </NewButton>
      
      <SectionTitle>Pages</SectionTitle>
      <PageList>
        {pages.map(page => (
          <PageItem 
            key={page.id}
            $isActive={page.id === currentPage.id}
            onClick={() => setCurrentPage(page.id)}
          >
            {isRenamingPage === page.id ? (
              <Input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => handleRenameKeyDown(e, page.id)}
                onBlur={() => handleRenamePage(page.id)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <PageName>{page.name}</PageName>
                <ActionButton 
                  title="Options" 
                  onClick={(e) => toggleDropdown(e, page.id)}
                >
                  ⋯
                </ActionButton>
                
                <Dropdown $isOpen={openDropdown === page.id}>
                  <DropdownItem onClick={(e) => startRenaming(e, page.id, page.name)}>
                    Rename
                  </DropdownItem>
                  <DropdownItem onClick={(e) => handleDeletePage(e, page.id)}>
                    Delete
                  </DropdownItem>
                </Dropdown>
              </>
            )}
          </PageItem>
        ))}
      </PageList>
      
      <SectionTitle>Designs</SectionTitle>
      <DesignsList>
        {currentDesigns.length === 0 ? (
          <EmptyState>
            No designs on this page.
            <br />
            Paste or drag an image to get started.
          </EmptyState>
        ) : (
          currentDesigns.map(design => (
            <DesignItem 
              key={design.id}
              $isSelected={design.id === selectedDesign}
              onClick={() => handleDesignSelect(design.id)}
            >
              <DesignThumbnail>
                <DesignImage src={design.imageUrl} alt={design.name} />
              </DesignThumbnail>
              <DesignName>{design.name}</DesignName>
              {design.id === selectedDesign && (
                <AnalyzeButton 
                  onClick={() => handleAnalyzeDesign()} 
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze UI'}
                </AnalyzeButton>
              )}
            </DesignItem>
          ))
        )}
      </DesignsList>
      
      <UserInfo>
        <Avatar>N</Avatar>
        <UserDetails>
          <UserName>nabilhasan24@gmail.com</UserName>
          <UserPlan>Free</UserPlan>
        </UserDetails>
      </UserInfo>
      
      {showAnalysisPanel && (
        <AIAnalysisPanel 
          analysis={analysisResult} 
          isLoading={isAnalyzing}
          onClose={closeAnalysisPanel}
        />
      )}
    </SidebarContainer>
  );
};

export default Sidebar; 
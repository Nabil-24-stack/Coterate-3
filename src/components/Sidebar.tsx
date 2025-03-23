import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { usePageContext } from '@/contexts/PageContext';

const SidebarContainer = styled.div`
  width: 240px;
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

const PageList = styled.div`
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

const PageName = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const ActionButton = styled.button`
  opacity: 0.5;
  &:hover {
    opacity: 1;
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

const Sidebar: React.FC = () => {
  const { pages, currentPage, addPage, setCurrentPage, renamePage, deletePage } = usePageContext();
  const [isRenamingPage, setIsRenamingPage] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const outsideClickRef = useRef<HTMLDivElement>(null);
  
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
      
      <UserInfo>
        <Avatar>N</Avatar>
        <UserDetails>
          <UserName>nabilhasan24@gmail.com</UserName>
          <UserPlan>Free</UserPlan>
        </UserDetails>
      </UserInfo>
    </SidebarContainer>
  );
};

export default Sidebar; 
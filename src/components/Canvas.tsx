import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { usePageContext } from '@/contexts/PageContext';
import { useDesignContext } from '@/contexts/DesignContext';
import { Position, DesignIteration } from '@/types';

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color:rgb(232, 232, 232);
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const CanvasGrid = styled.div<{ $scale: number; $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background-size: ${props => 20 * props.$scale}px ${props => 20 * props.$scale}px;
  background-image: linear-gradient(to right, #e8e8e8 1px, transparent 1px),
                    linear-gradient(to bottom, #e8e8e8 1px, transparent 1px);
  background-position: 0 0;
  opacity: 0.5;
`;

const CanvasContent = styled.div<{ $scale: number; $position: Position }>`
  position: absolute;
  transform-origin: 0 0;
  transform: translate(${props => props.$position.x}px, ${props => props.$position.y}px) scale(${props => props.$scale});
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const DesignItem = styled.div<{ $position: Position; $isSelected: boolean }>`
  position: absolute;
  left: ${props => props.$position.x}px;
  top: ${props => props.$position.y}px;
  user-select: none;
  border: ${props => props.$isSelected ? '3px solid #007bff' : '2px solid transparent'};
  box-shadow: ${props => props.$isSelected ? '0 0 8px rgba(0, 123, 255, 0.5)' : 'none'};
  transform: translate(-50%, -50%);
  z-index: 10;
  
  &:hover {
    box-shadow: ${props => props.$isSelected ? '0 0 8px rgba(0, 123, 255, 0.5)' : '0 0 0 1px rgba(0, 0, 0, 0.1)'};
  }
`;

const DesignImageWrapper = styled.div<{ $dimensions?: { width: number; height: number } }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$dimensions ? `${props.$dimensions.width}px` : 'auto'};
  height: ${props => props.$dimensions ? `${props.$dimensions.height}px` : 'auto'};
  position: relative;
`;

const DesignImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  display: block;
  pointer-events: none;
`;

const PlusButton = styled.button`
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:focus {
    outline: none;
  }
`;

const Canvas: React.FC = () => {
  const { currentPage } = usePageContext();
  const { designs, addDesign, removeDesign, getDesignsForCurrentPage } = useDesignContext();
  
  const [scale, setScale] = useState<number>(1);
  const [canvasPosition, setCanvasPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Get current viewport center position in canvas coordinates
  const getViewportCenter = (): Position => {
    if (!canvasRef.current) return { x: 100, y: 100 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Get the center of the visible viewport in window coordinates
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Convert to canvas coordinates
    const canvasCenterX = (centerX - canvasPosition.x) / scale;
    const canvasCenterY = (centerY - canvasPosition.y) / scale;
    
    return { x: canvasCenterX, y: canvasCenterY };
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Zoom with ctrl+wheel
    if (e.ctrlKey) {
      // Calculate position of cursor relative to canvas
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Get mouse position relative to canvas
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate cursor position in the canvas coordinate space
      const mouseCanvasX = (mouseX - canvasPosition.x) / scale;
      const mouseCanvasY = (mouseY - canvasPosition.y) / scale;
      
      // Calculate zoom delta - larger scale changes at higher zoom levels
      const zoomFactor = 1.1;
      const delta = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
      const newScale = scale * delta; // Remove min/max limits
      
      // Calculate new canvas position to zoom toward cursor
      const newPosX = mouseX - mouseCanvasX * newScale;
      const newPosY = mouseY - mouseCanvasY * newScale;
      
      // Apply new scale and position
      setScale(newScale);
      setCanvasPosition({
        x: newPosX,
        y: newPosY
      });
    } else {
      // Pan with wheel
      const deltaX = e.deltaX * -1;
      const deltaY = e.deltaY * -1;
      setCanvasPosition({
        x: canvasPosition.x + deltaX,
        y: canvasPosition.y + deltaY
      });
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setSelectedDesign(null); // Deselect when clicking on canvas
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    // Handle canvas dragging
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setCanvasPosition({
        x: canvasPosition.x + deltaX,
        y: canvasPosition.y + deltaY
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleDesignClick = (designId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDesign(designId);
  };
  
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This will be implemented later - for now just prevent the click from deselecting
    console.log('Plus button clicked');
  };
  
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    // Get the current viewport center in canvas coordinates
    const viewportCenter = getViewportCenter();
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const url = URL.createObjectURL(blob);
          
          // Create a new image object to get the natural dimensions
          const img = new Image();
          img.onload = () => {
            const dimensions = {
              width: img.naturalWidth,
              height: img.naturalHeight
            };
            
            console.log('Pasting image at position:', viewportCenter);
            console.log('Image dimensions:', dimensions.width, 'x', dimensions.height);
            
            const mockDesign: Omit<DesignIteration, 'id' | 'timestamp'> = {
              name: 'Pasted Design',
              pageId: currentPage.id,
              imageUrl: url,
              position: viewportCenter,
              dimensions: dimensions,
              feedback: null
            };
            
            addDesign(mockDesign);
          };
          
          // Load the image from the blob to get its dimensions
          img.src = url;
        }
      }
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '0' && e.ctrlKey) {
        e.preventDefault();
        // Reset zoom to 1 and center the canvas
        setScale(1);
        setCanvasPosition({ x: 0, y: 0 });
      } else if ((e.key === '+' || e.key === '=') && e.ctrlKey) {
        e.preventDefault();
        // Increase zoom by 10% at a time
        const zoomFactor = 1.1;
        const newScale = scale * zoomFactor;
        
        // Zoom toward the center of the viewport
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Calculate the center position in canvas space
          const centerCanvasX = (centerX - canvasPosition.x) / scale;
          const centerCanvasY = (centerY - canvasPosition.y) / scale;
          
          // Calculate new position to zoom toward center
          const newPosX = centerX - centerCanvasX * newScale;
          const newPosY = centerY - centerCanvasY * newScale;
          
          setScale(newScale);
          setCanvasPosition({
            x: newPosX,
            y: newPosY
          });
        } else {
          setScale(newScale);
        }
      } else if (e.key === '-' && e.ctrlKey) {
        e.preventDefault();
        // Decrease zoom by 10% at a time
        const zoomFactor = 1.1;
        const newScale = scale / zoomFactor;
        
        // Zoom toward the center of the viewport
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Calculate the center position in canvas space
          const centerCanvasX = (centerX - canvasPosition.x) / scale;
          const centerCanvasY = (centerY - canvasPosition.y) / scale;
          
          // Calculate new position to zoom toward center
          const newPosX = centerX - centerCanvasX * newScale;
          const newPosY = centerY - centerCanvasY * newScale;
          
          setScale(newScale);
          setCanvasPosition({
            x: newPosX,
            y: newPosY
          });
        } else {
          setScale(newScale);
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedDesign) {
        // Delete selected design when Delete or Backspace key is pressed
        removeDesign(selectedDesign);
        setSelectedDesign(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [addDesign, removeDesign, currentPage.id, scale, canvasPosition, selectedDesign]);
  
  const currentDesigns = getDesignsForCurrentPage();
  
  // Format scale for display (as percentage)
  const displayScale = Math.round(scale * 100);
  
  // Add an additional handler for mouse leave to prevent stuck drags
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  return (
    <CanvasContainer
      ref={canvasRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <CanvasGrid $scale={scale} $isVisible={true} />
      <CanvasContent $scale={scale} $position={canvasPosition}>
        {currentDesigns.map(design => (
          <DesignItem
            key={design.id}
            $position={design.position}
            $isSelected={selectedDesign === design.id}
            onClick={(e) => handleDesignClick(design.id, e)}
          >
            <DesignImageWrapper $dimensions={design.dimensions}>
              <DesignImage src={design.imageUrl} alt={design.name} />
              {selectedDesign === design.id && (
                <PlusButton onClick={handlePlusClick}>+</PlusButton>
              )}
            </DesignImageWrapper>
          </DesignItem>
        ))}
      </CanvasContent>
    </CanvasContainer>
  );
};

export default Canvas;
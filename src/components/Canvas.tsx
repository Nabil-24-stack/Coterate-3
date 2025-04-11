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

const DesignItem = styled.div<{ $position: Position; $isSelected: boolean; $isDragging?: boolean }>`
  position: absolute;
  left: ${props => props.$position.x}px;
  top: ${props => props.$position.y}px;
  user-select: none;
  border: ${props => props.$isSelected ? '3px solid #007bff' : '2px solid transparent'};
  box-shadow: ${props => props.$isSelected ? '0 0 8px rgba(0, 123, 255, 0.5)' : 'none'};
  transform: translate(-50%, -50%);
  z-index: ${props => (props.$isSelected || props.$isDragging) ? 20 : 10};
  cursor: ${props => (props.$isSelected) ? 'move' : 'pointer'};
  
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

const PlusButtonContainer = styled.div<{ $dimensions?: { width: number; height: number } }>`
  position: absolute;
  right: ${props => props.$dimensions ? `-${5}px` : '-5px'};
  top: 50%;
  transform: translateY(-50%);
  z-index: 99;
`;

// Create a fixed-size container that will handle the scaling
const PlusButtonWrapper = styled.div<{ $scale: number }>`
  transform: scale(${props => 1 / props.$scale});
  transform-origin: left center;
`;

// The plus button itself with fixed size
const PlusButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;
  position: relative;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    background-color: white;
  }
  
  &::before {
    width: 16px;
    height: 2px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  &::after {
    width: 2px;
    height: 16px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

// New components for handling image inputs
const ImageInputControls = styled.div<{ $scale: number; $position: Position }>`
  position: absolute;
  left: ${props => props.$position.x}px;
  top: ${props => props.$position.y}px;
  transform: translate(-50%, -50%) scale(${props => 1 / props.$scale});
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  width: 300px;
`;

const InputControlTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
`;

const UploadButton = styled.label`
  background-color: #007bff;
  color: white;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 12px;
  text-align: center;
  width: 100%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const UrlInputGroup = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 12px;
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const UrlSubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const DragDropArea = styled.div`
  border: 2px dashed #aaa;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  width: 100%;
  margin-bottom: 12px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    color: #007bff;
  }
`;

const OrText = styled.div`
  margin: 8px 0;
  font-size: 14px;
  color: #666;
  position: relative;
  text-align: center;
  width: 100%;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background-color: #ddd;
  }
  
  &::before {
    left: 0;
  }
  
  &::after {
    right: 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

// Drag overlay component that appears when dragging over the canvas
const DragOverlay = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 123, 255, 0.1);
  border: 3px dashed #007bff;
  z-index: 999;
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const DragOverlayText = styled.div`
  background-color: white;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const AddImageButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const Canvas: React.FC = () => {
  const { currentPage } = usePageContext();
  const { designs, addDesign, removeDesign, updateDesignPosition, getDesignsForCurrentPage } = useDesignContext();
  
  const [scale, setScale] = useState<number>(1);
  const [canvasPosition, setCanvasPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  
  // States for design dragging
  const [isDraggingDesign, setIsDraggingDesign] = useState<boolean>(false);
  const [designDragStart, setDesignDragStart] = useState<Position>({ x: 0, y: 0 });
  const [designInitialPosition, setDesignInitialPosition] = useState<Position | null>(null);
  
  // New states for image input
  const [isImageInputVisible, setIsImageInputVisible] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      
      // Close image input controls if open
      if (isImageInputVisible) {
        setIsImageInputVisible(false);
      }
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
    
    // Handle design dragging
    if (isDraggingDesign && selectedDesign && designInitialPosition) {
      e.stopPropagation();
      
      // Calculate the delta in screen coordinates
      const deltaX = e.clientX - designDragStart.x;
      const deltaY = e.clientY - designDragStart.y;
      
      // Convert the delta to canvas coordinates
      const deltaCanvasX = deltaX / scale;
      const deltaCanvasY = deltaY / scale;
      
      // Calculate new position
      const newPosition = {
        x: designInitialPosition.x + deltaCanvasX,
        y: designInitialPosition.y + deltaCanvasY
      };
      
      // Update the design position
      updateDesignPosition(selectedDesign, newPosition);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // End design dragging if it was in progress
    if (isDraggingDesign) {
      setIsDraggingDesign(false);
      setDesignInitialPosition(null);
    }
  };
  
  const handleDesignClick = (designId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDesign(designId);
    
    // Close image input controls if open
    if (isImageInputVisible) {
      setIsImageInputVisible(false);
    }
  };
  
  const handleDesignMouseDown = (design: DesignIteration, e: React.MouseEvent) => {
    if (selectedDesign === design.id) {
      e.stopPropagation();
      
      // Start dragging the design
      setIsDraggingDesign(true);
      setDesignDragStart({ x: e.clientX, y: e.clientY });
      setDesignInitialPosition({ ...design.position });
    }
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
          processImageFile(blob, viewportCenter);
        }
      }
    }
  };
  
  // New methods for handling image inputs
  const toggleImageInput = () => {
    setIsImageInputVisible(!isImageInputVisible);
    setImageUrl('');
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const viewportCenter = getViewportCenter();
    processImageFile(files[0], viewportCenter);
    
    // Reset file input for future uploads
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsImageInputVisible(false);
  };
  
  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) return;
    
    // Check if URL is valid
    try {
      new URL(imageUrl);
      
      // Create an image element to check if it loads correctly
      const img = new Image();
      img.onload = () => {
        const viewportCenter = getViewportCenter();
        const dimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight
        };
        
        const mockDesign: Omit<DesignIteration, 'id' | 'timestamp'> = {
          name: 'URL Design',
          pageId: currentPage.id,
          imageUrl: imageUrl,
          position: viewportCenter,
          dimensions: dimensions,
          feedback: null
        };
        
        addDesign(mockDesign);
        setIsImageInputVisible(false);
        setImageUrl('');
      };
      
      img.onerror = () => {
        alert('Could not load image from URL. Please check the URL and try again.');
      };
      
      img.src = imageUrl;
    } catch (error) {
      alert('Please enter a valid URL');
    }
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const viewportCenter = getViewportCenter();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Process dropped files
      const files = e.dataTransfer.files;
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          processImageFile(files[i], viewportCenter);
          
          // Close image input if it's open
          if (isImageInputVisible) {
            setIsImageInputVisible(false);
          }
          
          break; // Only process the first image for now
        }
      }
    } else if (e.dataTransfer.items) {
      // Handle dropped URLs or other content
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'string') {
          e.dataTransfer.items[i].getAsString((str) => {
            // Check if it's a URL
            try {
              const url = new URL(str);
              if (url.pathname.match(/\.(jpe?g|png|gif|webp)$/i)) {
                setImageUrl(url.href);
                handleUrlSubmit();
              }
            } catch (error) {
              // Not a valid URL, ignore
            }
          });
        }
      }
    }
  };
  
  const processImageFile = (file: File, position: Position) => {
    if (!file.type.startsWith('image/')) return;
    
    // Create object URL for the file
    const url = URL.createObjectURL(file);
    
    // Create a new image object to get the natural dimensions
    const img = new Image();
    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      
      // Limit image dimensions if too large (optional preprocessing step)
      const maxWidth = 1200;
      const maxHeight = 1200;
      
      let finalWidth = dimensions.width;
      let finalHeight = dimensions.height;
      
      if (dimensions.width > maxWidth) {
        finalWidth = maxWidth;
        finalHeight = (dimensions.height * maxWidth) / dimensions.width;
      }
      
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = (finalWidth * maxHeight) / finalHeight;
      }
      
      const finalDimensions = {
        width: finalWidth,
        height: finalHeight
      };
      
      const mockDesign: Omit<DesignIteration, 'id' | 'timestamp'> = {
        name: file.name || 'Uploaded Design',
        pageId: currentPage.id,
        imageUrl: url,
        position: position,
        dimensions: finalDimensions,
        feedback: null
      };
      
      addDesign(mockDesign);
    };
    
    // Load the image from the blob to get its dimensions
    img.src = url;
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
      } else if (e.key === 'Escape') {
        // Close the image input controls if open
        if (isImageInputVisible) {
          setIsImageInputVisible(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [addDesign, removeDesign, currentPage.id, scale, canvasPosition, selectedDesign, isImageInputVisible]);
  
  const currentDesigns = getDesignsForCurrentPage();
  
  // Add an additional handler for mouse leave to prevent stuck drags
  const handleMouseLeave = () => {
    setIsDragging(false);
    if (isDraggingDesign) {
      setIsDraggingDesign(false);
      setDesignInitialPosition(null);
    }
  };
  
  return (
    <CanvasContainer
      ref={canvasRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CanvasGrid $scale={scale} $isVisible={true} />
      <CanvasContent $scale={scale} $position={canvasPosition}>
        {currentDesigns.map(design => (
          <DesignItem
            key={design.id}
            $position={design.position}
            $isSelected={selectedDesign === design.id}
            $isDragging={isDraggingDesign && selectedDesign === design.id}
            onClick={(e) => handleDesignClick(design.id, e)}
            onMouseDown={(e) => handleDesignMouseDown(design, e)}
          >
            <DesignImageWrapper $dimensions={design.dimensions}>
              <DesignImage src={design.imageUrl} alt={design.name} />
              {selectedDesign === design.id && (
                <PlusButtonContainer $dimensions={design.dimensions}>
                  <PlusButtonWrapper $scale={scale}>
                    <PlusButton onClick={handlePlusClick} />
                  </PlusButtonWrapper>
                </PlusButtonContainer>
              )}
            </DesignImageWrapper>
          </DesignItem>
        ))}
      </CanvasContent>
      
      {/* Drag overlay */}
      <DragOverlay $isVisible={isDragOver}>
        <DragOverlayText>Drop image here</DragOverlayText>
      </DragOverlay>
      
      {/* Image input controls */}
      {isImageInputVisible && (
        <ImageInputControls 
          $scale={scale} 
          $position={getViewportCenter()}
        >
          <CloseButton onClick={() => setIsImageInputVisible(false)}>×</CloseButton>
          <InputControlTitle>Add Image</InputControlTitle>
          
          <DragDropArea
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            Drag and drop an image here<br />or click to browse
          </DragDropArea>
          
          <OrText>or</OrText>
          
          <UrlInputGroup>
            <UrlInput
              type="text"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUrlSubmit();
                }
              }}
            />
            <UrlSubmitButton onClick={handleUrlSubmit}>Add</UrlSubmitButton>
          </UrlInputGroup>
          
          <OrText>or</OrText>
          
          <UploadButton htmlFor="file-upload">
            Upload from device
          </UploadButton>
          <HiddenInput
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
          />
        </ImageInputControls>
      )}
      
      {/* Add Image button */}
      <AddImageButton onClick={toggleImageInput}>+</AddImageButton>
    </CanvasContainer>
  );
};

export default Canvas;
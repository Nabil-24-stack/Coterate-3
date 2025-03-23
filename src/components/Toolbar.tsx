import React from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  height: 68px;
  background-color: white;
  border-bottom: 1px solid #E3E6EA;
  display: flex;
  align-items: center;
  padding: 0 16px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 24px;
  color: #333;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const LogoIcon = styled.span`
  color: #4169e1;
  margin-right: 8px;
`;

const Toolbar: React.FC = () => {
  return (
    <ToolbarContainer>
      <Logo>
        <LogoIcon>🚀</LogoIcon>
        Coterate
      </Logo>
    </ToolbarContainer>
  );
};

export default Toolbar; 
import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';

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

const LogoImage = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

const Toolbar: React.FC = () => {
  return (
    <ToolbarContainer>
      <Logo>
        <LogoImage>
          <Image src="/Coterate logo.png" alt="Coterate Logo" width={32} height={32} />
        </LogoImage>
        Coterate
      </Logo>
    </ToolbarContainer>
  );
};

export default Toolbar;
import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import Toolbar from '@/components/Toolbar';
import Canvas from '@/components/Canvas';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export default function Home() {
  return (
    <>
      <Head>
        <title>Coterate Lite</title>
        <meta name="description" content="A simplified version of Coterate with Figma-like canvas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Container>
        <Toolbar />
        <Content>
          <Sidebar />
          <Canvas />
        </Content>
      </Container>
    </>
  );
} 
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { PageProvider } from '@/contexts/PageContext';
import { DesignProvider } from '@/contexts/DesignContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PageProvider>
      <DesignProvider>
        <Component {...pageProps} />
      </DesignProvider>
    </PageProvider>
  );
} 
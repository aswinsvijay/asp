import { GlobalStore } from '@/src/store/global';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalStore.Provider value={{}}>
      <Component {...pageProps} />
    </GlobalStore.Provider>
  );
}

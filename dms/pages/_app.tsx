import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SnackbarProvider } from 'notistack';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider anchorOrigin={{ horizontal: 'right', vertical: 'top' }} maxSnack={3}>
      <Component {...pageProps} />
    </SnackbarProvider>
  );
}

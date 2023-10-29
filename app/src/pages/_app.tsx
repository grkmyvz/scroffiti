import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

import { WagmiConfig } from 'wagmi';
import { activeChain } from '@/helpers/clients';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_KEY as string;

const metadata = {
  name: 'Scroffiti',
  description: 'Scroffiti app',
  url: 'https://scroffiti.vercel.app/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [activeChain];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}

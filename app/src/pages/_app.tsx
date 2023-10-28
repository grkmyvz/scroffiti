import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

import { WagmiConfig } from 'wagmi';
import { activeChain } from '@/helpers/clients';

const projectId = 'a25647947fb3a2e4343ad35a7680be76';

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
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

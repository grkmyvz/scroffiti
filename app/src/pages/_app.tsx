import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

import { WagmiConfig } from 'wagmi';
import { activeChain } from '@/helpers/clients';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_KEY as string;

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

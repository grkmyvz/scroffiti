import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { scroll } from 'viem/chains';

export const activeChain = scroll;

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(),
});

export const walletClient = () => {
  if (typeof window !== 'undefined') {
    return createWalletClient({
      chain: activeChain,
      transport: custom(window.ethereum as any),
    });
  }
};

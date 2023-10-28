import { useEffect, useState } from 'react';
import { Hex, hexToString } from 'viem';
import { publicClient, walletClient } from '@/helpers/clients';
import { contractABI, contractAddress } from '@/helpers/contractInfo';
import { createMulticall } from '@/helpers/createMulticall';

type BestScroffiti = {
  bestScroffitiDecoded: string;
  bestScroffitiEncoded: Hex;
  bestScroffitiIndex: number;
  bestScroffitiPoint: number;
};

export default function BestScroffiti({
  showToast,
}: {
  showToast: (message: string, duration?: number) => void;
}) {
  const [bestScroffiti, setBestScroffiti] = useState<BestScroffiti>();

  const contractParams = {
    address: contractAddress,
    abi: contractABI,
  } as const;

  async function readBestScroffiti() {
    try {
      const scroffitiCount = await publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'count',
      });

      if (Number(scroffitiCount) > 0) {
        const [bestScroffitiIndex, bestScroffitiPoint] = await publicClient.multicall({
          contracts: createMulticall(contractParams, [
            { functionName: 'bestScroffitiIndex' },
            { functionName: 'bestScroffitiPoint' },
          ]),
        });

        const bestScroffiti = await publicClient.readContract({
          address: contractAddress,
          abi: contractABI,
          functionName: 'scroffitis',
          args: [BigInt(Number(bestScroffitiIndex.result))],
        });
        setBestScroffiti({
          bestScroffitiDecoded: hexToString(bestScroffiti, { size: 32 }),
          bestScroffitiEncoded: bestScroffiti,
          bestScroffitiIndex: Number(bestScroffitiIndex.result),
          bestScroffitiPoint: Number(bestScroffitiPoint.result),
        });
      } else {
        setBestScroffiti(undefined);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function moveUp() {
    try {
      const [account] = (await walletClient()?.getAddresses()) as Hex[];
      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi: contractABI,
        functionName: 'moveUp',
        args: [BigInt(Number(bestScroffiti?.bestScroffitiIndex))],
        value: BigInt(1000000000000000),
      });
      const tx = await walletClient()?.writeContract(request);
      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx as Hex,
      });
      showToast(
        `${
          txReceipt.status
            ? 'Congratulations, you gave 1 point to scroffiti.'
            : 'Transaction failed.'
        } Transaction hash: ${tx}`,
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    readBestScroffiti();
  }, []);

  return (
    <div className="w100">
      <h2 className="p1">Best Scroffiti</h2>
      <h3 className="p1">{bestScroffiti?.bestScroffitiDecoded.toLowerCase()}</h3>
      <div className="horizontal-stack">
        <p className="bg-gray-700 w100 m1 p1 text-center">
          Index: {bestScroffiti?.bestScroffitiIndex}
        </p>
        <p className="bg-gray-700 w100 m1 p1 text-center">
          Point: {bestScroffiti?.bestScroffitiPoint}
        </p>
        <button className="bg-gray-800 w100 m1 p1 text-center" onClick={moveUp}>
          Hold It Up
        </button>
      </div>
    </div>
  );
}

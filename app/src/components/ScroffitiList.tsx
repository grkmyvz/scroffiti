import { publicClient, walletClient } from '@/helpers/clients';
import { contractABI, contractAddress } from '@/helpers/contractInfo';
import { createMulticall } from '@/helpers/createMulticall';
import { useEffect, useState } from 'react';
import { Hex, hexToString } from 'viem';

type Scroffiti = {
  scroffitiDecoded: string;
  scroffitiEncoded: Hex;
  scroffitiIndex: number;
  scroffitiPoint: number;
};

export default function ScroffitiList({
  showToast,
}: {
  showToast: (message: string, duration?: number) => void;
}) {
  const [scroffitiCount, setScroffitiCount] = useState<number>(0);
  const [lastIndex, setLastIndex] = useState<number>(0);
  const [scroffitis, setScroffitis] = useState<Scroffiti[]>([]);

  const contractParams = {
    address: contractAddress,
    abi: contractABI,
  } as const;

  async function getCount() {
    const count = await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'count',
    });
    setScroffitiCount(Number(count));
  }

  async function getScoffitis(count: number) {
    for (let i = count - 1; i > (count > 5 ? count - 5 : 0); i--) {
      await readScroffitis(i);
    }
  }

  async function readScroffitis(index: number) {
    const [lastScroffiti, lastScroffitiPoint] = await publicClient.multicall({
      contracts: createMulticall(contractParams, [
        {
          functionName: 'scroffitis',
          args: [BigInt(index)],
        },
        {
          functionName: 'scroffitiPoints',
          args: [BigInt(index)],
        },
      ]),
    });

    setScroffitis((prevScroffitis) => [
      ...prevScroffitis,
      {
        scroffitiDecoded: hexToString(lastScroffiti.result as Hex, {
          size: 32,
        }),
        scroffitiEncoded: lastScroffiti.result as Hex,
        scroffitiIndex: index,
        scroffitiPoint: Number(lastScroffitiPoint.result),
      },
    ]);
    setLastIndex(index);
  }

  async function loadMore() {
    if (lastIndex && scroffitiCount) {
      for (let i = lastIndex - 1; i > lastIndex - 6; i--) {
        if (i >= 0) {
          await readScroffitis(i);
        }
      }
    }
  }

  async function moveUp(index: number) {
    try {
      const [account] = (await walletClient()?.getAddresses()) as Hex[];
      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi: contractABI,
        functionName: 'moveUp',
        args: [BigInt(index)],
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
    getCount();
  }, []);

  useEffect(() => {
    if (scroffitiCount > 0) {
      getScoffitis(scroffitiCount > 10 ? 10 : scroffitiCount);
    }
  }, [scroffitiCount]);

  return (
    <div className="w100">
      <h2>Last Scroffitis</h2>
      <div className="w100">
        {scroffitis?.map((scroffiti) => (
          <div key={scroffiti.scroffitiIndex} className="horizontal-stack border">
            <h4>{scroffiti.scroffitiDecoded.toLowerCase()}</h4>
            <div className="vertical-stack w20">
              <p className="bg-gray-700 w100 p1 text-center">Point: {scroffiti.scroffitiPoint}</p>
              <p className="bg-gray-700 w100 p1 text-center">Index: {scroffiti.scroffitiIndex}</p>
              <button
                className="bg-gray-800 w100 p1 text-center"
                onClick={() => moveUp(scroffiti.scroffitiIndex)}
              >
                Move Up <span>(0.001 ETH)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="w100">
        <button className="m1 p1 w100" onClick={loadMore}>
          Load More
        </button>
      </div>
    </div>
  );
}

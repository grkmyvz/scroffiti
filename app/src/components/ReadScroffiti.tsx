import { publicClient, walletClient } from '@/helpers/clients';
import { contractABI, contractAddress } from '@/helpers/contractInfo';
import { createMulticall } from '@/helpers/createMulticall';
import { useState } from 'react';
import { Hex, hexToString } from 'viem';

type Scroffiti = {
  scroffitiDecoded: string;
  scroffitiEncoded: Hex;
  scroffitiIndex: number;
  scroffitiPoint: number;
};

export default function ReadScroffiti({
  showToast,
}: {
  showToast: (message: string, duration?: number) => void;
}) {
  const [input, setInput] = useState<number>();
  const [scroffiti, setScroffiti] = useState<Scroffiti>();

  const contractParams = {
    address: contractAddress,
    abi: contractABI,
  } as const;

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

    setScroffiti({
      scroffitiDecoded: hexToString(lastScroffiti.result as Hex, {
        size: 32,
      }),
      scroffitiEncoded: lastScroffiti.result as Hex,
      scroffitiIndex: index,
      scroffitiPoint: Number(lastScroffitiPoint.result),
    });
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
      showToast('Transaction sent, waiting for confirmation...');
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

  function handleReadScroffiti() {
    if (input !== undefined) {
      readScroffitis(input);
    }
  }

  return (
    <>
      <h2>Read Scroffiti</h2>
      <div>
        <input
          type="number"
          placeholder="Scroffiti Index"
          onChange={(e) => {
            setInput(Number(e.target.value));
          }}
        />
        <button onClick={handleReadScroffiti}>Read Scroffiti</button>
      </div>
      <div className="w100">
        {scroffiti && (
          <div className="w100">
            <div className="horizontal-stack border">
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
          </div>
        )}
      </div>
    </>
  );
}

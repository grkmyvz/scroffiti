import { publicClient, walletClient } from '@/helpers/clients';
import { contractABI, contractAddress } from '@/helpers/contractInfo';
import { useState } from 'react';
import { Hex, stringToHex } from 'viem';

export default function SendScroffiti({
  showToast,
}: {
  showToast: (message: string, duration?: number) => void;
}) {
  const [scroffitiInput, setScroffitiInput] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  function checkInput(input: string) {
    if (input === '') return false;
    const pattern = /^[a-zA-Z0-9\s]{0,32}$/;
    return pattern.test(input);
  }

  function padToBytes32(value: Hex) {
    while (value.length < 66) {
      value = (value + '0') as Hex;
    }
    return value;
  }

  async function writeScroffiti() {
    if (checkInput(scroffitiInput)) {
      try {
        const [account] = (await walletClient()?.getAddresses()) as Hex[];
        const { request } = await publicClient.simulateContract({
          account,
          address: contractAddress,
          abi: contractABI,
          functionName: 'write',
          args: [padToBytes32(stringToHex(scroffitiInput))],
        });
        const tx = await walletClient()?.writeContract(request);
        const txReceipt = await publicClient.waitForTransactionReceipt({
          hash: tx as Hex,
        });
        setToastMessage(
          `${
            txReceipt.status
              ? 'Congratulations, your scroffiti has been published on the network.'
              : 'An error occurred, your scroffiti is not published on the network.'
          } Transaction hash: ${tx}`,
        );
        setToastVisible(true);
        setTimeout(() => {
          setToastVisible(false);
        }, 5000);
      } catch (error) {
        console.error(error);
      }
    } else {
      setToastMessage('Invalid input');
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
      }, 3000);
    }
  }
  return (
    <div className="w100">
      <h2>Send Scroffiti</h2>
      <input
        className="w80"
        type="text"
        placeholder="Enter your message (Max 32 characters)"
        onChange={(e) => setScroffitiInput(e.target.value)}
      />
      <button className="w20" onClick={writeScroffiti}>
        Write Scroffiti
      </button>
    </div>
  );
}

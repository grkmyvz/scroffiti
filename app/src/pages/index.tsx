import Head from 'next/head';
import { Inter } from 'next/font/google';

import BestScroffiti from '@/components/BestScroffiti';
import SendScroffiti from '@/components/SendScroffiti';
import ScroffitiList from '@/components/ScroffitiList';
import useToast from '@/components/useToast';
import ReadScroffiti from '@/components/ReadScroffiti';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const { toastVisible, toastMessage, showToast } = useToast();
  return (
    <>
      <Head>
        <title>Scroffiti</title>
        <meta name="description" content="Scroffiti app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={inter.className}>
        <h1>Scroffiti</h1>
        <div className="p1">
          <w3m-button />
        </div>
        <hr />
        <BestScroffiti showToast={showToast} />
        <hr />
        <SendScroffiti showToast={showToast} />
        <hr />
        <ReadScroffiti showToast={showToast} />
        <hr />
        <ScroffitiList showToast={showToast} />
        <div className={`toast ${toastVisible ? 'toast-show' : 'toast-hide'}`}>{toastMessage}</div>
      </main>
    </>
  );
}

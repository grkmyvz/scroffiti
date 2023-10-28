import { useState } from 'react';

const useToast = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string, duration: number = 3000) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, duration);
  };

  return {
    showToast,
    toastVisible,
    toastMessage,
  };
};

export default useToast;

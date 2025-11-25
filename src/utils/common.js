import { useEffect, useState } from "react";

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export const useBrowserTabFocus = () => {
  const [isFocused, setIsFocused] = useState(true);
  useEffect(() => {
    const handleFocus = () => {
      console.log('handleFocus')
      setIsFocused(true);
    };

    const handleBlur = () => {
      console.log('handleBlur')
      setIsFocused(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
  return { isFocused };
}


export const useBroadcastChannel = (channelName) => {
  const [message, setMessage] = useState(null);
  const channel = new BroadcastChannel(channelName);

  useEffect(() => {
    const handleMessage = (event) => {
      setMessage(event.data);
    };

    channel.onmessage = handleMessage;

    // Clean up the channel when the component unmounts
    return () => {
      channel.close();
    };
  }, [channel]);

  const sendMessage = (msg) => {
    channel.postMessage(msg);
  };

  return { message, sendMessage };
};

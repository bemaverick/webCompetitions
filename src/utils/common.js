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
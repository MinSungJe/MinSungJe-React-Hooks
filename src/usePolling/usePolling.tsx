import { useCallback, useEffect, useRef } from 'react';

interface UsePollingProperties {
  apiFunction: () => unknown;
  interval?: number;
}

const usePolling = ({ apiFunction, interval = 3000 }: UsePollingProperties) => {
  const timerReference = useRef<number | null>(null);
  const apiReference = useRef(apiFunction);

  apiReference.current = apiFunction;

  const resetTimer = (function_: (...properties: never) => unknown) => {
    if (timerReference.current) clearTimeout(timerReference.current);
    timerReference.current = setTimeout(function_, interval);
  };

  const poll = useCallback(async () => {
    await apiReference.current();
    resetTimer(poll);
  }, [interval]);

  useEffect(() => {
    poll();
    return () => {
      if (timerReference.current) clearTimeout(timerReference.current);
    };
  }, [poll]);

  const call = async () => {
    const result = await apiReference.current();
    resetTimer(poll);
    return result;
  };

  return call;
};

export default usePolling;

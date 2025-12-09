import { useCallback, useEffect, useRef } from 'react';

interface UsePollingProperties {
  apiFunction: () => unknown;
  interval?: number;
  pauseWhenHidden?: boolean;
}

const usePolling = ({
  apiFunction,
  interval = 3000,
  pauseWhenHidden = true,
}: UsePollingProperties) => {
  const timerReference = useRef<number | null>(null);
  const apiReference = useRef(apiFunction);

  apiReference.current = apiFunction;

  const clearTimer = () => {
    if (timerReference.current) clearTimeout(timerReference.current);
  };

  const resetTimer = (function_: (...properties: never) => unknown) => {
    clearTimer();
    timerReference.current = setTimeout(function_, interval);
  };

  const poll = useCallback(async () => {
    await apiReference.current();
    resetTimer(poll);
  }, [interval]);

  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibility = () => {
      if (document.hidden) {
        clearTimer();
      } else {
        poll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pauseWhenHidden, poll]);

  useEffect(() => {
    poll();
    return () => clearTimer();
  }, [poll]);

  const call = async () => {
    const result = await apiReference.current();
    resetTimer(poll);
    return result;
  };

  return { runNow: call };
};

export default usePolling;

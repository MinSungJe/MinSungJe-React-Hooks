import { useCallback, useEffect, useRef } from 'react';

interface UsePollingProperties {
  apiFunction: () => unknown;
  interval?: number;
  pauseWhenHidden?: boolean;
  autoStart?: boolean;
}

const usePolling = ({
  apiFunction,
  interval = 3000,
  pauseWhenHidden = true,
  autoStart = true,
}: UsePollingProperties) => {
  const timerReference = useRef<number | null>(null);
  const apiReference = useRef(apiFunction);
  const isRunningReference = useRef(false);

  apiReference.current = apiFunction;

  const clearTimer = () => {
    if (timerReference.current) clearTimeout(timerReference.current);
  };

  const scheduleNext = (fn: () => void) => {
    clearTimer();
    timerReference.current = setTimeout(fn, interval);
  };

  const poll = useCallback(async () => {
    if (!isRunningReference.current) return;

    await apiReference.current();

    if (isRunningReference.current) {
      scheduleNext(poll);
    }
  }, [interval]);

  const start = useCallback(() => {
    if (isRunningReference.current) return;
    isRunningReference.current = true;
    poll();
  }, [poll]);

  const stop = useCallback(() => {
    isRunningReference.current = false;
    clearTimer();
  }, []);

  const call = useCallback(async () => {
    const result = await apiReference.current();
    if (isRunningReference.current) {
      scheduleNext(poll);
    }
    return result;
  }, [poll]);

  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pauseWhenHidden, start, stop]);

  useEffect(() => {
    if (autoStart) start();
    return () => stop();
  }, [autoStart, start, stop]);

  return { start, stop, runNow: call };
};

export default usePolling;

import { useCallback, useEffect, useRef } from 'react';

interface UsePollingProperties {
  apiFunction: () => unknown;
  interval?: number;
  pauseWhenHidden?: boolean;
  autoStart?: boolean;
  retryCount?: number;
}

const usePolling = ({
  apiFunction,
  interval = 3000,
  pauseWhenHidden = true,
  autoStart = true,
  retryCount = 3,
}: UsePollingProperties) => {
  const timerReference = useRef<number | null>(null);
  const apiReference = useRef(apiFunction);
  const isRunningReference = useRef(false);
  const retryReference = useRef(0);
  const isUserStoppedRef = useRef(false);

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

    try {
      await apiReference.current();
      retryReference.current = 0;
    } catch (error) {
      retryReference.current += 1;

      if (retryReference.current > retryCount) {
        isRunningReference.current = false;
        clearTimer();
        return;
      }
    }

    if (isRunningReference.current) {
      scheduleNext(poll);
    }
  }, [interval, retryCount]);

  const start = useCallback(() => {
    if (isRunningReference.current) return;

    isUserStoppedRef.current = false;
    retryReference.current = 0;
    isRunningReference.current = true;
    poll();
  }, [poll]);

  const stop = useCallback(() => {
    isUserStoppedRef.current = true;
    isRunningReference.current = false;
    clearTimer();
  }, []);

  const runNow = useCallback(async () => {
    try {
      const result = await apiReference.current();
      retryReference.current = 0;
      if (isRunningReference.current) scheduleNext(poll);
      return result;
    } catch (error) {
      retryReference.current += 1;
      if (retryReference.current > retryCount) stop();

      throw error;
    }
  }, [poll, retryCount, stop]);

  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibility = () => {
      if (document.hidden) {
        isRunningReference.current = false;
        clearTimer();
      } else {
        if (!isUserStoppedRef.current) start();
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

  return {
    start,
    stop,
    runNow,
  };
};

export default usePolling;

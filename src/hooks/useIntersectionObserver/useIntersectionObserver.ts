import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProperties {
  threshold?: number;
  rootMargin?: string;
}

const useIntersectionObserver = ({
  threshold = 0.5,
  rootMargin = '100px',
}: UseIntersectionObserverProperties) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const targetReference = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!targetReference.current) return;

    observer.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );
    observer.current.observe(targetReference.current);

    return () => {
      observer.current?.disconnect();
    };
  }, [threshold, rootMargin]);

  return { targetReference, isIntersecting };
};

export default useIntersectionObserver;

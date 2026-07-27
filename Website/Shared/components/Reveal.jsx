import { useEffect, useRef, useState } from 'react';
import styles from './Reveal.module.css';

export default function Reveal({ children, className = '' }) {
  const elementRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return undefined;
    }

    if (typeof window.IntersectionObserver !== 'function') {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`${styles.reveal} ${revealed ? styles.revealed : ''} ${className}`.trim()}
      data-revealed={revealed}
      ref={elementRef}
    >
      {children}
    </div>
  );
}

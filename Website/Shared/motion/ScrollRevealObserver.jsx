import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const revealSelector = '[data-reveal-group="true"]';

export default function ScrollRevealObserver() {
  const { pathname } = useLocation();

  useEffect(() => {
    const groups = [...document.querySelectorAll(revealSelector)];
    const reveal = (element) => {
      element.dataset.revealed = 'true';
    };

    if (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      || typeof window.IntersectionObserver !== 'function'
    ) {
      groups.forEach(reveal);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12,
    });

    groups.forEach((group) => {
      group.dataset.revealed = 'false';
      observer.observe(group);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

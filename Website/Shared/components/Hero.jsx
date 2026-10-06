import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

const geometricWordmarks = {
  ioak: {
    viewBox: '0 0 190 50',
    paths: [
      'M8 8V42',
      'M38 25C38 14 46 8 58 8C70 8 78 14 78 25C78 36 70 42 58 42C46 42 38 36 38 25Z',
      'M94 42L111 8L128 42M101 29H121',
      'M150 8V42M151 26L177 8M151 26L179 42',
    ],
  },
  flux: {
    viewBox: '0 0 230 50',
    paths: [
      'M8 42V8H49M8 24H41',
      'M70 8V42H108',
      'M128 8V29C128 38 135 42 145 42C155 42 162 38 162 29V8',
      'M184 8L222 42M222 8L184 42',
    ],
  },
};

function Wordmark({ title, wordmark }) {
  if (!wordmark) {
    return (
      <h1
        aria-label={title.replace(/\n/g, ' ')}
        data-motion-step="wordmark"
        data-page-heading
        id="page-title"
        tabIndex="-1"
      >
        {title.split('\n').map((line) => <span aria-hidden="true" key={line}>{line}</span>)}
      </h1>
    );
  }

  return (
    <h1
      aria-label={title}
      className={`${styles.wordmark} ${styles[wordmark.variant]}`}
      data-motion-step="wordmark"
      data-page-heading
      data-wordmark-construction={wordmark.construction}
      data-wordmark={wordmark.variant}
      id="page-title"
      tabIndex="-1"
    >
      {wordmark.image ? (
        <img alt="" aria-hidden="true" className={styles.wordmarkImage} src={wordmark.image} />
      ) : wordmark.variant === 's-project' ? (
        <>
          <span aria-hidden="true" className={styles.monogram}>S</span>
          <span aria-hidden="true" className={styles.wordmarkLabel}>PROJECT</span>
        </>
      ) : wordmark.variant === 'interich' ? (
        <span aria-hidden="true" className={styles.interichLetters}>INTERICH</span>
      ) : (
        <>
          <span className={styles.srOnly} data-wordmark-name>{title}</span>
          <svg
            aria-hidden="true"
            className={styles.wordmarkSvg}
            focusable="false"
            viewBox={geometricWordmarks[wordmark.variant].viewBox}
          >
            {geometricWordmarks[wordmark.variant].paths.map((path) => (
              <path
                d={path}
                fill="none"
                key={path}
                pathLength="1"
                stroke="currentColor"
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        </>
      )}
    </h1>
  );
}

export default function Hero({
  image,
  imageAlt,
  eyebrow,
  title,
  text,
  align = 'left',
  overlay = false,
  layout = 'split',
  height,
  imagePosition,
  eyebrowPosition = 'before',
  wordmark,
  headlineVariant,
  imageBrightness = 0.6,
  imageContrast = 0.95,
  imageWarmth = 0.06,
  imageHue = '0deg',
  imageSaturation = 1.05,
  imageBrightnessGradient = false,
  imageBrightnessTop,
  imageBrightnessBottom,
  contentTranslateY,
  contentMax,
  heroTreatment,
  scrollOnWheel = false,
  className = '',
}) {
  const heroRef = useRef(null);

  const scrollToNextSection = () => {
    const nextSection = heroRef.current?.nextElementSibling;
    if (!nextSection) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const header = document.querySelector('[role="banner"]');
    const headerBottom = header?.getBoundingClientRect().bottom || header?.offsetHeight || 0;
    const heroBottom = heroRef.current.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({
      top: Math.max(0, heroBottom - headerBottom),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  useEffect(() => {
    if (!scrollOnWheel) return undefined;

    const onWheel = (event) => {
      if (event.deltaY <= 0 || window.scrollY > 12) return;
      event.preventDefault();
      scrollToNextSection();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [scrollOnWheel]);

  return (
    <section
      className={`${styles.hero} ${styles[align] ?? ''} ${styles[layout] ?? ''} ${overlay ? styles.overlay : ''} ${className}`.trim()}
      aria-labelledby="page-title"
      data-hero-layout={layout}
      data-image-brightness-gradient={imageBrightnessGradient || undefined}
      data-hero-treatment={heroTreatment || undefined}
      data-motion-sequence="hero"
      data-scroll-target={scrollOnWheel ? 'next-section' : undefined}
      ref={heroRef}
      style={{
        '--hero-height': height,
        '--hero-content-max': contentMax,
        '--hero-image-position': imagePosition,
        '--hero-image-brightness': imageBrightness,
        '--hero-image-contrast': imageContrast,
        '--hero-image-warmth': imageWarmth,
        '--hero-image-hue': imageHue,
        '--hero-image-saturation': imageSaturation,
        '--hero-image-url': `url("${image}")`,
        '--hero-image-brightness-top': imageBrightnessTop,
        '--hero-image-brightness-bottom': imageBrightnessBottom,
        '--hero-content-translate-y': contentTranslateY,
      }}
    >
      <figure className={styles.figure} data-motion-step="image">
        <img
          alt={imageAlt}
          className={styles.image}
          fetchPriority="high"
          src={image}
        />
      </figure>
      <div className={styles.content}>
        {eyebrow && eyebrowPosition === 'before' && <p className={styles.eyebrow} data-motion-step="eyebrow">{eyebrow}</p>}
        <Wordmark title={title} wordmark={wordmark} />
        {eyebrow && eyebrowPosition === 'after' && <p className={styles.eyebrow} data-motion-step="eyebrow">{eyebrow}</p>}
        {text && (
          <p
            className={`${styles.text} ${headlineVariant ? styles.headline : ''} ${styles[`${headlineVariant}Headline`] ?? ''}`}
            data-headline-variant={headlineVariant}
            data-motion-step="copy"
          >
            {text}
          </p>
        )}
        {scrollOnWheel ? (
          <button className={styles.scrollCue} data-motion-step="scroll" onClick={scrollToNextSection} type="button">
            <span className={styles.scrollBreath} data-scroll-breathe="true">
              Scroll <span aria-hidden="true">↓</span>
            </span>
          </button>
        ) : (
          <span className={styles.scrollCue} aria-hidden="true" data-motion-step="scroll">
            <span className={styles.scrollBreath} data-scroll-breathe="true">Scroll ↓</span>
          </span>
        )}
      </div>
    </section>
  );
}

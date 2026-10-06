import { useEffect, useRef } from 'react';
import { SectionIntro, SplitFeature } from '../Shared/components/Editorial';
import { MediaGrid } from '../Shared/components/MediaGrid';
import SiteFooter from '../Shared/components/SiteFooter';
import SiteHeader from '../Shared/components/SiteHeader';
import { experience } from './experienceData';
import styles from './ExperiencePage.module.css';

export default function ExperiencePage() {
  const heroRef = useRef(null);

  useEffect(() => {
    const onWheel = (event) => {
      if (event.deltaY <= 0 || window.scrollY > 12 || !heroRef.current?.nextElementSibling) return;

      event.preventDefault();
      const header = document.querySelector('[role="banner"]');
      const headerBottom = header?.getBoundingClientRect().bottom || header?.offsetHeight || 0;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom + window.scrollY;
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      window.scrollTo({
        top: Math.max(0, heroBottom - headerBottom),
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <>
      <SiteHeader />
      <main className={`${styles.editorialType} ${styles.aboutPalette}`}>
        <section className={`${styles.hero} ${styles.fullViewportHero}`} aria-labelledby="page-title" data-copy-spacing="relaxed" data-motion-sequence="page-intro" data-overlay="dimmed-gradient" data-scroll-target="next-section" data-surface="hero" ref={heroRef}>
          <img alt={experience.hero.imageAlt} className={styles.heroImage} data-motion-step="image" fetchPriority="high" src={experience.hero.image} />
          <div className={styles.heroContent}>
            <h1 data-motion-step="title" data-page-heading id="page-title" tabIndex="-1">{experience.hero.title}</h1>
            <p data-motion-step="copy">{experience.hero.subtitle}</p>
            <span data-motion-step="copy">{experience.hero.opening}</span>
          </div>
        </section>

        <section className={styles.introductionBand} data-surface="tint">
          <SplitFeature
            className={styles.introduction}
            image={experience.introduction.image}
            imageAlt={experience.introduction.imageAlt}
          >
            <SectionIntro eyebrow={experience.introduction.eyebrow} title={experience.introduction.title}>
              {experience.introduction.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </SectionIntro>
          </SplitFeature>
        </section>

        <section className={styles.showroom} aria-labelledby="showroom-title" data-reveal-group="true" data-surface="paper">
          <p className={styles.eyebrow} data-reveal-item="text">Explore the showroom</p>
          <h2 className={styles.srOnly} id="showroom-title">Explore the showroom</h2>
          <MediaGrid
            className={`${styles.zoneGrid} ${styles.expandedSpacing}`}
            items={experience.showroomZones}
            minCardWidth="14rem"
            referenceColumns={3}
            referenceCount={3}
            gridTestId="experience-zone-grid"
          />
        </section>

        <section className={styles.location} aria-labelledby="location-title" data-reveal-group="true" data-surface="tint">
          <div className={styles.address} data-reveal-item="text">
            <p className={styles.eyebrow}>Visit 578</p>
            <h2 id="location-title">{experience.location.address.map((line) => <span key={line}>{line}</span>)}</h2>
            <p className={styles.opening}>{experience.location.opening}</p>
            <a className={styles.directionButton} href={`https://maps.google.com/?q=${encodeURIComponent(experience.location.address.join(' '))}`} rel="noreferrer" target="_blank">
              Get directions <span aria-hidden="true">→</span>
            </a>
          </div>
          <figure data-reveal-item="image"><img alt={experience.location.mapAlt} className={styles.locationMap} data-fit="contain" loading="lazy" src={experience.location.map} /></figure>
        </section>

        <section className={styles.visit} data-reveal-group="true" data-surface="paper">
          <div data-reveal-item="text">
            <h2>Visit 578 website <span aria-hidden="true">→</span></h2>
            <p>Independent website — launching 2026</p>
          </div>
          <img alt={experience.visit.imageAlt} data-reveal-item="image" loading="lazy" src={experience.visit.image} />
          <a aria-label="Visit 578 website" href={experience.visit.href} rel="noreferrer" target="_blank" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

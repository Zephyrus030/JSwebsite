import { SectionIntro, SplitFeature } from '../Shared/components/Editorial';
import { MediaGrid } from '../Shared/components/MediaGrid';
import SiteFooter from '../Shared/components/SiteFooter';
import SiteHeader from '../Shared/components/SiteHeader';
import { experience } from './experienceData';
import styles from './ExperiencePage.module.css';

export default function ExperiencePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className={styles.hero} aria-labelledby="page-title">
          <img alt={experience.hero.imageAlt} className={styles.heroImage} fetchPriority="high" src={experience.hero.image} />
          <div className={styles.heroContent}>
            <h1 data-page-heading id="page-title" tabIndex="-1">{experience.hero.title}</h1>
            <p>{experience.hero.subtitle}</p>
            <span>{experience.hero.opening}</span>
          </div>
        </section>

        <SplitFeature
          className={styles.introduction}
          image={experience.introduction.image}
          imageAlt={experience.introduction.imageAlt}
        >
          <SectionIntro eyebrow={experience.introduction.eyebrow} title={experience.introduction.title}>
            {experience.introduction.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </SectionIntro>
        </SplitFeature>

        <section className={styles.showroom} aria-labelledby="showroom-title">
          <p className={styles.eyebrow}>Explore the showroom</p>
          <h2 className={styles.srOnly} id="showroom-title">Explore the showroom</h2>
          <MediaGrid
            className={styles.zoneGrid}
            items={experience.showroomZones}
            minCardWidth="14rem"
            referenceColumns={3}
            referenceCount={3}
          />
        </section>

        <section className={styles.location} aria-labelledby="location-title">
          <div className={styles.address}>
            <p className={styles.eyebrow}>Visit 578</p>
            <h2 id="location-title">{experience.location.address.map((line) => <span key={line}>{line}</span>)}</h2>
            <p className={styles.opening}>{experience.location.opening}</p>
            <a className={styles.directionButton} href="https://maps.google.com/?q=578+Church+Street,+Richmond+VIC+3121" rel="noreferrer" target="_blank">
              Get directions <span aria-hidden="true">→</span>
            </a>
          </div>
          <figure><img alt={experience.location.mapAlt} loading="lazy" src={experience.location.map} /></figure>
        </section>

        <section className={styles.visit}>
          <div>
            <h2>Visit 578 website <span aria-hidden="true">→</span></h2>
            <p>Independent website — launching 2026</p>
          </div>
          <img alt={experience.visit.imageAlt} loading="lazy" src={experience.visit.image} />
          <a aria-label="Visit 578 website" href={experience.visit.href} rel="noreferrer" target="_blank" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

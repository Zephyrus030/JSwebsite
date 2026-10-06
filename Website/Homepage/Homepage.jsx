import { Link } from 'react-router-dom';
import Hero from '../Shared/components/Hero';
import { SectionIntro, SplitFeature } from '../Shared/components/Editorial';
import Reveal from '../Shared/components/Reveal';
import SiteFooter from '../Shared/components/SiteFooter';
import SiteHeader from '../Shared/components/SiteHeader';
import { about, brands, experience, hero, news } from './homepageData';
import styles from './Homepage.module.css';

function TextAction({ to, children = 'Learn more' }) {
  return (
    <Link className={styles.textAction} to={to}>
      {children} <span aria-hidden="true">-&gt;</span>
    </Link>
  );
}

export default function Homepage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero
          {...hero}
          className={styles.homeHero}
          height="calc(100svh - 4rem)"
          layout="full-bleed"
          scrollOnWheel
        />

        <Reveal className={styles.homeReveal} surface="paper">
          <SplitFeature
            className={`${styles.homeFeature} ${styles.aboutFeature}`}
            image={about.image}
            imageAlt={about.imageAlt}
          >
            <SectionIntro eyebrow="About JS Building Group" title={about.title}>
              <p>{about.text}</p>
            </SectionIntro>
            <TextAction to="/about" />
          </SplitFeature>
        </Reveal>

        <section className={styles.brands} aria-labelledby="brands-title" data-reveal-group="true" data-surface="tint">
          <p className={styles.eyebrow} data-reveal-item="text">Our brands</p>
          <h2 className={styles.visuallyHidden} id="brands-title">Our brands</h2>
          <div className={styles.brandGrid}>
            {brands.map((brand, index) => (
              <article className={styles.brandCard} data-reveal-item="card" key={brand.title} style={{ '--reveal-delay': `${index * 45}ms` }}>
                <Link to={brand.href}>
                  <h3>{brand.title}</h3>
                  <p className={styles.brandSubtitle}>{brand.subtitle}</p>
                  <p>{brand.text}</p>
                  <span className={styles.cardAction}>DISCOVER MORE <span aria-hidden="true">-&gt;</span></span>
                  <figure className={styles.brandImage}>
                    <img alt={brand.alt} loading="lazy" src={brand.src} />
                  </figure>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="578 INTERIORS" className={styles.experienceBand} data-surface="paper">
          <h2 className={styles.visuallyHidden}>578 INTERIORS</h2>
          <SplitFeature
            className={`${styles.homeFeature} ${styles.experienceFeature}`}
            image={experience.image}
            imageAlt={experience.imageAlt}
          >
            <SectionIntro eyebrow="578 INTERIORS" title={experience.title}>
              <p>{experience.text}</p>
              <p className={styles.opening}>Opening late 2026</p>
            </SectionIntro>
            <TextAction to={experience.href}>DISCOVER 578 INTERIORS</TextAction>
          </SplitFeature>
        </section>

        <section className={styles.news} aria-labelledby="news-title" data-reveal-group="true" data-surface="tint">
          <p className={styles.eyebrow} data-reveal-item="text">News</p>
          <h2 className={styles.visuallyHidden} id="news-title">News</h2>
          <div className={styles.newsGrid}>
            {news.map((item, index) => (
              <article className={styles.newsCard} data-reveal-item="card" key={item.title} style={{ '--reveal-delay': `${index * 45}ms` }}>
                <Link to={item.href}>
                  <img
                    alt={item.alt}
                    height="68"
                    loading="lazy"
                    src={item.src}
                    width="86"
                  />
                  <div>
                    {item.date && <p className={styles.newsDate}>{item.date}</p>}
                    <h3>{item.title}</h3>
                    <span className={styles.cardAction}>Read more -&gt;</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter divided={false} variant="brand" />
    </>
  );
}

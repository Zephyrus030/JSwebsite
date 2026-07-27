import { useEffect } from 'react';
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
  useEffect(() => {
    const onWheel = (event) => {
      if (event.deltaY <= 0 || window.scrollY > 12) return;
      const heroElement = document.querySelector('[data-hero-layout="full-bleed"]');
      const nextSection = heroElement?.nextElementSibling;
      if (!nextSection) return;
      event.preventDefault();
      window.scrollTo({ top: nextSection.offsetTop, behavior: 'smooth' });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero
          {...hero}
          className={styles.homeHero}
          height="calc(100svh - 4.5rem)"
          layout="full-bleed"
        />

        <Reveal className={styles.homeReveal}>
          <SplitFeature
            className={styles.homeFeature}
            image={about.image}
            imageAlt={about.imageAlt}
          >
            <SectionIntro eyebrow="About JS Building Group" title={about.title}>
              <p>{about.text}</p>
            </SectionIntro>
            <TextAction to="/about" />
          </SplitFeature>
        </Reveal>

        <section className={styles.brands} aria-labelledby="brands-title">
          <p className={styles.eyebrow}>Our brands</p>
          <h2 className={styles.visuallyHidden} id="brands-title">Our brands</h2>
          <div className={styles.brandGrid}>
            {brands.map((brand) => (
              <article className={styles.brandCard} key={brand.title}>
                <Link to={brand.href}>
                  <h3>{brand.title}</h3>
                  <p className={styles.brandSubtitle}>{brand.subtitle}</p>
                  <p>{brand.text}</p>
                  <span className={styles.cardAction}>Visit website -&gt;</span>
                  <figure>
                    <img alt={brand.alt} loading="lazy" src={brand.src} />
                  </figure>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="578 Experience">
          <h2 className={styles.visuallyHidden}>578 Experience</h2>
          <SplitFeature
            className={styles.homeFeature}
            image={experience.image}
            imageAlt={experience.imageAlt}
          >
            <SectionIntro eyebrow="578 Experience" title={experience.title}>
              <p>{experience.text}</p>
              <p className={styles.opening}>Opening late 2026</p>
            </SectionIntro>
            <TextAction to={experience.href} />
          </SplitFeature>
        </section>

        <section className={styles.news} aria-labelledby="news-title">
          <p className={styles.eyebrow}>News</p>
          <h2 className={styles.visuallyHidden} id="news-title">News</h2>
          <div className={styles.newsGrid}>
            {news.map((item) => (
              <article className={styles.newsCard} key={item.title}>
                <Link to={item.href}>
                  <img
                    alt={item.alt}
                    height="68"
                    loading="lazy"
                    src={item.src}
                    width="86"
                  />
                  <div>
                    <p className={styles.newsDate}>{item.date}</p>
                    <h3>{item.title}</h3>
                    <span className={styles.cardAction}>Read more -&gt;</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter variant="brand" />
    </>
  );
}

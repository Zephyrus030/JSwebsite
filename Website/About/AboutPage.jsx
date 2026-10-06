import SiteHeader from '../Shared/components/SiteHeader';
import SiteFooter from '../Shared/components/SiteFooter';
import styles from './AboutPage.module.css';

const sections = {
  introduction: {
    title: 'Where Building Becomes Living.',
    body: 'JS Building Group began in Australia in 2017 as a building materials supplier. Over time, we have grown into an integrated group bringing together construction, building materials, showrooms and local cabinetry manufacturing.\n\nOur background in materials gives us a deeper understanding of how homes should be built. By connecting design, product selection, supply and construction under one group, we can respond faster, maintain greater control over quality and create a more seamless experience for our clients — from the first idea through to the final detail.',
  },
  ambition: {
    title: ['One group.', 'One connected way to build.'],
    body: 'From construction and materials to cabinetry and finishes, we bring the key parts of the home together under one group. This gives our clients a simpler, more connected experience — with better communication, faster solutions and greater control over quality throughout the build.\n\nEvery decision is made with one goal in mind: to create a home that works beautifully as a whole, not just as a collection of individual parts.',
  },
  choice: {
    title: 'Why choose JS Building Group?',
    body: 'Our Melbourne-based team and local manufacturing capability keep us close to every stage—from the first idea to the final delivery.\n\nAcross our projects, products and brands, this gives us greater control over quality, consistency and service.',
  },
};

function Rule() {
  return <span aria-hidden="true" className={styles.rule} />;
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={`${styles.storySection} ${styles.intro}`} aria-labelledby="page-title" data-motion-sequence="page-intro" data-surface="paper">
          <figure className={styles.imageFrame}>
            <img alt="Minimalist hallway with timber doors and soft natural light" className={styles.image} data-motion-step="image" src="/assets/update914/about-introduction.webp" />
          </figure>
          <div className={`${styles.copy} ${styles.introCopy} ${styles.spaciousCopy}`}>
            <h1 className={styles.quieterHeading} data-motion-step="title" data-page-heading id="page-title" tabIndex="-1">{sections.introduction.title}</h1>
            <Rule />
            {sections.introduction.body.split('\n\n').map((paragraph) => <p data-motion-step="copy" key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <section className={`${styles.storySection} ${styles.tinted} ${styles.ambition}`} aria-labelledby="ambition-title" data-reveal-group="true" data-surface="tint">
          <div className={styles.copy} data-reveal-item="text">
            <h2 className={styles.quieterHeading} id="ambition-title">
              <span>{sections.ambition.title[0]}</span>{' '}<br />
              <span>{sections.ambition.title[1]}</span>
            </h2>
            <Rule />
            {sections.ambition.body.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <figure className={styles.imageFrame} data-reveal-item="image">
            <img alt="JS Building Group building entrance" className={styles.image} loading="lazy" src="/assets/about-building-entrance.webp" />
          </figure>
        </section>

        <section className={`${styles.storySection} ${styles.choice}`} aria-labelledby="choice-title" data-reveal-group="true" data-surface="paper">
          <figure className={styles.imageFrame} data-reveal-item="image">
            <img alt="JS Building Group western factory" className={styles.image} loading="lazy" src="/assets/about-western-factory.webp" />
          </figure>
          <div className={styles.copy} data-reveal-item="text">
            <h2 className={styles.quieterHeading} id="choice-title">{sections.choice.title}</h2>
            <Rule />
            {sections.choice.body.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <section className={`${styles.journey} ${styles.tinted}`} aria-labelledby="journey-title" data-reveal-group="true" data-surface="tint">
          <div className={styles.journeyInner}>
            <h2 className={styles.visuallyHidden} id="journey-title">Our journey</h2>
            <img alt="JS Building Group journey timeline" className={styles.journeyImage} data-reveal-item="image" loading="lazy" src="/assets/about-journey.webp" />
          </div>
        </section>

        <section className={styles.locations} aria-labelledby="locations-title" data-reveal-group="true" data-surface="paper">
          <div className={styles.locationList} data-reveal-item="text">
            <h2 className={styles.visuallyHidden} id="locations-title">Our locations</h2>
            <address>
              <strong>Head office</strong>
              <span>1 Aristoc Rd, Glen Waverley 3150 VIC</span>
            </address>
            <address>
              <strong>578 Interiors</strong>
              <span>574-578 Canterbury Road, Vermont 3133 VIC</span>
            </address>
            <address>
              <strong>Western factory</strong>
              <span>29-31 Horne St, Hoppers Crossing 3029 VIC</span>
            </address>
          </div>
          <figure className={`${styles.mapFrame} ${styles.mapBleed}`} data-reveal-item="image">
            <img alt="Melbourne locations map" className={styles.mapImage} data-fit="contain" loading="lazy" src="/assets/about-locations.webp" />
          </figure>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

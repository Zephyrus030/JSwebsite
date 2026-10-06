import { contactDetails, locations } from './contactData';
import SiteFooter from '../Shared/components/SiteFooter';
import SiteHeader from '../Shared/components/SiteHeader';
import styles from './ContactPage.module.css';

function ContactIcon({ name }) {
  return (
    <svg aria-hidden="true" className={styles.contactIcon} fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24">
      {name === 'location' && <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>}
      {name === 'email' && <><rect height="16" rx="1" width="22" x="1" y="4" /><path d="m2 5 10 8L22 5" /></>}
      {name === 'phone' && <path d="M8 3 5 2C3 3 2 5 3 8c2 6 7 11 13 13 3 1 5 0 6-2l-1-3-5-2-2 2c-3-1-5-3-6-6l2-2-2-5Z" />}
    </svg>
  );
}

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.intro} data-motion-sequence="page-intro" data-surface="paper">
          <p data-motion-step="eyebrow">Contact</p>
          <h1 data-motion-step="title" data-page-heading tabIndex="-1">Plan your visit.</h1>
          <span data-motion-step="copy">Discover the materials. Meet the makers.<br />Find a place to begin your next project.</span>
        </header>

        <section className={styles.locationSection} aria-labelledby="locations-title" data-surface="paper">
          <h2 className={styles.srOnly} id="locations-title">Visit locations</h2>
          <div className={styles.locations}>
            {locations.map((location, index) => (
              <article aria-labelledby={`location-${index}`} className={styles.locationCard} data-reveal-group="true" key={location.name}>
                <div className={styles.locationContent} data-reveal-item="text">
                  <p className={styles.locationLabel}>{location.category}</p>
                  <h2 id={`location-${index}`}>{location.name}</h2>
                  <p className={styles.locationDescription}>{location.description}</p>
                  {location.status && (
                    <p className={styles.locationStatus} data-location-status>{location.status}</p>
                  )}
                  <span aria-hidden="true" className={styles.rule} />
                  <address className={styles.contactDetails}>
                    <div className={styles.contactRow}>
                      <ContactIcon name="location" />
                      <span>{location.address.map((line) => <span className={styles.addressLine} key={line}>{line}</span>)}</span>
                    </div>
                    <a className={styles.contactRow} href={`mailto:${contactDetails.email}`}>
                      <ContactIcon name="email" /><span>{contactDetails.email}</span>
                    </a>
                    <a className={`${styles.contactRow} ${styles.phone}`} href={contactDetails.phoneHref}>
                      <ContactIcon name="phone" /><span>{contactDetails.phone}</span>
                    </a>
                  </address>
                </div>
                <div className={styles.locationImages} data-reveal-item="image">
                  {location.images.map((image) => (
                    <figure className={styles.imageFrame} key={image.src}>
                      <img alt={image.alt} loading="lazy" src={image.src} />
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter variant="brand" />
    </>
  );
}

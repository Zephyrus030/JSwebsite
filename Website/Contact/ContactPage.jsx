import AppointmentForm from './AppointmentForm';
import { locations } from './contactData';
import LocationMap from '../Shared/components/LocationMap';
import SiteFooter from '../Shared/components/SiteFooter';
import SiteHeader from '../Shared/components/SiteHeader';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <header className={styles.intro}>
          <p>Contact</p>
          <h1 data-page-heading tabIndex="-1">Plan your visit.</h1>
          <span>Experience our showroom,<br />meet the makers and explore your project in person.</span>
        </header>

        <section className={styles.locations} aria-labelledby="locations-title">
          <h2 className={styles.srOnly} id="locations-title">Visit locations</h2>
          {locations.map((location) => (
            <article className={styles.locationCard} key={location.name}>
              <div className={styles.locationImages}>
                {location.images.map((image) => <img alt={image.alt} key={image.src} loading="lazy" src={image.src} />)}
              </div>
              <div className={styles.locationContent}>
                <h2>{location.name}</h2>
                <span className={styles.rule} />
                <address>{location.address.map((line) => <span key={line}>{line}</span>)}</address>
                <p>Phone {location.phone}</p>
                <a href="#appointment">{location.action} <span aria-hidden="true">→</span></a>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.appointment} id="appointment" aria-labelledby="appointment-title">
          <header>
            <h2 id="appointment-title">Book an appointment</h2>
            <p>Tell us where and when you would like to visit.</p>
          </header>
          <AppointmentForm />
        </section>
      </main>
      <LocationMap compact />
      <SiteFooter variant="compact" />
    </>
  );
}

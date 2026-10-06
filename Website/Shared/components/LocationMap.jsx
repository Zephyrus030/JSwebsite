import styles from './LocationMap.module.css';

export default function LocationMap({ compact = false, surface, image = '/assets/contact-map.webp', imageAlt = 'Location map', fit = 'cover' }) {
  return (
    <section className={`${styles.panel} ${compact ? styles.compact : ''}`} aria-label="Locations" data-surface={surface}>
      {!compact && (
        <div className={styles.details}>
          <div>
            <p>Contact</p>
            <span>Head Office</span>
            <span>Level 20, 45 Exhibition Street</span>
            <span>Melbourne VIC 3000</span>
          </div>
          <div>
            <p>Factories</p>
            <span>INTERICH Factory</span>
            <span>29–31 Horne St</span>
            <span>Hoppers Crossing 3029 VIC</span>
          </div>
          <div>
            <p>S Project / Experience Centre</p>
            <span>S Project Centre</span>
            <span>40 Alex Fisher Drive</span>
            <span>South Melbourne VIC 3205</span>
          </div>
        </div>
      )}
      <figure>
        <img alt={imageAlt} data-fit={fit} loading="lazy" src={image} />
      </figure>
    </section>
  );
}

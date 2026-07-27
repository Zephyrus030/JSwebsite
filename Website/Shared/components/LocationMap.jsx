import styles from './LocationMap.module.css';

export default function LocationMap({ compact = false }) {
  return (
    <section className={`${styles.panel} ${compact ? styles.compact : ''}`} aria-label="Locations">
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
            <span>45 Sheehan Drive</span>
            <span>Braeside VIC 3195</span>
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
        <img alt="Location map" loading="lazy" src="/assets/contact-map.webp" />
      </figure>
    </section>
  );
}

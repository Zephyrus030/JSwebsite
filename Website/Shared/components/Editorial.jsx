import styles from './Editorial.module.css';

export function SectionIntro({ eyebrow, title, children, action }) {
  return (
    <header className={styles.intro}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      {title && <h2>{title}</h2>}
      {children && <div className={styles.copy}>{children}</div>}
      {action}
    </header>
  );
}

export function SplitFeature({ image, imageAlt, reverse = false, children, className = '' }) {
  return (
    <section className={`${styles.split} ${reverse ? styles.reverse : ''} ${className}`.trim()} data-reveal-group="true">
      <div className={styles.splitContent} data-reveal-item="text">{children}</div>
      <figure className={styles.splitFigure} data-reveal-item="image">
        <img alt={imageAlt} loading="lazy" src={image} />
      </figure>
    </section>
  );
}

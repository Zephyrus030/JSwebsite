import styles from './Editorial.module.css';

export function SectionIntro({ eyebrow, title, children, action }) {
  return (
    <header className={styles.intro}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2>{title}</h2>
      {children && <div className={styles.copy}>{children}</div>}
      {action}
    </header>
  );
}

export function SplitFeature({ image, imageAlt, reverse = false, children, className = '' }) {
  return (
    <section className={`${styles.split} ${reverse ? styles.reverse : ''} ${className}`.trim()}>
      <div className={styles.splitContent}>{children}</div>
      <figure className={styles.splitFigure}>
        <img alt={imageAlt} loading="lazy" src={image} />
      </figure>
    </section>
  );
}

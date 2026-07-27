import { Link } from 'react-router-dom';
import styles from './MediaGrid.module.css';

export function MediaGrid({
  items,
  minCardWidth = '18rem',
  className = '',
  referenceColumns,
  referenceCount,
  cardTestId,
  gridTestId,
}) {
  const usesReferenceLayout = (
    Number.isInteger(referenceColumns)
    && Number.isInteger(referenceCount)
    && items.length === referenceCount
  );

  return (
    <div
      className={`${styles.grid} ${usesReferenceLayout ? styles.reference : ''} ${className}`.trim()}
      data-layout={usesReferenceLayout ? 'reference' : 'fallback'}
      data-reference-columns={usesReferenceLayout ? referenceColumns : undefined}
      data-testid={gridTestId}
      style={{
        '--card-min': minCardWidth,
        '--reference-columns': usesReferenceLayout ? referenceColumns : undefined,
      }}
    >
      {items.map((item) => {
        const content = (
          <>
            <div
              className={`${styles.media} ${styles[item.ratio]}`}
              data-ratio={item.ratio}
            >
              <img src={item.src} alt={item.alt} loading="lazy" />
            </div>
            {item.meta && <p className={styles.meta}>{item.meta}</p>}
            {item.title && <h3 className={styles.title}>{item.title}</h3>}
            {item.text && <p className={styles.text}>{item.text}</p>}
          </>
        );

        return (
          <article
            className={styles.card}
            data-testid={cardTestId}
            key={`${item.src}-${item.title ?? ''}`}
            style={{
              '--reference-span': usesReferenceLayout ? (item.referenceSpan ?? 1) : undefined,
            }}
          >
            {item.href ? (
              <Link className={styles.link} to={item.href}>
                {content}
              </Link>
            ) : (
              content
            )}
          </article>
        );
      })}
    </div>
  );
}

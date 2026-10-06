import Hero from './Hero';
import { MediaGrid } from './MediaGrid';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import styles from './BrandPage.module.css';

function Copy({ eyebrow, id, title, text }) {
  return (
    <div className={styles.copy} data-reveal-item="text" data-section-copy>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      {title && <h2 id={id}>{title}</h2>}
      {text && <p>{text}</p>}
    </div>
  );
}

function Image({ image, alt, ratio = 'landscape', area, className = '' }) {
  return (
    <figure
      className={`${styles.image} ${styles[ratio]} ${className}`.trim()}
      data-area={area}
      data-reveal-item="image"
      data-ratio={ratio}
      style={{ gridArea: area }}
    >
      <img alt={alt} loading="lazy" src={image} />
    </figure>
  );
}

function MediaMosaic({ items, layout, referenceCount }) {
  const usesReferenceLayout = items.length === referenceCount;

  return (
    <div
      className={`${styles.mediaMosaic} ${usesReferenceLayout ? `${styles.referenceMosaic} ${styles[layout]}` : styles.fallbackMosaic}`}
      data-equal-height={usesReferenceLayout && layout === 'ioak-pair' ? 'true' : undefined}
      data-layout={usesReferenceLayout ? 'reference' : 'fallback'}
      data-media-layout={layout}
      data-mobile-layout="stack"
    >
      {items.map((item) => (
        <Image
          alt={item.alt}
          area={item.area}
          className={styles.mosaicCell}
          image={item.image}
          key={item.area}
          ratio={item.ratio}
        />
      ))}
    </div>
  );
}

function BrandCta({ brandName, cta, embedded = false, surface }) {
  const Container = embedded ? 'div' : 'section';

  return (
    <Container
      className={`${styles.cta} ${embedded ? styles.featureCta : ''}`}
      data-cta-placement={embedded ? 'feature' : 'page-end'}
      data-section-id={surface ? 'interich-cta' : undefined}
      data-surface={surface}
      style={{ '--section-surface': surface ? `var(--brand-${surface})` : undefined }}
    >
      <a href={cta.href} rel="noreferrer" target="_blank">
        Visit {brandName} website <span aria-hidden="true">→</span>
      </a>
      <p>{cta.note}</p>
    </Container>
  );
}

function BrandSection({ section, cta, brandName, surface }) {
  const headingId = `${section.id}-title`;

  if (section.type === 'collections') {
    return (
      <section
        className={`${styles.section} ${styles.collections}`}
        aria-labelledby={headingId}
        data-section-id={section.id}
        data-reveal-group="true"
        data-surface={surface}
        style={{ '--section-surface': surface ? `var(--brand-${surface})` : undefined }}
      >
        <Copy eyebrow={section.eyebrow} id={headingId} title={section.title} text={section.text} />
        <MediaGrid
          items={section.items}
          minCardWidth={section.minCardWidth}
          referenceColumns={section.referenceColumns}
          referenceCount={section.referenceCount}
          style={{
            '--media-gap': section.mediaGap,
            '--media-scale': section.mediaScale,
          }}
        />
        {cta && <BrandCta brandName={brandName} cta={cta} embedded />}
      </section>
    );
  }

  if (section.type === 'swatches') {
    const usesReferenceLayout = (
      section.items.length === section.referenceCount
      && Number.isInteger(section.referenceColumns)
    );

    return (
      <section
        className={`${styles.section} ${styles.swatches}`}
        aria-labelledby={headingId}
        data-section-id={section.id}
        data-reveal-group="true"
        data-surface={surface}
        style={{ '--section-surface': surface ? `var(--brand-${surface})` : undefined }}
      >
        <Copy eyebrow={section.eyebrow} id={headingId} title={section.title} text={section.text} />
        <ul
          aria-label="Available finishes"
          className={`${styles.swatchList} ${usesReferenceLayout ? styles.referenceSwatches : ''}`}
          data-reveal-item="card"
          data-layout={usesReferenceLayout ? 'reference' : 'fallback'}
          style={{
            '--reference-columns': usesReferenceLayout ? section.referenceColumns : undefined,
          }}
        >
          {section.items.map((item) => (
            <li aria-label={item.name} key={item.name}>
              <span aria-hidden="true" className={styles.swatch} style={{ background: item.color }} />
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const copy = (
    <Copy
      eyebrow={section.eyebrow}
      id={headingId}
      text={section.text}
      title={section.title}
    />
  );
  const media = section.mediaItems ? (
    <MediaMosaic
      items={section.mediaItems}
      layout={section.mediaLayout}
      referenceCount={section.mediaReferenceCount}
    />
  ) : (
    <Image image={section.image} alt={section.alt} ratio={section.ratio} />
  );
  const mediaFirst = section.variant === 'media-left-text-right';

  return (
    <section
      aria-labelledby={headingId}
      className={`${styles.section} ${styles.feature} ${styles[section.variant]}`}
      data-variant={section.variant}
      data-section-id={section.id}
      data-reveal-group="true"
      data-surface={surface}
      style={{
        '--feature-max': section.layout?.maxWidth,
        '--media-column': section.layout?.mediaColumn,
        '--section-surface': surface ? `var(--brand-${surface})` : undefined,
        '--text-column': section.layout?.textColumn,
      }}
    >
      {mediaFirst ? media : copy}
      {mediaFirst ? copy : media}
      {cta && <BrandCta brandName={brandName} cta={cta} embedded />}
    </section>
  );
}

export default function BrandPage({ brand, children }) {
  const sectionSurfaces = brand.sections.map((section, index) => (
    section.surface ?? (index % 2 === 0 ? 'paper' : 'deep')
  ));
  const ctaSurface = brand.cta.sectionId
    ? undefined
    : (brand.sections.length % 2 === 0 ? 'paper' : 'deep');
  const pageStyle = {
    '--brand-paper': 'var(--paper)',
    '--brand-deep': 'var(--tint)',
    '--brand-body-size': brand.layout?.bodySize,
    '--brand-section-max': brand.layout?.sectionMax,
    '--brand-section-space': brand.layout?.sectionSpace,
    '--brand-copy-size': brand.layout?.copySize,
    '--brand-copy-max': brand.layout?.copyMax,
    '--brand-statement-max': brand.layout?.statementMax,
    '--brand-statement-lead': brand.layout?.statementLead,
    '--brand-statement-detail': brand.layout?.statementDetail,
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.page} data-brand={brand.slug} style={pageStyle}>
        <Hero {...brand.hero} />
        {brand.statement && (
          <section
            aria-label={brand.statement.title ? undefined : `${brand.name} introduction`}
            aria-labelledby={brand.statement.title ? `${brand.slug}-statement-title` : undefined}
            className={`${styles.statement} ${styles[brand.statement.variant]}`}
            data-reveal-group="true"
            data-statement-variant={brand.statement.variant}
            data-surface="deep"
            style={{ '--section-surface': 'var(--brand-deep)' }}
          >
            {brand.statement.title && (
              <h2 id={`${brand.slug}-statement-title`}>{brand.statement.title}</h2>
            )}
            {brand.statement.image && (
              <figure className={styles.statementImage} data-reveal-item="image">
                <img alt={brand.statement.imageAlt} loading="lazy" src={brand.statement.image} />
              </figure>
            )}
            {brand.statement.lead && <p>{brand.statement.lead}</p>}
            {brand.statement.detail && <p>{brand.statement.detail}</p>}
          </section>
        )}
        {brand.sections.map((section, index) => (
          <BrandSection
            brandName={brand.name}
            cta={brand.cta.sectionId === section.id ? brand.cta : undefined}
            key={section.id}
            section={section}
            surface={sectionSurfaces[index]}
          />
        ))}
        {!brand.cta.sectionId && (
          <BrandCta
            brandName={brand.name}
            cta={brand.cta}
            surface={ctaSurface}
          />
        )}
        {children}
      </main>
      <SiteFooter variant="brand" />
    </>
  );
}

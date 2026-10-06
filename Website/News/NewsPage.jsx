import SiteFooter from '../Shared/components/SiteFooter';
import SiteHeader from '../Shared/components/SiteHeader';
import { newsStories } from './newsData';
import styles from './NewsPage.module.css';

export default function NewsPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.intro} data-motion-sequence="page-intro" data-surface="paper">
          <div>
            <p className={styles.eyebrow} data-motion-step="eyebrow">News</p>
            <h1 data-motion-step="title" data-page-heading tabIndex="-1">Latest from JS<br /> Building Group.</h1>
          </div>
          <div className={styles.summary} data-motion-step="copy">
            <p className={styles.eyebrow}>{String(newsStories.length).padStart(2, '0')} stories</p>
            <p>Updates from our brands,<br />projects, materials and spaces.</p>
          </div>
        </header>

        <section className={styles.stories} aria-label="Latest news" data-testid="news-grid">
          {newsStories.map((story) => (
            <article aria-labelledby={`${story.id}-title`} className={styles.story} data-reveal-group="true" data-story-id={story.id} data-testid="news-card" key={story.id}>
              <div className={styles.storyImages} data-reveal-item="image">
                {story.images.map((image) => (
                  <figure key={image.src}>
                    <img
                      alt={image.alt}
                      loading="lazy"
                      src={image.src}
                      style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
                    />
                  </figure>
                ))}
              </div>
              <div className={styles.storyContent} data-reveal-item="text">
                <div className={styles.storyMeta}>
                  <p className={styles.eyebrow}>{story.category}</p>
                  {story.date && <time dateTime={story.dateTime}>{story.date}</time>}
                </div>
                <h2 id={`${story.id}-title`}>{story.title}</h2>
                <p className={styles.storyCopy} data-story-copy>{story.text}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter variant="brand" />
    </>
  );
}

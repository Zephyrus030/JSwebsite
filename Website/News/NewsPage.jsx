import { useMemo, useState } from 'react';
import { MediaGrid } from '../Shared/components/MediaGrid';
import LocationMap from '../Shared/components/LocationMap';
import SiteFooter from '../Shared/components/SiteFooter';
import SiteHeader from '../Shared/components/SiteHeader';
import { filterProjects, newsCategories, newsProjects } from './newsData';
import styles from './NewsPage.module.css';

export default function NewsPage({ initialLimit = newsProjects.length }) {
  const [category, setCategory] = useState('ALL');
  const [limit, setLimit] = useState(initialLimit);
  const projects = useMemo(
    () => filterProjects(newsProjects, category),
    [category],
  );
  const visibleProjects = projects.slice(0, limit).map((project) => ({
    ...project,
    meta: `${project.date} · ${project.location}`,
    text: `BY ${project.brand}`,
  }));

  function selectCategory(nextCategory) {
    setCategory(nextCategory);
    setLimit(initialLimit);
  }

  return (
    <>
      <SiteHeader />
      <main>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>News</p>
          <h1 data-page-heading tabIndex="-1">Latest projects from across<br />the Group.</h1>
          <p>A selection of recent works by S Project, INTERICH, IOAK and FLUX.</p>
        </header>

        <section className={styles.projects} aria-labelledby="projects-heading">
          <h2 className={styles.srOnly} id="projects-heading">Latest projects</h2>
          <div aria-label="Project category" className={styles.filters} role="group">
            {newsCategories.map((item) => (
              <button
                aria-pressed={category === item}
                className={category === item ? styles.activeFilter : ''}
                key={item}
                onClick={() => selectCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <MediaGrid
            cardTestId="news-card"
            className={styles.newsGrid}
            gridTestId="news-grid"
            items={visibleProjects}
            minCardWidth="13rem"
            referenceColumns={4}
            referenceCount={8}
          />
          {limit < projects.length && (
            <div className={styles.loadMore}>
              <button onClick={() => setLimit((current) => current + 4)} type="button">
                Load more projects <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </section>
      </main>
      <LocationMap />
      <SiteFooter variant="brand" />
    </>
  );
}

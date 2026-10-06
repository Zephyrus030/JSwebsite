import { useState } from 'react';
import BrandPage from '../../Shared/components/BrandPage';
import { sProject } from './brandData';
import styles from './SProjectPage.module.css';

const selectedProjects = [
  { year: '2025', cover: '/assets/s-project-2025-cover.webp', preview: '/assets/s-project-2025-hover.webp' },
  { year: '2024', cover: '/assets/s-project-2024-cover.webp', preview: '/assets/s-project-2024-hover.webp' },
];

function ProjectCard({ project }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const caption = `S Project | ${project.year} Completed`;

  return (
    <figure className={styles.projectCard}>
      <button
        aria-label={`Preview ${caption}`}
        aria-pressed={previewOpen}
        className={styles.projectImages}
        onClick={() => setPreviewOpen((open) => !open)}
        type="button"
      >
        <img alt={`${project.year} completed S Project residence`} loading="lazy" src={project.cover} />
        <img alt="" className={styles.projectPreview} loading="lazy" src={project.preview} />
      </button>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function SProjectPage() {
  return (
    <div className={styles.page}>
      <BrandPage brand={sProject}>
        <section
          aria-labelledby="s-project-selected-title"
          className={styles.selectedProjects}
          data-section-id="s-project-selected"
        >
          <header className={styles.selectedHeading}>
            <p>S PROJECT / <span>SELECTED WORK</span></p>
            <h2 id="s-project-selected-title">Selected Projects</h2>
          </header>
          <div className={styles.projectGrid}>
            {selectedProjects.map((project) => <ProjectCard key={project.year} project={project} />)}
          </div>
        </section>
      </BrandPage>
    </div>
  );
}

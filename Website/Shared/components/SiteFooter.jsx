import { Link } from 'react-router-dom';
import { primaryNavigation } from '../data/navigation';
import styles from './SiteFooter.module.css';

export default function SiteFooter({ variant = 'default' }) {
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <footer className={`${styles.footer} ${styles.compactFooter}`} data-variant={variant}>
        <div className={styles.compactBrand} aria-label="JS Building Group">
          <span>JS</span>
          <span>BUILDING GROUP</span>
        </div>
        <small>© JS Building Group {new Date().getFullYear()}</small>
        <nav aria-label="Social links" className={styles.compactNavigation}>
          <a href="https://www.linkedin.com/" rel="noreferrer" target="_blank">LinkedIn</a>
          <a href="https://www.instagram.com/" rel="noreferrer" target="_blank">Instagram</a>
        </nav>
      </footer>
    );
  }

  return (
    <footer
      className={`${styles.footer} ${variant === 'brand' ? styles.brandFooter : ''}`}
      data-variant={variant}
    >
      <div className={styles.brand}>
        <p>JS BUILDING GROUP</p>
        <p>Building better living through considered spaces and materials.</p>
      </div>
      <address className={styles.address}>
        <span>578 Church Street</span>
        <span>Richmond VIC 3121</span>
        <a href="tel:+61394281900">+61 3 9428 1900</a>
      </address>
      <nav aria-label="Footer navigation" className={styles.navigation}>
        {primaryNavigation.map((item) => (
          <Link key={item.href} to={item.href}>
            {item.label}
          </Link>
        ))}
        <a href="https://www.instagram.com/" rel="noreferrer" target="_blank">
          Instagram
        </a>
      </nav>
      <small>© {new Date().getFullYear()} JS Building Group</small>
    </footer>
  );
}

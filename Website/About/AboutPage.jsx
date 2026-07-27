import { Link } from 'react-router-dom';
import SiteFooter from '../Shared/components/SiteFooter';
import SiteHeader from '../Shared/components/SiteHeader';
import styles from './AboutPage.module.css';

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section aria-labelledby="page-title">
          <p>JS Building Group</p>
          <h1 data-page-heading id="page-title" tabIndex="-1">About</h1>
          <span>Coming soon</span>
          <Link to="/">Home <span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

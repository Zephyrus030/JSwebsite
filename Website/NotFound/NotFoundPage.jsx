import { Link } from 'react-router-dom';
import SiteFooter from '../Shared/components/SiteFooter';
import SiteHeader from '../Shared/components/SiteHeader';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section aria-labelledby="page-title">
          <p>404</p>
          <h1 data-page-heading id="page-title" tabIndex="-1">Page not found</h1>
          <span>The page you are looking for is not available.</span>
          <Link to="/">Home <span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

import BrandPage from '../../Shared/components/BrandPage';
import { ioak } from './brandData';
import styles from './IoakPage.module.css';

export default function IoakPage() {
  return (
    <div className={styles.page}>
      <BrandPage brand={{ ...ioak, hero: { ...ioak.hero, className: styles.hero } }} />
    </div>
  );
}

import BrandPage from '../../Shared/components/BrandPage';
import { interich } from './brandData';
import styles from './InterichPage.module.css';

export default function InterichPage() {
  return <div className={styles.page}><BrandPage brand={interich} /></div>;
}

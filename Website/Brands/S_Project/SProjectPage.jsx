import BrandPage from '../../Shared/components/BrandPage';
import { sProject } from './brandData';
import styles from './SProjectPage.module.css';

export default function SProjectPage() {
  return <div className={styles.page}><BrandPage brand={sProject} /></div>;
}

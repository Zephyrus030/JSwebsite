import BrandPage from '../../Shared/components/BrandPage';
import { flux } from './brandData';
import styles from './FluxPage.module.css';

export default function FluxPage() {
  return <div className={styles.page}><BrandPage brand={flux} /></div>;
}

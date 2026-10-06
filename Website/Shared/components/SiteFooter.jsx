import { Link } from 'react-router-dom';
import styles from './SiteFooter.module.css';

const exploreLinks = [
  { label: 'About', href: '/about' },
  { label: '578 Interiors', href: '/experience' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
];

const brandLinks = [
  { label: 'IOAK', href: '/brands/ioak' },
  { label: 'FLUX', href: '/brands/flux' },
  { label: 'INTERICH', href: '/brands/interich' },
  { label: 'S PROJECT', href: '/brands/s-project' },
];

const socialLinks = [
  { name: 'TikTok', href: 'https://www.tiktok.com/' },
  { name: 'Instagram', href: 'https://www.instagram.com/' },
  { name: '小红书', href: 'https://www.xiaohongshu.com/' },
];

const locations = [
  { name: 'Head office', address: '1 Aristoc Rd, Glen Waverley 3150 VIC' },
  { name: '578 Interiors', address: '574–578 Canterbury Road, Vermont 3133 VIC' },
  { name: 'Western factory', address: '29–31 Horne St, Hoppers Crossing 3029 VIC' },
];

function FooterIcon({ name }) {
  return (
    <svg aria-hidden="true" className={styles.icon} fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24">
      {name === 'phone' && <path d="M8 3 5 2C3 3 2 5 3 8c2 6 7 11 13 13 3 1 5 0 6-2l-1-3-5-2-2 2c-3-1-5-3-6-6l2-2-2-5Z" />}
      {name === 'email' && <><rect height="16" rx="1" width="22" x="1" y="4" /><path d="m2 5 10 8L22 5" /></>}
      {name === 'location' && <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>}
      {name === 'Instagram' && <><rect height="20" rx="6" width="20" x="2" y="2" /><circle cx="12" cy="12" r="4.5" /><circle cx="18" cy="6" fill="currentColor" r="1" stroke="none" /></>}
      {name === 'TikTok' && <path d="M14 2h4c.3 3 2 5 5 5v4c-2 0-4-.7-5-2v8a6 6 0 1 1-6-6v4a2 2 0 1 0 2 2V2Z" fill="currentColor" stroke="none" />}
      {name === '小红书' && <><rect fill="currentColor" height="22" rx="4" stroke="none" width="24" y="1" /><text fill="var(--paper)" fontSize="7" fontWeight="700" stroke="none" textAnchor="middle" x="12" y="15">小红书</text></>}
    </svg>
  );
}

function FooterNavigation({ title, links }) {
  return (
    <nav aria-label={title} className={styles.navigation}>
      <h2 className={styles.heading}>{title}</h2>
      <ul className={styles.linkList}>
        {links.map((link) => <li key={link.href}><Link to={link.href}>{link.label}</Link></li>)}
      </ul>
    </nav>
  );
}

export default function SiteFooter({ variant = 'default', divided = true }) {
  return (
    <footer className={`${styles.footer}${divided ? ` ${styles.divided}` : ''}`} data-variant={variant}>
      <div className={styles.main}>
        <div className={styles.brand}>
          <p className={styles.brandName}>JS BUILDING GROUP</p>
          <p className={styles.tagline}>Building better living through considered spaces and materials.</p>
        </div>
        <div className={styles.details}>
          <FooterNavigation links={exploreLinks} title="Explore" />
          <FooterNavigation links={brandLinks} title="Our brands" />
          <div className={styles.contact}>
            <h2 className={styles.heading}>Contact</h2>
            <address className={styles.contactLinks}>
              <a href="tel:+61380862666"><FooterIcon name="phone" /><span>(03) 8086 2666</span></a>
              <a href="mailto:info@jsbuildinggroup.com.au"><FooterIcon name="email" /><span>info@jsbuildinggroup.com.au</span></a>
            </address>
            <ul aria-label="Social media" className={styles.socials}>
              {socialLinks.map(({ name, href }) => (
                <li key={name}>
                  <a aria-label={name} className={styles.socialIcon} href={href} rel="noopener noreferrer" target="_blank" title={name}><FooterIcon name={name} /></a>
                </li>
              ))}
            </ul>
          </div>
          <section aria-label="Locations" className={styles.locations}>
            <h2 className={styles.locationsHeading}><FooterIcon name="location" /><span>Locations</span></h2>
            <div className={styles.locationGrid}>
              {locations.map((location) => (
                <address key={location.name}>
                  <h3>{location.name}</h3>
                  <p>{location.address}</p>
                </address>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className={styles.copyright}><small>© JS Building Group. All rights reserved.</small></div>
    </footer>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { brandNavigation, primaryNavigation } from '../data/navigation';
import styles from './SiteHeader.module.css';

export default function SiteHeader() {
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const brandsTriggerRef = useRef(null);
  const mobileTriggerRef = useRef(null);
  const mobilePanelRef = useRef(null);

  useEffect(() => {
    const updateScrolled = (event) => {
      const position = window.scrollY || event?.target?.scrollY || 0;
      setScrolled(position > 12);
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setBrandsOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobilePanelRef.current?.querySelector('button, a[href]')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const closeBrandsWithFocus = () => {
    setBrandsOpen(false);
    brandsTriggerRef.current?.focus();
  };

  const closeMobileMenu = (restoreFocus = false) => {
    setMobileOpen(false);
    setMobileBrandsOpen(false);
    if (restoreFocus) mobileTriggerRef.current?.focus();
  };

  const handleMobileKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMobileMenu(true);
      return;
    }

    if (event.key !== 'Tab') return;

    const controls = mobilePanelRef.current?.querySelectorAll(
      'button:not([disabled]), a[href]',
    );
    if (!controls?.length) return;

    const firstControl = controls[0];
    const lastControl = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === firstControl) {
      event.preventDefault();
      lastControl.focus();
    } else if (!event.shiftKey && document.activeElement === lastControl) {
      event.preventDefault();
      firstControl.focus();
    }
  };

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      data-scrolled={scrolled}
      ref={headerRef}
      role="banner"
    >
      <Link className={styles.logo} to="/" aria-label="JS Building Group home">
        <img
          alt="JS Building Group"
          className={styles.logoImage}
          src="/assets/js-building-group-logo.png"
        />
      </Link>

      <nav className={styles.desktopNav} aria-label="Primary navigation">
        <NavLink className={styles.navItem} onClick={() => setBrandsOpen(false)} to="/about">About</NavLink>
        <div
          className={styles.brandGroup}
          onMouseEnter={() => setBrandsOpen(true)}
          onMouseLeave={() => setBrandsOpen(false)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setBrandsOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeBrandsWithFocus();
            }
          }}
        >
          <button
            aria-controls="brands-menu"
            aria-expanded={brandsOpen}
            className={`${styles.navButton} ${styles.navItem}`}
            onClick={() => setBrandsOpen(true)}
            ref={brandsTriggerRef}
            type="button"
          >
            Our Brands
          </button>
          {brandsOpen && (
            <div className={styles.brandsMenu} id="brands-menu">
              {brandNavigation.map((item) => (
                <NavLink className={styles.navItem} key={item.href} onClick={() => setBrandsOpen(false)} to={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
        {primaryNavigation.slice(1).map((item) => (
          <NavLink className={styles.navItem} key={item.href} onClick={() => setBrandsOpen(false)} to={item.href}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        aria-controls="mobile-menu"
        aria-expanded={mobileOpen}
        aria-label="Menu"
        className={styles.mobileToggle}
        onClick={() => setMobileOpen((open) => !open)}
        ref={mobileTriggerRef}
        type="button"
      >
        MENU
      </button>

      {mobileOpen && (
        <div
          aria-label="Site navigation"
          aria-modal="true"
          className={styles.mobilePanel}
          id="mobile-menu"
          onKeyDown={handleMobileKeyDown}
          ref={mobilePanelRef}
          role="dialog"
        >
          <nav aria-label="Mobile navigation">
            <button
              aria-expanded={mobileBrandsOpen}
              className={`${styles.mobileBrandToggle} ${styles.navItem}`}
              onClick={() => setMobileBrandsOpen((open) => !open)}
              type="button"
            >
              Our Brands
            </button>
            {mobileBrandsOpen && (
              <div className={styles.mobileBrandLinks}>
                {brandNavigation.map((item) => (
                  <NavLink className={styles.navItem} key={item.href} onClick={() => closeMobileMenu()} to={item.href}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
            {primaryNavigation.map((item) => (
              <NavLink className={styles.navItem} key={item.href} onClick={() => closeMobileMenu()} to={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

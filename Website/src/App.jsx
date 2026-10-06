import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AboutPage from '../About/AboutPage';
import FluxPage from '../Brands/FLUX/FluxPage';
import InterichPage from '../Brands/INTERICH/InterichPage';
import IoakPage from '../Brands/IOAK/IoakPage';
import SProjectPage from '../Brands/S_Project/SProjectPage';
import ContactPage from '../Contact/ContactPage';
import ExperiencePage from '../Experience/ExperiencePage';
import Homepage from '../Homepage/Homepage';
import NewsPage from '../News/NewsPage';
import NotFoundPage from '../NotFound/NotFoundPage';
import EditorMode from '../Shared/editor/EditorMode';
import ScrollRevealObserver from '../Shared/motion/ScrollRevealObserver';

const ENLARGED_PAGE_PATHS = new Set([
  '/',
  '/brands/s-project',
  '/brands/interich',
  '/brands/ioak',
  '/brands/flux',
  '/experience',
]);

export function PageViewport({ children }) {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const isEnlarged = ENLARGED_PAGE_PATHS.has(normalizedPath);

  return (
    <div
      data-page-viewport
      data-page-scale={isEnlarged ? '1.1' : undefined}
      style={isEnlarged ? { '--page-scale': 1.1 } : undefined}
    >
      {children}
    </div>
  );
}

export function RouteFocus() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.querySelector('[data-page-heading]')?.focus();
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <EditorMode>
      <RouteFocus />
      <PageViewport>
        <ScrollRevealObserver />
        <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/brands/s-project" element={<SProjectPage />} />
        <Route path="/brands/interich" element={<InterichPage />} />
        <Route path="/brands/ioak" element={<IoakPage />} />
        <Route path="/brands/flux" element={<FluxPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageViewport>
    </EditorMode>
  );
}

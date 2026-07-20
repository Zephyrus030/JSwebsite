import { Route, Routes } from 'react-router-dom';
import AboutPage from '../About/AboutPage';
import FluxPage from '../Brands/FLUX/FluxPage';
import InterichPage from '../Brands/INTERICH/InterichPage';
import IoakPage from '../Brands/IOAK/IoakPage';
import SProjectPage from '../Brands/S_Project/SProjectPage';
import ContactPage from '../Contact/ContactPage';
import ExperiencePage from '../Experience/ExperiencePage';
import Homepage from '../Homepage/Homepage';
import NewsPage from '../News/NewsPage';
import NotFoundPage from '../Shared/NotFoundPage';

export default function App() {
  return (
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
  );
}

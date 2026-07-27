export const newsCategories = ['ALL', 'S PROJECT', 'INTERICH', 'IOAK', 'FLUX'];

export const newsProjects = [
  { title: 'Brighton Residence', brand: 'S PROJECT', date: '02 MAY 2024', location: 'BRIGHTON, VIC', src: '/assets/news-brighton.webp', alt: 'Brighton residence entry framed by mature trees', ratio: 'portrait' },
  { title: 'Kew Kitchen', brand: 'INTERICH', date: '24 APR 2024', location: 'KEW, VIC', src: '/assets/news-kew-kitchen.webp', alt: 'Timber kitchen with a stone island and black stools', ratio: 'portrait' },
  { title: 'Toorak Herringbone', brand: 'IOAK', date: '19 APR 2024', location: 'TOORAK, VIC', src: '/assets/news-toorak-herringbone.webp', alt: 'Light timber herringbone flooring', ratio: 'portrait' },
  { title: 'Arc Collection', brand: 'FLUX', date: '10 APR 2024', location: 'PRAHRAN, VIC', src: '/assets/news-arc-collection.webp', alt: 'Matte black tapware on a pale stone bench', ratio: 'portrait' },
  { title: 'Hawthorn House', brand: 'S PROJECT', date: '28 MAR 2024', location: 'HAWTHORN, VIC', src: '/assets/news-hawthorn-house.webp', alt: 'Courtyard garden of a contemporary home', ratio: 'portrait' },
  { title: 'Canterbury Dressing Room', brand: 'INTERICH', date: '20 MAR 2024', location: 'CANTERBURY, VIC', src: '/assets/news-canterbury-dressing-room.webp', alt: 'Custom timber dressing room cabinetry', ratio: 'portrait' },
  { title: 'Natural Oak Residence', brand: 'IOAK', date: '14 MAR 2024', location: 'ARMADALE, VIC', src: '/assets/news-natural-oak-residence.webp', alt: 'Living room with timber flooring and garden outlook', ratio: 'portrait' },
  { title: 'Vermont Ensuite', brand: 'FLUX', date: '06 MAR 2024', location: 'MALVERN, VIC', src: '/assets/news-vermont-ensuite.webp', alt: 'Stone ensuite with wall-mounted black tapware', ratio: 'portrait' },
];

export function filterProjects(projects, category) {
  return category === 'ALL'
    ? projects
    : projects.filter((project) => project.brand === category);
}

const asset = (file) => `/assets/${file}`;

export const experience = {
  hero: {
    image: asset('experience-hero.webp'),
    imageAlt: 'Facade of the 578 Experience showroom on Church Street',
    title: '578 Experience',
    subtitle: 'A destination where every detail comes together.',
    opening: 'Opening late 2026',
  },
  introduction: {
    eyebrow: 'About the 578 Experience',
    title: 'A destination where every detail comes together.',
    paragraphs: [
      'A 1,000m² centre, the 578 Experience brings INTERICH, FLUX and IOAK together in one inspiring physical space.',
      'Explore the finest in building, interiors and home living — and connect with the experts behind every detail.',
    ],
    image: asset('experience-introduction.webp'),
    imageAlt: 'A refined kitchen at the 578 Experience showroom',
  },
  showroomZones: [
    {
      src: asset('experience-interich-zone.webp'),
      alt: 'INTERICH cabinetry showroom kitchen',
      title: 'INTERICH — Cabinetry Zone',
      text: 'Premium full-home cabinetry and joinery.',
      ratio: 'portrait',
    },
    {
      src: asset('experience-flux-zone.webp'),
      alt: 'FLUX tapware showroom bathroom',
      title: 'FLUX — Tapware Zone',
      text: 'A refined showcase of tapware and bathroom solutions.',
      ratio: 'portrait',
    },
    {
      src: asset('experience-ioak-zone.webp'),
      alt: 'IOAK flooring showroom display',
      title: 'IOAK — Flooring Zone',
      text: 'Timber flooring sample library and installed floor displays.',
      ratio: 'portrait',
    },
  ],
  location: {
    address: ['578 Church Street,', 'Richmond VIC 3121'],
    opening: 'Opening late 2026',
    map: asset('experience-map.webp'),
    mapAlt: 'Map showing 578 Church Street in Richmond',
  },
  visit: {
    image: asset('experience-visit.webp'),
    imageAlt: 'Meeting space within the 578 Experience showroom',
    href: 'https://578experience.com.au/',
  },
};


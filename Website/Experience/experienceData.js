const asset = (file) => `/assets/${file}`;

export const experience = {
  hero: {
    image: asset('578-hero.png'),
    imageAlt: 'Facade of the 578 Experience showroom',
    title: '578 Interiors',
    subtitle: 'A destination where every detail comes together.',
    opening: 'Opening late 2026',
  },
  introduction: {
    eyebrow: 'About the 578 Experience',
    title: 'A destination where every detail comes together.',
    paragraphs: [
      'Set within a 1000m² experience centre, 578 Interiors brings INTERICH, FLUX and IOAK together in one considered space. Explore cabinetry, tapware and timber flooring in an environment designed to show how materials, finishes and craftsmanship work together.',
      'With our designers based in the showroom, every detail can be considered together. From material selection and cabinetry to finishes and overall interior direction, we provide a more complete and coordinated solution — always with our clients’ needs, lifestyle and vision at the centre of the process.',
    ],
    image: asset('update1001/578-interiors-1.webp'),
    imageAlt: 'Entrance to the 578 Experience showroom',
  },
  showroomZones: [
    {
      src: asset('578-zone-01.jpg'),
      alt: 'INTERICH cabinetry showroom kitchen',
      title: 'INTERICH — Cabinetry Zone',
      text: 'Premium full-home cabinetry and joinery.',
      ratio: 'portrait',
    },
    {
      src: asset('578-zone-02.jpg'),
      alt: 'FLUX tapware showroom bathroom',
      title: 'FLUX —\nTapware Zone',
      text: 'A refined showcase of tapware and bathroom solutions.',
      ratio: 'portrait',
    },
    {
      src: asset('578-zone-03.jpg'),
      alt: 'IOAK flooring showroom display',
      title: 'IOAK — Flooring Zone',
      text: 'Timber flooring sample library and installed floor displays.',
      ratio: 'portrait',
    },
  ],
  location: {
    address: ['574–578 Canterbury Road,', 'Vermont 3133 VIC'],
    opening: 'Opening late 2026',
    map: asset('578-map.png'),
    mapAlt: 'Map of the 578 showroom area',
  },
  visit: {
    image: asset('578-visit.jpg'),
    imageAlt: 'Meeting space within the 578 Experience showroom',
    href: 'https://578experience.com.au/',
  },
};


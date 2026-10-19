// Photos for the coffee cart section. Files live in public/assets/images/cart:
//   main.jpg            the large photo beside the inquiry form
//   <id>.jpg            large version, shown in the photo viewer
//   <id>-s.jpg          small version, shown in the carousel
// Sizes below are the real pixel sizes of those files.

const BASE = '/assets/images/cart';

export const MAIN = {
  src: `${BASE}/main.jpg`,
  w: 1080,
  h: 1616,
  alt: 'The Mang Kapi Ta mobile coffee cart with its glowing counter, menu easel, and a three-person barista team in a bright lobby',
};

// Order shown in the carousel.
const PHOTOS = [
  { id: 'dsc3498', w: 720, h: 525, lw: 1800, lh: 1314, alt: 'A coffee bar dressed in burlap and white linen with flowers and a menu board, set in a garden' },
  { id: 'dsc0213', w: 480, h: 720, lw: 1200, lh: 1800, alt: 'The white coffee cart with a glowing counter and a menu on an easel in a bright hall' },
  { id: 'dsc5927', w: 720, h: 480, lw: 1800, lh: 1200, alt: 'Costumed characters posing with the baristas behind the coffee cart at a themed party' },
  { id: 'dsc7322', w: 480, h: 720, lw: 1200, lh: 1800, alt: 'A coffee cart at a pink and peach event with a balloon garland and a menu easel' },
  { id: 'img9062', w: 720, h: 480, lw: 1800, lh: 1200, alt: 'Two baristas and a guest smiling behind the coffee cart at a reception' },
  { id: 'dsc9310', w: 480, h: 720, lw: 1200, lh: 1800, alt: 'The coffee cart at an indoor celebration with hanging decorations above' },
  { id: 'dsc4139', w: 480, h: 720, lw: 1200, lh: 1800, alt: 'Two baristas serving from a white coffee cart in a garden courtyard' },
  { id: 'img8429', w: 540, h: 720, lw: 1350, lh: 1800, alt: 'A couple with the barista team at a wedding coffee cart, with the espresso machine and cups shown close up' },
  { id: 'dsc3637', w: 480, h: 720, lw: 1200, lh: 1800, alt: 'Baristas preparing drinks at an outdoor coffee cart among palm trees' },
  { id: 'dsc1236', w: 480, h: 720, lw: 1200, lh: 1800, alt: 'A coffee cart set up outdoors beside the water with dried grass decorations' },
  { id: 'img3886', w: 480, h: 720, lw: 1201, lh: 1800, alt: 'Three team members posing behind the white coffee cart in a bright lobby' },
  { id: 'dsc0216', w: 481, h: 720, lw: 1080, lh: 1616, alt: 'A branded paper cup beside amber bottles and greenery on the cart counter' },
];

export const GALLERY = PHOTOS.map((p) => ({
  thumb: `${BASE}/${p.id}-s.jpg`, tw: p.w, th: p.h,
  src: `${BASE}/${p.id}.jpg`, w: p.lw, h: p.lh,
  alt: p.alt,
}));

// Everything the photo viewer can show: the main photo first, then the carousel in order.
export const VIEWER = [
  { src: MAIN.src, w: MAIN.w, h: MAIN.h, alt: MAIN.alt },
  ...GALLERY.map((g) => ({ src: g.src, w: g.w, h: g.h, alt: g.alt })),
];

// The full menu, transcribed from the printed menu boards.
// Prices are whole pesos here and held in centavos. The server prices every order from this file,
// never from the browser.
//
// Drinks come in Handymax (Hx, 12 oz) and Panamax (Px, 16 oz); a few are Panamax only.
// Food has a single price.

export const SIZES = {
  hx: { label: 'Handymax', oz: 12 },
  px: { label: 'Panamax', oz: 16 },
  // t-shirt sizes (no ounces)
  s: { label: 'Small', short: 'S' }, m: { label: 'Medium', short: 'M' }, l: { label: 'Large', short: 'L' },
  xl: { label: 'XL', short: 'XL' }, xxl: { label: '2XL', short: '2XL' },
};

/** "Panamax 16 oz" for drinks, "Medium" for shirts. */
export const sizeLabel = (key) => (SIZES[key].oz ? `${SIZES[key].label} ${SIZES[key].oz} oz` : SIZES[key].label);

export const CATEGORIES = ['Kapi Picks', 'Kapi-Kapi', 'Non-Kapi', 'Matcha', 'Fizz & Tea', 'Sandwiches', 'Pasta'];

const c = (pesos) => pesos * 100;

/** A sized drink. Pass null for hx when it is only sold as Panamax. */
const drink = (slug, name, category, hx, px, blurb, art, extra = {}) => ({
  slug, name, category, blurb, art, ...extra,
  sizes: { ...(hx ? { hx: c(hx) } : {}), px: c(px) },
});

/** Food with one price. */
const food = (slug, name, category, pesos, blurb, art) => ({
  slug, name, category, blurb, art, sizes: null, price: c(pesos),
});

// Cup colours run bottom, middle, top.
const cup = (bg, layers, extra = {}) => ({ kind: 'cup', bg, layers, ...extra });

export const MENU = [
  /* Kapi Picks */
  drink('kapi-migliore', 'Kapi Migliore', 'Kapi Picks', 180, 200, 'One of our two signature coffee drinks.',
    cup('#e9dcc6', ['#5c3b28', '#a8703f', '#efe0c0'], { foam: '#f1e3c6' }), { note: 'Tam-is nga medyo isog' }),
  drink('kapi-freddo', 'Kapi Freddo', 'Kapi Picks', 175, 195, 'The other signature coffee drink.',
    cup('#dfd3bd', ['#4a3a30', '#8a6a4c', '#efe6d2'], { foam: '#ece0c6' }), { note: 'Isog nga medyo tam-is' }),
  drink('kapi-alsaha', 'Kapi Alsaha', 'Kapi Picks', null, 240, 'A tiramisu latte, topped with a ladyfinger.',
    cup('#d9c0b2', ['#f1e6d0', '#8b5e3b', '#f6efe0'], { topping: 'ladyfinger' }), { note: 'Tiramisu latte' }),
  drink('kakaw-kapi', 'Kakaw Kapi', 'Kapi Picks', null, 220, 'Dusted with cocoa.',
    cup('#d8c2b0', ['#b06a3d', '#8a4f33', '#e8d6c0'], { topping: 'cocoa' }), { note: 'Salted cacao nga may kapi' }),
  drink('kapi-con-sal', 'Kapi Con Sal', 'Kapi Picks', null, 220, 'A seasalt cream latte.',
    cup('#ead9bd', ['#d9a05a', '#b87638', '#f4e8d0'], { foam: '#f4e8d0' }), { note: 'Seasalt cream latte' }),
  drink('kapi-linga', 'Kapi Linga', 'Kapi Picks', null, 245, 'An oat black sesame latte.',
    cup('#e2d6c2', ['#c8863f', '#b27a46', '#efe7d6'], { foam: '#efe7d6', topping: 'sesame' }), { note: 'Oat black sesame latte' }),

  /* Kapi-Kapi */
  drink('americano', 'Americano', 'Kapi-Kapi', 135, 150, 'Espresso and water.',
    cup('#e6d6bf', ['#3b2a20', '#5a4030', '#8a6a4c'])),
  drink('cafe-latte', 'Cafe Latte', 'Kapi-Kapi', 145, 155, 'Espresso with milk.',
    cup('#eadfcb', ['#d8bfa0', '#e9d5b8', '#f5ecd9'])),
  drink('spanish-latte', 'Spanish Latte', 'Kapi-Kapi', 175, 195, 'Espresso and milk, sweetened with condensed milk.',
    cup('#ead7b8', ['#c27e3d', '#e4b87c', '#f6ecd8'])),
  drink('caramel-macchiato', 'Caramel Macchiato', 'Kapi-Kapi', 175, 195, 'Espresso and milk with caramel.',
    cup('#e9d6b9', ['#f3e8d4', '#d99a58', '#6a4330'])),
  drink('kapi-mocha', 'Kapi Mocha', 'Kapi-Kapi', 170, 190, 'Espresso and milk with chocolate. Choose dark or white.',
    cup('#dccbb6', ['#b79670', '#9a7552', '#c9ad8a']), { choice: { label: 'Chocolate', options: ['Dark', 'White'] } }),
  drink('honey-oat-latte', 'Honey Oat Latte', 'Kapi-Kapi', 180, 200, 'Espresso with honey and oat milk.',
    cup('#ead9b4', ['#e8c58a', '#a8672f', '#f1e2c4'])),

  /* Non-Kapi (coffee-free) */
  drink('green-tea-latte', 'Green Tea Latte', 'Non-Kapi', 155, 175, 'A green tea latte. Coffee-free.',
    cup('#dfe6c4', ['#d6e4a8', '#dfeab8', '#eef3d2'])),
  drink('green-tea-blossom', 'Green Tea Blossom', 'Non-Kapi', 165, 185, 'Green tea under a pink layer. Coffee-free.',
    cup('#ecd5d0', ['#4f6a2e', '#e7a3a8', '#f2c7c9'])),
  drink('pika', 'Pika', 'Non-Kapi', 155, 175, 'A pink drink with a caramel drizzle. Coffee-free.',
    cup('#efd8d4', ['#c46a4a', '#e8aab0', '#f4d8dc'])),
  drink('mauves-kiss', "Mauve's Kiss", 'Non-Kapi', 165, 185, 'A pink and deep-blue layered drink. Coffee-free.',
    cup('#e6d2dc', ['#2b2f55', '#b0558d', '#f0c6d8'])),
  drink('green-tea-overload', 'Green Tea Overload', 'Non-Kapi', 165, 185, 'A layered green tea drink. Coffee-free.',
    cup('#e0e6c6', ['#6e7f33', '#b7c76a', '#e6edb8'])),
  drink('ube-cloud', 'Ube Cloud', 'Non-Kapi', 175, 195, 'An ube drink with a soft cloud look. Coffee-free.',
    cup('#e3d5ec', ['#a98bd1', '#c5aee0', '#efe5f6'])),

  /* Matcha */
  drink('matcha-latte', 'Matcha Latte', 'Matcha', 170, 190, 'Matcha with milk.',
    cup('#d8e2c3', ['#f1efe0', '#7a9a52', '#4f6f35'])),
  drink('seasalt-matcha', 'Seasalt Matcha', 'Matcha', 195, 215, 'Matcha crowned with a seasalt cream cloud.',
    cup('#cfd8bd', ['#f4f0e2', '#7d9a52', '#f4f0e2'], { foam: '#f4f0e2' })),
  drink('cloud-matcha', 'Cloud Matcha', 'Matcha', 190, 210, 'Matcha under a soft milk cloud.',
    cup('#d9e3c8', ['#f4f2e6', '#6d8c48', '#3f5f2c'])),
  drink('honey-oat-matcha', 'Honey Oat Matcha', 'Matcha', 190, 210, 'Matcha with honey and oat milk.',
    cup('#dfe3c3', ['#f2e6c8', '#6f8a45', '#c9a24a'])),
  drink('matcha-tiramisu', 'Matcha Tiramisu', 'Matcha', 210, 230, 'A matcha tiramisu in a cup, topped with a ladyfinger.',
    cup('#d6e0bf', ['#f2efe0', '#7a9a52', '#9db36a'], { topping: 'ladyfinger-green' })),

  /* Fizz & Tea */
  drink('passion-fruit-black-tea', 'Passion Fruit Black Tea', 'Fizz & Tea', 150, 170, 'Black tea with passion fruit.',
    cup('#ecd7b8', ['#b8511f', '#c97a2c', '#e9a53a'], { straw: true })),
  drink('berry-soda', 'Berry Soda', 'Fizz & Tea', 155, 175, 'A sparkling berry soda.',
    cup('#f0d4d4', ['#e45f6a', '#f08a92', '#f6c9cc'], { straw: true })),
  drink('peach-soda', 'Peach Soda', 'Fizz & Tea', 155, 175, 'A sparkling peach soda, garnished with peach.',
    cup('#f2dfb5', ['#f3a63a', '#f7c85a', '#fbe08a'], { straw: true, topping: 'fruit' })),
  drink('sparkling-chee', 'Sparkling Chee', 'Fizz & Tea', 160, 180, 'A pink sparkling drink.',
    cup('#f1d9db', ['#f06a7a', '#f6b0b8', '#fbe6e8'], { straw: true, topping: 'cherry' })),

  /* Sandwiches */
  food('reuben-sandwich', 'Reuben Sandwich', 'Sandwiches', 250, 'A grilled Reuben sandwich.', 'reuben'),
  food('blt-sandwich', 'BLT Sandwich', 'Sandwiches', 205, 'Bacon, lettuce, and tomato.', 'blk'),
  food('pull-apart-cheese-sandwich', 'Pull-apart Cheese Sandwich', 'Sandwiches', 190, 'A grilled cheese sandwich, served with a dipping sauce.', 'melt'),
  food('grilled-chicken-sandwich', 'Grilled Chicken Sandwich', 'Sandwiches', 190, 'A grilled chicken sandwich.',
    { kind: 'sandwich', bg: '#e6dcc4', fills: ['#f0d9a0', '#9fb86a'] }),
  food('grilled-tuna-sandwich', 'Grilled Tuna Sandwich', 'Sandwiches', 190, 'A grilled tuna sandwich.',
    { kind: 'sandwich', bg: '#e2d9c8', fills: ['#e8b07a', '#f2e0b8'] }),
  food('grilled-spicy-tuna-sandwich', 'Grilled Spicy Tuna Sandwich', 'Sandwiches', 190, 'A grilled spicy tuna sandwich.',
    { kind: 'sandwich', bg: '#ead8c6', fills: ['#d9703a', '#f2d9a8'] }),
  food('ham-n-cheese-sandwich', "Ham n' Cheese Sandwich", 'Sandwiches', 195, 'A grilled ham and cheese sandwich.',
    { kind: 'sandwich', bg: '#ecdcb6', fills: ['#f2c94a', '#e59a9a', '#f2c94a'], tall: true }),

  /* Pasta */
  food('seafood-marinara', 'Seafood Marinara', 'Pasta', 280, 'Pasta in marinara sauce with seafood.',
    { kind: 'bowl', bg: '#ecd3bc', noodles: '#d9663a', topping: 'shrimp' }),
  food('creamy-pesto-pasta', 'Creamy Pesto Pasta', 'Pasta', 280, 'Pasta in a creamy pesto sauce.',
    { kind: 'bowl', bg: '#d9e0bd', noodles: '#8fa452', topping: 'basil' }),
];

/* ------------------------------- merch ------------------------------- */
// Sold from the merch section, not the menu stamps. Placeholder sizes and prices until the real ones are set.
export const MERCH = [
  { slug: 'kapi-signature-tee', name: 'KAPI Signature Tee', category: 'Merch',
    blurb: 'White tee with the KAPI cup mascot and an illustrated Iloilo scene.',
    sizes: { s: c(650), m: c(650), l: c(650), xl: c(690), xxl: c(720) } },
];

/* ------------------------------- helpers ------------------------------- */
export const findItem = (slug) => MENU.find((m) => m.slug === slug) || MERCH.find((m) => m.slug === slug) || null;

/** Price in centavos for a size (or the one price of a food item). Null when the size is not offered. */
export const unitPrice = (item, size) => (item.sizes ? (Object.hasOwn(item.sizes, size) ? item.sizes[size] : null) : item.price);

/** The lowest price, used on the menu stamps. */
export const fromPrice = (item) => (item.sizes ? Math.min(...Object.values(item.sizes)) : item.price);

/** Name as stored on an order, for example "Kapi Mocha (Panamax 16 oz, Dark)". */
export function lineName(item, size, choice) {
  const parts = [];
  if (item.sizes) parts.push(sizeLabel(size));
  if (choice) parts.push(choice);
  return parts.length ? `${item.name} (${parts.join(', ')})` : item.name;
}

/** What the browser needs to build the cart and popup. */
export const publicMenu = () =>
  Object.fromEntries([...MENU, ...MERCH].map((m) => [m.slug, {
    slug: m.slug, name: m.name, category: m.category, note: m.note || null, blurb: m.blurb,
    sizes: m.sizes, price: m.price ?? null, choice: m.choice || null,
  }]));

// Single source of truth for the menu. Prices are whole pesos; the server converts to centavos.
// The browser never decides a price: orders are always priced from this file on the server.

export const MENU = [
  { slug: 'kapi-migliore', name: 'Kapi Migliore', category: 'Specialty Drinks', pesos: 130, blurb: 'The house signature. Pulled espresso, velvety milk balance, and a sweet caramel and hazelnut warmth.', serve: 'Hot or iced', tag: 'Signature', art: 'latte' },
  { slug: 'kapi-alsaha', name: 'Kapi Alsaha', category: 'Specialty Drinks', pesos: 160, blurb: 'A tiramisu in a cup: Italian sponge, mascarpone velvet foam, and a dusting of cocoa over bold espresso.', serve: 'Regular or large', tag: 'Signature', art: 'tiramisu' },
  { slug: 'seasalt-matcha', name: 'Seasalt Matcha', category: 'Specialty Drinks', pesos: 155, blurb: 'Ceremonial-grade matcha crowned with a savory sea-salt cream cloud.', serve: 'Iced', tag: null, art: 'matcha' },
  { slug: 'honey-oat-latte', name: 'Honey Oat Latte', category: 'Specialty Drinks', pesos: 150, blurb: 'Smooth pulled espresso, pure golden honey, and micro-toasted oat milk.', serve: 'Hot or iced', tag: null, art: 'oat' },
  { slug: 'chef-paos-reuben', name: "Chef Pao's Reuben", category: 'Mahaw Bites', pesos: 220, blurb: 'Tender slow-cured beef brisket, melted Swiss, and tangy kraut, grilled on house sourdough.', serve: 'Grilled to order', tag: 'Signature', art: 'reuben' },
  { slug: 'pull-apart-melt', name: 'Pull-Apart Melt', category: 'Mahaw Bites', pesos: 180, blurb: 'A four-cheese blend toasted golden, with a crisp crust and our signature tomato relish.', serve: 'Freshly griddled', tag: null, art: 'melt' },
  { slug: 'blk-sandwich', name: 'BLK Sandwich', category: 'Mahaw Bites', pesos: 185, blurb: 'Smoked bacon, crisp lettuce, and ripe tomatoes on toasted brioche.', serve: 'Toasted slices', tag: null, art: 'blk' },
].map((m) => ({ ...m, price: m.pesos * 100 })); // price in centavos

export const findItem = (slug) => MENU.find((m) => m.slug === slug) || null;

// Birthday coffee cart packages, add-ons and fees, taken from the price flyer.
// The page and the server both read this file, so prices can never disagree.

export const TRANSPORT_FEE = 1000; // pesos, charged for transportation and logistics

const INCLUSIONS = [
  'Coffee cart w/ espresso machine',
  '2 baristas on duty',
  '4 hours of service',
  'Personalized menu stand',
];
const DRINKS = 'Iced (12oz) or hot (8oz)';
const FLAVORS = ['Americano', 'Cafe Latte', 'Spanish Latte', 'Lemonade', 'Blueberry Lemonade'];

export const PACKAGES = [
  { id: 'a', name: 'Package A', cups: 120, price: 15600, inclusions: INCLUSIONS, drinks: DRINKS, flavors: FLAVORS },
  { id: 'b', name: 'Package B', cups: 150, price: 18750, inclusions: INCLUSIONS, drinks: DRINKS, flavors: FLAVORS },
];

export const ADD_ONS = [
  { id: 'sticker', label: 'Personalized sticker on cup', price: 250 },
  { id: 'signature', label: 'Signature coffee based drink', note: 'Kapi Miglioré & Kapi Freddo', price: 1500 },
];
export const EXTRA_CUP = { price: 150, note: 'ordered on the day of the event' };

export const findPackage = (id) => PACKAGES.find((p) => p.id === id) || null;

export const money = (n) => `PHP ${Number(n).toLocaleString('en-PH')}`;

/** What the package includes, as one sentence for the form. */
export function includesText(pkg) {
  return `${pkg.cups} cups (${pkg.drinks.toLowerCase()}). ${pkg.inclusions.join(', ')}. Flavors: ${pkg.flavors.join(', ')}.`;
}

/**
 * Prices a selection. `picks` is { sticker: bool, signature: bool, extraCups: number }.
 * Returns the estimated total and a one-line summary, or null when the package is unknown.
 */
export function quote(packageId, picks = {}) {
  const pkg = findPackage(packageId);
  if (!pkg) return null;
  const extra = Math.max(0, Math.min(500, Math.floor(Number(picks.extraCups) || 0)));
  const chosen = ADD_ONS.filter((a) => picks[a.id]);
  const total = pkg.price + chosen.reduce((s, a) => s + a.price, 0) + extra * EXTRA_CUP.price + TRANSPORT_FEE;

  const addOns = [...chosen.map((a) => a.label), ...(extra ? [`${extra} additional cup${extra === 1 ? '' : 's'}`] : [])];
  const summary =
    `${pkg.name} (${pkg.cups} cups, ${money(pkg.price)})` +
    (addOns.length ? `; add-ons: ${addOns.join(', ')}` : '') +
    `; transport ${money(TRANSPORT_FEE)}; estimated total ${money(total)}`;
  return { pkg, extra, total, summary };
}

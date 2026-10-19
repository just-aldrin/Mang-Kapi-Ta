// Original line illustrations used inside the menu stamps (viewBox 0 0 120 120).
const steam =
  '<path d="M46 30c-6-7 6-11 0-19M60 30c-6-7 6-11 0-19M74 30c-6-7 6-11 0-19" fill="none" stroke="#6b4a3a" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>';

const ART = {
  latte:
    '<rect width="120" height="120" fill="#e9dcc6"/>' + steam +
    '<path d="M30 40h60l-6 46a14 14 0 0 1-14 12H50a14 14 0 0 1-14-12z" fill="#fbf4e6" stroke="#3b2a20" stroke-width="3"/>' +
    '<path d="M90 50h8a9 9 0 0 1 0 18h-10" fill="none" stroke="#3b2a20" stroke-width="3"/>' +
    '<path d="M34 52h52l-1.6 12H35.6z" fill="#8b5e4b"/>' +
    '<path d="M52 56c4-5 8 5 12 0s8 5 10 0" fill="none" stroke="#fbf4e6" stroke-width="2.4" stroke-linecap="round"/>' +
    '<ellipse cx="60" cy="106" rx="34" ry="5" fill="#3b2a20" opacity=".18"/>',

  tiramisu:
    '<rect width="120" height="120" fill="#d9c0b2"/>' +
    '<path d="M34 34h52l-5 52a12 12 0 0 1-12 11H51a12 12 0 0 1-12-11z" fill="#fbf4e6" stroke="#3b2a20" stroke-width="3"/>' +
    '<path d="M36 48h48l-1 10H37z" fill="#4a3226"/><path d="M38 66h44l-1 10H39z" fill="#e5cfa9"/>' +
    '<path d="M34 34c4-9 14-9 18-3 4-8 14-8 18-1 4-6 12-5 16 4z" fill="#fbf4e6" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/>' +
    '<g fill="#4a3226" opacity=".8"><circle cx="48" cy="29" r="1.4"/><circle cx="58" cy="27" r="1.4"/><circle cx="68" cy="29" r="1.4"/><circle cx="78" cy="30" r="1.4"/></g>' +
    '<ellipse cx="60" cy="106" rx="30" ry="5" fill="#3b2a20" opacity=".18"/>',

  matcha:
    '<rect width="120" height="120" fill="#cfd8bd"/>' +
    '<path d="M36 26h48l-6 72a8 8 0 0 1-8 7H50a8 8 0 0 1-8-7z" fill="#f4f0e2" stroke="#3b2a20" stroke-width="3"/>' +
    '<path d="M39 44h42l-4.5 52H43.5z" fill="#7d9a52"/><path d="M39 44h42l-.6 8H39.6z" fill="#fbf4e6"/>' +
    '<path d="M39 70h42l-1.6 18H40.6z" fill="#5f7d3a" opacity=".55"/>' +
    '<path d="M70 14l10 30" stroke="#3b2a20" stroke-width="3" stroke-linecap="round"/>' +
    '<g fill="#fbf4e6" opacity=".9"><rect x="48" y="58" width="9" height="9" rx="2"/><rect x="62" y="75" width="9" height="9" rx="2"/></g>',

  oat:
    '<rect width="120" height="120" fill="#ead9b4"/>' + steam +
    '<path d="M32 40h56l-5 46a14 14 0 0 1-14 12H51a14 14 0 0 1-14-12z" fill="#fbf4e6" stroke="#3b2a20" stroke-width="3"/>' +
    '<path d="M88 50h8a9 9 0 0 1 0 18h-10" fill="none" stroke="#3b2a20" stroke-width="3"/>' +
    '<path d="M35 52h50l-1.4 12H36.4z" fill="#c8923a"/>' +
    '<path d="M56 74c0 6 8 6 8 0 0-4-4-8-4-8s-4 4-4 8z" fill="#c8923a" stroke="#3b2a20" stroke-width="2"/>' +
    '<g stroke="#8b5e4b" stroke-width="2" stroke-linecap="round" fill="none"><path d="M24 96c4-10 4-18 0-26"/><path d="M24 84l-6-4M24 78l6-4M24 90l-6-4"/></g>' +
    '<ellipse cx="60" cy="106" rx="34" ry="5" fill="#3b2a20" opacity=".18"/>',

  reuben:
    '<rect width="120" height="120" fill="#c9d1b4"/>' +
    '<path d="M22 52c0-16 18-24 38-24s38 8 38 24z" fill="#d9a85d" stroke="#3b2a20" stroke-width="3"/>' +
    '<path d="M22 60h76l-5 8H27z" fill="#e8c24a" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M24 70c8 6 14-4 22 2s14-4 22 2 14-4 26 0v6H24z" fill="#b7c47a" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/>' +
    '<rect x="24" y="78" width="72" height="9" rx="3" fill="#8b4a3a" stroke="#3b2a20" stroke-width="3"/>' +
    '<path d="M22 90h76c0 8-10 12-38 12S22 98 22 90z" fill="#d9a85d" stroke="#3b2a20" stroke-width="3"/>' +
    '<g fill="#fbf4e6" opacity=".75"><circle cx="44" cy="40" r="2"/><circle cx="62" cy="36" r="2"/><circle cx="78" cy="42" r="2"/></g>',

  melt:
    '<rect width="120" height="120" fill="#ecd5a8"/>' +
    '<path d="M24 36l72 0 6 16-84 0z" fill="#d9a85d" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M18 52h84v8c-6 0-6 18-12 18s-4-10-10-10-4 20-12 20-6-16-12-16-6 14-12 14-6-18-14-18-6 8-12 8z" fill="#f2cf5a" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M24 92h72l-6 10H30z" fill="#d9a85d" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle cx="46" cy="44" r="2" fill="#fbf4e6"/><circle cx="70" cy="44" r="2" fill="#fbf4e6"/>',

  blk:
    '<rect width="120" height="120" fill="#e0cfc2"/>' +
    '<path d="M24 54c0-16 16-24 36-24s36 8 36 24z" fill="#d9a85d" stroke="#3b2a20" stroke-width="3"/>' +
    '<path d="M20 62c8-6 14 4 22-2s14 4 22 0 14 4 22-2 10 2 14 0v8H20z" fill="#8fae5a" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M22 70c8 8 14-6 22 0s14-6 22 0 14-6 22 0 8-2 10 0v6H22z" fill="#b8473a" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M24 78c10 4 14-4 24 0s14-4 24 0 14-4 24 0v6c-12 3-14-3-24 0s-14-3-24 0-14-3-24 0z" fill="#7a3a2e" stroke="#3b2a20" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M22 92h76c0 8-10 12-38 12S22 100 22 92z" fill="#d9a85d" stroke="#3b2a20" stroke-width="3"/>',
};

/* ---------- illustrations generated for the full menu (viewBox 0 0 120 120) ---------- */
let artId = 0; // clip paths need a unique id per drawing, because many drawings share one page
const INK = '#3b2a20';

const ladyfinger = (color) =>
  `<rect x="52" y="19" width="32" height="9" rx="3.5" transform="rotate(-26 68 23)" fill="${color}" stroke="${INK}" stroke-width="2"/>`;

const CUP_TOPPINGS = {
  ladyfinger: ladyfinger('#e9c98a'),
  'ladyfinger-green': ladyfinger('#b5c76a'),
  cocoa: `<ellipse cx="60" cy="41" rx="24" ry="5" fill="#6b3f2a" stroke="${INK}" stroke-width="2"/><g fill="#8a5a3a"><circle cx="50" cy="40" r="1.3"/><circle cx="60" cy="42" r="1.3"/><circle cx="69" cy="40" r="1.3"/></g>`,
  sesame: '<g fill="#2a2420"><circle cx="50" cy="31" r="1.7"/><circle cx="58" cy="28" r="1.7"/><circle cx="66" cy="31" r="1.7"/><circle cx="73" cy="28" r="1.7"/><circle cx="62" cy="34" r="1.7"/></g>',
  cherry: `<g stroke="${INK}" stroke-width="1.6"><circle cx="52" cy="33" r="4.2" fill="#e0405a"/><circle cx="64" cy="30" r="4.2" fill="#e0405a"/><circle cx="72" cy="35" r="3.6" fill="#f0788c"/></g>`,
  fruit: `<path d="M38 28L88 22" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><circle cx="62" cy="23" r="8.5" fill="#f2a24a" stroke="${INK}" stroke-width="2"/>`,
};

/** An iced cup: layered drink, lid, KAPI sticker, and an optional foam dome, topping, or straw. */
function cupArt({ bg, layers, foam, topping, straw }) {
  const id = `cup${++artId}`;
  const [bottom, mid, top] = layers;
  const shape = 'M35 42h50l-5.5 54a7 7 0 0 1-7 6.2H47.5a7 7 0 0 1-7-6.2z';
  return (
    `<rect width="120" height="120" fill="${bg}"/>` +
    (straw
      ? `<path d="M68 40L77 8" stroke="${INK}" stroke-width="4.6" stroke-linecap="round"/><path d="M68 40L77 8" stroke="#f6e9d2" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 5"/>`
      : '') +
    `<ellipse cx="60" cy="107" rx="26" ry="3.6" fill="#000" opacity=".16"/>` +
    `<clipPath id="${id}"><path d="${shape}"/></clipPath>` +
    `<g clip-path="url(#${id})">` +
    `<rect x="30" y="38" width="60" height="70" fill="${top}"/>` +
    `<path d="M30 58c8-4 14 4 22 0s14 4 22 0 12 2 16 0V110H30z" fill="${mid}"/>` +
    `<path d="M30 80c8-4 14 4 22 0s14 4 22 0 12 2 16 0V110H30z" fill="${bottom}"/>` +
    '<g fill="#fff" opacity=".3"><rect x="44" y="50" width="10" height="10" rx="2.5" transform="rotate(12 49 55)"/><rect x="65" y="47" width="11" height="11" rx="2.5" transform="rotate(-14 70 52)"/><rect x="54" y="63" width="9" height="9" rx="2.5" transform="rotate(20 58 67)"/></g>' +
    `</g>` +
    `<path d="${shape}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>` +
    (foam ? `<path d="M37 41c0-10 9-14 23-14s23 4 23 14z" fill="${foam}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>` : '') +
    `<rect x="31" y="38" width="58" height="7" rx="3.5" fill="#fbf4e6" stroke="${INK}" stroke-width="2.4"/>` +
    (topping ? CUP_TOPPINGS[topping] : '') +
    `<g transform="translate(60 74)"><path d="M-15-9h30a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-13l-3.5 6-3.5-6H-15a5 5 0 0 1-5-5v-8a5 5 0 0 1 5-5z" fill="#fbf4e6" stroke="#8a5a3a" stroke-width="1.6"/>` +
    `<text x="0" y="3.2" text-anchor="middle" font-size="8.4" font-weight="700" fill="#6b3a1e" font-family="FF Providence Sans, sans-serif" letter-spacing=".6">KAPI</text></g>`
  );
}

/** A grilled sandwich with a toothpick. `fills` are the layers between the bread. */
function sandwichArt({ bg, fills, tall = false }) {
  const bread = '#d9a85d';
  const top = tall ? 22 : 30;
  const y0 = top + 25;
  const yb = y0 + fills.length * 9 + 2;
  return (
    `<rect width="120" height="120" fill="${bg}"/>` +
    `<ellipse cx="60" cy="${yb + 17}" rx="38" ry="4" fill="#000" opacity=".14"/>` +
    `<path d="M22 ${top + 26}c0-17 17-25 38-25s38 8 38 25z" fill="${bread}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    '<path d="M36 ' + (top + 12) + 'c8-5 16-5 24-3" fill="none" stroke="#b9873f" stroke-width="2.4" stroke-linecap="round"/>' +
    fills.map((f, i) => `<rect x="19" y="${y0 + i * 9}" width="82" height="10" rx="5" fill="${f}" stroke="${INK}" stroke-width="2.6"/>`).join('') +
    `<path d="M22 ${yb}h76c0 9-9 14-38 14S22 ${yb + 9} 22 ${yb}z" fill="${bread}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M60 ${top - 6}V${top + 18}" stroke="#c9a46a" stroke-width="2.6" stroke-linecap="round"/><circle cx="60" cy="${top - 7}" r="3.6" fill="#c9a46a" stroke="${INK}" stroke-width="1.8"/>`
  );
}

/** A takeaway bowl of pasta, with a shrimp or basil on top. */
function bowlArt({ bg, noodles, topping }) {
  const swirl = (y, dx) => `<path d="M${26 + dx} ${y}c8-9 14 9 22 0s14 9 22 0 12 7 18 1" fill="none" stroke="${noodles}" stroke-width="4.4" stroke-linecap="round"/>`;
  const extra = topping === 'shrimp'
    ? `<circle cx="66" cy="54" r="9" fill="#f4b8a2" stroke="${INK}" stroke-width="2.2"/><path d="M60 50c4-3 9-2 12 2" fill="none" stroke="#e08a72" stroke-width="2" stroke-linecap="round"/><path d="M73 58c4 2 6 5 5 8" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`
    : `<g fill="#4f7a2e" stroke="${INK}" stroke-width="1.6"><path d="M50 52c3-6 9-6 11 0-3 5-8 5-11 0z"/><path d="M64 50c3-6 9-6 11 0-3 5-8 5-11 0z"/><path d="M57 58c3-6 9-6 11 0-3 5-8 5-11 0z"/></g>`;
  return (
    `<rect width="120" height="120" fill="${bg}"/>` +
    `<ellipse cx="60" cy="101" rx="42" ry="5.5" fill="#000" opacity=".14"/>` +
    `<path d="M16 58h88c0 24-16 42-44 42S16 82 16 58z" fill="#e7cf9f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    `<ellipse cx="60" cy="58" rx="44" ry="13" fill="#f3e4bf" stroke="${INK}" stroke-width="3"/>` +
    `<ellipse cx="60" cy="57" rx="37" ry="9.5" fill="${noodles}" opacity=".35"/>` +
    swirl(54, 2) + swirl(58, -3) + swirl(62, 4) + extra
  );
}

const RENDER = { cup: cupArt, sandwich: sandwichArt, bowl: bowlArt };

/** A menu illustration. `art` is either a legacy key ("reuben") or a spec such as { kind: 'cup', ... }. */
export function stampArt(art) {
  const body = typeof art === 'string' ? ART[art] || ART.latte : RENDER[art.kind](art);
  return `<svg viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false">${body}</svg>`;
}

/** Round "postmark" with wavy cancellation lines. */
let pmCount = 0;
export function postmark(line1 = 'ILOILO CITY', line2 = 'MANG KAPI TA') {
  const id = `pm${++pmCount}`;
  const wave = (y) => `<path d="M84 ${y}c8-6 12 6 20 0s12 6 20 0 12 6 20 0"/>`;
  return (
    '<svg class="postmark" viewBox="0 0 160 70" aria-hidden="true" focusable="false">' +
    `<defs><path id="${id}a" d="M16 35a28 28 0 0 1 56 0"/><path id="${id}b" d="M16 35a28 28 0 0 0 56 0"/></defs>` +
    '<g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="44" cy="35" r="30"/><circle cx="44" cy="35" r="19"/>' +
    [18, 30, 42, 54].map(wave).join('') + '</g>' +
    '<g fill="currentColor" font-family="FF Providence Sans, sans-serif" font-size="6.2" font-weight="700" letter-spacing="1">' +
    `<text><textPath href="#${id}a" startOffset="50%" text-anchor="middle">${line1}</textPath></text>` +
    `<text><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${line2}</textPath></text>` +
    '<text x="44" y="37.5" text-anchor="middle" font-size="7">EST. 25</text></g></svg>'
  );
}

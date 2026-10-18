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

export function stampArt(key) {
  return `<svg viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false">${ART[key] || ART.latte}</svg>`;
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
    '<g fill="currentColor" font-family="Inter, sans-serif" font-size="6.2" font-weight="700" letter-spacing="1">' +
    `<text><textPath href="#${id}a" startOffset="50%" text-anchor="middle">${line1}</textPath></text>` +
    `<text><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${line2}</textPath></text>` +
    '<text x="44" y="37.5" text-anchor="middle" font-size="7">EST. 25</text></g></svg>'
  );
}

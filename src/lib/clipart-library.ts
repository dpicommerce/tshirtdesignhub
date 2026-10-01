// Built-in clip art (inline SVG so it works offline)
const svg = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="600" height="600">${body}</svg>`,
  )}`;

export const CLIPART_LIBRARY: { label: string; src: string }[] = [
  { label: "Star", src: svg(`<polygon points="50,4 61,38 97,38 68,59 79,94 50,72 21,94 32,59 3,38 39,38" fill="#f5b800"/>`) },
  { label: "Heart", src: svg(`<path d="M50 88 C10 60 4 36 18 22 C30 10 46 16 50 28 C54 16 70 10 82 22 C96 36 90 60 50 88Z" fill="#e5383b"/>`) },
  { label: "Crown", src: svg(`<path d="M10 75 L16 30 L35 52 L50 18 L65 52 L84 30 L90 75Z" fill="#f5b800"/><rect x="10" y="78" width="80" height="10" fill="#f5b800"/>`) },
  { label: "Lightning", src: svg(`<polygon points="58,4 18,56 46,56 38,96 82,40 54,40" fill="#ffd60a"/>`) },
  { label: "Flame", src: svg(`<path d="M50 96 C24 96 16 74 22 58 C28 44 40 40 38 20 C56 30 62 44 60 56 C66 50 68 42 66 34 C82 48 86 66 80 78 C74 90 64 96 50 96Z" fill="#ff6b00"/><path d="M50 92 C38 92 34 80 38 72 C42 64 50 62 50 52 C58 60 64 70 60 80 C58 88 54 92 50 92Z" fill="#ffd60a"/>`) },
  { label: "Cricket", src: svg(`<rect x="44" y="6" width="12" height="64" rx="5" fill="#c08a4a" transform="rotate(30 50 50)"/><circle cx="72" cy="78" r="12" fill="#d00000"/><path d="M62 74 Q72 78 82 74" stroke="#fff" stroke-width="2" fill="none"/>`) },
  { label: "Football", src: svg(`<circle cx="50" cy="50" r="44" fill="#fff" stroke="#111" stroke-width="4"/><polygon points="50,30 66,42 60,62 40,62 34,42" fill="#111"/>`) },
  { label: "Trophy", src: svg(`<path d="M28 10 H72 V36 C72 52 62 60 50 60 C38 60 28 52 28 36Z" fill="#f5b800"/><path d="M28 18 H14 C14 34 22 40 30 40 M72 18 H86 C86 34 78 40 70 40" stroke="#f5b800" stroke-width="5" fill="none"/><rect x="44" y="60" width="12" height="18" fill="#f5b800"/><rect x="30" y="78" width="40" height="12" fill="#f5b800"/>`) },
  { label: "Shield", src: svg(`<path d="M50 4 L90 18 V48 C90 72 72 88 50 96 C28 88 10 72 10 48 V18Z" fill="#1d4ed8" stroke="#fff" stroke-width="4"/>`) },
  { label: "Wings", src: svg(`<path d="M50 50 C36 30 16 26 2 30 C14 36 18 44 16 50 C24 50 30 56 30 62 C40 60 46 56 50 50Z M50 50 C64 30 84 26 98 30 C86 36 82 44 84 50 C76 50 70 56 70 62 C60 60 54 56 50 50Z" fill="#e5e5e5"/>`) },
  { label: "Laurel", src: svg(`<g fill="#2d6a4f">${Array.from({ length: 6 }, (_, i) => `<ellipse cx="${28 - i}" cy="${80 - i * 11}" rx="5" ry="10" transform="rotate(${-30 + i * 6} ${28 - i} ${80 - i * 11})"/><ellipse cx="${72 + i}" cy="${80 - i * 11}" rx="5" ry="10" transform="rotate(${30 - i * 6} ${72 + i} ${80 - i * 11})"/>`).join("")}</g>`) },
  { label: "Paw", src: svg(`<g fill="#111"><ellipse cx="50" cy="66" rx="20" ry="17"/><circle cx="26" cy="42" r="9"/><circle cx="42" cy="28" r="9"/><circle cx="58" cy="28" r="9"/><circle cx="74" cy="42" r="9"/></g>`) },
];

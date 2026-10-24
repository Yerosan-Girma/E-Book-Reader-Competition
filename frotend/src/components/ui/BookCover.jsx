function Motif({ kind, color }) {
  const common = { stroke: color, fill: 'none', strokeWidth: 1.5 };
  switch (kind) {
    case 'sun':
      return (<svg viewBox="0 0 100 100" className="w-3/5"><circle cx="50" cy="50" r="18" fill={color} />{Array.from({ length: 12 }).map((_, i) => (<line key={i} x1="50" y1="20" x2="50" y2="10" {...common} transform={`rotate(${i * 30} 50 50)`} />))}</svg>);
    case 'wave':
      return (<svg viewBox="0 0 100 100" className="w-3/5">{[30, 45, 60, 75].map((y) => (<path key={y} d={`M5 ${y} Q 27 ${y - 12} 50 ${y} T 95 ${y}`} {...common} />))}</svg>);
    case 'arch':
      return (<svg viewBox="0 0 100 100" className="w-1/2"><path d="M20 90 V45 A30 30 0 0 1 80 45 V90" {...common} strokeWidth={3} /><path d="M35 90 V50 A15 15 0 0 1 65 50 V90" {...common} /></svg>);
    case 'grid':
      return (<svg viewBox="0 0 100 100" className="w-1/2">{[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3].map((c) => (<circle key={`${r}${c}`} cx={20 + c * 20} cy={20 + r * 20} r={(r + c) % 3 === 0 ? 6 : 3} fill={color} />)))}</svg>);
    case 'leaf':
      return (<svg viewBox="0 0 100 100" className="w-1/2"><path d="M50 90 C 10 60 20 20 50 10 C 80 20 90 60 50 90 Z" {...common} strokeWidth={2} /><line x1="50" y1="90" x2="50" y2="15" {...common} /></svg>);
    case 'star':
      return (<svg viewBox="0 0 100 100" className="w-1/2"><path d="M50 10 L58 42 L90 50 L58 58 L50 90 L42 58 L10 50 L42 42 Z" fill={color} /></svg>);
    case 'chart':
      return (
        <svg viewBox="0 0 100 100" className="w-1/2">
          <line x1="20" y1="80" x2="80" y2="80" {...common} strokeWidth={2} />
          <line x1="20" y1="80" x2="20" y2="20" {...common} strokeWidth={2} />
          <rect x="28" y="50" width="10" height="30" fill={color} opacity="0.7" />
          <rect x="44" y="35" width="10" height="45" fill={color} opacity="0.85" />
          <rect x="60" y="22" width="10" height="58" fill={color} />
        </svg>
      );
    case 'book':
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-1/2">
          <path d="M50 30 C 40 24 25 24 18 27 V 75 C 25 72 40 72 50 78 C 60 72 75 72 82 75 V 27 C 75 24 60 24 50 30 Z" {...common} strokeWidth={2} />
          <line x1="50" y1="30" x2="50" y2="78" {...common} strokeWidth={2} />
        </svg>
      );
  }
}

export function BookCover({ book, className = '', tilt = true }) {
  if (!book) {
    return (
      <div
        className={`aspect-[3/4.4] rounded-[1.4em] bg-forest-deep p-[0.45em] shadow-book ring-1 ring-cream/15${tilt ? ' device-tilt' : ''}${className ? ' ' + className : ''}`}
        role="img"
        aria-label="E-book cover placeholder"
      >
        <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[1em] bg-forest-800 text-cream/40 p-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-current fill-none stroke-[1.5]">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10M6 10h10" />
          </svg>
          <span className="mt-2 text-[0.65em] uppercase tracking-wider font-medium">No cover</span>
        </div>
      </div>
    );
  }

  // If a cover image exists (via cover_url or an image path in cover)
  const coverImageUrl = book.cover_url || (typeof book.cover === 'string' && (book.cover.startsWith('http') || book.cover.startsWith('/')) ? book.cover : null);

  if (coverImageUrl) {
    return (
      <div
        className={`aspect-[3/4.4] rounded-[1.4em] bg-forest-deep p-[0.45em] shadow-book ring-1 ring-cream/15${tilt ? ' device-tilt' : ''}${className ? ' ' + className : ''}`}
        role="img"
        aria-label={`E-book: ${book.title || 'Untitled'} by ${book.author || 'Unknown'}`}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-[1em] bg-forest-800">
          <img
            src={coverImageUrl}
            alt={book.title || 'Cover'}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,oklch(1_0_0/0.18),transparent_40%)]" />
        </div>
      </div>
    );
  }

  // Standard or fallback cover palette
  const defaultPalette = ['oklch(0.37 0.06 162)', 'oklch(0.77 0.11 75)'];
  const [bg, fg] = Array.isArray(book.cover) && book.cover.length >= 2
    ? book.cover
    : defaultPalette;

  const categoryName = book.category || (Array.isArray(book.categories) ? book.categories[0] : 'eBook');

  return (
    <div
      className={`aspect-[3/4.4] rounded-[1.4em] bg-forest-deep p-[0.45em] shadow-book ring-1 ring-cream/15${tilt ? ' device-tilt' : ''}${className ? ' ' + className : ''}`}
      role="img"
      aria-label={`E-book: ${book.title || 'Untitled'} by ${book.author || 'Unknown'}`}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[1em]" style={{ background: bg, color: fg }}>
        <div className="flex items-center justify-between px-[8%] pt-[6%] text-[0.5em] font-semibold uppercase tracking-[0.2em] opacity-80">
          <span>eBook</span><span>{categoryName}</span>
        </div>
        <div className="flex flex-1 items-center justify-center"><Motif kind={book.motif} color={fg} /></div>
        <div className="px-[8%] text-center">
          <p className="font-display text-[1.1em] leading-tight">{book.title || 'Untitled'}</p>
          <p className="mt-1 text-[0.55em] uppercase tracking-[0.2em] opacity-80">{book.author || 'Unknown'}</p>
        </div>
        <div className="mx-[8%] mb-[7%] mt-[6%] h-[0.25em] overflow-hidden rounded-full" style={{ background: `color-mix(in oklab, ${fg} 25%, transparent)` }}>
          <div className="h-full w-2/3 rounded-full" style={{ background: fg }} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,oklch(1_0_0/0.18),transparent_40%)]" />
      </div>
    </div>
  );
}

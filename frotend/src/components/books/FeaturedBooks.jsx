import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Search, ArrowRight, BookOpen, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { books as initialBooks } from '../../data/readrise-data';
import { BookCover } from '../ui/BookCover';
import { Reveal, SectionHeading } from '../ui/primitives';
import api from '../../api/client';
import { detectMaterialFormat, getMaterialLengthLabel, estimateReadingTime } from '../../lib/materialUtils';

const FEATURED_LIMIT = 4;

export default function FeaturedBooks() {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [saved, setSaved] = useState(new Set());
  const [bookList, setBookList] = useState(initialBooks);

  useEffect(() => {
    let cancelled = false;
    api.get('/books', { params: { page: 1, limit: 12 } })
      .then(({ data }) => {
        if (cancelled) return;
        const items = Array.isArray(data.items) ? data.items : [];
        if (items.length > 0) {
          // Keep authentic backend material properties without corrupting with sample mock data
          const cleaned = items.map((item) => ({
            ...item,
            category: item.categories?.[0] || item.category || 'Digital Library',
            description: item.description || '',
          }));
          setBookList(cleaned);
        }
      })
      .catch(() => {
        // Fallback to initial local books if server offline
      });
    return () => { cancelled = true; };
  }, []);

  /* Extract categories dynamically from loaded books */
  const dynamicCategories = useMemo(() => {
    const cats = new Set();
    bookList.forEach((b) => {
      const c = b.category || (Array.isArray(b.categories) && b.categories.length > 0 ? b.categories[0] : null);
      if (c && typeof c === 'string' && c.trim()) cats.add(c.trim());
    });
    return ['All', ...Array.from(cats).sort()];
  }, [bookList]);

  const list = useMemo(
    () =>
      bookList.filter((b) => {
        const c = b.category || (Array.isArray(b.categories) && b.categories.length > 0 ? b.categories[0] : '') || '';
        const matchesCat = cat === 'All' || c === cat;
        const matchesQuery = `${b.title || ''} ${b.author || ''} ${b.description || ''}`
          .toLowerCase()
          .includes((q || '').toLowerCase());
        return matchesCat && matchesQuery;
      }),
    [bookList, cat, q]
  );

  /* Curated sample of books to keep landing page concise */
  const displayedBooks = useMemo(() => list.slice(0, FEATURED_LIMIT), [list]);

  const toggle = (id, title) => {
    setSaved((s) => {
      const n = new Set(s);
      if (n.has(id)) {
        n.delete(id);
        toast(`Removed "${title}" from your list`);
      } else {
        n.add(id);
        toast.success(`Saved "${title}" to your reading list`, {
          description: 'Ready to read in your digital library.',
        });
      }
      return n;
    });
  };

  return (
    <section id="books" className="bg-sage/60 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="The digital library"
              title="Curated Books & Materials"
              subtitle="Explore publications, research docs, and books available to read online."
            />
          </Reveal>
          <div className="flex items-center gap-3 w-full max-w-md justify-between lg:justify-end">
            <Link
              to="/books"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-deep transition whitespace-nowrap bg-forest/10 px-3.5 py-2 rounded-full border border-forest/20 shadow-2xs hover:bg-forest/15"
            >
              <BookOpen className="w-3.5 h-3.5" /> Book Library ({bookList.length})
            </Link>
            <label className="relative w-full max-w-xs">
              <span className="sr-only">Search books</span>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search materials…"
                className="w-full rounded-full border border-forest/15 bg-cream py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-gold"
              />
            </label>
          </div>
        </div>

        {/* Dynamic Category Tabs */}
        {dynamicCategories.length > 2 && (
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2" role="tablist">
            {dynamicCategories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border px-5 py-2 text-xs sm:text-sm font-medium transition ${
                  cat === c
                    ? 'border-forest bg-forest text-cream shadow-xs'
                    : 'border-forest/15 bg-cream/70 text-forest-deep hover:border-forest/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {list.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-forest/20 p-16 text-center text-muted-foreground">
            No materials match that search. Try another title or category.
          </div>
        ) : (
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {displayedBooks.map((b, i) => {
              const format = detectMaterialFormat(b);
              const lengthLabel = getMaterialLengthLabel(b);
              const readTime = estimateReadingTime(b);
              const category =
                b.category ||
                (Array.isArray(b.categories) && b.categories.length > 0 ? b.categories[0] : null) ||
                'eBook';

              return (
                <Reveal key={b.id} delay={(i % 4) * 80}>
                  <article className="group flex flex-col justify-between h-full bg-cream/50 hover:bg-cream rounded-2xl p-5 border border-forest/10 hover:border-forest/25 shadow-xs hover:shadow-card transition-all duration-300">
                    <div>
                      {/* Cover with realistic spine and format badge */}
                      <div className="relative mb-4">
                        <Link to={`/read/${b.id}`} className="block">
                          <div className="mx-auto w-4/5 text-[12px] sm:text-[13px] transition-transform duration-300 group-hover:scale-[1.03]">
                            <BookCover book={b} showBadge={false} />
                          </div>
                        </Link>

                        {/* Top-left format badge */}
                        <div className="absolute top-2 left-2 z-20">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${format.badgeClass}`}>
                            <FileText className="w-2.5 h-2.5" />
                            {format.label}
                          </span>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={() => toggle(b.id, b.title)}
                          aria-label={
                            saved.has(b.id)
                              ? `Remove ${b.title} from reading list`
                              : `Save ${b.title} to reading list`
                          }
                          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-cream/90 text-forest shadow-xs transition hover:scale-110 hover:bg-white"
                        >
                          {saved.has(b.id) ? (
                            <BookmarkCheck className="h-4 w-4 fill-gold text-forest" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between gap-1 text-[10px] uppercase font-bold tracking-wider text-forest-soft mb-1">
                        <span className="truncate">{category}</span>
                        <span className="text-muted-foreground font-normal lowercase">{readTime}</span>
                      </div>

                      <Link to={`/books/${b.id}`}>
                        <h3 className="font-display text-lg sm:text-xl text-forest-deep leading-snug line-clamp-2 transition group-hover:text-forest">
                          {b.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 truncate">by {b.author}</p>

                      {b.description && (
                        <p className="mt-2.5 line-clamp-2 text-xs text-ink/75 leading-relaxed font-reader">
                          {b.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-5 pt-3 border-t border-forest/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{lengthLabel}</span>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/books/${b.id}`}
                          className="text-xs text-muted-foreground hover:text-forest-deep transition-colors"
                        >
                          Overview
                        </Link>
                        <Link
                          to={`/read/${b.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-deep transition-colors"
                        >
                          Read <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        <div className="mt-14 flex flex-col items-center gap-3 text-center">
          <Link
            to={cat !== 'All' ? `/books?category=${encodeURIComponent(cat)}` : '/books'}
            className="inline-flex items-center gap-2.5 rounded-full border border-forest bg-forest text-cream px-9 py-4 text-sm font-semibold shadow-sm transition hover:bg-forest-deep hover:shadow-md"
          >
            <span>Explore Book Library ({bookList.length} Materials)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-forest-deep/70">
            Showing {displayedBooks.length} featured materials • Visit the Book Library to view all {bookList.length} books & documents
          </p>
        </div>
      </div>
    </section>
  );
}

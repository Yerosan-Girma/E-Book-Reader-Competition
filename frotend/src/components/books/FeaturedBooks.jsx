import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Search, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { books as initialBooks, categories, getBook } from '../../data/readrise-data';
import { BookCover } from '../ui/BookCover';
import { Reveal, SectionHeading } from '../ui/primitives';
import api from '../../api/client';

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
          const merged = items.map((item, idx) => {
            const fallback = getBook(item.id) || initialBooks[idx % initialBooks.length];
            return {
              ...item,
              category: item.categories?.[0] || fallback?.category || 'eBook',
              cover: fallback?.cover,
              motif: fallback?.motif,
              description: item.description || fallback?.description,
              pages: fallback?.pages || 200,
            };
          });
          setBookList(merged);
        }
      })
      .catch(() => {
        // Gracefully keep initialBooks
      });
    return () => { cancelled = true; };
  }, []);

  const list = useMemo(
    () =>
      bookList.filter(
        (b) =>
          (cat === 'All' || b.category === cat) &&
          `${b.title} ${b.author}`.toLowerCase().includes(q.toLowerCase())
      ),
    [bookList, cat, q]
  );

  const toggle = (id, title) => {
    setSaved((s) => {
      const n = new Set(s);
      if (n.has(id)) {
        n.delete(id);
        toast(`Removed "${title}" from your list`);
      } else {
        n.add(id);
        toast.success(`Saved "${title}" to your reading list`, {
          description: 'Saved for this session only (demo).',
        });
      }
      return n;
    });
  };

  return (
    <section id="books" className="bg-sage/60 py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="The library"
              title="Find Your Next Favorite"
              subtitle="Explore stories, ideas, and knowledge worth spending time with."
            />
          </Reveal>
          <label className="relative w-full max-w-sm">
            <span className="sr-only">Search books</span>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or author"
              className="w-full rounded-full border border-forest/15 bg-cream py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-gold"
            />
          </label>
        </div>

        <div className="mt-10 flex gap-2 overflow-x-auto pb-2" role="tablist">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition${
                cat === c
                  ? ' border-forest bg-forest text-cream'
                  : ' border-forest/15 bg-cream/60 text-forest-deep hover:border-forest/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-forest/20 p-16 text-center text-muted-foreground">
            No books match that search. Try another title or category.
          </div>
        ) : (
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((b, i) => (
              <Reveal key={b.id} delay={(i % 4) * 90}>
                <article className="group">
                  <div className="relative rounded-xl bg-cream/70 p-8 pb-10 transition duration-500 group-hover:bg-cream group-hover:shadow-card">
                    <Link to={`/books/${b.id}`} className="block">
                      <div className="mx-auto w-3/4 text-[13px] transition-transform duration-500 [&_.device-tilt]:group-hover:[transform:perspective(1200px)_rotateY(-2deg)_translateY(-6px)]">
                        <BookCover book={b} />
                      </div>
                    </Link>
                    <button
                      onClick={() => toggle(b.id, b.title)}
                      aria-label={
                        saved.has(b.id)
                          ? `Remove ${b.title} from reading list`
                          : `Save ${b.title} to reading list`
                      }
                      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream text-forest shadow-card transition hover:scale-110"
                    >
                      {saved.has(b.id) ? (
                        <BookmarkCheck className="h-4 w-4 fill-gold text-forest" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="eyebrow mt-6 text-[10px] text-forest-soft">{b.category}</p>
                  <Link to={`/books/${b.id}`}>
                    <h3 className="mt-2 text-2xl text-forest-deep transition hover:text-forest">
                      {b.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">{b.author}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-ink/70">{b.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <Link
                      to={`/read/${b.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-forest underline-offset-4 hover:underline"
                    >
                      Start reading <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/books/${b.id}`}
                      className="text-sm text-muted-foreground hover:text-forest-deep"
                    >
                      Details
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
        <div className="mt-16 text-center">
          <Link
            to="/explore"
            className="inline-block rounded-full border border-forest px-7 py-3 font-semibold text-forest transition hover:bg-forest hover:text-cream"
          >
            View All Books
          </Link>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Original curated Ethiopian titles for demonstration and competition reading.
        </p>
      </div>
    </section>
  );
}

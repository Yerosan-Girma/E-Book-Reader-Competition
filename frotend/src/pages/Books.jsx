import { useEffect, useState } from 'react';
import api from '../api/client';
import Navbar from '../components/Navbar';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get('/books', { params: { page, search, limit: 12 } })
      .then(({ data }) => {
        setBooks(data.items);
        setTotalPages(data.totalPages);
      })
      .catch(console.error);
  }, [page, search]);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-forest-700">Explore Books</h1>

        <input
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search by title or author…"
          className="mt-4 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 text-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-600/30"
        />

        {books.length === 0 ? (
          <p className="mt-10 text-forest-700/70">No books yet.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((b) => (
              <div key={b.id} className="rounded-2xl bg-white border border-cream-200 p-5">
                <h2 className="font-display text-xl text-forest-700">{b.title}</h2>
                <p className="text-sm text-forest-700/70 mt-1">{b.author}</p>
                {b.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {b.categories.map((c) => (
                      <span key={c} className="text-xs rounded-full bg-cream-100 px-2 py-1 text-forest-700/80">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-cream-200 px-3 py-1 disabled:opacity-40"
            >Prev</button>
            <span className="text-sm text-forest-700/70">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-cream-200 px-3 py-1 disabled:opacity-40"
            >Next</button>
          </div>
        )}
      </main>
    </>
  );
}
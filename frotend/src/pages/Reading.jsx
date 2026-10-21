import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pause, Play, Sun, Moon, Coffee, CheckCircle2,
} from 'lucide-react';
import api from '../api/client';

const FONT_SIZES = [16, 17, 18, 19, 20, 22];
const THEMES = ['light', 'sepia', 'dark'];

export default function Reading() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState(
    params.get('chapter') ? Number(params.get('chapter')) : null
  );
  const [chapter, setChapter] = useState(null);

  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | active | paused
  const [seconds, setSeconds] = useState(0);

  const [fontIdx, setFontIdx] = useState(2);
  const [theme, setTheme] = useState('light');

  const timerRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Load book + chapters
  useEffect(() => {
    api.get(`/books/${id}`).then(({ data }) => setBook(data));
    api.get(`/books/${id}/chapters`).then(({ data }) => {
      setChapters(data);
      if (!chapterId && data[0]) setChapterId(data[0].id);
    });
  }, [id]); // eslint-disable-line

  // Restore reading position if no chapter in URL
  useEffect(() => {
    if (chapterId) return;
    api.get(`/reading-sessions/progress/${id}`)
      .then(({ data }) => {
        if (data?.chapter_id) setChapterId(data.chapter_id);
      })
      .catch(() => {});
  }, [id]); // eslint-disable-line

  // Load chapter content
  useEffect(() => {
    if (!chapterId) return;
    setParams({ chapter: chapterId }, { replace: true });
    api.get(`/books/${id}/chapters/${chapterId}`)
      .then(({ data }) => setChapter(data));
  }, [chapterId, id, setParams]);

  // Start a new session
  const startSession = useCallback(async () => {
    try {
      const { data } = await api.post('/reading-sessions', {
        bookId: Number(id),
        chapterId,
      });
      setSessionId(data.id);
      setStatus('active');
    } catch (e) {
      console.error(e);
    }
  }, [id, chapterId]);

  // Timer — ticks only while active
  useEffect(() => {
    if (status !== 'active') return;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  // Heartbeat every 30s while active
  useEffect(() => {
    if (status !== 'active' || !sessionId) return;
    heartbeatRef.current = setInterval(() => {
      api.post(`/reading-sessions/${sessionId}/heartbeat`).catch(() => {});
    }, 30_000);
    return () => clearInterval(heartbeatRef.current);
  }, [status, sessionId]);

  const pause = async () => {
    if (!sessionId) { setStatus('paused'); return; }
    try {
      await api.post(`/reading-sessions/${sessionId}/pause`);
      setStatus('paused');
    } catch { /* ignore */ }
  };

  // Auto-pause when the tab is hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && status === 'active') {
        if (!sessionId) { setStatus('paused'); return; }
        api.post(`/reading-sessions/${sessionId}/pause`)
          .then(() => setStatus('paused'))
          .catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [status, sessionId]);

  const resume = async () => {
    if (!sessionId) { startSession(); return; }
    try {
      await api.post(`/reading-sessions/${sessionId}/resume`);
      setStatus('active');
    } catch { /* ignore */ }
  };

  const finishSession = async () => {
    if (sessionId) {
      try { await api.post(`/reading-sessions/${sessionId}/finish`); }
      catch { /* ignore */ }
    }
    api.post('/reading-sessions/progress', {
      bookId: Number(id),
      chapterId,
      scrollPercent: 0,
    }).catch(() => {});
    nav('/dashboard');
  };

  const goChapter = (cid) => {
    api.post('/reading-sessions/progress', {
      bookId: Number(id),
      chapterId: cid,
      scrollPercent: 0,
    }).catch(() => {});
    setChapterId(cid);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentIdx = chapters.findIndex((c) => c.id === chapterId);
  const prev = chapters[currentIdx - 1];
  const next = chapters[currentIdx + 1];

  const mmss = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const themeClasses =
    theme === 'sepia' ? 'reader-sepia' :
    theme === 'dark'  ? 'reader-dark' :
    'bg-cream-50';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* ─── Top bar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl
                   border-b border-black/5 shadow-sm"
      >
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/books/${id}`}
              title="Back to book"
              aria-label="Back to book"
              className="w-9 h-9 shrink-0 rounded-full flex items-center
                         justify-center hover:bg-black/5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs opacity-60 truncate">
                {book?.title || 'Reading'}
              </p>
              <p className="text-sm font-medium truncate">
                {chapter?.title || 'Loading…'}
              </p>
            </div>
          </div>

          {/* Session controls */}
          <div className="flex items-center gap-2 shrink-0">
            {status === 'active' ? (
              <button onClick={pause} className="btn btn-primary text-sm px-4 py-2">
                <Pause className="w-3.5 h-3.5" />
                <span className="tabular-nums">{mmss(seconds)}</span>
              </button>
            ) : status === 'paused' ? (
              <button onClick={resume} className="btn btn-gold text-sm px-4 py-2">
                <Play className="w-3.5 h-3.5" /> Resume
              </button>
            ) : (
              <button onClick={startSession} className="btn btn-primary text-sm px-4 py-2">
                <Play className="w-3.5 h-3.5" /> Start session
              </button>
            )}

            <button onClick={finishSession} className="btn btn-outline text-sm px-4 py-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Finish</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-black/5">
          <div
            className="h-full bg-gradient-to-r from-forest-600 to-gold-400 transition-all"
            style={{
              width: chapters.length
                ? `${((currentIdx + 1) / chapters.length) * 100}%`
                : '0%',
            }}
          />
        </div>
      </header>

      {/* ─── Toolbar: font size + theme ──────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-end gap-2">
        {/* Font size group */}
        <div className="inline-flex rounded-full bg-white/80 backdrop-blur
                        border border-cream-200 shadow-sm p-1 text-xs">
          <button
            onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
            aria-label="Decrease font size"
            className="w-8 h-8 rounded-full hover:bg-black/5 font-semibold"
          >
            A−
          </button>
          <button
            onClick={() => setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
            aria-label="Increase font size"
            className="w-8 h-8 rounded-full hover:bg-black/5 font-semibold"
          >
            A+
          </button>
        </div>

        {/* Theme group */}
        <div className="inline-flex rounded-full bg-white/80 backdrop-blur
                        border border-cream-200 shadow-sm p-1 gap-0.5">
          {THEMES.map((t) => {
            const Icon = t === 'light' ? Sun : t === 'sepia' ? Coffee : Moon;
            return (
              <button
                key={`theme-${t}`}
                onClick={() => setTheme(t)}
                aria-label={`${t} theme`}
                aria-pressed={theme === t}
                className={`w-8 h-8 rounded-full flex items-center justify-center
                            hover:bg-black/5 transition
                            ${theme === t ? 'bg-black/10' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Chapter content ────────────────────────────────────── */}
      <article className="max-w-2xl mx-auto px-6 pb-24">
        {chapter ? (
          <>
            <p className="text-xs uppercase tracking-widest opacity-50">
              Chapter {chapter.chapter_number}
            </p>
            <h1 className="font-display text-3xl mt-1 mb-8">
              {chapter.title}
            </h1>
            <div
              className="reader-content"
              style={{ fontSize: `${FONT_SIZES[fontIdx]}px` }}
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          </>
        ) : (
          <p className="py-24 text-center opacity-60">Loading chapter…</p>
        )}

        {/* Chapter nav */}
        <nav className="mt-16 grid grid-cols-2 gap-3" aria-label="Chapter navigation">
          <button
            disabled={!prev}
            onClick={() => prev && goChapter(prev.id)}
            className="btn btn-outline text-sm justify-start text-left disabled:opacity-40 py-3"
          >
            {prev && (
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wider opacity-60">
                  Previous
                </span>
                <span className="block truncate font-semibold">{prev.title}</span>
              </span>
            )}
          </button>
          <button
            disabled={!next}
            onClick={() => next && goChapter(next.id)}
            className="btn btn-outline text-sm justify-end text-right disabled:opacity-40 py-3"
          >
            {next && (
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wider opacity-60">
                  Next
                </span>
                <span className="block truncate font-semibold">{next.title}</span>
              </span>
            )}
          </button>
        </nav>
      </article>
    </div>
  );
}
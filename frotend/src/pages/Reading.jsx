import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getBook } from '../data/readrise-data';
import BookReader from '../components/reader/BookReader';

export default function Reading() {
  const { id: rawId } = useParams();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();

  // Resolve ID (numeric or slug) and initial fallback
  const fallback = getBook(rawId);
  const numericId = fallback?.id || (isNaN(Number(rawId)) ? null : Number(rawId));

  const [book, setBook] = useState(() => fallback || null);
  const [chapters, setChapters] = useState(() => fallback?.chapters || []);
  const [chapterId, setChapterId] = useState(
    params.get('chapter')
      ? Number(params.get('chapter'))
      : fallback?.chapters?.[0]?.id || null,
  );
  const [chapter, setChapter] = useState(() => {
    const targetCid = params.get('chapter')
      ? Number(params.get('chapter'))
      : fallback?.chapters?.[0]?.id || null;
    return (
      fallback?.chapters?.find((c) => c.id === targetCid) ||
      fallback?.chapters?.[0] ||
      null
    );
  });
  const [loadingError, setLoadingError] = useState(null);

  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | active | paused
  const [seconds, setSeconds] = useState(0);

  const timerRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Load book + chapters from API
  useEffect(() => {
    if (!numericId) return;

    api
      .get(`/books/${numericId}`)
      .then(({ data }) => setBook((prev) => ({ ...(prev || fallback), ...data })))
      .catch((err) => {
        console.error('Error loading book:', err);
        if (!fallback) {
          setLoadingError('Failed to load book details');
        }
      });

    api
      .get(`/books/${numericId}/chapters`)
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setChapters(data);
          if (!chapterId && data[0]) {
            setChapterId(data[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('Error loading chapters:', err);
        if (!fallback?.chapters?.length) {
          setChapters([]);
        }
      });
  }, [numericId]); // eslint-disable-line

  // Restore reading position if no chapter in URL
  useEffect(() => {
    if (chapterId || !numericId) return;
    api
      .get(`/reading-sessions/progress/${numericId}`)
      .then(({ data }) => {
        if (data?.chapterId) setChapterId(data.chapterId);
      })
      .catch(() => {});
  }, [numericId]); // eslint-disable-line

  // Load chapter content
  useEffect(() => {
    if (!chapterId) return;
    setParams({ chapter: chapterId }, { replace: true });

    if (numericId) {
      api
        .get(`/books/${numericId}/chapters/${chapterId}`)
        .then(({ data }) => {
          setChapter(data);
          setLoadingError(null);
        })
        .catch((err) => {
          console.error('Error loading chapter:', err);
          const local = chapters.find((c) => c.id === chapterId);
          if (local) {
            setChapter(local);
            setLoadingError(null);
          } else if (!fallback?.chapters) {
            setLoadingError('Failed to load chapter content');
          }
        });
    }
  }, [chapterId, numericId, setParams]); // eslint-disable-line

  // Start a new session
  const startSession = useCallback(async () => {
    try {
      if (numericId) {
        const { data } = await api.post('/reading-sessions', {
          bookId: numericId,
          chapterId: chapterId || null,
        });
        setSessionId(data.id);
      }
      setStatus('active');
    } catch (e) {
      console.error(e);
      setStatus('active');
    }
  }, [numericId, chapterId]);

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
    if (!sessionId) {
      setStatus('paused');
      return;
    }
    try {
      await api.post(`/reading-sessions/${sessionId}/pause`);
      setStatus('paused');
    } catch {
      /* ignore */
    }
  };

  // Auto-pause when the tab is hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && status === 'active') {
        if (!sessionId) {
          setStatus('paused');
          return;
        }
        api
          .post(`/reading-sessions/${sessionId}/pause`)
          .then(() => setStatus('paused'))
          .catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [status, sessionId]);

  const resume = async () => {
    if (!sessionId) {
      startSession();
      return;
    }
    try {
      await api.post(`/reading-sessions/${sessionId}/resume`);
      setStatus('active');
    } catch {
      /* ignore */
    }
  };

  const finishSession = async () => {
    if (sessionId) {
      try {
        await api.post(`/reading-sessions/${sessionId}/finish`);
      } catch {
        /* ignore */
      }
    }
    if (numericId) {
      api
        .post('/reading-sessions/progress', {
          bookId: numericId,
          chapterId,
          scrollPercent: 100,
          isCompleted: true,
        })
        .catch(() => {});
    }
    nav('/dashboard');
  };

  const goChapter = (cid) => {
    if (numericId) {
      api
        .post('/reading-sessions/progress', {
          bookId: numericId,
          chapterId: cid,
          scrollPercent: 0,
        })
        .catch(() => {});
    }
    const localChap = chapters.find((c) => c.id === cid);
    if (localChap) setChapter(localChap);
    setChapterId(cid);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loadingError && !book && !chapter) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-cream-200">
          <p className="text-red-600 font-medium mb-4">{loadingError}</p>
          <div className="flex justify-center gap-3">
            <Link to="/" className="btn btn-primary px-5 py-2 text-sm rounded-xl">
              Go to Home
            </Link>
            <Link to="/explore" className="btn btn-outline px-5 py-2 text-sm rounded-xl">
              Explore Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BookReader
      book={book}
      chapters={chapters}
      chapterId={chapterId}
      onSelectChapter={goChapter}
      currentChapter={chapter}
      sessionId={sessionId}
      status={status}
      seconds={seconds}
      onStartSession={startSession}
      onPauseSession={pause}
      onResumeSession={resume}
      onFinishSession={finishSession}
    />
  );
}

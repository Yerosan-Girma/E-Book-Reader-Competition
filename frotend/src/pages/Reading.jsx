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
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [cumulativeSeconds, setCumulativeSeconds] = useState(0);
  const [initialPosition, setInitialPosition] = useState(() => params.get('pos') || null);

  const timerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const sessionIdRef = useRef(null);
  const sessionSecondsRef = useRef(0);
  const cumulativeSecondsRef = useRef(0);
  const statusRef = useRef('idle');
  const startingLockRef = useRef(false);

  // Keep refs in sync for unmount / beforeunload / callbacks
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    sessionSecondsRef.current = sessionSeconds;
  }, [sessionSeconds]);

  useEffect(() => {
    cumulativeSecondsRef.current = cumulativeSeconds;
  }, [cumulativeSeconds]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Load book details + chapters from API
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

  // Restore saved reading progress (chapter, position, & previous reading time)
  useEffect(() => {
    if (!numericId) return;

    api
      .get(`/reading-sessions/progress/${numericId}`)
      .then(({ data }) => {
        if (data) {
          if (!params.get('chapter') && data.chapterId) {
            setChapterId(data.chapterId);
          }
          if (!params.get('pos') && data.position) {
            setInitialPosition(data.position);
          }
          if (data.totalReadingSeconds) {
            setCumulativeSeconds(Number(data.totalReadingSeconds));
            cumulativeSecondsRef.current = Number(data.totalReadingSeconds);
          }
        }
      })
      .catch(() => {});
  }, [numericId]); // eslint-disable-line

  // Load chapter content if reading chapter book
  useEffect(() => {
    if (!chapterId) return;
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('chapter', chapterId);
      return p;
    }, { replace: true });

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
  }, [chapterId, numericId]); // eslint-disable-line

  // Start reading session (guaranteed single-execution per book load)
  const startSession = useCallback(async () => {
    if (startingLockRef.current || sessionIdRef.current) return;
    startingLockRef.current = true;

    try {
      if (numericId) {
        const { data } = await api.post('/reading-sessions', {
          bookId: numericId,
          chapterId: chapterId || null,
        });

        setSessionId(data.id);
        sessionIdRef.current = data.id;

        if (data.previousTotalSeconds != null) {
          setCumulativeSeconds(Number(data.previousTotalSeconds));
          cumulativeSecondsRef.current = Number(data.previousTotalSeconds);
        }
      }
      setStatus('active');
      statusRef.current = 'active';
    } catch (e) {
      console.warn('Session start fallback:', e);
      setStatus('active');
      statusRef.current = 'active';
    } finally {
      startingLockRef.current = false;
    }
  }, [numericId, chapterId]);

  // AUTOMATIC READING TIME COUNTING: Start session as soon as book is ready
  useEffect(() => {
    if (numericId && status === 'idle' && !startingLockRef.current) {
      startSession();
    }
  }, [numericId, status, startSession]);

  // Timer — ticks actively every second while reading
  useEffect(() => {
    if (status !== 'active') return;
    timerRef.current = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  // Immediate sync helper to record seconds to backend
  const syncTimeNow = useCallback(async (isFinal = false) => {
    const sId = sessionIdRef.current;
    const sec = sessionSecondsRef.current;
    if (!sId || sec <= 0) return;

    try {
      const endpoint = isFinal
        ? `/reading-sessions/${sId}/finish`
        : `/reading-sessions/${sId}/heartbeat`;

      await api.post(endpoint, {
        seconds: sec,
        bookId: numericId,
      });
    } catch {
      /* ignore background errors */
    }
  }, [numericId]);

  // Periodic heartbeat every 8 seconds so reading time is continuously saved to the DB
  useEffect(() => {
    if (status !== 'active' || !sessionId) return;

    // Send first sync quickly after 3 seconds
    const initialSyncTimer = setTimeout(() => {
      syncTimeNow(false);
    }, 3000);

    heartbeatRef.current = setInterval(() => {
      syncTimeNow(false);
    }, 8000);

    return () => {
      clearTimeout(initialSyncTimer);
      clearInterval(heartbeatRef.current);
    };
  }, [status, sessionId, syncTimeNow]);

  const pause = async () => {
    setStatus('paused');
    statusRef.current = 'paused';
    syncTimeNow(false);
    if (sessionId) {
      try {
        await api.post(`/reading-sessions/${sessionId}/pause`);
      } catch {
        /* ignore */
      }
    }
  };

  const resume = async () => {
    if (!sessionId) {
      startSession();
      return;
    }
    try {
      await api.post(`/reading-sessions/${sessionId}/resume`);
      setStatus('active');
      statusRef.current = 'active';
    } catch {
      setStatus('active');
      statusRef.current = 'active';
    }
  };

  // Auto-pause when user switches tabs or minimizes browser, auto-resume when they return
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (statusRef.current === 'active') {
          pause();
        }
      } else {
        if (statusRef.current === 'paused') {
          resume();
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [sessionId]); // eslint-disable-line

  // RECORD TIME WHEN LEAVING PAGE (Unmount & Page Unload):
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sId = sessionIdRef.current;
      const sec = sessionSecondsRef.current;
      if (!sId || sec <= 0) return;

      const token = localStorage.getItem('readrise.token');
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reading-sessions/${sId}/finish?token=${encodeURIComponent(token || '')}`;
      const payload = JSON.stringify({ seconds: sec, token });

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
        } else {
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: payload,
            keepalive: true,
          });
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // In-app navigation cleanup: immediately record final duration in Postgres
      const sId = sessionIdRef.current;
      const sec = sessionSecondsRef.current;
      if (sId && sec > 0) {
        const token = localStorage.getItem('readrise.token');
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reading-sessions/${sId}/finish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ seconds: sec }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, []);

  const finishSession = async () => {
    if (sessionId) {
      try {
        await api.post(`/reading-sessions/${sessionId}/finish`, {
          seconds: sessionSecondsRef.current,
        });
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
          seconds: sessionSecondsRef.current,
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
          seconds: sessionSecondsRef.current,
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
            <Link to="/books" className="btn btn-outline px-5 py-2 text-sm rounded-xl">
              Explore Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Live total time = previously accumulated seconds for this book + current session seconds
  const totalDisplaySeconds = cumulativeSeconds + sessionSeconds;

  return (
    <BookReader
      book={book}
      chapters={chapters}
      chapterId={chapterId}
      onSelectChapter={goChapter}
      currentChapter={chapter}
      sessionId={sessionId}
      status={status}
      seconds={totalDisplaySeconds}
      sessionSeconds={sessionSeconds}
      initialPosition={initialPosition}
      onStartSession={startSession}
      onPauseSession={pause}
      onResumeSession={resume}
      onFinishSession={finishSession}
    />
  );
}

import { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

/**
 * Official Adobe Acrobat PDF Embed API Reader
 * Renders the industry standard Adobe Acrobat Reader inside the web application
 * using Adobe's official free Document Cloud View SDK.
 */
export default function AdobePDFViewer({
  fileUrl,
  fileName = 'document.pdf',
  initialPage = 1,
  onPageChange,
  onSwitchEngine,
}) {
  const [clientId, setClientId] = useState(() => {
    return (
      import.meta.env.VITE_ADOBE_PDF_CLIENT_ID ||
      (typeof window !== 'undefined' && localStorage.getItem('readrise_adobe_client_id')) ||
      '070f8a0187cf468ab0db9670c4b53fda'
    );
  });
  const [inputKey, setInputKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const viewerContainerId = 'adobe-dc-view-embed-container';

  // Save entered key
  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) return;
    localStorage.setItem('readrise_adobe_client_id', cleanKey);
    setClientId(cleanKey);
    setIsConfiguring(false);
    setError(null);
  };

  const handleClearKey = () => {
    localStorage.removeItem('readrise_adobe_client_id');
    setClientId('');
    setInputKey('');
    setIsConfiguring(true);
  };

  useEffect(() => {
    if (!clientId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    // 1. Inject or verify Adobe View SDK script
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.AdobeDC) {
          resolve(window.AdobeDC);
          return;
        }
        const existing = document.getElementById('adobe-view-sdk-script');
        if (existing) {
          existing.addEventListener('load', () => resolve(window.AdobeDC));
          return;
        }
        const script = document.createElement('script');
        script.id = 'adobe-view-sdk-script';
        script.src = 'https://documentservices.adobe.com/view-sdk/main.js';
        script.async = true;
        script.onload = () => resolve(window.AdobeDC);
        script.onerror = () => reject(new Error('Failed to load Adobe View SDK script'));
        document.head.appendChild(script);
      });
    };

    loadScript()
      .then(() => {
        if (!isMounted) return;

        const initializeAdobeViewer = async () => {
          try {
            // Fetch file as ArrayBuffer for 100% reliable cross-origin loading
            const response = await fetch(fileUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch document binary (${response.status})`);
            }
            const buffer = await response.arrayBuffer();

            if (!isMounted) return;

            const containerEl = document.getElementById(viewerContainerId);
            if (containerEl) {
              containerEl.innerHTML = '';
            }

            const adobeDCView = new window.AdobeDC.View({
              clientId: clientId,
              divId: viewerContainerId,
            });

            const previewPromise = adobeDCView.previewFile(
              {
                content: { promise: Promise.resolve(buffer) },
                metaData: { fileName: fileName || 'document.pdf' },
              },
              {
                embedMode: 'FULL_WINDOW',
                showAnnotationTools: true,
                showLeftHandPanel: true,
                showDownloadPDF: false,
                showPrintPDF: false,
                showPageControls: true,
                dockPageControls: true,
                defaultViewMode: 'FIT_WIDTH',
              },
            );

            previewPromise
              .then((adobeViewer) => {
                if (initialPage && Number(initialPage) > 1) {
                  adobeViewer
                    .getAPIs()
                    .then((apis) => {
                      apis.gotoLocation(Number(initialPage));
                    })
                    .catch(() => {});
                }
                if (onPageChange) {
                  adobeViewer
                    .getAPIs()
                    .then((apis) => {
                      if (window.AdobeDC?.View?.Enum?.CallbackType?.PAGE_CHANGE) {
                        apis.registerCallback(
                          window.AdobeDC.View.Enum.CallbackType.PAGE_CHANGE,
                          (event) => {
                            if (event?.data?.pageNumber) {
                              onPageChange(event.data.pageNumber);
                            }
                          }
                        );
                      }
                    })
                    .catch(() => {});
                }
              })
              .catch(() => {});

            if (isMounted) setLoading(false);
          } catch (err) {
            console.error('Adobe View SDK error:', err);
            if (isMounted) {
              setError(
                err.message ||
                  'Failed to render in Adobe Acrobat. Verify your Client ID matches your domain (e.g. localhost).',
              );
              setLoading(false);
            }
          }
        };

        if (window.AdobeDC) {
          initializeAdobeViewer();
        } else {
          document.addEventListener('adobe_dc_view_sdk.ready', initializeAdobeViewer, {
            once: true,
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to initialize Adobe View SDK');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, fileUrl, fileName]);

  // Case A: Missing Key or User is Configuring Key
  if (!clientId || isConfiguring) {
    return (
      <div className="w-full max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-3xl border border-cream-300 shadow-xl text-ink">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold">Official Adobe Acrobat Reader</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                Free API Key
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Embed the world standard Adobe Acrobat interface with annotations, thumbnails, and search.
            </p>
          </div>
        </div>

        <div className="space-y-3.5 my-6 p-4 rounded-2xl bg-cream-100/70 border border-cream-200 text-xs text-ink-light">
          <p className="font-semibold text-ink text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold-500" />
            How to get your free Adobe Client ID in 60 seconds:
          </p>
          <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
            <li>
              Go to the free{' '}
              <a
                href="https://developer.adobe.com/document-services/apis/pdf-embed/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest-600 font-semibold underline inline-flex items-center gap-0.5"
              >
                Adobe PDF Embed API Portal <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and click <strong>Get Credentials</strong>.
            </li>
            <li>
              Log in with any Google or Adobe account. Enter application name <strong>ReadRise</strong> and domain <strong>localhost</strong>.
            </li>
            <li>
              Copy your generated <strong>Client ID</strong> and paste it below:
            </li>
          </ol>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-forest-600" /> Adobe Client ID (API Key)
            </label>
            <input
              type="text"
              required
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="e.g. 5d8f92a3e4b01234567890ab"
              className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 focus:bg-white text-xs font-mono focus:outline-none focus:border-forest-500 shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto btn btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Activate Adobe Reader
            </button>

            {onSwitchEngine && (
              <button
                type="button"
                onClick={() => onSwitchEngine('continuous')}
                className="w-full sm:w-auto btn btn-outline px-5 py-2.5 rounded-xl text-xs font-medium text-ink-muted hover:text-ink"
              >
                Use Continuous Scroll Reader (No Key Required)
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Case B: Active Adobe DC View (Edge-to-Edge Full Viewport Width & Height)
  return (
    <div className="w-full h-[calc(100vh-96px)] relative bg-slate-900 overflow-hidden flex flex-col">
      {/* Subtle key settings button (non-intrusive) */}
      <div className="absolute top-2 right-16 z-30 flex items-center gap-1.5 opacity-40 hover:opacity-100 transition bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white">
        <button
          onClick={() => setIsConfiguring(true)}
          className="hover:text-gold-300 transition"
          title="Change Adobe Client ID"
        >
          Key
        </button>
        <span>|</span>
        <button
          onClick={handleClearKey}
          className="hover:text-red-400 transition"
          title="Reset API Key"
        >
          Reset
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="text-sm font-semibold text-ink">Starting Adobe Acrobat Reader…</span>
          <span className="text-xs text-ink-muted">Loading full-bleed document canvas</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-white text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h3 className="font-bold text-lg text-ink mb-1">Adobe Reader Error</h3>
          <p className="text-xs text-ink-light max-w-md mb-6">{error}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConfiguring(true)}
              className="btn btn-primary text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" /> Reconfigure Client ID
            </button>
            {onSwitchEngine && (
              <button
                onClick={() => onSwitchEngine('continuous')}
                className="btn btn-outline text-xs px-5 py-2.5 rounded-xl"
              >
                Switch to Continuous Reader
              </button>
            )}
          </div>
        </div>
      )}

      {/* 100% Edge-to-Edge Container */}
      <div
        id={viewerContainerId}
        className="w-full h-full"
        style={{ height: 'calc(100vh - 96px)', width: '100%' }}
      />
    </div>
  );
}

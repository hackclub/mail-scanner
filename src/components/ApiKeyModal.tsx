import { useState } from "react";
import QRCode from "react-qr-code";

interface ApiKeyModalProps {
  onSubmit: (
    apiKey: string,
    store: boolean,
    mode: "webcam" | "keyboard"
  ) => void;
  onScanRequest: () => void;
  onScanKeyboardRequest: () => void;
  onClose?: () => void;
  existingApiKey?: string;
  startInShareMode?: boolean;
}

export function ApiKeyModal({
  onSubmit,
  onScanRequest,
  onScanKeyboardRequest,
  onClose,
  existingApiKey,
  startInShareMode = false,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [store, setStore] = useState(true);
  const [showShare, setShowShare] = useState(startInShareMode);

  const handleSubmit =
    (mode: "webcam" | "keyboard") => (e: React.FormEvent) => {
      e.preventDefault();
      if (apiKey.trim()) {
        onSubmit(apiKey.trim(), store, mode);
      } else if (existingApiKey && onClose) {
        onClose();
      }
    };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget && existingApiKey && onClose) {
            onClose();
          }
        }}
      >
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
          {existingApiKey && onClose && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white/70 hover:text-white text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          )}
          <h2 className="text-2xl font-bold mb-4 text-white">Enter API Key</h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Hack Club Mail API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  existingApiKey ? "••••••••••••" : "Enter your API key"
                }
                autoFocus
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="store"
                checked={store}
                onChange={(e) => setStore(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="store" className="ml-2 text-sm text-white/80">
                Store key locally
              </label>
            </div>
            {existingApiKey ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSubmit("webcam")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  {apiKey.trim() ? "Update API Key" : "Close"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowShare(true)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Share Current API Key
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <button
                    onClick={handleSubmit("webcam")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                    disabled={!apiKey.trim()}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    onClick={onScanRequest}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                  >
                    Scan Key
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <button
                    onClick={handleSubmit("keyboard")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                    disabled={!apiKey.trim()}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    onClick={onScanKeyboardRequest}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                  >
                    Scan Key
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {showShare && existingApiKey && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm text-center relative">
            <button
              onClick={() => {
                if (startInShareMode && onClose) {
                  onClose();
                } else {
                  setShowShare(false);
                }
              }}
              className="absolute top-2 right-2 text-white/70 hover:text-white text-2xl"
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-white">
              Scan to Import API Key
            </h3>
            <div className="bg-white p-4 rounded inline-block">
              <QRCode
                value={`${window.location.origin}/#${existingApiKey}`}
                size={192}
              />
            </div>
            <p className="text-xs text-white/60 mt-3">
              Never share this publicly.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

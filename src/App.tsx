import { useState, useEffect, useCallback, useRef } from "react";
import { Scanner } from "./components/Scanner";
import { KeyboardScanner } from "./components/KeyboardScanner";
import { HistoryList } from "./components/HistoryList";
import { ApiKeyModal } from "./components/ApiKeyModal";
import type { AppState, HistoryItem, Status } from "./types";
import { parseLetterId } from "./utils/letterParser";
import { markLetterMailed, getLetterStatus } from "./utils/api";
import {
  loadApiKey,
  saveApiKey,
  loadHistory,
  saveHistory,
} from "./utils/storage";
import { useErrorSound } from "./hooks/useErrorSound";

function App() {
  const [state, setState] = useState<AppState>({
    status: "idle",
    apiKey: "",
    lastLetterId: null,
    message: "Ready to scan",
    history: [],
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [shareMode, setShareMode] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [scannerMode, setScannerMode] = useState<"webcam" | "keyboard">(
    "webcam"
  );
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const { playError, playDuplicate, playSuccess } = useErrorSound();
  const processingRef = useRef(false);
  const successSetRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let apiKey = loadApiKey();
    const history = loadHistory();
    successSetRef.current = new Set(
      history.filter((h) => h.status === "success").map((h) => h.id)
    );

    // Check URL hash for API key
    const hash = window.location.hash.slice(1); // Remove the #
    if (hash.startsWith("th_api_live_")) {
      apiKey = hash;
      saveApiKey(apiKey);
      window.history.replaceState(null, "", window.location.pathname); // Clear hash
    }

    setState((prev) => ({
      ...prev,
      apiKey,
      history,
    }));
    if (!apiKey) {
      setShowApiKeyModal(true);
    }
  }, []);

  useEffect(() => {
    saveHistory(state.history);
  }, [state.history]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const setStatus = useCallback(
    (status: Status, message: string, lastLetterId: string | null = null) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setState((prev) => ({
        ...prev,
        status,
        message,
        lastLetterId,
      }));

      if (status === "duplicate") {
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null;
          setState((prev) => ({
            ...prev,
            status: "idle",
            message: "Ready to scan",
          }));
        }, 5000);
      } else if (status === "success") {
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null;
          setState((prev) => ({
            ...prev,
            status: "idle",
            message: "Ready to scan",
          }));
        }, 800);
      } else if (status === "error") {
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null;
          setState((prev) => ({
            ...prev,
            status: "idle",
            message: "Ready to scan",
          }));
        }, 5000);
      } else if (status === "apiKeyUpdated") {
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null;
          setState((prev) => ({
            ...prev,
            status: "idle",
            message: "Ready to scan",
          }));
        }, 5000);
      }
    },
    []
  );

  const addToHistory = useCallback((item: Omit<HistoryItem, "ts">) => {
    setState((prev) => ({
      ...prev,
      history: [...prev.history, { ...item, ts: Date.now() }],
    }));
  }, []);

  const handleScan = useCallback(
    async (text: string) => {
      // Check if it's an API key first (direct key or URL with hash)
      const trimmedText = text.trim();
      let apiKey = null;

      if (trimmedText.startsWith("th_api_live_")) {
        apiKey = trimmedText;
      } else if (trimmedText.includes("#th_api_live_")) {
        apiKey = trimmedText.split("#")[1];
      }

      if (apiKey) {
        saveApiKey(apiKey);
        setState((prev) => ({ ...prev, apiKey }));
        playSuccess();
        setStatus("apiKeyUpdated", "API key updated", null);
        setHasStarted(true);
        return;
      }

      if (processingRef.current) return;

      const letterId = parseLetterId(text);

      if (!letterId) {
        playError();
        setStatus("error", "Not a letter code", null);
        return;
      }

      if (successSetRef.current.has(letterId)) {
        playDuplicate();
        setStatus("duplicate", "Letter already marked as mailed", letterId);
        addToHistory({
          id: letterId,
          status: "duplicate",
          message: "Already scanned",
        });
        return;
      }

      processingRef.current = true;
      setStatus("processing", "Processing...", letterId);

      try {
        const response = await markLetterMailed(state.apiKey, letterId);

        if (response.ok) {
          playSuccess();
          setStatus("success", "Successfully marked as mailed", letterId);
          addToHistory({
            id: letterId,
            status: "success",
            message: "Marked as mailed",
          });
          successSetRef.current.add(letterId);
        } else {
          const statusData = await getLetterStatus(state.apiKey, letterId);

          if (statusData?.letter?.status === "mailed") {
            playDuplicate();
            setStatus("duplicate", "Letter already marked as mailed", letterId);
            addToHistory({
              id: letterId,
              status: "duplicate",
              message: "Already mailed",
            });
          } else if (response.status === 401) {
            playError();
            setStatus("error", "Invalid API key", letterId);
            addToHistory({
              id: letterId,
              status: "error",
              message: "Invalid API key",
            });
          } else if (response.status === 404) {
            playError();
            setStatus("error", "Invalid letter or no permission", letterId);
            addToHistory({
              id: letterId,
              status: "error",
              message: "Invalid letter or no permission",
            });
          } else {
            playError();
            setStatus(
              "error",
              `Error marking as mailed (${response.status})`,
              letterId
            );
            addToHistory({
              id: letterId,
              status: "error",
              message: `HTTP ${response.status}`,
            });
          }
        }
      } catch (err) {
        playError();
        setStatus("error", "Network error", letterId);
        addToHistory({
          id: letterId,
          status: "error",
          message: "Network error",
        });
      } finally {
        processingRef.current = false;
      }
    },
    [state.apiKey, setStatus, addToHistory, playError]
  );

  const handleApiKeySubmit = (
    apiKey: string,
    store: boolean,
    mode: "webcam" | "keyboard"
  ) => {
    if (store) {
      saveApiKey(apiKey);
    }
    setState((prev) => ({ ...prev, apiKey }));
    setScannerMode(mode);
    setShowApiKeyModal(false);
    setHasStarted(true);
  };

  const handleChangeApiKey = () => {
    setShowApiKeyModal(true);
  };

  const handleShareApiKey = () => {
    setShareMode(true);
    setShowApiKeyModal(true);
  };

  const handleCloseApiKeyModal = () => {
    setShareMode(false);
    setShowApiKeyModal(false);
  };

  const handleClearHistory = () => {
    setState((prev) => ({ ...prev, history: [] }));
    successSetRef.current.clear();
  };

  const handleStartWebcam = () => {
    setScannerMode("webcam");
    setHasStarted(true);
  };

  const handleStartKeyboard = () => {
    console.log("Starting keyboard scanner mode");
    setScannerMode("keyboard");
    setHasStarted(true);
  };

  const handleScanApiKeyRequest = () => {
    setScannerMode("webcam");
    setShowApiKeyModal(false);
    setHasStarted(true);
  };

  const handleScanKeyboardApiKeyRequest = () => {
    setScannerMode("keyboard");
    setShowApiKeyModal(false);
    setHasStarted(true);
  };

  const getBackgroundClass = () => {
    switch (state.status) {
      case "processing":
        return "bg-yellow-500";
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "duplicate":
        return "bg-red-600";
      case "apiKeyUpdated":
        return "bg-blue-600";
      default:
        return "bg-gray-900";
    }
  };

  const getAnimationStyle = () => {
    if (state.status === "duplicate") {
      return { animation: "flash 0.5s steps(1, end) 10" };
    }
    return {};
  };

  return (
    <div
      className={`min-h-screen ${getBackgroundClass()} text-white`}
      style={getAnimationStyle()}
    >
      {showApiKeyModal && (
        <ApiKeyModal
          onSubmit={handleApiKeySubmit}
          onScanRequest={handleScanApiKeyRequest}
          onScanKeyboardRequest={handleScanKeyboardApiKeyRequest}
          onClose={state.apiKey ? handleCloseApiKeyModal : undefined}
          existingApiKey={state.apiKey}
          startInShareMode={shareMode}
        />
      )}

      {!hasStarted && !showApiKeyModal && state.apiKey && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Ready to Scan
            </h2>
            <p className="text-white/80 mb-6">Choose your scanning method</p>
            <button
              onClick={handleStartWebcam}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Use Camera
            </button>
            <button
              onClick={handleStartKeyboard}
              className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Use Physical Scanner
            </button>
            <button
              onClick={handleShareApiKey}
              className="w-full mt-4 text-white/60 hover:text-white text-sm py-2 transition-colors"
            >
              Share Saved API Key
            </button>
          </div>
        </div>
      )}

      {!showApiKeyModal && hasStarted && scannerMode === "webcam" && (
        <Scanner enabled={true} onResult={handleScan} />
      )}

      {!showApiKeyModal && hasStarted && scannerMode === "keyboard" && (
        <KeyboardScanner enabled={true} onResult={handleScan} />
      )}

      {(!isPageVisible || !isWindowFocused) && hasStarted && scannerMode === "keyboard" && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white px-4 py-3 text-center z-50 shadow-lg">
          <p className="font-bold">⚠️ Window not active - Physical scanner input disabled</p>
          <p className="text-sm mt-1">Click on this window to resume scanning</p>
        </div>
      )}

      <div className="relative z-10 h-screen flex flex-col overflow-hidden">
        <div
          className={`flex-1 flex flex-col items-center justify-center p-4 min-h-0 ${
            scannerMode === "webcam" ? "pt-48 md:pt-32" : ""
          }`}
        >
          <div className="text-center">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-mono mb-4 break-all px-2">
              {state.lastLetterId || "--"}
            </div>
            <div className="text-lg sm:text-xl md:text-2xl">
              {state.message}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 pb-4">
          <HistoryList
            history={state.history}
            onClearHistory={handleClearHistory}
          />
        </div>

        {state.apiKey && (
          <button
            onClick={handleChangeApiKey}
            className="fixed top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded text-sm transition-colors z-50"
            aria-label="Change API Key"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default App;

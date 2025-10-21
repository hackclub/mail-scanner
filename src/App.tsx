import { useState, useEffect, useCallback, useRef } from "react";
import { Scanner } from "./components/Scanner";
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
  const [hasStarted, setHasStarted] = useState(false);
  const { playError, playDuplicate, playSuccess } = useErrorSound();
  const processingRef = useRef(false);
  const successSetRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const apiKey = loadApiKey();
    const history = loadHistory();
    successSetRef.current = new Set(
      history.filter((h) => h.status === "success").map((h) => h.id)
    );
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
            status: "error",
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
      // Check if it's an API key first
      const trimmedText = text.trim();
      if (trimmedText.startsWith("th_api_live_")) {
        saveApiKey(trimmedText);
        setState((prev) => ({ ...prev, apiKey: trimmedText }));
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

  const handleApiKeySubmit = (apiKey: string, store: boolean) => {
    if (store) {
      saveApiKey(apiKey);
    }
    setState((prev) => ({ ...prev, apiKey }));
    setShowApiKeyModal(false);
    setHasStarted(true);
  };

  const handleChangeApiKey = () => {
    setShowApiKeyModal(true);
  };

  const handleClearHistory = () => {
    setState((prev) => ({ ...prev, history: [] }));
    successSetRef.current.clear();
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleScanApiKeyRequest = () => {
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
          onClose={state.apiKey ? () => setShowApiKeyModal(false) : undefined}
          existingApiKey={state.apiKey}
        />
      )}

      {!hasStarted && !showApiKeyModal && state.apiKey && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Ready to Scan</h2>
            <p className="text-white/80 mb-6">Click the button below to start scanning QR codes</p>
            <button
              onClick={handleStart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Start Scanning
            </button>
          </div>
        </div>
      )}

      {!showApiKeyModal && hasStarted && (
        <Scanner enabled={true} onResult={handleScan} />
      )}

      <div className="relative z-10 h-screen flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-4 pt-32 min-h-0">
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

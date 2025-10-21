import type { HistoryItem } from "../types";

interface HistoryListProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export function HistoryList({ history, onClearHistory }: HistoryListProps) {
  const getStatusColor = (status: HistoryItem["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "duplicate":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Scan History</h2>
        <button
          onClick={onClearHistory}
          className="text-sm px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
        >
          Clear History
        </button>
      </div>
      <div className="bg-white/10 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
        {history.length === 0 ? (
          <div className="p-4 text-center text-white/60">
            No scans yet
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {[...history].reverse().map((item, index) => (
              <div
                key={`${item.id}-${item.ts}-${index}`}
                className="p-3 flex items-center gap-3"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(item.status)}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-bold">{item.id}</div>
                  <div className="text-sm text-white/70 truncate">{item.message}</div>
                </div>
                <div className="text-xs text-white/50 whitespace-nowrap">
                  {new Date(item.ts).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

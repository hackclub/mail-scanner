import { useState } from "react";

interface ApiKeyModalProps {
  onSubmit: (apiKey: string, store: boolean) => void;
}

export function ApiKeyModal({ onSubmit }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [store, setStore] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim(), store);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Enter API Key</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-white/80 mb-2">
              Hack Club Mail API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your API key"
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
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            disabled={!apiKey.trim()}
          >
            Start Scanning
          </button>
        </form>
      </div>
    </div>
  );
}

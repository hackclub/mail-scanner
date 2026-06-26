interface ScanResultPopupProps {
  letterId: string;
  count: number;
  lastLocation?: string;
  mailedAt?: string;
  onClose: () => void;
}

// A small popup that surfaces a letter's USPS IV-MTR tracking state after a
// scan. It floats on top of the page and doesn't affect any of the page's
// existing scan states/colors.
export function ScanResultPopup({
  letterId,
  count,
  lastLocation,
  mailedAt,
  onClose,
}: ScanResultPopupProps) {
  const tracked = count > 0;
  const mailedOn = mailedAt
    ? new Date(mailedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <div
        className={`rounded-lg shadow-lg bg-gray-800 border-l-4 px-4 py-3 flex items-start gap-3 ${
          tracked ? "border-teal-400" : "border-amber-400"
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="font-mono font-bold text-white truncate">
            {letterId}
          </div>
          {tracked ? (
            <>
              <div className="text-teal-300 text-sm font-semibold">
                ✓ {count} USPS scan{count === 1 ? "" : "s"}
              </div>
              {lastLocation && (
                <div className="text-white/60 text-xs truncate">
                  last seen: {lastLocation}
                </div>
              )}
            </>
          ) : (
            <div className="text-amber-300 text-sm font-semibold">
              ⚠️ No USPS tracking yet
            </div>
          )}
          {mailedOn && (
            <div className="text-white/50 text-xs mt-0.5">
              marked mailed: {mailedOn}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white text-xl leading-none flex-shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

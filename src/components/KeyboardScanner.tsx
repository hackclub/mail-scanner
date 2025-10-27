import { useEffect, useRef } from "react";
// @ts-expect-error - No type declarations available for this package
import KeyboardBarcodeScanner from "@point-of-sale/keyboard-barcode-scanner";

interface KeyboardScannerProps {
  enabled: boolean;
  onResult: (text: string) => void;
}

export function KeyboardScanner({ enabled, onResult }: KeyboardScannerProps) {
  console.log("KeyboardScanner component rendered", { enabled });
  const scannerRef = useRef<any>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (!enabled) {
      console.log("Keyboard scanner effect: skipped", { enabled });
      return;
    }

    if (scannerRef.current) {
      console.log("Keyboard scanner already exists, skipping initialization");
      return;
    }

    console.log("Initializing keyboard scanner...");

    // Patch the scanner to ignore Clear/NumLock keys that interfere with barcode detection
    const scannerKeydownHandler = (e: KeyboardEvent) => {
      // Filter out Clear/NumLock keys that the Netum scanner sends
      if (e.key === "Clear" && e.code === "NumLock") {
        // console.log("Ignoring Clear/NumLock key from scanner");
        e.stopPropagation();
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("keydown", scannerKeydownHandler, {
      capture: true,
    });

    const scannerOptions = {
      guessSymbology: true,
    };

    const scanner = new KeyboardBarcodeScanner(scannerOptions);

    scanner.addEventListener("barcode", (event: any) => {
      console.log("Scanned:", event.value);
      onResultRef.current(event.value);
    });

    scanner
      .connect()
      .then(() => {
        console.log("Keyboard scanner connected successfully");
      })
      .catch((err: unknown) => {
        console.error("Failed to start keyboard scanner:", err);
      });

    scannerRef.current = scanner;

    return () => {
      console.log("Keyboard scanner cleanup running");
      document.removeEventListener("keydown", scannerKeydownHandler, {
        capture: true,
      });
      if (scannerRef.current) {
        scannerRef.current.disconnect();
        scannerRef.current = null;
      }
    };
  }, [enabled]);

  return null;
}

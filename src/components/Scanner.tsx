import { useEffect, useRef } from "react";
import BarcodeScanner from "@point-of-sale/webcam-barcode-scanner";

interface ScannerProps {
  enabled: boolean;
  onResult: (text: string) => void;
}

export function Scanner({ enabled, onResult }: ScannerProps) {
  const scannerRef = useRef<BarcodeScanner | null>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (!enabled) {
      console.log("Scanner effect: skipped", { enabled });
      return;
    }

    // If scanner already exists, don't create another
    if (scannerRef.current) {
      console.log("Scanner already exists, skipping initialization");
      return;
    }

    console.log("Initializing scanner...");
    const scanner = new BarcodeScanner({
      allowedSymbologies: ["qr-code"],
      beep: true,
      preview: {
        enabled: true,
        draggable: false,
        position: "top-left",
        size: 240,
        mirrored: true,
        padding: 16,
        radius: 8,
        zIndex: 1000,
        hud: {
          enabled: true,
          outline: true,
        },
      },
    });

    scanner.addEventListener("barcode", (event: { value: string }) => {
      console.log("Scanned:", event.value);
      onResultRef.current(event.value);
    });

    scanner
      .connect()
      .then(() => {
        console.log("Scanner connected successfully");
      })
      .catch((err: unknown) => {
        console.error("Failed to start scanner:", err);
      });

    scannerRef.current = scanner;

    return () => {
      console.log("Scanner cleanup running");
      if (scannerRef.current) {
        scannerRef.current.disconnect();
        scannerRef.current = null;
      }
    };
  }, [enabled]);

  return null;
}

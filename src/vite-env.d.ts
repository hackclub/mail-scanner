/// <reference types="vite/client" />

declare module '@point-of-sale/webcam-barcode-scanner' {
  interface BarcodeScannerOptions {
    beep?: boolean;
    allowedSymbologies?: string[];
    useFallback?: boolean;
    useWorker?: boolean;
    debug?: boolean;
    scanInterval?: number;
    cooldownTime?: number;
    workerPath?: string | null;
    binaryPath?: string | null;
    resolution?: {
      width?: number;
      height?: number;
    };
    preview?: {
      enabled?: boolean;
      draggable?: boolean;
      mirrored?: boolean;
      zoom?: number;
      size?: number;
      position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
      padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
      radius?: number;
      zIndex?: number;
      menu?: {
        enabled?: boolean;
      };
      hud?: {
        enabled?: boolean;
        guide?: boolean;
        outline?: boolean;
      };
    };
  }

  export default class BarcodeScanner {
    constructor(options?: BarcodeScannerOptions);
    addEventListener(event: string, callback: (event: { value: string; symbology?: string }) => void): void;
    connect(): Promise<void>;
    disconnect(): void;
  }
}

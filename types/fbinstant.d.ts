export interface FBInstantSDK {
  initializeAsync(): Promise<void>;
  setLoadingProgress(percentage: number): void;
  startGameAsync(): Promise<void>;
}

declare global {
  interface Window {
    FBInstant?: FBInstantSDK;
    // Set by the inline bootstrap in pages/_document.tsx once the FB startup
    // handshake has completed (or failed open).
    __FB_INSTANT_READY__?: boolean;
  }
}

export {};

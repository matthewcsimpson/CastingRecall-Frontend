import "@testing-library/jest-dom";
import { vi } from "vitest";

// @testing-library/dom's waitFor only auto-advances fake timers when a global
// `jest` object is present (it calls jest.advanceTimersByTime internally).
// Vitest's fake timers are otherwise compatible, so expose a thin shim so
// waitFor works under vi.useFakeTimers() the way it did under CRA's Jest.
if (typeof globalThis.jest === "undefined") {
  globalThis.jest = {
    advanceTimersByTime: (ms) => vi.advanceTimersByTime(ms),
  };
}

// jsdom under Vitest does not always expose a working Web Storage API.
// Provide a minimal in-memory localStorage when one isn't available so the
// storage utilities and their tests behave as they did under CRA's jsdom.
if (typeof window.localStorage?.clear !== "function") {
  const store = new Map();
  const localStorageMock = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: localStorageMock,
  });
}

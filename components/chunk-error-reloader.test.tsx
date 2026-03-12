import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ChunkErrorReloader,
  RELOAD_GUARD_KEY,
  attemptRecoveryReload,
  isChunkErrorMessage,
  isNextStaticAssetTarget,
  stringifyError,
} from "@/components/chunk-error-reloader";

describe("chunk-error helpers", () => {
  it("stringifies different error payloads", () => {
    expect(stringifyError("plain")).toBe("plain");
    expect(stringifyError(new Error("boom"))).toContain("Error: boom");
    expect(stringifyError({ a: 1 })).toBe('{"a":1}');
  });

  it("detects supported chunk error patterns", () => {
    expect(isChunkErrorMessage("ChunkLoadError: Loading chunk 123 failed")).toBe(true);
    expect(isChunkErrorMessage("Failed to load /_next/static/chunks/abc.js")).toBe(true);
    expect(isChunkErrorMessage("ReferenceError: x is not defined")).toBe(false);
  });

  it("detects next static script/link targets", () => {
    const script = document.createElement("script");
    script.src = "https://example.com/_next/static/chunks/chunk.js";
    expect(isNextStaticAssetTarget(script)).toBe(true);

    const link = document.createElement("link");
    link.href = "https://example.com/_next/static/css/file.css";
    expect(isNextStaticAssetTarget(link)).toBe(true);

    const div = document.createElement("div");
    expect(isNextStaticAssetTarget(div)).toBe(false);
  });

  it("guards recovery reload to one attempt per URL", () => {
    const getItem = vi.fn();
    const setItem = vi.fn();
    const reload = vi.fn();

    getItem.mockReturnValueOnce(null);
    attemptRecoveryReload("https://example.com/dashboard", { getItem, setItem }, reload);

    expect(setItem).toHaveBeenCalledWith(RELOAD_GUARD_KEY, "https://example.com/dashboard");
    expect(reload).toHaveBeenCalledTimes(1);

    getItem.mockReturnValueOnce("https://example.com/dashboard");
    attemptRecoveryReload("https://example.com/dashboard", { getItem, setItem }, reload);

    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe("ChunkErrorReloader integration", () => {
  it("handles chunk errors from window events", () => {
    sessionStorage.setItem(RELOAD_GUARD_KEY, window.location.href);
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    render(<ChunkErrorReloader />);

    window.dispatchEvent(
      new ErrorEvent("error", {
        message: "ChunkLoadError: Loading chunk failed",
        error: new Error("loading chunk failed"),
      }),
    );

    expect(getItemSpy).toHaveBeenCalledWith(RELOAD_GUARD_KEY);
  });
});

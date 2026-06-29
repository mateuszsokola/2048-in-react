import { renderHook, act } from "@testing-library/react";
import useFacebookInstant from "@/hooks/use-facebook-instant";

// The hook observes the handshake driven by the _document bootstrap script;
// it does not call the SDK itself. These tests cover the three observable paths.
describe("useFacebookInstant", () => {
  afterEach(() => {
    delete window.FBInstant;
    delete window.__FB_INSTANT_READY__;
  });

  it("is ready immediately when no SDK is present (local dev)", () => {
    const { result } = renderHook(() => useFacebookInstant());
    expect(result.current).toBe(true);
  });

  it("is ready immediately if the bootstrap already completed before mount", () => {
    window.FBInstant = {} as NonNullable<typeof window.FBInstant>;
    window.__FB_INSTANT_READY__ = true;

    const { result } = renderHook(() => useFacebookInstant());

    expect(result.current).toBe(true);
  });

  it("stays not-ready until the fb-instant-ready event fires", () => {
    window.FBInstant = {} as NonNullable<typeof window.FBInstant>;

    const { result } = renderHook(() => useFacebookInstant());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("fb-instant-ready"));
    });

    expect(result.current).toBe(true);
  });
});

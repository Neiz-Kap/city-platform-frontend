import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1200;

function createMediaQueryHook(maxWidth: number) {
  const mediaQuery = `(max-width: ${maxWidth - 1}px)`;

  return function useMediaQueryMatch() {
    return useSyncExternalStore(
      (onStoreChange) => {
        const mediaQueryList = window.matchMedia(mediaQuery);
        mediaQueryList.addEventListener("change", onStoreChange);

        return () => mediaQueryList.removeEventListener("change", onStoreChange);
      },
      () => window.matchMedia(mediaQuery).matches,
      () => false,
    );
  };
}

export const useIsMobile = createMediaQueryHook(MOBILE_BREAKPOINT);

export const useIsTablet = createMediaQueryHook(TABLET_BREAKPOINT);

import React, { createContext, useContext, useRef } from "react";
import { Animated, Platform } from "react-native";

const HeaderScrollContext = createContext(null);

// Drives Layout's collapsible top nav: scrolling down slides the header up
// and out of view, scrolling back up (even slightly, via Animated.diffClamp)
// brings it right back. Lives in its own context because the ScrollView that
// generates the scroll events (inside a screen like HomeScreen) and the
// header that animates in response (in Layout, a parent several components
// up) aren't in a direct parent-child relationship.
export function HeaderScrollProvider({ headerHeight, children }) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const clampedScrollY = Animated.diffClamp(scrollY, 0, headerHeight);
  const translateY = clampedScrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });

  // Native driver isn't supported on react-native-web.
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: Platform.OS !== "web" },
  );

  return (
    <HeaderScrollContext.Provider value={{ onScroll, translateY, headerHeight }}>
      {children}
    </HeaderScrollContext.Provider>
  );
}

// A screen rendered under Layout's chrome calls this and spreads
// `scrollProps` onto its main ScrollView (must be an Animated.ScrollView) to
// link its scroll position to the top nav's show/hide animation.
export function useHeaderScroll() {
  const ctx = useContext(HeaderScrollContext);
  if (!ctx) {
    return { onScroll: undefined, translateY: 0, headerHeight: 0, scrollProps: {} };
  }
  return { ...ctx, scrollProps: { onScroll: ctx.onScroll, scrollEventThrottle: 16 } };
}

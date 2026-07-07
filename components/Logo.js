import React from "react";
import Svg, { Rect, Path } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

export default function Logo({ width = 40, height = 40, style }) {
  const { theme } = useTheme();
  const isDark = theme.dark || theme.mode === "dark";
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 80 80"
      fill="none"
      style={style}
    >
      <Rect
        width="80"
        height="80"
        rx="22"
        fill={isDark ? "#FFFFFF" : "#0A0A0A"}
      />
      <Path
        d="M14 62 L19 32 L30 52 L40 14 L50 52 L61 32"
        stroke={isDark ? "#0A0A0A" : "#FFFFFF"}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

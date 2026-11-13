"use client";

import { useEffect } from "react";

// Sections that used to live on the home page. Shared cards and old links point at these anchors.
const moved: Record<string, string> = {
  "#oracle": "/lab#oracle",
  "#replay": "/lab#replay",
};

export function MovedAnchors() {
  useEffect(() => {
    const to = moved[window.location.hash];
    if (to) window.location.replace(to);
  }, []);
  return null;
}

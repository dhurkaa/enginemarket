"use client";

import { useEffect } from "react";

/**
 * The taste kit's scripts (nav sheet, hover and press layer, hero entrance, moments) are plain ES
 * modules in /public/assets. They load once React has hydrated, so their DOM changes never clash
 * with hydration. Pages link with plain <a>, so every page load starts them fresh.
 */
const SCRIPTS = ["/assets/system.js", "/assets/motion/motion.js", "/assets/layout/layout.js"];

export function KitScripts() {
  useEffect(() => {
    for (const src of SCRIPTS) {
      if (document.querySelector(`script[data-kit="${src}"]`)) continue;
      const s = document.createElement("script");
      s.type = "module";
      s.src = src;
      s.dataset.kit = src;
      document.body.appendChild(s);
    }
  }, []);
  return null;
}

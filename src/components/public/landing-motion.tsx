"use client";

import { useEffect } from "react";

export function LandingMotion(): null {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.animate(
          [{ opacity: 0.45, transform: "translateY(18px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 620, easing: "cubic-bezier(.22,1,.36,1)" }
        );
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    document.querySelectorAll(".landing-page > section:not(:first-of-type)").forEach((section) => observer.observe(section));
    const stop = () => {
      if (preference.matches) {
        observer.disconnect();
        document.querySelectorAll(".landing-page > section").forEach((section) => section.getAnimations().forEach((animation) => animation.cancel()));
      }
    };
    preference.addEventListener("change", stop);
    return () => { observer.disconnect(); preference.removeEventListener("change", stop); };
  }, []);
  return null;
}

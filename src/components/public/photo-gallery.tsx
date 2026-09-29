"use client";

import Image from "next/image";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useEffect, useId, useRef, useState } from "react";

export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  featured?: boolean;
};

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const previousButton = useRef<HTMLButtonElement | null>(null);
  const nextButton = useRef<HTMLButtonElement | null>(null);
  const rail = useRef<HTMLDivElement | null>(null);
  const captionId = useId();
  const drag = useRef<{ pointerId: number; startX: number; scrollLeft: number; moved: boolean } | null>(null);
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  const close = (): void => {
    setActiveIndex(null);
    window.setTimeout(() => opener.current?.focus(), 0);
  };

  const move = (direction: -1 | 1): void => {
    setActiveIndex((current) => current === null ? null : (current + direction + photos.length) % photos.length);
  };

  const scrollRail = (direction: -1 | 1): void => {
    const element = rail.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({ left: direction * element.clientWidth * 0.76, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft, moved: false };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.current.startX;
    if (Math.abs(distance) > 6 && !drag.current.moved) {
      drag.current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    event.currentTarget.scrollLeft = drag.current.scrollLeft - distance;
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const moved = drag.current.moved;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    if (moved) setDragging(false);
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "Tab") {
        const controls = [closeButton.current, previousButton.current, nextButton.current].filter((control): control is HTMLButtonElement => control !== null);
        const currentIndex = controls.indexOf(document.activeElement as HTMLButtonElement);
        const nextIndex = event.shiftKey ? (currentIndex <= 0 ? controls.length - 1 : currentIndex - 1) : (currentIndex === controls.length - 1 ? 0 : currentIndex + 1);
        event.preventDefault();
        controls[nextIndex]?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex]);

  return <>
    <div className="kp-public-gallery-toolbar">
      <p><span>{String(photos.length).padStart(2, "0")}</span> dokumentasi · geser untuk melihat</p>
      <div><button type="button" aria-label="Geser galeri ke kiri" onClick={() => scrollRail(-1)}><IconChevronLeft size={21} aria-hidden="true" /></button><button type="button" aria-label="Geser galeri ke kanan" onClick={() => scrollRail(1)}><IconChevronRight size={21} aria-hidden="true" /></button></div>
    </div>
    <div ref={rail} className={`kp-public-gallery${dragging ? " is-dragging" : ""}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={finishDrag} onPointerCancel={finishDrag}>
      {photos.map((photo, index) => <figure className={`kp-public-photo${photo.featured ? " kp-public-photo--feature" : ""}`} key={photo.src}>
        <button className="kp-public-photo__trigger" style={{ position: "absolute" }} aria-label={`Buka foto ${index + 1}: ${photo.caption}`} onDragStart={(event) => event.preventDefault()} onPointerUp={(event) => { if (drag.current && !drag.current.moved) { opener.current = event.currentTarget; setActiveIndex(index); } }} onClick={(event) => { if (event.detail === 0) { opener.current = event.currentTarget; setActiveIndex(index); } }} type="button">
          <Image alt={photo.alt} fill loading={index < 6 ? "eager" : "lazy"} sizes="(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 25vw" src={photo.src} />
        </button>
        <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{photo.caption}</figcaption>
      </figure>)}
    </div>

    {activePhoto && <div className="kp-lightbox" role="dialog" aria-modal="true" aria-describedby={captionId} aria-label={`Foto ${activeIndex! + 1} dari ${photos.length}: ${activePhoto.caption}`} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="kp-lightbox__panel">
        <div className="kp-lightbox__image"><Image alt={activePhoto.alt} fill priority sizes="94vw" src={activePhoto.src} /></div>
        <div className="kp-lightbox__caption" id={captionId} aria-live="polite"><span>{String(activeIndex! + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span><strong>{activePhoto.caption}</strong></div>
        <button ref={closeButton} className="kp-lightbox__control kp-lightbox__close" type="button" aria-label="Tutup foto" onClick={close}><IconX size={22} aria-hidden="true" /></button>
        <button ref={previousButton} className="kp-lightbox__control kp-lightbox__previous" type="button" aria-label="Foto sebelumnya" onClick={() => move(-1)}><IconChevronLeft size={25} aria-hidden="true" /></button>
        <button ref={nextButton} className="kp-lightbox__control kp-lightbox__next" type="button" aria-label="Foto berikutnya" onClick={() => move(1)}><IconChevronRight size={25} aria-hidden="true" /></button>
      </div>
    </div>}
  </>;
}

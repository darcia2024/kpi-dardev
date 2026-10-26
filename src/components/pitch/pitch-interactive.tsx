"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export type PitchSection = { id: string; label: string };

export function PitchNav({ sections }: { sections: PitchSection[] }): React.JSX.Element {
  const bar = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState("");
  useEffect(() => {
    function update(): void {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      if (bar.current) bar.current.style.width = `${max > 0 ? (root.scrollTop / max) * 100 : 0}%`;
      let active = "";
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top < 140) active = section.id;
      }
      setCurrent(active);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [sections]);
  return <>
    <nav className="pitch-nav" aria-label="Bagian">
      {sections.map((section) => <a className={current === section.id ? "on" : undefined} href={`#${section.id}`} key={section.id}>{section.label}</a>)}
    </nav>
    <div className="pitch-progress" ref={bar} />
  </>;
}

export type PitchModule = { key: string; label: string; url: string; image: string; title: string; lead: string; ticks: string[] };

export function PitchModuleTabs({ modules }: { modules: PitchModule[] }): React.JSX.Element {
  const [index, setIndex] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = modules[index];
  function move(event: KeyboardEvent<HTMLButtonElement>, from: number): void {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next = (from + (event.key === "ArrowRight" ? 1 : -1) + modules.length) % modules.length;
    setIndex(next);
    buttons.current[next]?.focus();
  }
  return <>
    <div className="tabs" role="tablist" aria-label="Modul portal">
      {modules.map((module, position) => <button aria-controls="pitch-panel" aria-selected={position === index} className="tab" id={`pitch-tab-${module.key}`} key={module.key} onClick={() => setIndex(position)} onKeyDown={(event) => move(event, position)} ref={(element) => { buttons.current[position] = element; }} role="tab" tabIndex={position === index ? 0 : -1} type="button">{module.label}</button>)}
    </div>
    <div aria-labelledby={`pitch-tab-${selected.key}`} className="panel" id="pitch-panel" role="tabpanel">
      <div className="frame"><div className="frame-bar"><i /><i /><i /><span>{selected.url}</span></div><Image alt={`Layar ${selected.label} di portal pengurus`} height={900} sizes="(min-width: 980px) 60vw, 100vw" src={selected.image} width={1440} /></div>
      <div className="panel-copy">
        <span className="eyebrow">{selected.label}</span>
        <h3>{selected.title}</h3>
        <p className="lead">{selected.lead}</p>
        <ul className="ticks">{selected.ticks.map((tick) => <li key={tick}>{tick}</li>)}</ul>
      </div>
    </div>
  </>;
}

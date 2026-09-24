"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { nav, photos, site } from "@/content/site";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("top");
  const toggleRef = useRef<HTMLButtonElement>(null);

  // compact bar after the first bit of scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // highlight the section currently in view
  useEffect(() => {
    const sections = nav
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // mobile menu: lock scroll, Escape to close, move focus in and back out
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // keep keyboard focus inside header + menu while open
    const behind = [...document.querySelectorAll<HTMLElement>("#main, footer, [data-behind-menu]")];
    behind.forEach((el) => (el.inert = true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      behind.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding] duration-500 ${
          solid
            ? "bg-navy/90 py-2 shadow-[0_8px_30px_-18px_rgb(0_0_0/0.6)] backdrop-blur-md"
            : "bg-transparent py-4 lg:py-6"
        }`}
      >
        <nav
          aria-label="ניווט ראשי"
          className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8"
        >
          <a
            href="#top"
            className="group flex items-center gap-3 text-cream"
            onClick={() => setOpen(false)}
          >
            <Image
              src={photos.logo.src}
              alt=""
              width={48}
              height={48}
              loading="eager"
              className={`rounded-full transition-all duration-500 ${solid ? "h-9 w-9" : "h-11 w-11"}`}
            />
            <span className="font-display text-2xl font-bold leading-none">
              {site.nameHe}
              <span className="sr-only"> — לעמוד הבית</span>
            </span>
          </a>

          {/* desktop */}
          <ul role="list" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "location" : undefined}
                  className="relative flex min-h-11 items-center px-4 text-[1.0625rem] text-muted-dark transition-colors hover:text-cream aria-[current]:text-cream after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-turq after:transition-transform after:duration-500 hover:after:scale-x-100 aria-[current]:after:scale-x-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#location" className="btn btn-turq btn-sm hidden lg:inline-flex">
            נווטו אלינו
          </a>

          {/* mobile toggle */}
          <button
            ref={toggleRef}
            type="button"
            className="relative -me-2 flex h-12 w-12 items-center justify-center text-cream lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "סגירת התפריט" : "פתיחת התפריט"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-4 w-7">
              <span
                className={`absolute inset-x-0 top-0 h-0.5 rounded bg-current transition-transform duration-500 ease-[var(--ease-out-soft)] ${open ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`absolute end-0 top-[7px] h-0.5 w-5 rounded bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-0.5 rounded bg-current transition-transform duration-500 ease-[var(--ease-out-soft)] ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </nav>
        {/* reading progress — fills as the page scrolls */}
        <span
          aria-hidden="true"
          data-progress
          className={`absolute inset-x-0 bottom-0 h-0.5 origin-right bg-turq transition-opacity duration-500 ${
            solid ? "opacity-100" : "opacity-0"
          }`}
        />
      </header>

      {/* mobile overlay — outside <header> so backdrop-filter doesn't trap it */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col bg-navy px-6 pb-10 pt-28 text-cream transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <ul role="list" className="flex flex-col">
          {nav.map((item, i) => (
            <li
              key={item.id}
              className={`border-b border-cream/15 transition-all duration-700 ease-[var(--ease-out-soft)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${80 + i * 55}ms` : "0ms" }}
            >
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                aria-current={active === item.id ? "location" : undefined}
                className="flex items-baseline justify-between py-4 font-display text-4xl font-bold aria-[current]:text-turq"
              >
                {item.label}
                <span className="font-sans text-sm font-normal text-faint-dark" aria-hidden="true">
                  0{i + 1}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-3">
          <a href="#location" onClick={() => setOpen(false)} className="btn btn-turq w-full">
            נווטו אלינו
          </a>
          <p className="text-center text-sm text-muted-dark">
            {site.nameEn} · {site.slogan}
          </p>
        </div>
      </div>
    </>
  );
}

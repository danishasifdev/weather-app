/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, Search, X } from "lucide-react";
import { searchLocations } from "../lib/weather";
import { LoadingDots, OrbitSpinner } from "./States";

const RECENT_KEY = "aether-recent-cities";

function readRecent() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(saved) ? saved.slice(0, 4) : [];
  } catch {
    return [];
  }
}

function flagFor(code) {
  if (!code || code.length !== 2) return "📍";

  try {
    return String.fromCodePoint(
      ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
    );
  } catch {
    return "📍";
  }
}

function Highlight({ text, term }) {
  const i = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;

  if (i < 0) return text;

  return (
    <>
      {text.slice(0, i)}
      <span className="font-semibold text-brand-text">
        {text.slice(i, i + term.length)}
      </span>
      {text.slice(i + term.length)}
    </>
  );
}

export default function SearchBox({ query, onQueryChange, onSelect }) {
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState(readRecent);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [active, setActive] = useState(0);
  const [retry, setRetry] = useState(0);
  const [dropdownRect, setDropdownRect] = useState(null);

  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const skipRef = useRef(false);

  const term = query.trim();
  const showingResults = term.length >= 2;
  const list = showingResults ? results : recent;
  const showDropdown = open && (showingResults || recent.length > 0);

  // Position the portal directly below the search input.
  useEffect(() => {
    if (!showDropdown) {
      setDropdownRect(null);
      return undefined;
    }

    function updatePosition() {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();

      setDropdownRect({
        top: rect.bottom + 10,
        left: rect.left,
        width: rect.width,
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showDropdown]);

  // Close dropdown when clicking outside both the input and portal.
  useEffect(() => {
    function onPointerDown(e) {
      const target = e.target;

      if (
        wrapperRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  // Search locations.
  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return undefined;
    }

    const searchTerm = query.trim();

    if (searchTerm.length < 2) {
      setResults([]);
      setSearchError("");
      setSearching(false);
      return undefined;
    }

    setOpen(true);
    setSearching(true);
    setActive(0);
    setSearchError("");

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const found = await searchLocations(searchTerm, controller.signal);

        setResults(found);
        setSearchError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setResults([]);
          setSearchError(err.message || "Search is unavailable right now.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, retry]);

  function saveRecent(result) {
    const next = [
      result,
      ...recent.filter(
        (r) =>
          r.id !== result.id &&
          !(r.latitude === result.latitude && r.longitude === result.longitude),
      ),
    ].slice(0, 4);

    setRecent(next);

    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // Storage is optional.
    }
  }

  function select(result) {
    skipRef.current = true;

    onQueryChange(result.name);
    setResults([]);
    setOpen(false);
    setSearchError("");

    saveRecent(result);
    onSelect(result);

    inputRef.current?.blur();
  }

  function clearRecent() {
    setRecent([]);

    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      // Storage is optional.
    }
  }

  function onKeyDown(e) {
    if (!showDropdown || !list.length) {
      if (e.key === "Escape") setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % list.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + list.length) % list.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(list[active] || list[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <>
      <div ref={wrapperRef} className="relative z-10 w-full min-w-0">
        <div className="flex w-full min-w-0 items-center gap-2.5 rounded-2xl border border-brand-navy/5 bg-white py-2 pl-[18px] pr-2 transition-all focus-within:border-brand-text/55 focus-within:bg-white focus-within:shadow-[0_10px_26px_rgba(28,43,69,0.08)]">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search any location ..."
            aria-label="Search for a city"
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-brand-navy outline-none placeholder:text-brand-muted"
          />

          {searching && (
            <OrbitSpinner className="h-[15px] w-[15px] flex-none text-brand-text" />
          )}

          {!searching && query && (
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                setResults([]);
                setOpen(true);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid h-5 w-5 flex-none place-items-center rounded-full text-brand-muted transition-colors hover:bg-[#e9eef0] hover:text-brand-navy"
            >
              <X size={13} strokeWidth={2} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              inputRef.current?.focus();
              setOpen(true);
            }}
            aria-label="Search"
            className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[11px] bg-brand-deep text-white shadow-[0_6px_16px_rgba(193,79,0,0.28)] transition-transform hover:scale-105"
          >
            <Search
              size={17}
              strokeWidth={1.6}
              className="shrink-0 text-white"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {showDropdown &&
        dropdownRect &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
            }}
            className="z-[99999] overflow-hidden rounded-[18px] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(28,43,69,0.18)] animate-slide-down"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#edf0f2] px-[15px] py-[11px]">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">
                {showingResults ? `Results for “${term}”` : "Recent searches"}
              </p>

              {showingResults ? (
                <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-[#626A78]">
                  {searching ? (
                    <>
                      Searching <LoadingDots />
                    </>
                  ) : (
                    `${results.length} found`
                  )}
                </span>
              ) : (
                recent.length > 0 && (
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="shrink-0 text-[10px] text-[#626A78] transition-colors hover:text-slate-700"
                  >
                    Clear
                  </button>
                )
              )}
            </div>

            {searchError ? (
              <div className="flex items-center gap-3 px-4 py-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500">
                  !
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-rose-600">
                    {searchError}
                  </p>

                  <button
                    type="button"
                    onClick={() => setRetry((n) => n + 1)}
                    className="mt-1 text-[11px] font-medium text-[#2d8f9b] transition-colors hover:text-[#1a2841]"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : searching && showingResults ? (
              <div className="space-y-1.5 p-2.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="relative h-11 w-full overflow-hidden rounded-xl bg-[#e9edf0] after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.85),transparent)] after:content-[''] after:[animation-delay:var(--shimmer-delay)]"
                    style={{ "--shimmer-delay": `${i * 140}ms` }}
                  />
                ))}
              </div>
            ) : list.length ? (
              <ul
                className="max-h-72 overflow-y-auto overscroll-contain p-1.5"
                role="listbox"
              >
                {list.map((r, i) => (
                  <li key={`${r.id || "r"}-${r.latitude}-${r.longitude}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => select(r)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                        i === active
                          ? "bg-brand-orange/10"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg">
                        {flagFor(r.countryCode)}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-slate-800">
                          <Highlight
                            text={r.name}
                            term={showingResults ? term : ""}
                          />
                        </span>

                        <span className="block truncate text-[11px] text-[#626A78]">
                          {[r.admin1, r.country].filter(Boolean).join(", ") ||
                            "City"}
                        </span>
                      </span>

                      {!showingResults && (
                        <Clock
                          size={14}
                          strokeWidth={2}
                          className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-[#2d8f9b]"
                          aria-hidden="true"
                        />
                      )}

                      {showingResults && r.countryCode && (
                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-slate-500">
                          {r.countryCode}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-700">No cities found</p>
                <p className="mt-1 text-[11px] text-[#626A78]">
                  Try a shorter name or check the spelling.
                </p>
              </div>
            )}

            <div className="hidden items-center justify-between border-t border-slate-100 px-4 py-2 text-[10px] text-[#626A78] sm:flex">
              <span>↑↓ navigate · ↵ select · esc close</span>
              <span className="text-[8px]">Powered by Open-Meteo</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

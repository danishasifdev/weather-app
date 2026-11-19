/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, LocateFixed, RefreshCw, User } from "lucide-react";
import Dashboard from "./components/Dashboard";
import SearchBox from "./components/SearchBox";
import {
  DashboardSkeleton,
  ErrorBanner,
  ErrorState,
  LoadingDots,
  NoticeBanner,
  OrbitSpinner,
} from "./components/States";
import WeatherBackdrop from "./components/WeatherBackdrop";
import {
  DEFAULT_LOCATION,
  fetchForecast,
  locationLabel,
  timeUntil,
  weatherInfo,
} from "./lib/weather";

const THEMES = {
  "clear-day":
    "radial-gradient(700px 420px at 82% 4%, rgba(255,224,208,.55), transparent 65%), radial-gradient(900px 380px at 4% 96%, rgba(180,231,225,.5), transparent 70%), linear-gradient(145deg,#f7fafa 0%,#eef4f5 55%,#e9f1f2 100%)",
  "clear-night":
    "radial-gradient(700px 420px at 82% 4%, rgba(214,234,112,.28), transparent 65%), radial-gradient(900px 380px at 4% 96%, rgba(85,181,229,.2), transparent 70%), linear-gradient(145deg,#eef1f6 0%,#e6ecf2 55%,#e9eef3 100%)",
  partly:
    "radial-gradient(700px 420px at 82% 4%, rgba(255,224,208,.55), transparent 65%), radial-gradient(900px 380px at 4% 96%, rgba(180,231,225,.5), transparent 70%), linear-gradient(145deg,#f7fafa 0%,#eef4f5 55%,#e9f1f2 100%)",
  cloudy:
    "radial-gradient(800px 400px at 50% 0%, rgba(180,231,225,.28), transparent 70%), linear-gradient(145deg,#f6f8f9 0%,#edf1f3 55%,#e9eef0 100%)",
  fog: "radial-gradient(800px 400px at 50% 20%, rgba(255,255,255,.7), transparent 70%), linear-gradient(145deg,#f8fafa 0%,#eef2f3 55%,#e9edef 100%)",
  rain: "radial-gradient(700px 420px at 16% 0%, rgba(85,181,229,.32), transparent 65%), radial-gradient(900px 380px at 50% 100%, rgba(180,231,225,.4), transparent 70%), linear-gradient(145deg,#f2f7f9 0%,#e7f0f3 55%,#e3edf0 100%)",
  snow: "radial-gradient(700px 420px at 16% 0%, rgba(255,255,255,.75), transparent 65%), radial-gradient(900px 380px at 50% 100%, rgba(180,231,225,.32), transparent 70%), linear-gradient(145deg,#fbfdfd 0%,#eef4f6 55%,#e8f0f3 100%)",
  storm:
    "radial-gradient(800px 400px at 50% 0%, rgba(133,138,152,.2), transparent 65%), linear-gradient(145deg,#f0f2f5 0%,#e6ebef 55%,#e2e8ec 100%)",
};

function themeFor(category, isDay) {
  if (category === "clear")
    return isDay ? THEMES["clear-day"] : THEMES["clear-night"];
  if (category === "partly")
    return isDay ? THEMES.partly : THEMES["clear-night"];
  return THEMES[category] || THEMES["clear-day"];
}

function IconButton({ label, onClick, children, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`relative grid h-9 w-9 place-items-center rounded-full text-[#62708a] transition-all hover:-translate-y-px hover:bg-brand-orange/10 hover:text-brand-text max-[520px]:h-8 max-[520px]:w-8 ${active ? "bg-brand-orange/10 text-brand-text" : ""}`}
    >
      {active && (
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-brand-orange/20" />
      )}
      {children}
    </button>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [place, setPlace] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unit, setUnit] = useState("C");
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState(null);
  const [notice, setNotice] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [, setTick] = useState(0);

  const abortRef = useRef(null);
  const hasDataRef = useRef(false);
  const notificationRef = useRef(null);

  const loadWeather = useCallback(async (location) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!hasDataRef.current) setStatus("loading");
    else setRefreshing(true);
    setError(null);

    try {
      const forecast = await fetchForecast({
        latitude: location.latitude,
        longitude: location.longitude,
        signal: controller.signal,
      });
      const label = location.label || locationLabel(location);
      setData(forecast);
      setPlace(label);
      setCoords({
        latitude: location.latitude,
        longitude: location.longitude,
        label,
      });
      setStatus("ready");
      setUpdatedAt(new Date());
      hasDataRef.current = true;
      setNotice(null);
    } catch (err) {
      if (err.name === "AbortError") return;
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setError({
        title: offline ? "You appear to be offline" : "Unable to load weather",
        message: offline
          ? "Check your internet connection, then try again."
          : err.message || "The weather service could not be reached.",
      });
      if (!hasDataRef.current) setStatus("error");
    } finally {
      if (abortRef.current === controller) setRefreshing(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setNotice({
        message: "Your browser doesn't support location detection.",
        action: null,
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadWeather({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Your location",
        });
      },
      () => {
        setNotice({
          message: "Location access was denied. Showing your last location.",
          action: null,
        });
      },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  }, [loadWeather]);

  // Initial load: browser location first, with a graceful city fallback.
  useEffect(() => {
    let cancelled = false;
    const fallback = () => {
      if (cancelled) return;
      setNotice({
        message: "Location unavailable — showing Islamabad by default.",
        action: "location",
      });
      loadWeather({
        ...DEFAULT_LOCATION,
        label: locationLabel(DEFAULT_LOCATION),
      });
    };

    if (!navigator.geolocation) {
      fallback();
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        loadWeather({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Your location",
        });
      },
      fallback,
      { timeout: 7000, maximumAge: 10 * 60 * 1000 },
    );

    return () => {
      cancelled = true;
    };
  }, [loadWeather]);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const onPointerDown = (event) => {
      if (!notificationRef.current?.contains(event.target))
        setNotificationsOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [notificationsOpen]);

  const info = weatherInfo(data?.current?.weather_code ?? 0);
  const isDay = data?.current?.is_day !== 0;
  const theme = themeFor(info.category, isDay);
  const [layers, setLayers] = useState([{ id: 0, value: theme }]);

  useEffect(() => {
    setLayers((prev) =>
      prev[prev.length - 1].value === theme
        ? prev
        : [...prev.slice(-1), { id: Date.now(), value: theme }],
    );
  }, [theme]);

  function selectLocation(result) {
    loadWeather({ ...result, label: locationLabel(result) });
  }

  function refresh() {
    if (coords) loadWeather(coords);
    else requestLocation();
  }

  function retry() {
    if (coords) loadWeather(coords);
    else requestLocation();
  }

  function focusSearch() {
    document.querySelector('input[aria-label="Search for a city"]')?.focus();
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Crossfading atmosphere + art-directed geometry, always behind the content. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {layers.map((layer, i) => (
          <div
            key={layer.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              background: layer.value,
              opacity: i === layers.length - 1 ? 1 : 0,
            }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 opacity-[0.26] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_30%,transparent_92%)] [mask-image:linear-gradient(to_bottom,transparent,#000_30%,transparent_92%)]">
          <WeatherBackdrop
            key={`${info.category}-${isDay}`}
            category={info.category}
            isDay={isDay}
          />
        </div>
        <div className="pointer-events-none absolute -left-40 top-[16%] h-[520px] w-[340px] rotate-[-18deg] rounded-[64px] bg-brand-mint/40" />
        <div className="pointer-events-none absolute rounded-full border border-brand-sky/30 -right-48 -top-28 h-[520px] w-[520px]" />
        <div className="pointer-events-none absolute rounded-full border border-brand-sky/30 -bottom-[230px] left-[44%] h-[370px] w-[370px] border-brand-orange/20" />
        <div className="pointer-events-none absolute -bottom-[120px] right-[18%] h-[280px] w-[280px] rounded-full blur-[2px] bg-[radial-gradient(circle,rgba(214,234,112,0.34),transparent_70%)]" />
        <div className="pointer-events-none absolute -top-[100px] left-[12%] h-[220px] w-[220px] rounded-full blur-[2px] bg-[radial-gradient(circle,rgba(255,224,208,0.6),transparent_70%)]" />
      </div>

      {refreshing && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-0.5 overflow-hidden bg-[#D6EA70]/30">
          <div className="animate-progress-sweep h-full w-1/3 bg-gradient-to-r from-transparent via-[#FF8129] to-transparent" />
        </div>
      )}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-4 p-4 sm:grid-cols-[1fr_auto] sm:gap-x-6 sm:px-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,440px)_minmax(0,1fr)] xl:gap-6 xl:px-8 xl:py-6 animate-fade-in">
          {/* Greeting */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              className="grid h-[54px] w-[54px] flex-none place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#FF9B55] to-brand-orange shadow-[0_10px_24px_rgba(255,129,41,0.28)] max-[520px]:h-[46px] max-[520px]:w-[46px]"
              aria-hidden="true"
            >
              <User
                strokeWidth={1.9}
                className="h-[30px] w-[30px] text-white max-[520px]:h-[26px] max-[520px]:w-[26px]"
              />
            </div>

            <div>
              <h1 className="text-[22px] font-bold leading-[1.1] tracking-[-0.04em] max-[520px]:text-lg">
                Hello!
              </h1>
            </div>
          </div>

          {/* Search */}
          <div
            className="w-full col-span-2 row-start-2 xl:col-span-1 xl:col-start-2 xl:row-start-1"
            style={{ animationDelay: "60ms" }}
          >
            <SearchBox
              query={query}
              onQueryChange={setQuery}
              onSelect={selectLocation}
            />
          </div>

          {/* Actions */}
          <div
            className="relative flex items-center justify-end gap-2.5 col-start-2 row-start-1 xl:col-start-3 xl:row-start-1"
            style={{ animationDelay: "100ms" }}
          >
            {refreshing && data && (
              <span className="absolute right-0 top-[calc(100%+8px)] z-30 flex animate-scale-in items-center gap-1.5 whitespace-nowrap rounded-full border border-white bg-white/95 px-2.5 py-1 text-10px font-semibold text-brand-ink shadow-card">
                <OrbitSpinner className="h-3 w-3 text-brand-orange" />
                Updating
                <LoadingDots />
              </span>
            )}
            <div className="flex items-center gap-1.5 rounded-full border border-white bg-white/80 p-1.5 shadow-[0_8px_22px_rgba(28,43,69,0.07)] max-[520px]:gap-0.5 max-[520px]:p-0.5">
              <IconButton label="Use my location" onClick={requestLocation}>
                <LocateFixed size={17} strokeWidth={1.7} />
              </IconButton>

              <div
                className="flex items-center gap-0.5 rounded-full bg-[#f1f3f5] p-0.5"
                role="group"
                aria-label="Temperature unit"
              >
                {["C", "F"].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`h-[30px] w-8 rounded-full text-11px font-bold text-brand-muted transition-all max-[520px]:w-7 ${
                      unit === u
                        ? "bg-brand-navy text-white shadow-[0_4px_10px_rgba(28,43,69,0.22)]"
                        : ""
                    }`}
                    aria-label={`Switch to °${u}`}
                  >
                    °{u}
                  </button>
                ))}
              </div>

              <IconButton
                label="Refresh weather"
                onClick={refresh}
                active={refreshing}
              >
                <RefreshCw
                  size={17}
                  strokeWidth={1.7}
                  className={refreshing ? "animate-spin" : ""}
                />
              </IconButton>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                className="relative grid h-11 w-11 place-items-center rounded-full border border-brand-navy/10 bg-white text-brand-navy shadow-[0_8px_22px_rgba(28,43,69,0.08)] transition-transform hover:-translate-y-0.5 max-[520px]:h-10 max-[520px]:w-10"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={18} strokeWidth={1.7} />
                <span className="absolute right-2.5 top-2 h-[7px] w-[7px] rounded-full border-2 border-white bg-brand-orange" />
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] z-50 flex w-[230px] flex-col gap-0.5 rounded-[14px] bg-white p-3.5 shadow-dropdown animate-slide-down"
                  role="status"
                >
                  <strong className="text-xs">You&apos;re all caught up</strong>
                  <span className="text-11px text-brand-muted">
                    No new weather alerts right now.
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 max-[350px]:p-2 px-8 pb-5 pt-2 max-[760px]:px-4 max-[760px]:pb-[18px] max-[760px]:pt-1.5">
          {status === "loading" && !data ? (
            <DashboardSkeleton />
          ) : status === "error" && !data ? (
            <ErrorState
              error={error}
              onRetry={retry}
              onUseLocation={requestLocation}
            />
          ) : (
            <>
              {(notice || error) && (
                <div className="mb-3.5 w-full">
                  {notice && (
                    <NoticeBanner
                      message={notice.message}
                      actionLabel={
                        notice.action === "location"
                          ? "Use my location"
                          : undefined
                      }
                      onAction={requestLocation}
                    />
                  )}
                  {error && (
                    <ErrorBanner
                      message={error.message}
                      onRetry={refresh}
                      onDismiss={() => setError(null)}
                    />
                  )}
                </div>
              )}
              <Dashboard
                data={data}
                place={place}
                unit={unit}
                utcOffsetSeconds={data.utcOffsetSeconds}
                onChangeLocation={focusSearch}
              />
            </>
          )}
        </main>

        <footer className="mx-auto w-full max-w-[1600px] px-8 pb-6 text-center text-11px text-brand-muted max-[760px]:px-4 max-[760px]:pb-5">
          WEATHER · Data from Open-Meteo
          {updatedAt && data ? ` · Updated ${timeUntil(updatedAt)}` : ""}
        </footer>
      </div>
    </div>
  );
}

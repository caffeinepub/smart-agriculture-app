import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AppSidebar from "./components/AppSidebar";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useAllZones } from "./hooks/useQueries";
import { useInitializeSeedData } from "./hooks/useQueries";
import AlertsPage from "./pages/AlertsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CropsPage from "./pages/CropsPage";
import DashboardPage from "./pages/DashboardPage";
import FieldZonesPage from "./pages/FieldZonesPage";
import IrrigationPage from "./pages/IrrigationPage";
import LoginPage from "./pages/LoginPage";
import SensorsPage from "./pages/SensorsPage";
import SettingsPage from "./pages/SettingsPage";

export type PageId =
  | "dashboard"
  | "fields"
  | "crops"
  | "irrigation"
  | "sensors"
  | "alerts"
  | "analytics"
  | "settings";

function AppInner() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard");
  const [guestMode, setGuestMode] = useState(false);
  const { data: zones, isLoading: zonesLoading } = useAllZones();
  const initSeed = useInitializeSeedData();
  const { actor, isFetching } = useActor();
  const { loginStatus, identity } = useInternetIdentity();

  // Consider authenticated if loginStatus is "success" OR if we have a valid non-anonymous identity.
  // This guards against a race where the useEffect in the hook resets loginStatus back to "idle"
  // after setAuthClient triggers a re-run, overwriting the "success" state.
  const hasValidIdentity = !!identity && !identity.getPrincipal().isAnonymous();
  const isAuthenticated = loginStatus === "success" || hasValidIdentity;
  const isInitializing = loginStatus === "initializing" && !hasValidIdentity;
  const showApp = isAuthenticated || guestMode;
  // Guest mode = not authenticated with Internet Identity
  const isGuestMode = !isAuthenticated;

  const { mutate: doInitSeed } = initSeed;
  // Initialize seed data on first load if no zones exist
  useEffect(() => {
    if (!isFetching && actor && !zonesLoading && zones && zones.length === 0) {
      doInitSeed();
    }
  }, [actor, isFetching, zones, zonesLoading, doInitSeed]);

  function handleGuestLogin() {
    setGuestMode(true);
  }

  // Show a stable splash while the auth client initializes to avoid flicker/blur
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-login-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center shadow-lg animate-pulse">
            <svg
              aria-hidden="true"
              role="presentation"
              className="w-8 h-8 text-lime-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-white/60 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Once II login succeeds, showApp becomes true automatically via loginStatus
  if (!showApp) {
    return <LoginPage onLogin={() => {}} onGuestLogin={handleGuestLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentPage} />;
      case "fields":
        return <FieldZonesPage isGuest={isGuestMode} />;
      case "crops":
        return <CropsPage isGuest={isGuestMode} />;
      case "irrigation":
        return <IrrigationPage isGuest={isGuestMode} />;
      case "sensors":
        return <SensorsPage isGuest={isGuestMode} />;
      case "alerts":
        return <AlertsPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {renderPage()}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}

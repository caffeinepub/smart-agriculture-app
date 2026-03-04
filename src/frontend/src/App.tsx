import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
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
  // Once the user has explicitly logged in (email/password form or guest), latch permanently
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  // initDone = auth client has fully initialized and we know if there's a prior session
  const [initDone, setInitDone] = useState(false);

  const { data: zones, isLoading: zonesLoading } = useAllZones();
  const initSeed = useInitializeSeedData();
  const { actor, isFetching } = useActor();
  const { loginStatus, identity } = useInternetIdentity();

  // The useInternetIdentity hook runs its init effect TWICE on mount:
  //   Pass 1: creates the AuthClient → setAuthClient() → "idle"
  //   Pass 2: checks isAuthenticated → sets identity if found → "idle"
  // We must wait for BOTH passes before declaring init complete.
  // Count "initializing → idle" transitions; mark done after 2nd.
  // Fallback timeout ensures we never get stuck on slow networks.
  const idleCount = useRef(0);
  const prevStatusRef = useRef<string>("");

  useEffect(() => {
    if (loginStatus === "idle" && prevStatusRef.current === "initializing") {
      idleCount.current += 1;
      if (idleCount.current >= 2) {
        setInitDone(true);
      }
    }
    if (loginStatus === "loginError") {
      setInitDone(true);
    }
    prevStatusRef.current = loginStatus;
  }, [loginStatus]);

  // Safety fallback: if init takes more than 4 seconds, show login page anyway
  useEffect(() => {
    const timer = setTimeout(() => setInitDone(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // identity is set by the hook when: (a) prior session exists on load, or (b) II login succeeds.
  // loginStatus then goes back to "idle" but identity persists — watch it directly.
  const hasValidIdentity = !!identity && !identity.getPrincipal().isAnonymous();

  // Latch userLoggedIn permanently the moment we have a valid II identity
  useEffect(() => {
    if (hasValidIdentity) {
      setUserLoggedIn(true);
    }
  }, [hasValidIdentity]);

  const isGuestMode = !hasValidIdentity;

  // Show app only after init is complete AND the user has explicitly entered (II login or guest)
  const showApp = initDone && (userLoggedIn || guestMode);

  const { mutate: doInitSeed } = initSeed;
  useEffect(() => {
    if (!isFetching && actor && !zonesLoading && zones && zones.length === 0) {
      doInitSeed();
    }
  }, [actor, isFetching, zones, zonesLoading, doInitSeed]);

  // Splash screen while auth client initializes
  if (!initDone) {
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

  // Show login page until explicit login
  if (!showApp) {
    return (
      <LoginPage
        onLogin={(_email: string, _password: string) => {
          setUserLoggedIn(true);
        }}
        onGuestLogin={() => setGuestMode(true)}
      />
    );
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

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
  const { loginStatus } = useInternetIdentity();

  const isAuthenticated = loginStatus === "success";
  const showApp = isAuthenticated || guestMode;

  const { mutate: doInitSeed } = initSeed;
  // Initialize seed data on first load if no zones exist
  useEffect(() => {
    if (!isFetching && actor && !zonesLoading && zones && zones.length === 0) {
      doInitSeed();
    }
  }, [actor, isFetching, zones, zonesLoading, doInitSeed]);

  function handleLogin() {
    // called after successful Internet Identity login
  }

  function handleGuestLogin() {
    setGuestMode(true);
  }

  if (!showApp) {
    return <LoginPage onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentPage} />;
      case "fields":
        return <FieldZonesPage />;
      case "crops":
        return <CropsPage />;
      case "irrigation":
        return <IrrigationPage />;
      case "sensors":
        return <SensorsPage />;
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

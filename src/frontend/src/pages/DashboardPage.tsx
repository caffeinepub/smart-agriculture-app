import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Cloud,
  CloudRain,
  Droplets,
  MapPin,
  Plus,
  Sun,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wind,
} from "lucide-react";
import type { PageId } from "../App";
import { useLanguage } from "../contexts/LanguageContext";
import { useAllCrops, useAllZones } from "../hooks/useQueries";

interface Props {
  onNavigate: (page: PageId) => void;
}

const WEATHER_FORECAST_KEYS = [
  { day: "Mon", iconComp: Sun, condKey: "dashboard.sunny" },
  { day: "Tue", iconComp: CloudRain, condKey: "dashboard.rainy", temp: 22 },
  { day: "Wed", iconComp: Cloud, condKey: "dashboard.cloudy", temp: 24 },
  { day: "Thu", iconComp: Sun, condKey: "dashboard.sunny", temp: 30 },
  { day: "Fri", iconComp: Wind, condKey: "dashboard.windy", temp: 26 },
];
const WEATHER_TEMPS = [28, 22, 24, 30, 26];

const HEALTH_STATUS: Record<string, "healthy" | "at-risk" | "critical"> = {
  "zone-1": "healthy",
  "zone-2": "healthy",
  "zone-3": "at-risk",
  "zone-4": "critical",
};

const now = new Date();
const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DashboardPage({ onNavigate }: Props) {
  const { data: zones = [] } = useAllZones();
  const { data: crops = [] } = useAllCrops();
  const { t } = useLanguage();

  const MOCK_ALERTS = [
    {
      id: "1",
      severity: "critical",
      message: t("alerts.msg.soilMoistureLow"),
      zone: "Zone A",
      time: "12 min ago",
    },
    {
      id: "2",
      severity: "warning",
      message: t("alerts.msg.tempExceeds"),
      zone: "Zone C",
      time: "1 hr ago",
    },
    {
      id: "3",
      severity: "info",
      message: t("alerts.msg.irrigationComplete"),
      zone: "Zone B",
      time: "3 hr ago",
    },
  ];

  const activeAlerts = MOCK_ALERTS.filter(
    (a) => a.severity === "critical",
  ).length;

  function getGreeting() {
    const h = now.getHours();
    if (h < 12) return t("dashboard.goodMorning");
    if (h < 17) return t("dashboard.goodAfternoon");
    return t("dashboard.goodEvening");
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            {dayNames[now.getDay()]}, {monthNames[now.getMonth()]}{" "}
            {now.getDate()}, {now.getFullYear()}
          </p>
          <h1 className="text-2xl font-display font-bold text-foreground mt-0.5">
            {getGreeting()},{" "}
            <span className="text-primary">GreenField Farm</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </button>
          <div className="w-9 h-9 rounded-full bg-forest-700 flex items-center justify-center">
            <span className="text-xs font-bold text-lime-400">GF</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t("dashboard.avgTemperature")}
          value="26.4°C"
          icon={Thermometer}
          trend="+1.2°"
          trendUp={true}
          color="text-orange-500"
          bg="bg-orange-50"
        />
        <KpiCard
          title={t("dashboard.humidity")}
          value="68%"
          icon={Droplets}
          trend="-3%"
          trendUp={false}
          color="text-blue-500"
          bg="bg-blue-50"
        />
        <KpiCard
          title={t("dashboard.soilMoisture")}
          value="42%"
          icon={Activity}
          trend="+5%"
          trendUp={true}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <KpiCard
          title={t("dashboard.activeAlerts")}
          value={String(activeAlerts)}
          icon={AlertTriangle}
          trend={t("dashboard.1critical")}
          trendUp={false}
          color="text-red-500"
          bg="bg-red-50"
          isAlert
        />
      </div>

      {/* Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <Card className="lg:col-span-1 shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              {t("dashboard.currentWeather")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-display font-bold text-foreground">
                28°C
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {t("dashboard.partlySunny")}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Central Valley
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("dashboard.wind")}: 14 km/h · {t("dashboard.uv")}: 6
                </p>
              </div>
            </div>
            {/* 5-day forecast */}
            <div className="grid grid-cols-5 gap-1">
              {WEATHER_FORECAST_KEYS.map(
                ({ day, iconComp: WeatherIcon }, i) => (
                  <div
                    key={day}
                    className="flex flex-col items-center gap-1 py-2 rounded-lg bg-secondary/60"
                  >
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      {day}
                    </p>
                    <WeatherIcon className="w-4 h-4 text-amber-500" />
                    <p className="text-xs font-bold text-foreground">
                      {WEATHER_TEMPS[i]}°
                    </p>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Farm Health Overview */}
        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {t("dashboard.farmZoneHealth")}
              </CardTitle>
              <button
                type="button"
                onClick={() => onNavigate("fields")}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {zones.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {zones.slice(0, 6).map((zone, idx) => {
                  const statusKeys = Object.keys(HEALTH_STATUS);
                  const status =
                    HEALTH_STATUS[statusKeys[idx % statusKeys.length]] ||
                    "healthy";
                  const cropCount = crops.filter(
                    (c) => c.zoneId === zone.id,
                  ).length;
                  return (
                    <ZoneMiniCard
                      key={zone.id}
                      name={zone.name}
                      area={zone.area}
                      soilType={zone.soilType}
                      status={status}
                      cropCount={cropCount}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    name: "North Field",
                    area: 12.4,
                    soilType: "Clay Loam",
                    status: "healthy" as const,
                    cropCount: 2,
                  },
                  {
                    name: "South Field",
                    area: 8.6,
                    soilType: "Sandy Loam",
                    status: "healthy" as const,
                    cropCount: 1,
                  },
                  {
                    name: "East Block",
                    area: 5.2,
                    soilType: "Silt Loam",
                    status: "at-risk" as const,
                    cropCount: 1,
                  },
                  {
                    name: "West Plot",
                    area: 9.1,
                    soilType: "Clay",
                    status: "critical" as const,
                    cropCount: 2,
                  },
                  {
                    name: "Greenhouse A",
                    area: 2.0,
                    soilType: "Peat",
                    status: "healthy" as const,
                    cropCount: 3,
                  },
                  {
                    name: "Orchard",
                    area: 15.7,
                    soilType: "Loam",
                    status: "healthy" as const,
                    cropCount: 1,
                  },
                ].map((z) => (
                  <ZoneMiniCard key={z.name} {...z} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                {t("dashboard.recentAlerts")}
              </CardTitle>
              <button
                type="button"
                onClick={() => onNavigate("alerts")}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_ALERTS.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {t("dashboard.quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              data-ocid="dashboard.add_sensor.button"
              onClick={() => onNavigate("sensors")}
              variant="outline"
              className="w-full justify-start gap-2 h-10 border-border hover:bg-secondary"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              {t("dashboard.addSensorReading")}
            </Button>
            <Button
              data-ocid="dashboard.schedule_irrigation.button"
              onClick={() => onNavigate("irrigation")}
              variant="outline"
              className="w-full justify-start gap-2 h-10 border-border hover:bg-secondary"
            >
              <Droplets className="w-4 h-4 text-blue-500" />
              {t("dashboard.scheduleIrrigation")}
            </Button>
            <Button
              data-ocid="dashboard.add_crop.button"
              onClick={() => onNavigate("crops")}
              variant="outline"
              className="w-full justify-start gap-2 h-10 border-border hover:bg-secondary"
            >
              <Plus className="w-4 h-4 text-primary" />
              {t("dashboard.addCrop")}
            </Button>
            <Button
              onClick={() => onNavigate("analytics")}
              variant="outline"
              className="w-full justify-start gap-2 h-10 border-border hover:bg-secondary"
            >
              <Calendar className="w-4 h-4 text-purple-500" />
              {t("dashboard.viewAnalytics")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color,
  bg,
  isAlert,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  trendUp: boolean;
  color: string;
  bg: string;
  isAlert?: boolean;
}) {
  return (
    <Card className="shadow-card border-border card-hover">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              bg,
            )}
          >
            <Icon className={cn("w-4.5 h-4.5", color)} />
          </div>
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trendUp ? "stat-up" : isAlert ? "text-red-500" : "stat-down",
            )}
          >
            {trendUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trend}
          </div>
        </div>
        <p className="text-2xl font-display font-bold text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
      </CardContent>
    </Card>
  );
}

function ZoneMiniCard({
  name,
  area,
  soilType,
  status,
  cropCount,
}: {
  name: string;
  area: number;
  soilType: string;
  status: "healthy" | "at-risk" | "critical";
  cropCount: number;
}) {
  const { t } = useLanguage();

  const statusConfig = {
    healthy: {
      label: t("dashboard.healthy"),
      dot: "health-dot-healthy",
      text: "text-emerald-700",
    },
    "at-risk": {
      label: t("dashboard.atRisk"),
      dot: "health-dot-at-risk",
      text: "text-amber-700",
    },
    critical: {
      label: t("dashboard.critical"),
      dot: "health-dot-critical",
      text: "text-red-700",
    },
  };
  const cfg = statusConfig[status];

  return (
    <div className="p-3 rounded-xl border border-border bg-card hover:shadow-card-hover transition-all duration-150 cursor-pointer group">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {name}
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {area} ha · {soilType}
      </p>
      <p className={cn("text-[10px] font-semibold mt-1", cfg.text)}>
        {cfg.label}
      </p>
      <p className="text-[10px] text-muted-foreground">
        {cropCount} {t("dashboard.crops")}
      </p>
    </div>
  );
}

function AlertRow({
  alert,
}: {
  alert: { severity: string; message: string; zone: string; time: string };
}) {
  const { t } = useLanguage();

  const config = {
    critical: {
      bg: "bg-red-50",
      border: "border-red-200",
      dot: "bg-red-500",
      text: "text-red-700",
      label: t("alerts.severity.critical"),
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      dot: "bg-amber-500",
      text: "text-amber-700",
      label: t("alerts.severity.warning"),
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      dot: "bg-blue-500",
      text: "text-blue-700",
      label: t("alerts.severity.info"),
    },
  } as Record<
    string,
    { bg: string; border: string; dot: string; text: string; label: string }
  >;
  const cfg = config[alert.severity] || config.info;

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-3 py-2.5 rounded-lg border",
        cfg.bg,
        cfg.border,
      )}
    >
      <div
        className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", cfg.dot)}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">
          {alert.message}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {alert.zone} · {alert.time}
        </p>
      </div>
      <span className={cn("text-[10px] font-semibold uppercase", cfg.text)}>
        {cfg.label}
      </span>
    </div>
  );
}

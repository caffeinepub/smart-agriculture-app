import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

type Severity = "critical" | "warning" | "info" | "resolved";

interface Alert {
  id: string;
  severity: Severity;
  msgKey: string;
  detailKey: string;
  zone: string;
  time: string;
}

const INITIAL_ALERTS_DATA: Alert[] = [
  {
    id: "1",
    severity: "critical",
    msgKey: "alerts.msg.soilMoistureLow",
    detailKey: "alerts.detail.soilMoistureLow",
    zone: "Zone A — North Field",
    time: "12 min ago",
  },
  {
    id: "2",
    severity: "critical",
    msgKey: "alerts.msg.tempExceeds",
    detailKey: "alerts.detail.tempExceeds",
    zone: "Zone C — East Block",
    time: "38 min ago",
  },
  {
    id: "3",
    severity: "warning",
    msgKey: "alerts.msg.phOutOfRange",
    detailKey: "alerts.detail.phOutOfRange",
    zone: "Zone B — South Field",
    time: "1 hr ago",
  },
  {
    id: "4",
    severity: "warning",
    msgKey: "alerts.msg.lowNitrogen",
    detailKey: "alerts.detail.lowNitrogen",
    zone: "Zone D — West Plot",
    time: "2 hr ago",
  },
  {
    id: "5",
    severity: "info",
    msgKey: "alerts.msg.irrigationComplete",
    detailKey: "alerts.detail.irrigationComplete",
    zone: "Zone B — South Field",
    time: "3 hr ago",
  },
  {
    id: "6",
    severity: "info",
    msgKey: "alerts.msg.sensorCalibration",
    detailKey: "alerts.detail.sensorCalibration",
    zone: "Zone A — North Field",
    time: "5 hr ago",
  },
  {
    id: "7",
    severity: "resolved",
    msgKey: "alerts.msg.pumpRestored",
    detailKey: "alerts.detail.pumpRestored",
    zone: "Zone C — East Block",
    time: "Yesterday",
  },
];

type TabValue = "all" | Severity;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS_DATA);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const { t } = useLanguage();

  const SEVERITY_CONFIG = {
    critical: {
      icon: AlertTriangle,
      bg: "bg-red-50",
      border: "border-red-200",
      dot: "bg-red-500",
      text: "text-red-700",
      badgeClass: "agri-badge-critical",
      label: t("alerts.severity.critical"),
    },
    warning: {
      icon: AlertCircle,
      bg: "bg-amber-50",
      border: "border-amber-200",
      dot: "bg-amber-500",
      text: "text-amber-700",
      badgeClass: "agri-badge-at-risk",
      label: t("alerts.severity.warning"),
    },
    info: {
      icon: Info,
      bg: "bg-blue-50",
      border: "border-blue-200",
      dot: "bg-blue-500",
      text: "text-blue-700",
      badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
      label: t("alerts.severity.info"),
    },
    resolved: {
      icon: CheckCircle2,
      bg: "bg-muted/50",
      border: "border-border",
      dot: "bg-muted-foreground",
      text: "text-muted-foreground",
      badgeClass: "bg-muted text-muted-foreground border border-border",
      label: t("alerts.severity.resolved"),
    },
  };

  const TAB_LABELS: Record<TabValue, string> = {
    all: t("alerts.tabAll"),
    critical: t("alerts.tabCritical"),
    warning: t("alerts.tabWarning"),
    info: t("alerts.tabInfo"),
    resolved: t("alerts.tabResolved"),
  };

  const filtered = alerts.filter((a) => {
    if (activeTab === "all") return true;
    return a.severity === activeTab;
  });

  function resolveAlert(id: string) {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, severity: "resolved" as Severity } : a,
      ),
    );
    toast.success(t("alerts.resolve"));
  }

  function resolveAll() {
    setAlerts((prev) =>
      prev.map((a) =>
        a.severity !== "critical" && a.severity !== "resolved"
          ? { ...a, severity: "resolved" as Severity }
          : a,
      ),
    );
    toast.success(t("alerts.resolveNonCritical"));
  }

  function dismissAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast(t("alerts.resolve"));
  }

  const unresolvedCount = alerts.filter(
    (a) => a.severity !== "resolved",
  ).length;

  const counts: Record<TabValue, number> = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
    resolved: alerts.filter((a) => a.severity === "resolved").length,
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("alerts.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("alerts.subtitle").replace("{count}", String(unresolvedCount))}
          </p>
        </div>
        {unresolvedCount > 0 && (
          <Button
            data-ocid="alerts.resolve_all.button"
            variant="outline"
            onClick={resolveAll}
            className="border-border gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            {t("alerts.resolveNonCritical")}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList className="bg-muted/60" data-ocid="alerts.filter.tab">
          {(
            ["all", "critical", "warning", "info", "resolved"] as TabValue[]
          ).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              data-ocid={`alerts.${tab}.tab`}
              className="capitalize text-xs"
            >
              {TAB_LABELS[tab]}
              {counts[tab] > 0 && (
                <span
                  className={cn(
                    "ml-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1",
                    tab === "critical"
                      ? "bg-red-500 text-white"
                      : tab === "warning"
                        ? "bg-amber-500 text-white"
                        : "bg-muted-foreground/20 text-muted-foreground",
                  )}
                >
                  {counts[tab]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Alert List */}
      {filtered.length === 0 ? (
        <div
          data-ocid="alerts.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">
            {t("alerts.noAlerts")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === "resolved"
              ? t("alerts.noResolved")
              : t("alerts.noAlerts")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity];
            const Icon = cfg.icon;
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border transition-all",
                  cfg.bg,
                  cfg.border,
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                    alert.severity === "critical"
                      ? "bg-red-100"
                      : alert.severity === "warning"
                        ? "bg-amber-100"
                        : alert.severity === "info"
                          ? "bg-blue-100"
                          : "bg-muted",
                  )}
                >
                  <Icon className={cn("w-4.5 h-4.5", cfg.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm flex-1">
                      {t(alert.msgKey)}
                    </p>
                    <span
                      className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
                        cfg.badgeClass,
                      )}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(alert.detailKey)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      {alert.zone}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {alert.time}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {alert.severity !== "resolved" && (
                    <Button
                      data-ocid="alerts.resolve.button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-emerald-700 hover:bg-emerald-100"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {t("alerts.resolve")}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

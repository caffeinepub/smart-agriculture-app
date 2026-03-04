import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Activity,
  Clock,
  Droplets,
  Loader2,
  Plus,
  RefreshCw,
  Thermometer,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SensorData } from "../backend.d";
import { useLanguage } from "../contexts/LanguageContext";
import { useAddSensorData, useAllZones } from "../hooks/useQueries";

const MOCK_SENSOR_DATA: Record<string, SensorData> = {
  "zone-1": {
    id: "s1",
    zoneId: "zone-1",
    temperature: 26.4,
    humidity: 68,
    soilMoisture: 42,
    phLevel: 6.8,
    nitrogenLevel: 78,
    timestamp: BigInt(Date.now()),
  },
  "zone-2": {
    id: "s2",
    zoneId: "zone-2",
    temperature: 29.1,
    humidity: 54,
    soilMoisture: 31,
    phLevel: 7.2,
    nitrogenLevel: 62,
    timestamp: BigInt(Date.now() - 1800000),
  },
  "zone-3": {
    id: "s3",
    zoneId: "zone-3",
    temperature: 31.8,
    humidity: 45,
    soilMoisture: 18,
    phLevel: 5.9,
    nitrogenLevel: 44,
    timestamp: BigInt(Date.now() - 3600000),
  },
  "zone-4": {
    id: "s4",
    zoneId: "zone-4",
    temperature: 24.2,
    humidity: 72,
    soilMoisture: 56,
    phLevel: 7.0,
    nitrogenLevel: 85,
    timestamp: BigInt(Date.now() - 900000),
  },
};

const DEFAULT_ZONES = [
  { id: "zone-1", name: "North Field" },
  { id: "zone-2", name: "South Field" },
  { id: "zone-3", name: "East Block" },
  { id: "zone-4", name: "West Plot" },
];

export default function SensorsPage({
  isGuest = false,
}: { isGuest?: boolean }) {
  const { data: zonesRaw = [] } = useAllZones();
  const addSensorData = useAddSensorData();
  const { t } = useLanguage();

  const zones = zonesRaw.length > 0 ? zonesRaw : DEFAULT_ZONES;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [sensorData, setSensorData] = useState(MOCK_SENSOR_DATA);

  const [form, setForm] = useState({
    zoneId: "",
    temperature: "26.0",
    humidity: "65",
    soilMoisture: "45",
    phLevel: "6.8",
    nitrogenLevel: "70",
  });

  async function handleRefresh() {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSensorData((prev) => {
      const updated = { ...prev };
      for (const key in updated) {
        updated[key] = {
          ...updated[key],
          temperature: Number.parseFloat(
            (updated[key].temperature + (Math.random() - 0.5) * 0.5).toFixed(1),
          ),
          humidity: Math.min(
            100,
            Math.max(
              0,
              Math.round(updated[key].humidity + (Math.random() - 0.5) * 3),
            ),
          ),
          soilMoisture: Math.min(
            100,
            Math.max(
              0,
              Math.round(updated[key].soilMoisture + (Math.random() - 0.5) * 4),
            ),
          ),
          timestamp: BigInt(Date.now()),
        };
      }
      return updated;
    });
    setIsRefreshing(false);
    toast.success(t("sensors.refresh"));
  }

  async function handleAddReading() {
    if (isGuest) {
      toast.error("Please login with Internet Identity to add sensor readings");
      return;
    }
    if (!form.zoneId) {
      toast.error("Please select a zone");
      return;
    }
    const data: SensorData = {
      id: `sensor-${Date.now()}`,
      zoneId: form.zoneId,
      temperature: Number.parseFloat(form.temperature),
      humidity: Number.parseFloat(form.humidity),
      soilMoisture: Number.parseFloat(form.soilMoisture),
      phLevel: Number.parseFloat(form.phLevel),
      nitrogenLevel: Number.parseFloat(form.nitrogenLevel),
      timestamp: BigInt(Date.now()),
    };
    try {
      await addSensorData.mutateAsync(data);
      setSensorData((prev) => ({ ...prev, [form.zoneId]: data }));
      toast.success(t("sensors.addReading"));
      setAddOpen(false);
    } catch {
      toast.error(
        "Failed to add sensor reading. Please ensure you are logged in.",
      );
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("sensors.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("sensors.subtitle").replace("{zones}", String(zones.length))}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-border"
          >
            <RefreshCw
              className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")}
            />
            {t("sensors.refresh")}
          </Button>
          <Button
            onClick={() => {
              if (!isGuest) setAddOpen(true);
              else
                toast.error(
                  "Please login with Internet Identity to add sensor readings",
                );
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("sensors.addReading")}
          </Button>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {zones.map((zone) => {
          const data = sensorData[zone.id];
          return (
            <SensorCard
              key={zone.id}
              zoneName={zone.name}
              data={data}
              isRefreshing={isRefreshing}
            />
          );
        })}
      </div>

      {/* Add Reading Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("sensors.addSensorReading")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t("sensors.zone")}</Label>
              <Select
                value={form.zoneId}
                onValueChange={(v) => setForm({ ...form, zoneId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("sensors.selectZone")} />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("sensors.temperatureC")}</Label>
                <Input
                  type="number"
                  value={form.temperature}
                  onChange={(e) =>
                    setForm({ ...form, temperature: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("sensors.humidityPct")}</Label>
                <Input
                  type="number"
                  value={form.humidity}
                  onChange={(e) =>
                    setForm({ ...form, humidity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("sensors.soilMoisturePct")}</Label>
                <Input
                  type="number"
                  value={form.soilMoisture}
                  onChange={(e) =>
                    setForm({ ...form, soilMoisture: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("sensors.phLevelLabel")}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.phLevel}
                  onChange={(e) =>
                    setForm({ ...form, phLevel: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("sensors.nitrogenPpm")}</Label>
                <Input
                  type="number"
                  value={form.nitrogenLevel}
                  onChange={(e) =>
                    setForm({ ...form, nitrogenLevel: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              {t("sensors.cancel")}
            </Button>
            <Button
              onClick={handleAddReading}
              disabled={addSensorData.isPending}
              className="bg-primary text-primary-foreground"
            >
              {addSensorData.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t("sensors.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatTimestampI18n(ts: bigint, t: (k: string) => string): string {
  try {
    const ms = Number(ts);
    const d = new Date(ms > 1e15 ? ms / 1e6 : ms);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("sensors.justNow");
    if (mins < 60) return `${mins} ${t("sensors.minAgo")}`;
    return `${Math.floor(mins / 60)}${t("sensors.hAgo")} ${mins % 60}m`;
  } catch {
    return "Unknown";
  }
}

function SensorCard({
  zoneName,
  data,
  isRefreshing,
}: {
  zoneName: string;
  data?: SensorData;
  isRefreshing: boolean;
}) {
  const { t } = useLanguage();

  if (!data) {
    return (
      <Card className="shadow-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{zoneName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("sensors.noData")}</p>
        </CardContent>
      </Card>
    );
  }

  const tempStatus =
    data.temperature > 32
      ? "critical"
      : data.temperature > 28
        ? "warning"
        : "ok";
  const moistureStatus =
    data.soilMoisture < 25
      ? "critical"
      : data.soilMoisture < 35
        ? "warning"
        : "ok";
  const phStatus =
    data.phLevel < 5.5 || data.phLevel > 7.5
      ? "critical"
      : data.phLevel < 6.0 || data.phLevel > 7.2
        ? "warning"
        : "ok";

  return (
    <Card
      className={cn(
        "shadow-card border-border",
        isRefreshing && "opacity-75 transition-opacity",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{zoneName}</CardTitle>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimestampI18n(data.timestamp, t)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperature */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              tempStatus === "critical"
                ? "bg-red-100"
                : tempStatus === "warning"
                  ? "bg-amber-100"
                  : "bg-emerald-100",
            )}
          >
            <Thermometer
              className={cn(
                "w-5 h-5",
                tempStatus === "critical"
                  ? "text-red-600"
                  : tempStatus === "warning"
                    ? "text-amber-600"
                    : "text-emerald-600",
              )}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {t("sensors.temperature")}
              </span>
              <span
                className={cn(
                  "text-sm font-bold",
                  tempStatus === "critical"
                    ? "text-red-600"
                    : tempStatus === "warning"
                      ? "text-amber-600"
                      : "text-foreground",
                )}
              >
                {data.temperature.toFixed(1)}°C
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  tempStatus === "critical"
                    ? "bg-red-500"
                    : tempStatus === "warning"
                      ? "bg-amber-500"
                      : "bg-emerald-500",
                )}
                style={{
                  width: `${Math.min(100, (data.temperature / 45) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-100">
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {t("sensors.humidity")}
              </span>
              <span className="text-sm font-bold text-foreground">
                {data.humidity}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${data.humidity}%` }}
              />
            </div>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              moistureStatus === "critical"
                ? "bg-red-100"
                : moistureStatus === "warning"
                  ? "bg-amber-100"
                  : "bg-teal-100",
            )}
          >
            <Activity
              className={cn(
                "w-5 h-5",
                moistureStatus === "critical"
                  ? "text-red-600"
                  : moistureStatus === "warning"
                    ? "text-amber-600"
                    : "text-teal-600",
              )}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {t("sensors.soilMoisture")}
              </span>
              <span
                className={cn(
                  "text-sm font-bold",
                  moistureStatus === "critical"
                    ? "text-red-600"
                    : moistureStatus === "warning"
                      ? "text-amber-600"
                      : "text-foreground",
                )}
              >
                {data.soilMoisture}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  moistureStatus === "critical"
                    ? "bg-red-500"
                    : moistureStatus === "warning"
                      ? "bg-amber-500"
                      : "bg-teal-500",
                )}
                style={{ width: `${data.soilMoisture}%` }}
              />
            </div>
          </div>
        </div>

        {/* pH & Nitrogen row */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div
            className={cn(
              "rounded-lg p-3",
              phStatus === "critical"
                ? "bg-red-50 border border-red-200"
                : phStatus === "warning"
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-emerald-50 border border-emerald-100",
            )}
          >
            <p className="text-[10px] text-muted-foreground font-medium">
              {t("sensors.phLevel")}
            </p>
            <p
              className={cn(
                "text-xl font-display font-bold mt-0.5",
                phStatus === "critical"
                  ? "text-red-700"
                  : phStatus === "warning"
                    ? "text-amber-700"
                    : "text-emerald-700",
              )}
            >
              {data.phLevel.toFixed(1)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("sensors.optimal")}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground font-medium">
              {t("sensors.nitrogen")}
            </p>
            <p className="text-xl font-display font-bold mt-0.5 text-purple-700">
              {data.nitrogenLevel}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("sensors.ppm")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

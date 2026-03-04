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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  CalendarDays,
  Clock,
  Droplets,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { IrrigationSchedule } from "../backend.d";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAddIrrigationSchedule,
  useAllIrrigationSchedules,
  useAllZones,
  useDeleteIrrigationSchedule,
} from "../hooks/useQueries";

const WATER_USAGE_DATA = [
  { day: "Mon", usage: 1240 },
  { day: "Tue", usage: 980 },
  { day: "Wed", usage: 1560 },
  { day: "Thu", usage: 870 },
  { day: "Fri", usage: 1320 },
  { day: "Sat", usage: 640 },
  { day: "Sun", usage: 720 },
];

const DEFAULT_ZONES = [
  { id: "zone-1", name: "North Field" },
  { id: "zone-2", name: "South Field" },
  { id: "zone-3", name: "East Block" },
  { id: "zone-4", name: "West Plot" },
];

const DEFAULT_SCHEDULES: IrrigationSchedule[] = [
  {
    id: "sch-1",
    zoneId: "zone-1",
    startTime: BigInt(Date.now()),
    duration: BigInt(60),
    waterAmount: 450,
  },
  {
    id: "sch-2",
    zoneId: "zone-2",
    startTime: BigInt(Date.now() + 7200000),
    duration: BigInt(30),
    waterAmount: 280,
  },
  {
    id: "sch-3",
    zoneId: "zone-3",
    startTime: BigInt(Date.now() + 3600000),
    duration: BigInt(45),
    waterAmount: 380,
  },
];

function formatBigIntTime(ts: bigint): string {
  try {
    const ms = Number(ts);
    const d = new Date(ms > 1e15 ? ms / 1e6 : ms);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatDuration(dur: bigint): string {
  try {
    const mins = Number(dur);
    // Handle both raw minutes and milliseconds (legacy data)
    const actualMins = mins > 10000 ? Math.round(mins / 60000) : mins;
    if (actualMins >= 60)
      return `${Math.floor(actualMins / 60)}h ${actualMins % 60}m`;
    return `${actualMins} min`;
  } catch {
    return "—";
  }
}

export default function IrrigationPage({
  isGuest = false,
}: { isGuest?: boolean }) {
  const { data: schedulesRaw = [], isLoading } = useAllIrrigationSchedules();
  const { data: zonesRaw = [] } = useAllZones();
  const addSchedule = useAddIrrigationSchedule();
  const deleteSchedule = useDeleteIrrigationSchedule();
  const { t } = useLanguage();

  const schedules = schedulesRaw.length > 0 ? schedulesRaw : DEFAULT_SCHEDULES;
  const zones = zonesRaw.length > 0 ? zonesRaw : DEFAULT_ZONES;

  const [addOpen, setAddOpen] = useState(false);
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(schedules.map((s) => [s.id, true])),
  );
  const [form, setForm] = useState({
    zoneId: "",
    startTime: "06:00",
    durationMinutes: "60",
    waterAmount: "400",
  });

  function checkAuth(): boolean {
    if (isGuest) {
      toast.error("Please login with Internet Identity to make changes");
      return false;
    }
    return true;
  }

  const thisWeekTotal = WATER_USAGE_DATA.reduce((s, d) => s + d.usage, 0);
  const lastWeekTotal = Math.round(thisWeekTotal * 0.88);

  async function handleAdd() {
    if (!checkAuth()) return;
    if (!form.zoneId) {
      toast.error("Please select a zone");
      return;
    }
    const [hours, mins] = form.startTime.split(":").map(Number);
    const now = new Date();
    now.setHours(hours, mins, 0, 0);
    const schedule: IrrigationSchedule = {
      id: `sch-${Date.now()}`,
      zoneId: form.zoneId,
      startTime: BigInt(now.getTime()),
      duration: BigInt(Number.parseInt(form.durationMinutes)),
      waterAmount: Number.parseFloat(form.waterAmount),
    };
    try {
      await addSchedule.mutateAsync(schedule);
      toast.success(t("irrigation.addSchedule"));
      setAddOpen(false);
      setForm({
        zoneId: "",
        startTime: "06:00",
        durationMinutes: "60",
        waterAmount: "400",
      });
    } catch {
      toast.error("Failed to add schedule. Please ensure you are logged in.");
    }
  }

  async function handleDelete(id: string) {
    if (!checkAuth()) return;
    try {
      await deleteSchedule.mutateAsync(id);
      toast.success(t("fields.delete"));
    } catch {
      toast.error(
        "Failed to delete schedule. Please ensure you are logged in.",
      );
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("irrigation.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {schedules.length} {t("irrigation.addSchedule").toLowerCase()}
          </p>
        </div>
        <Button
          data-ocid="irrigation.add_schedule.open_modal_button"
          onClick={() => {
            if (!isGuest) setAddOpen(true);
            else
              toast.error(
                "Please login with Internet Identity to add schedules",
              );
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("irrigation.addSchedule")}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">
              {t("irrigation.thisWeek")}
            </p>
            <p className="text-2xl font-display font-bold text-foreground mt-0.5">
              {thisWeekTotal.toLocaleString()} L
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">
              {t("irrigation.vsLastWeek")}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">
              {t("irrigation.lastWeek")}
            </p>
            <p className="text-2xl font-display font-bold text-foreground mt-0.5">
              {lastWeekTotal.toLocaleString()} L
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("irrigation.previousPeriod")}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">
              {t("irrigation.activeZones")}
            </p>
            <p className="text-2xl font-display font-bold text-foreground mt-0.5">
              {Object.values(toggleStates).filter(Boolean).length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("fields.delete").includes("நீக்")
                ? `${zones.length} ${t("nav.fields").toLowerCase()} மொத்தம்`
                : `of ${zones.length} total`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            {t("irrigation.zoneSchedules")}
          </h2>
          {isLoading ? (
            <div
              data-ocid="irrigation.loading_state"
              className="flex items-center justify-center h-32"
            >
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : schedules.length === 0 ? (
            <div
              data-ocid="irrigation.empty_state"
              className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border"
            >
              {t("irrigation.noSchedules")}
            </div>
          ) : (
            schedules.map((schedule, idx) => {
              const zoneName =
                zones.find((z) => z.id === schedule.zoneId)?.name ||
                schedule.zoneId;
              const isOn = toggleStates[schedule.id] ?? true;
              return (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  zoneName={zoneName}
                  isOn={isOn}
                  onToggle={(v) =>
                    setToggleStates((prev) => ({ ...prev, [schedule.id]: v }))
                  }
                  onDelete={() => handleDelete(schedule.id)}
                  index={idx + 1}
                />
              );
            })
          )}
        </div>

        {/* Water Usage Chart */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              {t("irrigation.7dayWater")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={WATER_USAGE_DATA} barSize={16}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.88 0.025 130)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "oklch(0.52 0.05 145)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.52 0.05 145)" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.99 0.004 120)",
                    border: "1px solid oklch(0.88 0.025 130)",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v} L`, t("analytics.water")]}
                />
                <Bar
                  dataKey="usage"
                  fill="oklch(0.55 0.18 195)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="max-w-md"
          data-ocid="irrigation.add_schedule.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("irrigation.addIrrigationSchedule")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t("irrigation.zone")}</Label>
              <Select
                value={form.zoneId}
                onValueChange={(v) => setForm({ ...form, zoneId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("irrigation.selectZone")} />
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
                <Label htmlFor="start-time">{t("irrigation.startTime")}</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration">{t("irrigation.duration")}</Label>
                <Input
                  id="duration"
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="water-amt">{t("irrigation.waterAmount")}</Label>
              <Input
                id="water-amt"
                type="number"
                value={form.waterAmount}
                onChange={(e) =>
                  setForm({ ...form, waterAmount: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="irrigation.add_schedule.cancel_button"
              onClick={() => setAddOpen(false)}
            >
              {t("irrigation.cancel")}
            </Button>
            <Button
              data-ocid="irrigation.add_schedule.submit_button"
              onClick={handleAdd}
              disabled={addSchedule.isPending}
              className="bg-primary text-primary-foreground"
            >
              {addSchedule.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t("irrigation.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScheduleCard({
  schedule,
  zoneName,
  isOn,
  onToggle,
  onDelete,
  index: _index,
}: {
  schedule: IrrigationSchedule;
  zoneName: string;
  isOn: boolean;
  onToggle: (v: boolean) => void;
  onDelete: () => void;
  index?: number;
}) {
  const { t } = useLanguage();

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isOn ? "bg-blue-100" : "bg-muted",
            )}
          >
            <Droplets
              className={cn(
                "w-5 h-5",
                isOn ? "text-blue-600" : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <p className="font-semibold text-foreground">{zoneName}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatBigIntTime(schedule.startTime)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDuration(schedule.duration)}
              </span>
              <span className="text-xs text-blue-600 font-medium">
                {schedule.waterAmount} L
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <Switch
              data-ocid="irrigation.zone_toggle.switch"
              checked={isOn}
              onCheckedChange={onToggle}
            />
            <span className="text-[10px] text-muted-foreground">
              {isOn ? t("irrigation.active") : t("irrigation.paused")}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 p-0 text-muted-foreground hover:text-red-500"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            "text-[11px] font-semibold px-2 py-0.5 rounded-full",
            isOn ? "agri-badge-active" : "agri-badge-fallow",
          )}
        >
          {isOn ? t("irrigation.auto") : t("irrigation.manual")}
        </span>
      </div>
    </div>
  );
}

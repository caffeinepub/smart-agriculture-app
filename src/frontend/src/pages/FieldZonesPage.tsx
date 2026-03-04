import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Sprout,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Zone } from "../backend.d";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAddZone,
  useAllCrops,
  useAllZones,
  useDeleteZone,
} from "../hooks/useQueries";

const SOIL_TYPES = [
  "Clay Loam",
  "Sandy Loam",
  "Silt Loam",
  "Clay",
  "Loam",
  "Peat",
  "Silty Clay",
  "Sandy Clay",
];

const ZONE_STATUS = ["active", "fallow", "harvesting"] as const;
type ZoneStatus = (typeof ZONE_STATUS)[number];

const HEALTH_STATUSES = ["healthy", "at-risk", "critical"] as const;
type HealthStatus = (typeof HEALTH_STATUSES)[number];

function deterministicHealth(zoneId: string): HealthStatus {
  const n = zoneId.charCodeAt(zoneId.length - 1) % 3;
  return HEALTH_STATUSES[n];
}
function deterministicStatus(zoneId: string): ZoneStatus {
  const n = zoneId.charCodeAt(0) % 3;
  return ZONE_STATUS[n];
}

const DEFAULT_FALLBACK_ZONES: Zone[] = [
  {
    id: "zone-1",
    name: "North Field",
    area: 12.4,
    soilType: "Clay Loam",
    coordinates: [],
  },
  {
    id: "zone-2",
    name: "South Field",
    area: 8.6,
    soilType: "Sandy Loam",
    coordinates: [],
  },
  {
    id: "zone-3",
    name: "East Block",
    area: 5.2,
    soilType: "Silt Loam",
    coordinates: [],
  },
  {
    id: "zone-4",
    name: "West Plot",
    area: 9.1,
    soilType: "Clay",
    coordinates: [],
  },
  {
    id: "zone-5",
    name: "Greenhouse A",
    area: 2.0,
    soilType: "Peat",
    coordinates: [],
  },
  {
    id: "zone-6",
    name: "Orchard",
    area: 15.7,
    soilType: "Loam",
    coordinates: [],
  },
];

export default function FieldZonesPage({
  isGuest = false,
}: { isGuest?: boolean }) {
  const { data: zonesRaw = [], isLoading } = useAllZones();
  const { data: crops = [] } = useAllCrops();
  const addZone = useAddZone();
  const deleteZone = useDeleteZone();
  const { t } = useLanguage();

  const zones = zonesRaw.length > 0 ? zonesRaw : DEFAULT_FALLBACK_ZONES;

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    area: "",
    soilType: "Clay Loam",
  });

  function checkAuth(): boolean {
    if (isGuest) {
      toast.error(
        t("auth.loginRequired") ||
          "Please login with Internet Identity to make changes",
      );
      return false;
    }
    return true;
  }

  async function handleAdd() {
    if (!checkAuth()) return;
    if (!form.name || !form.area) {
      toast.error("Please fill all required fields");
      return;
    }
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: form.name,
      area: Number.parseFloat(form.area),
      soilType: form.soilType,
      coordinates: [],
    };
    try {
      await addZone.mutateAsync(newZone);
      toast.success(`${t("fields.addZone")}: "${form.name}"`);
      setAddOpen(false);
      setForm({ name: "", area: "", soilType: "Clay Loam" });
    } catch {
      toast.error("Failed to add zone. Please ensure you are logged in.");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!checkAuth()) return;
    try {
      await deleteZone.mutateAsync(id);
      toast.success(`"${name}" ${t("fields.delete")}`);
    } catch {
      toast.error("Failed to delete zone. Please ensure you are logged in.");
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("fields.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {zones.length} {t("nav.fields").toLowerCase()} ·{" "}
            {zones.reduce((s, z) => s + z.area, 0).toFixed(1)} ha
          </p>
        </div>
        <Button
          data-ocid="fields.add_zone.open_modal_button"
          onClick={() => {
            if (!isGuest) setAddOpen(true);
            else
              toast.error("Please login with Internet Identity to add zones");
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("fields.addZone")}
        </Button>
      </div>

      {/* Zone Grid */}
      {isLoading ? (
        <div
          data-ocid="fields.loading_state"
          className="flex items-center justify-center h-48"
        >
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {zones.map((zone, idx) => {
            const health = deterministicHealth(zone.id);
            const status = deterministicStatus(zone.id);
            const cropCount = crops.filter((c) => c.zoneId === zone.id).length;
            const firstCrop = crops.find((c) => c.zoneId === zone.id);
            return (
              <ZoneCard
                key={zone.id}
                zone={zone}
                health={health}
                status={status}
                cropCount={cropCount}
                firstCropType={firstCrop?.cropType}
                index={idx + 1}
                onDelete={() => handleDelete(zone.id, zone.name)}
              />
            );
          })}
        </div>
      )}

      {/* Add Zone Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md" data-ocid="fields.add_zone.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("fields.addNewZone")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="zone-name">{t("fields.zoneName")}</Label>
              <Input
                id="zone-name"
                data-ocid="fields.zone.input"
                placeholder={t("fields.zoneNamePlaceholder")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zone-area">{t("fields.area")}</Label>
              <Input
                id="zone-area"
                type="number"
                placeholder={t("fields.areaPh")}
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("fields.soilType")}</Label>
              <Select
                value={form.soilType}
                onValueChange={(v) => setForm({ ...form, soilType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOIL_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="fields.add_zone.cancel_button"
              onClick={() => setAddOpen(false)}
            >
              {t("fields.cancel")}
            </Button>
            <Button
              data-ocid="fields.add_zone.submit_button"
              onClick={handleAdd}
              disabled={addZone.isPending}
              className="bg-primary text-primary-foreground"
            >
              {addZone.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t("fields.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ZoneCard({
  zone,
  health,
  status,
  cropCount,
  firstCropType,
  index,
  onDelete,
}: {
  zone: Zone;
  health: HealthStatus;
  status: ZoneStatus;
  cropCount: number;
  firstCropType?: string;
  index: number;
  onDelete: () => void;
}) {
  const { t } = useLanguage();

  const healthCfg = {
    healthy: {
      label: t("fields.healthy"),
      dotClass: "health-dot-healthy",
      badgeClass: "agri-badge-healthy",
    },
    "at-risk": {
      label: t("fields.atRisk"),
      dotClass: "health-dot-at-risk",
      badgeClass: "agri-badge-at-risk",
    },
    critical: {
      label: t("fields.critical"),
      dotClass: "health-dot-critical",
      badgeClass: "agri-badge-critical",
    },
  };
  const statusCfg = {
    active: { label: t("fields.active"), badgeClass: "agri-badge-active" },
    fallow: { label: t("fields.fallow"), badgeClass: "agri-badge-fallow" },
    harvesting: {
      label: t("fields.harvesting"),
      badgeClass: "agri-badge-harvesting",
    },
  };

  const hcfg = healthCfg[health];
  const scfg = statusCfg[status];

  return (
    <div
      data-ocid={`fields.zone.item.${index}`}
      className="bg-card rounded-2xl border border-border shadow-card card-hover group overflow-hidden"
    >
      <div
        className={cn(
          "h-1.5",
          health === "healthy"
            ? "bg-emerald-500"
            : health === "at-risk"
              ? "bg-amber-500"
              : "bg-red-500",
        )}
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full flex-shrink-0",
                hcfg.dotClass,
              )}
            />
            <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
              {zone.name}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Pencil className="w-3.5 h-3.5" /> {t("fields.editZone")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-600"
                onClick={onDelete}
              >
                <Trash2 className="w-3.5 h-3.5" /> {t("fields.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {zone.area} ha · {zone.soilType}
            </span>
          </div>
          {firstCropType && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sprout className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{firstCropType}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {cropCount}{" "}
            {cropCount !== 1 ? t("fields.activeCrops") : t("fields.activeCrop")}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 rounded-full",
              scfg.badgeClass,
            )}
          >
            {scfg.label}
          </span>
          <span
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 rounded-full",
              hcfg.badgeClass,
            )}
          >
            {hcfg.label}
          </span>
        </div>
      </div>
    </div>
  );
}

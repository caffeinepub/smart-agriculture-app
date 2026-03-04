import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Filter, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CropRecord } from "../backend.d";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAddCrop,
  useAllCrops,
  useAllZones,
  useDeleteCrop,
} from "../hooks/useQueries";

const GROWTH_STAGE_KEYS = [
  "crops.stage.seedling",
  "crops.stage.vegetative",
  "crops.stage.flowering",
  "crops.stage.fruiting",
  "crops.stage.harvestReady",
] as const;

const CROP_TYPES = [
  "Maize",
  "Wheat",
  "Rice",
  "Tomatoes",
  "Cabbage",
  "Potatoes",
  "Soybeans",
  "Sunflower",
  "Cotton",
  "Sugarcane",
];

function deterministicStage(cropId: string): number {
  return cropId.charCodeAt(cropId.length - 1) % GROWTH_STAGE_KEYS.length;
}
function deterministicHealth(cropId: string): 0 | 1 | 2 {
  const n = cropId.charCodeAt(0) % 3;
  return n as 0 | 1 | 2;
}

const DEFAULT_CROPS: CropRecord[] = [
  {
    id: "crop-1",
    cropType: "Maize",
    zoneId: "zone-1",
    plantingDate: "2026-01-15",
    irrigationNeeds: 45,
    expectedYield: 8500,
  },
  {
    id: "crop-2",
    cropType: "Tomatoes",
    zoneId: "zone-2",
    plantingDate: "2026-02-01",
    irrigationNeeds: 60,
    expectedYield: 12000,
  },
  {
    id: "crop-3",
    cropType: "Wheat",
    zoneId: "zone-3",
    plantingDate: "2025-11-20",
    irrigationNeeds: 30,
    expectedYield: 5500,
  },
  {
    id: "crop-4",
    cropType: "Soybeans",
    zoneId: "zone-1",
    plantingDate: "2026-01-28",
    irrigationNeeds: 35,
    expectedYield: 3200,
  },
  {
    id: "crop-5",
    cropType: "Cabbage",
    zoneId: "zone-4",
    plantingDate: "2026-02-10",
    irrigationNeeds: 55,
    expectedYield: 7800,
  },
];

const DEFAULT_ZONES = [
  { id: "zone-1", name: "North Field" },
  { id: "zone-2", name: "South Field" },
  { id: "zone-3", name: "East Block" },
  { id: "zone-4", name: "West Plot" },
  { id: "zone-5", name: "Greenhouse A" },
  { id: "zone-6", name: "Orchard" },
];

export default function CropsPage({ isGuest = false }: { isGuest?: boolean }) {
  const { data: cropsRaw = [], isLoading } = useAllCrops();
  const { data: zonesRaw = [] } = useAllZones();
  const addCrop = useAddCrop();
  const deleteCrop = useDeleteCrop();
  const { t } = useLanguage();

  const crops = cropsRaw.length > 0 ? cropsRaw : DEFAULT_CROPS;
  const zones = zonesRaw.length > 0 ? zonesRaw : DEFAULT_ZONES;

  const [addOpen, setAddOpen] = useState(false);
  const [filterZone, setFilterZone] = useState("all");
  const [filterHealth, setFilterHealth] = useState("all");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    cropType: "Maize",
    zoneId: "",
    plantingDate: "",
    irrigationNeeds: "40",
    expectedYield: "5000",
  });

  function checkAuth(): boolean {
    if (isGuest) {
      toast.error("Please login with Internet Identity to make changes");
      return false;
    }
    return true;
  }

  const filtered = crops.filter((c) => {
    const matchZone = filterZone === "all" || c.zoneId === filterZone;
    const healthIdx = deterministicHealth(c.id);
    const healthLabel = ["healthy", "at-risk", "critical"][healthIdx];
    const matchHealth =
      filterHealth === "all" || filterHealth.toLowerCase() === healthLabel;
    const matchSearch =
      !search || c.cropType.toLowerCase().includes(search.toLowerCase());
    return matchZone && matchHealth && matchSearch;
  });

  async function handleAdd() {
    if (!checkAuth()) return;
    if (!form.cropType || !form.zoneId || !form.plantingDate) {
      toast.error("Please fill all required fields");
      return;
    }
    const crop: CropRecord = {
      id: `crop-${Date.now()}`,
      cropType: form.cropType,
      zoneId: form.zoneId,
      plantingDate: form.plantingDate,
      irrigationNeeds: Number.parseFloat(form.irrigationNeeds),
      expectedYield: Number.parseFloat(form.expectedYield),
    };
    try {
      await addCrop.mutateAsync(crop);
      toast.success(`${t("crops.addCrop")}: "${form.cropType}"`);
      setAddOpen(false);
      setForm({
        cropType: "Maize",
        zoneId: "",
        plantingDate: "",
        irrigationNeeds: "40",
        expectedYield: "5000",
      });
    } catch {
      toast.error("Failed to add crop. Please ensure you are logged in.");
    }
  }

  async function handleDelete(id: string, type: string) {
    if (!checkAuth()) return;
    try {
      await deleteCrop.mutateAsync(id);
      toast.success(`"${type}" ${t("fields.delete")}`);
    } catch {
      toast.error("Failed to delete crop. Please ensure you are logged in.");
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("crops.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {crops.length} {t("crops.title").toLowerCase()} · {zones.length}{" "}
            {t("nav.fields").toLowerCase()}
          </p>
        </div>
        <Button
          data-ocid="crops.add_crop.open_modal_button"
          onClick={() => {
            if (!isGuest) setAddOpen(true);
            else
              toast.error("Please login with Internet Identity to add crops");
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("crops.addCrop")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("crops.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterZone} onValueChange={setFilterZone}>
          <SelectTrigger data-ocid="crops.filter.select" className="w-[160px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={t("crops.allZones")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("crops.allZones")}</SelectItem>
            {zones.map((z) => (
              <SelectItem key={z.id} value={z.id}>
                {z.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterHealth} onValueChange={setFilterHealth}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("crops.allHealth")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("crops.allHealth")}</SelectItem>
            <SelectItem value="healthy">{t("crops.healthy")}</SelectItem>
            <SelectItem value="at-risk">{t("crops.atRisk")}</SelectItem>
            <SelectItem value="critical">{t("crops.critical")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div
          data-ocid="crops.loading_state"
          className="flex items-center justify-center h-48"
        >
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div
          data-ocid="crops.table"
          className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">
                  {t("crops.colCrop")}
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  {t("crops.colZone")}
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  {t("crops.colPlanted")}
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  {t("crops.colGrowthStage")}
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  {t("crops.colHealth")}
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  {t("crops.colYield")}
                </TableHead>
                <TableHead className="font-semibold text-foreground w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    data-ocid="crops.empty_state"
                    className="text-center py-12 text-muted-foreground"
                  >
                    {t("crops.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((crop) => {
                  const stageIdx = deterministicStage(crop.id);
                  const healthIdx = deterministicHealth(crop.id);
                  const zoneName =
                    zones.find((z) => z.id === crop.zoneId)?.name ||
                    crop.zoneId;
                  return (
                    <CropTableRow
                      key={crop.id}
                      crop={crop}
                      zoneName={zoneName}
                      stageIdx={stageIdx}
                      healthIdx={healthIdx}
                      onDelete={() => handleDelete(crop.id, crop.cropType)}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Crop Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md" data-ocid="crops.add_crop.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("crops.addNewCrop")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t("crops.cropType")}</Label>
              <Select
                value={form.cropType}
                onValueChange={(v) => setForm({ ...form, cropType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CROP_TYPES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("crops.zone")}</Label>
              <Select
                value={form.zoneId}
                onValueChange={(v) => setForm({ ...form, zoneId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("crops.selectZone")} />
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
            <div className="space-y-1.5">
              <Label htmlFor="planting-date">{t("crops.plantingDate")}</Label>
              <Input
                id="planting-date"
                type="date"
                value={form.plantingDate}
                onChange={(e) =>
                  setForm({ ...form, plantingDate: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="irrigation">{t("crops.irrigationMm")}</Label>
                <Input
                  id="irrigation"
                  type="number"
                  value={form.irrigationNeeds}
                  onChange={(e) =>
                    setForm({ ...form, irrigationNeeds: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yield">{t("crops.expectedYield")}</Label>
                <Input
                  id="yield"
                  type="number"
                  value={form.expectedYield}
                  onChange={(e) =>
                    setForm({ ...form, expectedYield: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="crops.add_crop.cancel_button"
              onClick={() => setAddOpen(false)}
            >
              {t("crops.cancel")}
            </Button>
            <Button
              data-ocid="crops.add_crop.submit_button"
              onClick={handleAdd}
              disabled={addCrop.isPending}
              className="bg-primary text-primary-foreground"
            >
              {addCrop.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t("crops.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CropTableRow({
  crop,
  zoneName,
  stageIdx,
  healthIdx,
  onDelete,
}: {
  crop: CropRecord;
  zoneName: string;
  stageIdx: number;
  healthIdx: 0 | 1 | 2;
  onDelete: () => void;
}) {
  const { t } = useLanguage();

  const healthLabelKeys = ["crops.healthy", "crops.atRisk", "crops.critical"];
  const healthClasses = [
    "agri-badge-healthy",
    "agri-badge-at-risk",
    "agri-badge-critical",
  ];

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell>
        <div>
          <p className="font-semibold text-foreground">{crop.cropType}</p>
          <p className="text-xs text-muted-foreground">
            {t("crops.yield")} {crop.expectedYield.toLocaleString()} kg
          </p>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {zoneName}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(crop.plantingDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </TableCell>
      <TableCell>
        <GrowthStagePill stageIdx={stageIdx} />
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "text-[11px] font-semibold px-2 py-0.5 rounded-full",
            healthClasses[healthIdx],
          )}
        >
          {t(healthLabelKeys[healthIdx])}
        </span>
      </TableCell>
      <TableCell className="font-medium">
        {crop.expectedYield.toLocaleString()}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-muted-foreground hover:text-red-500"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function GrowthStagePill({ stageIdx }: { stageIdx: number }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-0.5">
      {GROWTH_STAGE_KEYS.map((stageKey, i) => (
        <div key={stageKey} className="flex items-center gap-0.5">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              i <= stageIdx ? "bg-primary" : "bg-border",
            )}
            title={t(stageKey)}
          />
          {i < GROWTH_STAGE_KEYS.length - 1 && (
            <div
              className={cn(
                "w-3 h-px",
                i < stageIdx ? "bg-primary" : "bg-border",
              )}
            />
          )}
        </div>
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground whitespace-nowrap">
        {t(GROWTH_STAGE_KEYS[stageIdx])}
      </span>
    </div>
  );
}

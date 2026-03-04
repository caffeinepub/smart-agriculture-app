import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Droplets, Thermometer, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "../contexts/LanguageContext";

type Range = "7" | "30" | "90";

interface YieldDataPoint {
  date: string;
  yield: number;
  target: number;
}
interface WaterDataPoint {
  date: string;
  usage: number;
}
interface TempHumidDataPoint {
  date: string;
  temperature: number;
  humidity: number;
}

function dateLabel(d: Date, days: number): string {
  return days <= 7
    ? d.toLocaleDateString("en-US", { weekday: "short" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function generateYieldData(days: number): YieldDataPoint[] {
  const data: YieldDataPoint[] = [];
  const base = 4200;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: dateLabel(d, days),
      yield: Math.round(base + Math.sin(i * 0.4) * 600 + Math.random() * 300),
      target: base + 200,
    });
  }
  return data;
}

function generateWaterData(days: number): WaterDataPoint[] {
  const data: WaterDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: dateLabel(d, days),
      usage: Math.round(800 + Math.random() * 800),
    });
  }
  return data;
}

function generateTempHumidData(days: number): TempHumidDataPoint[] {
  const data: TempHumidDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: dateLabel(d, days),
      temperature: Number.parseFloat(
        (24 + Math.sin(i * 0.3) * 5 + Math.random() * 2).toFixed(1),
      ),
      humidity: Math.round(55 + Math.cos(i * 0.25) * 15 + Math.random() * 8),
    });
  }
  return data;
}

const ZONE_PERFORMANCE = [
  { zone: "North Field", yield: 8540, water: 4200, score: 87 },
  { zone: "South Field", yield: 6280, water: 3100, score: 74 },
  { zone: "East Block", yield: 4980, water: 2850, score: 61 },
  { zone: "West Plot", yield: 7640, water: 3800, score: 82 },
  { zone: "Greenhouse A", yield: 11200, water: 1800, score: 94 },
  { zone: "Orchard", yield: 5120, water: 4600, score: 70 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "oklch(0.99 0.004 120)",
  border: "1px solid oklch(0.88 0.025 130)",
  borderRadius: "8px",
  fontSize: 12,
};
const TICK_STYLE = { fontSize: 11, fill: "oklch(0.52 0.05 145)" };

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("7");
  const { t } = useLanguage();
  const days = Number.parseInt(range);

  const yieldData = generateYieldData(days);
  const waterData = generateWaterData(days);
  const tempHumidData = generateTempHumidData(days);

  const interval = days <= 7 ? 0 : days <= 30 ? 4 : 12;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("analytics.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("analytics.subtitle")}
          </p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger
            data-ocid="analytics.date_range.select"
            className="w-[160px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">{t("analytics.last7")}</SelectItem>
            <SelectItem value="30">{t("analytics.last30")}</SelectItem>
            <SelectItem value="90">{t("analytics.last90")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("analytics.totalYield")}
          value={`${(yieldData.reduce((s, d) => s + d.yield, 0) / 1000).toFixed(1)}t`}
          sub={t("analytics.thisPeriod")}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          title={t("analytics.waterUsed")}
          value={`${(waterData.reduce((s, d) => s + d.usage, 0) / 1000).toFixed(1)}k L`}
          sub={t("analytics.thisPeriod")}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          title={t("analytics.avgTemperature")}
          value={`${(tempHumidData.reduce((s, d) => s + d.temperature, 0) / tempHumidData.length).toFixed(1)}°C`}
          sub={t("analytics.dailyAverage")}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <StatCard
          title={t("analytics.avgHumidity")}
          value={`${Math.round(tempHumidData.reduce((s, d) => s + d.humidity, 0) / tempHumidData.length)}%`}
          sub={t("analytics.dailyAverage")}
          color="text-cyan-600"
          bg="bg-cyan-50"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Trend */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {t("analytics.yieldTrend")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.55 0.18 145)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.55 0.18 145)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.88 0.025 130)"
                />
                <XAxis
                  dataKey="date"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  interval={interval}
                />
                <YAxis
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [`${v} kg`, ""]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="yield"
                  stroke="oklch(0.55 0.18 145)"
                  fill="url(#yieldGrad)"
                  strokeWidth={2}
                  name={t("analytics.actualYield")}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="oklch(0.72 0.18 75)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  name={t("analytics.target")}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Water Usage */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-600" />
              {t("analytics.waterUsage")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={waterData} barSize={days <= 7 ? 24 : 8}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.88 0.025 130)"
                />
                <XAxis
                  dataKey="date"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  interval={interval}
                />
                <YAxis
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [`${v} L`, t("analytics.water")]}
                />
                <Bar
                  dataKey="usage"
                  fill="oklch(0.55 0.18 195)"
                  radius={[4, 4, 0, 0]}
                  name={t("analytics.waterUsage")}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temperature & Humidity */}
        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-600" />
              {t("analytics.tempHumidity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={tempHumidData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.88 0.025 130)"
                />
                <XAxis
                  dataKey="date"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  interval={interval}
                />
                <YAxis
                  yAxisId="temp"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <YAxis
                  yAxisId="humid"
                  orientation="right"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  stroke="oklch(0.65 0.18 35)"
                  strokeWidth={2}
                  name={t("analytics.tempC")}
                  dot={false}
                />
                <Line
                  yAxisId="humid"
                  type="monotone"
                  dataKey="humidity"
                  stroke="oklch(0.55 0.18 195)"
                  strokeWidth={2}
                  name={t("analytics.humidityPct")}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Zone Performance */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              {t("analytics.zonePerformance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ZONE_PERFORMANCE.map((z) => (
                <div key={z.zone}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                      {z.zone}
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      {z.score}%
                    </p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${z.score}%`,
                        opacity: (z.score / 100) * 0.7 + 0.3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  color: string;
  bg?: string;
}) {
  return (
    <Card className="shadow-card border-border">
      <CardContent className="pt-4 pb-3">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className={`text-2xl font-display font-bold mt-0.5 ${color}`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

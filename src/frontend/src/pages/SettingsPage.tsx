import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Database,
  Download,
  Loader2,
  Mail,
  MapPin,
  Save,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useInitializeSeedData,
  useSaveUserProfile,
  useUserProfile,
} from "../hooks/useQueries";

export default function SettingsPage() {
  const { data: profile } = useUserProfile();
  const saveProfile = useSaveUserProfile();
  const initSeed = useInitializeSeedData();
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    farmName: "GreenField Farm",
    name: "John Anderson",
    email: "john@greenfieldfarm.com",
    location: "Central Valley, CA",
    totalArea: "52.9",
  });

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    weeklyReports: true,
    irrigationReminders: false,
    weatherAlerts: true,
  });

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        farmName: profile.farmName || prev.farmName,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
      }));
    }
  }, [profile]);

  async function handleSave() {
    try {
      await saveProfile.mutateAsync({
        farmName: form.farmName,
        name: form.name,
        email: form.email,
      });
      toast.success(t("settings.saveProfile"));
    } catch {
      toast.error("Failed to save profile");
    }
  }

  async function handleInitData() {
    try {
      await initSeed.mutateAsync();
      toast.success(t("settings.initSampleData"));
    } catch {
      toast.error("Failed to initialize sample data");
    }
  }

  function handleExportData() {
    const exportData = {
      farmName: form.farmName,
      exportDate: new Date().toISOString(),
      profile: form,
      notifications,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.farmName.replace(/\s+/g, "_")}_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("settings.exportData"));
  }

  const isLoggedIn = loginStatus === "success" && !!identity;

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Account Section */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {t("settings.account")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoggedIn ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  {t("settings.loggedInAs")}
                </p>
                <p className="text-xs text-emerald-600 font-mono mt-0.5 truncate max-w-[280px]">
                  {identity.getPrincipal().toString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
                {t("settings.logout")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("settings.notLoggedIn")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("settings.loginToSave")}
                </p>
              </div>
              <Button
                size="sm"
                onClick={login}
                disabled={loginStatus === "logging-in"}
                className="bg-primary text-primary-foreground text-xs"
              >
                {loginStatus === "logging-in" ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : null}
                {t("settings.login")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Farm Profile */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {t("settings.farmProfile")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="farm-name">{t("settings.farmName")}</Label>
              <Input
                id="farm-name"
                value={form.farmName}
                onChange={(e) => setForm({ ...form, farmName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="owner-name">{t("settings.ownerName")}</Label>
              <Input
                id="owner-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {t("settings.email")}
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">{t("settings.location")}</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">{t("settings.totalArea")}</Label>
              <Input
                id="area"
                type="number"
                value={form.totalArea}
                onChange={(e) =>
                  setForm({ ...form, totalArea: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              data-ocid="settings.save.submit_button"
              onClick={handleSave}
              disabled={saveProfile.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saveProfile.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saveProfile.isPending
                ? t("settings.saving")
                : t("settings.saveProfile")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            {t("settings.notifications")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotifToggle
            id="critical"
            label={t("settings.criticalAlerts")}
            description={t("settings.criticalAlertsDesc")}
            checked={notifications.criticalAlerts}
            onChange={(v) =>
              setNotifications({ ...notifications, criticalAlerts: v })
            }
          />
          <Separator />
          <NotifToggle
            id="weekly"
            label={t("settings.weeklyReports")}
            description={t("settings.weeklyReportsDesc")}
            checked={notifications.weeklyReports}
            onChange={(v) =>
              setNotifications({ ...notifications, weeklyReports: v })
            }
          />
          <Separator />
          <NotifToggle
            id="irrigation"
            label={t("settings.irrigationReminders")}
            description={t("settings.irrigationRemindersDesc")}
            checked={notifications.irrigationReminders}
            onChange={(v) =>
              setNotifications({ ...notifications, irrigationReminders: v })
            }
          />
          <Separator />
          <NotifToggle
            id="weather"
            label={t("settings.weatherAlerts")}
            description={t("settings.weatherAlertsDesc")}
            checked={notifications.weatherAlerts}
            onChange={(v) =>
              setNotifications({ ...notifications, weatherAlerts: v })
            }
          />
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            {t("settings.dataManagement")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("settings.exportData")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("settings.exportDataDesc")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="flex-shrink-0 border-border gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              {t("settings.export")}
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("settings.initSampleData")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("settings.initSampleDataDesc")}
              </p>
            </div>
            <Button
              data-ocid="settings.init_data.button"
              variant="outline"
              size="sm"
              onClick={handleInitData}
              disabled={initSeed.isPending}
              className="flex-shrink-0 border-border gap-2"
            >
              {initSeed.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              {t("settings.initialize")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

function NotifToggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="flex-shrink-0"
      />
    </div>
  );
}

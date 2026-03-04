import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronRight,
  Droplets,
  LayoutDashboard,
  Leaf,
  Map as MapIcon,
  Settings,
  Sprout,
} from "lucide-react";
import type { PageId } from "../App";
import { useLanguage } from "../contexts/LanguageContext";

interface NavItem {
  id: PageId;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { id: "fields", labelKey: "nav.fields", icon: MapIcon },
  { id: "crops", labelKey: "nav.crops", icon: Sprout },
  { id: "irrigation", labelKey: "nav.irrigation", icon: Droplets },
  { id: "sensors", labelKey: "nav.sensors", icon: Activity },
  { id: "alerts", labelKey: "nav.alerts", icon: Bell, badge: 3 },
  { id: "analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { id: "settings", labelKey: "nav.settings", icon: Settings },
];

interface Props {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function AppSidebar({ currentPage, onNavigate }: Props) {
  const { t, lang, setLang } = useLanguage();

  return (
    <aside className="sidebar-gradient w-64 flex-shrink-0 flex flex-col h-screen shadow-sidebar">
      {/* Logo / Farm Header */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-lime-400/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-lime-400" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sidebar-foreground text-sm leading-tight truncate">
              GreenField Farm
            </p>
            <p className="text-xs text-sidebar-foreground/50 leading-tight">
              {lang === "ta" ? "விவசாய மேலாண்மை" : "Smart Agriculture"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 scrollbar-thin overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          {t("nav.management")}
        </p>
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <NavButton
            key={item.id}
            item={item}
            label={t(item.labelKey)}
            isActive={currentPage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}

        <p className="px-3 mt-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          {t("nav.monitoring")}
        </p>
        {NAV_ITEMS.slice(5).map((item) => (
          <NavButton
            key={item.id}
            item={item}
            label={t(item.labelKey)}
            isActive={currentPage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      {/* Language Toggle */}
      <div className="px-5 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/40 font-semibold uppercase tracking-widest mb-2">
          {t("nav.language")}
        </p>
        <div
          data-ocid="sidebar.language.toggle"
          className="flex items-center gap-1 bg-sidebar-accent/30 rounded-full p-1"
        >
          <button
            type="button"
            onClick={() => setLang("en")}
            className={cn(
              "flex-1 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 text-center",
              lang === "en"
                ? "bg-lime-400 text-forest-900 shadow-sm"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("ta")}
            className={cn(
              "flex-1 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 text-center",
              lang === "ta"
                ? "bg-lime-400 text-forest-900 shadow-sm"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
            )}
          >
            தமிழ்
          </button>
        </div>
      </div>

      {/* Bottom status */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-lime-400">GF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {t("nav.farmManager")}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50">
              {t("nav.systemActive")}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

function NavButton({
  item,
  label,
  isActive,
  onClick,
}: {
  item: NavItem;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      data-ocid={`nav.${item.id}.link`}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isActive
          ? "bg-lime-400/15 text-lime-400 shadow-sm"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
      )}
    >
      <Icon
        className={cn(
          "w-4.5 h-4.5 flex-shrink-0",
          isActive ? "text-lime-400" : "text-sidebar-foreground/60",
        )}
      />
      <span className="flex-1 text-left">{label}</span>
      {item.badge && item.badge > 0 ? (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
          {item.badge}
        </span>
      ) : null}
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 text-lime-400/60 flex-shrink-0" />
      )}
    </button>
  );
}

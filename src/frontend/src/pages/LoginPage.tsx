import { cn } from "@/lib/utils";
import { Leaf, Loader2, LogIn, Users } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  onLogin: () => void;
  onGuestLogin: () => void;
}

export default function LoginPage({ onLogin: _onLogin, onGuestLogin }: Props) {
  const { login, loginStatus } = useInternetIdentity();
  const { lang, setLang, t } = useLanguage();

  const isLoggingIn = loginStatus === "logging-in";

  function handleLogin() {
    login();
  }

  return (
    <div className="min-h-screen bg-login-bg flex flex-col relative overflow-hidden">
      {/* Background decorative elements — blurs disabled while II popup is open to prevent GPU flicker */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Radial glow top-left */}
        <div
          className={cn(
            "absolute -top-32 -left-32 w-96 h-96 rounded-full bg-lime-400/10",
            !isLoggingIn && "blur-3xl",
          )}
        />
        {/* Radial glow bottom-right */}
        <div
          className={cn(
            "absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/10",
            !isLoggingIn && "blur-3xl",
          )}
        />
        {/* Diagonal lines pattern */}
        <svg
          role="presentation"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="diag"
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                stroke="#a3e635"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>
        {/* Floating leaf shapes */}
        <svg
          role="presentation"
          aria-hidden="true"
          className="absolute top-16 right-16 w-64 h-64 text-lime-400/8 fill-current"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M100 10 C140 10, 190 60, 190 100 C190 140, 140 190, 100 190 C60 190, 10 140, 10 100 C10 60, 60 10, 100 10 Z" />
        </svg>
        <svg
          role="presentation"
          aria-hidden="true"
          className="absolute bottom-24 left-12 w-48 h-48 text-emerald-400/6 fill-current rotate-45"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="100" cy="100" rx="80" ry="50" />
        </svg>
      </div>

      {/* Language Toggle — top right */}
      <header className="relative z-10 flex justify-end p-6">
        <div
          data-ocid="login.language.toggle"
          className={cn(
            "flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/20",
            !isLoggingIn && "backdrop-blur-sm",
          )}
        >
          <button
            type="button"
            onClick={() => setLang("en")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
              lang === "en"
                ? "bg-lime-400 text-forest-900 shadow-sm"
                : "text-white/70 hover:text-white",
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("ta")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
              lang === "ta"
                ? "bg-lime-400 text-forest-900 shadow-sm"
                : "text-white/70 hover:text-white",
            )}
          >
            தமிழ்
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Card — backdrop-blur disabled while II popup open to prevent GPU compositing flicker */}
          <div
            className={cn(
              "bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl",
              !isLoggingIn && "backdrop-blur-md",
            )}
          >
            {/* Logo & App name */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center mb-5 shadow-lg">
                <Leaf className="w-10 h-10 text-lime-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white text-center leading-tight">
                {t("login.appName")}
              </h1>
              <p className="text-white/60 text-sm mt-1 font-medium">
                {t("login.appNameSub")}
              </p>
            </div>

            {/* Welcome heading */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-white">
                {t("login.welcome")}
              </h2>
              <p className="text-white/60 text-sm mt-2">{t("login.tagline")}</p>
            </div>

            {/* Login section */}
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-lime-300 uppercase tracking-widest mb-6">
                {t("login.farmerLogin")}
              </p>

              {/* Internet Identity button */}
              <button
                type="button"
                data-ocid="login.identity.button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={cn(
                  "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl",
                  "bg-lime-400 text-forest-900 font-semibold text-base",
                  "hover:bg-lime-300 active:bg-lime-500",
                  "transition-all duration-200 shadow-lg hover:shadow-xl",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "min-h-[56px]",
                )}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2
                      data-ocid="login.loading_state"
                      className="w-5 h-5 animate-spin"
                    />
                    <span>{t("login.signingIn")}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>{t("login.enterWithII")}</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-xs text-white/40 font-medium">
                  {lang === "ta" ? "அல்லது" : "or"}
                </span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Guest button */}
              <button
                type="button"
                data-ocid="login.guest.button"
                onClick={onGuestLogin}
                className={cn(
                  "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl",
                  "bg-white/10 text-white font-semibold text-base border border-white/20",
                  "hover:bg-white/20 active:bg-white/30",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  "min-h-[56px]",
                )}
              >
                <Users className="w-5 h-5 text-white/70" />
                <span>{t("login.guestContinue")}</span>
              </button>
            </div>

            {/* Feature hints */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                {
                  icon: "🌱",
                  en: "Crop Tracking",
                  ta: "பயிர் கண்காணிப்பு",
                },
                {
                  icon: "💧",
                  en: "Smart Irrigation",
                  ta: "நுண்ணிய நீர்ப்பாசனம்",
                },
                { icon: "📊", en: "Analytics", ta: "பகுப்பாய்வு" },
              ].map((f) => (
                <div
                  key={f.icon}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white/5 rounded-xl border border-white/10 text-center"
                >
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-[10px] text-white/60 font-medium leading-tight">
                    {lang === "ta" ? f.ta : f.en}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-white/30 mt-6">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              {lang === "ta"
                ? "caffeine.ai மூலம் உருவாக்கப்பட்டது"
                : "Built with ❤️ using caffeine.ai"}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

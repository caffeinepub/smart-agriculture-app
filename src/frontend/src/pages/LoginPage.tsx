import { cn } from "@/lib/utils";
import { Eye, EyeOff, Leaf, Loader2, LogIn, Users } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  onLogin: (email: string, password: string) => void;
  onGuestLogin: () => void;
}

export default function LoginPage({ onLogin, onGuestLogin }: Props) {
  const { lang, setLang } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter email and password / மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்",
      );
      return;
    }

    setIsLoggingIn(true);
    // Simulate a brief loading state before navigating
    setTimeout(() => {
      setIsLoggingIn(false);
      onLogin(email, password);
    }, 600);
  }

  return (
    <div className="min-h-screen bg-login-bg flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Radial glow top-left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-lime-400/10 blur-3xl" />
        {/* Radial glow bottom-right */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
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
        <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/20 backdrop-blur-sm">
          <button
            type="button"
            data-ocid="login.language.en.toggle"
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
            data-ocid="login.language.ta.toggle"
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
          {/* Card */}
          <div className="bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            {/* Logo & App name — always bilingual */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center mb-5 shadow-lg">
                <Leaf className="w-10 h-10 text-lime-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white text-center leading-tight">
                Smart Agriculture
              </h1>
              <p className="text-lime-300/80 text-sm mt-0.5 font-medium">
                விவசாய மேலாண்மை
              </p>
            </div>

            {/* Welcome heading — always bilingual */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-white leading-tight">
                Welcome
                <span className="text-white/50 mx-2">/</span>
                <span className="text-lime-300">வரவேற்கிறோம்</span>
              </h2>
              <p className="text-white/50 text-xs mt-2 font-medium">
                Smart farming decisions, powered by data
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                தரவால் இயக்கப்படும் புத்திசாலித்தனமான விவசாய முடிவுகள்
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Farmer Login label — bilingual */}
              <p className="text-center text-xs font-semibold text-lime-300/80 uppercase tracking-widest mb-2">
                Farmer Login{" "}
                <span className="text-lime-300/50 normal-case tracking-normal">
                  | விவசாயி உள்நுழைவு
                </span>
              </p>

              {/* Email input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  {lang === "ta" ? "மின்னஞ்சல்" : "Email"}
                </label>
                <input
                  id="login-email"
                  type="email"
                  data-ocid="login.email.input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder={
                    lang === "ta"
                      ? "உங்கள் மின்னஞ்சலை உள்ளிடவும்"
                      : "Enter your email"
                  }
                  autoComplete="email"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl",
                    "bg-white/10 border border-white/20 text-white placeholder:text-white/40",
                    "text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-lime-400/60 focus:border-lime-400/60",
                    "transition-all duration-200",
                    error && "border-red-400/60 focus:ring-red-400/40",
                  )}
                />
              </div>

              {/* Password input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  {lang === "ta" ? "கடவுச்சொல்" : "Password"}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    data-ocid="login.password.input"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder={
                      lang === "ta"
                        ? "உங்கள் கடவுச்சொல்லை உள்ளிடவும்"
                        : "Enter your password"
                    }
                    autoComplete="current-password"
                    className={cn(
                      "w-full px-4 py-3 pr-12 rounded-xl",
                      "bg-white/10 border border-white/20 text-white placeholder:text-white/40",
                      "text-sm font-medium",
                      "focus:outline-none focus:ring-2 focus:ring-lime-400/60 focus:border-lime-400/60",
                      "transition-all duration-200",
                      error && "border-red-400/60 focus:ring-red-400/40",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  data-ocid="login.error_state"
                  className="flex items-start gap-2 px-4 py-3 bg-red-500/15 border border-red-400/30 rounded-xl text-red-300 text-xs font-medium"
                  role="alert"
                >
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Login submit button */}
              <button
                type="submit"
                data-ocid="login.submit.button"
                disabled={isLoggingIn}
                className={cn(
                  "w-full flex flex-col items-center justify-center gap-1 px-6 py-4 rounded-2xl",
                  "bg-lime-400 text-forest-900 font-semibold",
                  "hover:bg-lime-300 active:bg-lime-500",
                  "transition-all duration-200 shadow-lg hover:shadow-xl",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "min-h-[60px]",
                )}
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-3">
                    <Loader2
                      data-ocid="login.loading_state"
                      className="w-5 h-5 animate-spin"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-base leading-tight">
                        Signing in...
                      </span>
                      <span className="text-xs opacity-70 font-normal">
                        உள்நுழைகிறது...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <LogIn className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="text-base leading-tight">
                        Login / உள்நுழை
                      </span>
                      <span className="text-xs opacity-70 font-normal">
                        உங்கள் கணக்கில் நுழைக
                      </span>
                    </div>
                  </div>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-xs text-white/40 font-medium">
                  or · அல்லது
                </span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Guest button */}
              <button
                type="button"
                data-ocid="login.guest.button"
                onClick={onGuestLogin}
                className={cn(
                  "w-full flex flex-col items-center justify-center gap-1 px-6 py-4 rounded-2xl",
                  "bg-white/10 text-white font-semibold border border-white/20",
                  "hover:bg-white/20 active:bg-white/30",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  "min-h-[60px]",
                )}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-white/70 shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-base leading-tight">
                      Continue as Guest
                    </span>
                    <span className="text-xs opacity-50 font-normal">
                      விருந்தினராக தொடரவும்
                    </span>
                  </div>
                </div>
              </button>
            </form>

            {/* Feature hints — both languages stacked */}
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
                  className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl border border-white/10 text-center"
                >
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-[10px] text-white/70 font-medium leading-tight">
                    {f.en}
                  </span>
                  <span className="text-[9px] text-white/40 leading-tight">
                    {f.ta}
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
              Built with ❤️ using caffeine.ai
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

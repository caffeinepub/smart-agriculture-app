import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import translations, {
  type Lang,
  type TranslationKey,
} from "../lib/translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey | string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "agri_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "ta") return stored;
    } catch {
      // ignore
    }
    return "en";
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey | string): string => {
      const dict = translations[lang] as Record<string, string>;
      return (
        dict[key] ?? (translations.en as Record<string, string>)[key] ?? key
      );
    },
    [lang],
  );

  // Sync lang attribute on html element for font rendering
  useEffect(() => {
    document.documentElement.lang = lang === "ta" ? "ta" : "en";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

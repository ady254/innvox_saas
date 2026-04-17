"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fetchClientConfig, ClientConfig } from "@/lib/api";
import { Languages, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "Hindi (हिंदी)", flag: "🇮🇳" },
  { code: "ur", label: "Urdu (اردو)", flag: "🇵🇰" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [config, setConfig] = useState<ClientConfig | null>(null);

  useEffect(() => {
    fetchClientConfig().then(setConfig).catch(console.error);
    
    // Set initial dir
    const dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
  }, [i18n.language]);

  const allowedCodes = config?.allowed_languages || ["en", "hi", "ur"];
  const visibleLanguages = LANGUAGES.filter((l) => allowedCodes.includes(l.code));

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    const dir = code === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
  };

  const currentLang = LANGUAGES.find((l) => l.code === (i18n.language.split('-')[0])) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-auto gap-2 px-3 border border-white/10 hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300">
          <Languages className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline-block">{currentLang.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 min-w-[140px] p-1 animate-in fade-in zoom-in-95 duration-200">
        {visibleLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-md cursor-pointer transition-colors",
              i18n.language.startsWith(lang.code) ? "bg-brand/10 text-brand" : "hover:bg-white/5 active:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
               <span className="text-base leading-none">{lang.flag}</span>
               <span>{lang.label}</span>
            </div>
            {i18n.language.startsWith(lang.code) && <Check className="h-3 w-3" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

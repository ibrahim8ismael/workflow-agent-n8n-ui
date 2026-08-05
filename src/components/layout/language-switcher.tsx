"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/i18n/language";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobeIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = "ghost",
  size = "sm",
  showLabel = true,
  className,
}: LanguageSwitcherProps) {
  const { language, changeLanguage } = useLanguage();

  const currentLang = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={false}
        render={
          <Button
            variant={variant}
            size={size}
            className={cn("gap-2 font-medium text-xs sm:text-sm", className)}
          />
        }
      >
        <GlobeIcon className="h-4 w-4 text-muted-foreground" />
        {showLabel && <span>{currentLang.nativeName}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code as LanguageCode)}
            className="flex items-center justify-between text-xs py-2 cursor-pointer font-medium"
          >
            <span className="flex items-center gap-2">
              <span className="font-semibold">{lang.code === "en" ? "EN" : "AR"}</span>
              <span>{lang.nativeName}</span>
            </span>
            {language === lang.code && (
              <CheckIcon className="h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

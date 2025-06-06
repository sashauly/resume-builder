"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useMobile } from "@/hooks/use-mobile";

export function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isMobile = useMobile();

  // Only show on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="grid grid-cols-3 h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center ${
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">{t("nav.home")}</span>
        </Link>
        <Link
          href="/builder"
          className={`flex flex-col items-center justify-center ${
            pathname === "/builder" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">{t("nav.builder")}</span>
        </Link>
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center ${
            pathname === "/settings" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">{t("nav.settings")}</span>
        </Link>
      </div>
    </div>
  );
}

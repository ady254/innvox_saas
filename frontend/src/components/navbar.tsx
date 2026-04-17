"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { type Me, clearToken, fetchMe, getToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTenant } from "./tenant-provider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const { t } = useTranslation();
  const { client } = useTenant();
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const token = getToken();
    setAuthed(!!token);
    if (!token) {
      setMe(null);
      return;
    }
    fetchMe()
      .then(setMe)
      .catch(() => {
        setMe(null);
        setAuthed(false);
      });
  }, [pathname]);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-brand",
        pathname === href ? "text-brand" : "text-white/70"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            {client.logo ? (
              <img src={client.logo} alt={client.name} className="h-8 w-auto" />
            ) : (
              <span className="text-brand">{client.name || "Innvox"}</span>
            )}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLink("/", t("common.home") || "Home")}
            {navLink("/courses", t("common.courses") || "Courses")}
            {navLink("/about", t("common.about") || "About")}
            {navLink("/contact", t("common.contact") || "Contact")}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          
          {!authed ? (
            <>
              <Link href="/login" className="hidden text-sm font-medium text-white/70 hover:text-white sm:block">
                {t("common.login") || "Login"}
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-brand hover:brightness-110">
                  {t("common.enroll_now") || "Get Started"}
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white">
                {t("common.dashboard") || "Dashboard"}
              </Link>
              {me?.role === "admin" && (
                <Link href="/admin" className="text-sm font-medium text-brand hover:brightness-110">
                  {t("common.admin_panel") || "Admin Panel"}
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white"
                onClick={() => {
                  clearToken();
                  setAuthed(false);
                  router.push("/login");
                }}
              >
                {t("common.logout") || "Logout"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


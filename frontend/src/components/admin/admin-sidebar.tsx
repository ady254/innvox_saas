"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fetchClientConfig, ClientConfig } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Users,
  Megaphone
} from "lucide-react";

const items = [
  { href: "/admin", label: "common.dashboard", icon: LayoutDashboard, feature: "all" },
  { href: "/admin/add-course", label: "common.courses", icon: BookOpen, feature: "courses" },
  { href: "/admin/students", label: "common.students", icon: Users, feature: "all" },
  { href: "/admin/enrollments", label: "common.enrollments", icon: GraduationCap, feature: "all" },
  { href: "/admin/payments", label: "common.payments", icon: CreditCard, feature: "payments" },
  { href: "/admin/classes", label: "common.classes", icon: GraduationCap, feature: "classes" },
  { href: "/admin/results", label: "common.results", icon: BookOpen, feature: "results" },
  { href: "/admin/website-settings", label: "common.settings", icon: LayoutDashboard, feature: "all" },
  { href: "/admin/announcements", label: "common.announcements", icon: Megaphone, feature: "announcements" },
];

export function AdminSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [config, setConfig] = useState<ClientConfig | null>(null);

  useEffect(() => {
    fetchClientConfig().then(setConfig).catch(console.error);
  }, []);

  const activeFeatures = config?.active_features || [];
  const visibleItems = items.filter(item => 
    item.feature === "all" || activeFeatures.includes(item.feature)
  );

  let daysLeft = null;
  if (config?.expiry_date) {
    const timeDiff = new Date(config.expiry_date).getTime() - new Date().getTime();
    daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  return (
    <aside className="w-56 shrink-0 border-r border-white/10 pr-4 flex flex-col min-h-[calc(100vh-8rem)]">
      <div>
        <div className="mb-6 text-xs font-semibold uppercase tracking-wider text-white/40">
          {t("common.admin")}
        </div>
        <nav className="flex flex-col gap-1">
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {t(label)}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-8">
         {daysLeft !== null && daysLeft <= 7 && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 text-sm flex flex-col gap-2 shadow-lg">
               <span className="font-bold flex items-center gap-2">
                 <Megaphone className="h-4 w-4" /> 
                 {t("common.subscription_alert") || "Subscription Alert"}
               </span>
               {daysLeft > 0 ? (
                 <p className="text-white/70">
                    {t("common.expiry_warning", { days: daysLeft }) || `Your subscription expires in ${daysLeft} days.`}
                 </p>
               ) : (
                 <p className="text-white/70 font-bold">
                    {t("common.expired") || "Your subscription has expired!"}
                 </p>
               )}
            </div>
         )}
      </div>
    </aside>
  );
}

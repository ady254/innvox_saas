"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchClientConfig, ClientConfig } from "@/lib/api";
import { PlatformAnnouncements } from "@/components/PlatformAnnouncements";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle, 
  Users, 
  GraduationCap, 
  CreditCard, 
  BookOpen, 
  LayoutDashboard, 
  Megaphone,
  Inbox 
} from "lucide-react";

export default function AdminHomePage() {
  const [config, setConfig] = useState<ClientConfig | null>(null);

  useEffect(() => {
    fetchClientConfig().then(setConfig).catch(console.error);
  }, []);

  const activeFeatures = config?.active_features || [];

  const quickLinks = [
    {
      title: "Courses",
      description: "View, edit & manage all courses",
      href: "/admin/courses",
      icon: BookOpen,
      color: "text-brand",
      buttonVariant: "default" as const,
      feature: "all"
    },
    {
      title: "Add Course",
      description: "Create a new course listing",
      href: "/admin/add-course",
      icon: PlusCircle,
      buttonVariant: "secondary" as const,
      feature: "courses"
    },
    {
      title: "Students",
      description: "View all student accounts",
      href: "/admin/students",
      icon: Users,
      buttonVariant: "secondary" as const,
      feature: "all"
    },
    {
      title: "Enrollments",
      description: "Who enrolled in what",
      href: "/admin/enrollments",
      icon: GraduationCap,
      buttonVariant: "secondary" as const,
      feature: "all"
    },
    {
      title: "Payments",
      description: "Enrollment payment history",
      href: "/admin/payments",
      icon: CreditCard,
      buttonVariant: "secondary" as const,
      feature: "payments"
    },
    {
      title: "Classes",
      description: "Manage live class sessions",
      href: "/admin/classes",
      icon: GraduationCap,
      buttonVariant: "secondary" as const,
      feature: "classes"
    },
    {
      title: "Results",
      description: "Post and manage student results",
      href: "/admin/results",
      icon: BookOpen,
      buttonVariant: "secondary" as const,
      feature: "results"
    },
    {
      title: "Leads",
      description: "View contact form submissions",
      href: "/admin/leads",
      icon: Inbox,
      buttonVariant: "secondary" as const,
      feature: "all"
    },
    {
      title: "Website Settings",
      description: "Customize landing page content",
      href: "/admin/website-settings",
      icon: LayoutDashboard,
      buttonVariant: "secondary" as const,
      feature: "website_settings"
    },
    {
      title: "Announcements",
      description: "Broadcast updates & alerts",
      href: "/admin/announcements",
      icon: Megaphone,
      color: "text-brand",
      buttonVariant: "default" as const,
      feature: "announcements"
    },
  ];

  const visibleLinks = quickLinks.filter(link => 
    link.feature === "all" || activeFeatures.includes(link.feature)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Admin Dashboard</h1>
        <p className="text-white/60">
          Global management system for your educational platform.
        </p>
      </div>

      <PlatformAnnouncements />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visibleLinks.map((link) => (
          <Card key={link.href} className="border-white/10 bg-white/5 shadow-xl group hover:border-brand/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <link.icon className={`h-5 w-5 ${link.color || "text-white/40"} group-hover:scale-110 transition-transform`} />
              </div>
              <CardTitle className="text-lg">{link.title}</CardTitle>
              <CardDescription className="text-xs line-clamp-1">{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={link.href}>
                <Button 
                  size="sm" 
                  variant={link.buttonVariant} 
                  className={link.buttonVariant === "default" ? "bg-brand hover:brightness-110 w-full" : "w-full border-white/5 hover:bg-white/10"}
                >
                  Open {link.title.split(" ")[0]}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

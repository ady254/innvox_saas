import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle, 
  Users, 
  GraduationCap, 
  CreditCard, 
  BookOpen, 
  LayoutDashboard, 
  Megaphone 
} from "lucide-react";

export default function AdminHomePage() {
  const quickLinks = [
    {
      title: "Add course",
      description: "Create a new course listing",
      href: "/admin/add-course",
      icon: PlusCircle,
      color: "text-brand",
      buttonVariant: "default" as const
    },
    {
      title: "Students",
      description: "View all student accounts",
      href: "/admin/students",
      icon: Users,
      buttonVariant: "secondary" as const
    },
    {
      title: "Enrollments",
      description: "Who enrolled in what",
      href: "/admin/enrollments",
      icon: GraduationCap,
      buttonVariant: "secondary" as const
    },
    {
      title: "Payments",
      description: "Enrollment payment history",
      href: "/admin/payments",
      icon: CreditCard,
      buttonVariant: "secondary" as const
    },
    {
      title: "Classes",
      description: "Manage live class sessions",
      href: "/admin/classes",
      icon: GraduationCap,
      buttonVariant: "secondary" as const
    },
    {
      title: "Results",
      description: "Post and manage student results",
      href: "/admin/results",
      icon: BookOpen,
      buttonVariant: "secondary" as const
    },
    {
      title: "Website Settings",
      description: "Customize landing page content",
      href: "/admin/website-settings",
      icon: LayoutDashboard,
      buttonVariant: "secondary" as const
    },
    {
      title: "Announcements",
      description: "Broadcast updates & alerts",
      href: "/admin/announcements",
      icon: Megaphone,
      color: "text-brand",
      buttonVariant: "default" as const
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Admin Dashboard</h1>
        <p className="text-white/60">
          Global management system for your educational platform.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
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

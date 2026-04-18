"use client";

import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMyCourses, fetchStudentAnnouncements, type Announcement } from "@/lib/api";
import { Bell, Zap } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = React.useState<{ count: number; courses: any[] } | null>(null);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([
      fetchMyCourses(),
      fetchStudentAnnouncements()
    ])
      .then(([coursesData, announceData]) => {
        setData(coursesData);
        setAnnouncements(announceData);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load dashboard"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-semibold">Dashboard</h1>
           <p className="text-white/70">Your enrolled courses and latest updates.</p>
        </div>
        <Link href="/dashboard/certificates">
           <Button variant="outline" className="border-brand/30 text-brand hover:bg-brand/10">🎓 My Certificates</Button>
        </Link>
      </div>

      {/* Student Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand">
            <Bell className="h-4 w-4" />
            <span>Latest Updates</span>
          </div>
          <div className="flex flex-col gap-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`flex flex-col gap-1 rounded-xl border p-4 transition-all ${
                  a.priority === "high"
                    ? "border-orange-500/50 bg-orange-500/10 shadow-lg shadow-orange-500/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    {a.priority === "high" && <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />}
                    {a.title}
                  </h3>
                  <span className="text-[10px] text-white/30">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>}

      {!data ? (
        <div className="space-y-4">
          <p className="text-sm text-white/50 animate-pulse">Fetching your dashboard...</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter className="justify-end">
                  <Skeleton className="h-9 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : data.count === 0 ? (
        <Card className="border-dashed border-white/20 bg-transparent">
          <CardHeader className="text-center">
            <CardTitle>Welcome to your learning journey</CardTitle>
            <CardDescription>You haven&apos;t enrolled in any courses yet.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/courses">
              <Button className="bg-brand text-black">Browse Courses</Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {data.courses.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{c.title}</CardTitle>
                <CardDescription>₹{c.price}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-4 text-sm text-white/70">{c.description}</p>
              </CardContent>
              <CardFooter className="justify-end">
                <Link href={`/dashboard/courses/${c.id}`}>
                  <Button variant="secondary" size="sm" className="hover:bg-brand/10 hover:text-brand">
                    View Course
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


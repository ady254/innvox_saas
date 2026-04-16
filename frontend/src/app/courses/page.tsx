"use client";

import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Course, fetchCourses } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load courses"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Courses</h1>
        <p className="text-white/70">Browse and enroll using Razorpay checkout.</p>
      </div>

      {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>}

      {!courses ? (
        <div className="space-y-4">
          <p className="text-sm text-white/50 animate-pulse">Loading courses...</p>
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
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="justify-end">
                  <Skeleton className="h-9 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{c.title}</CardTitle>
                <CardDescription>₹{c.price}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-4 text-sm text-white/70">{c.description}</p>
              </CardContent>
              <CardFooter className="justify-end">
                {c.is_enrolled ? (
                  <Link href={`/dashboard/courses/${c.id}`}>
                    <Button size="sm" variant="secondary" className="bg-brand/20 text-brand hover:bg-brand/30">
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/checkout/${c.id}`}>
                    <Button size="sm">Enroll</Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


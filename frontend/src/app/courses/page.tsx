"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Course, fetchCourses, studentEnrollFreeCourse } from "@/lib/api";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  React.useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load courses"));
  }, []);

  const handleFreeEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    setError(null);
    try {
      await studentEnrollFreeCourse(courseId);
      // Update local state instead of hard reload to feel instantaneous
      setCourses((prev) => 
         prev ? prev.map(c => c.id === courseId ? { ...c, is_enrolled: true } : c) : []
      );
      router.push(`/dashboard/courses/${courseId}`);
    } catch (e: unknown) {
       setError(e instanceof Error ? e.message : "Failed to enroll. You might need to log in first.");
    } finally {
       setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Courses</h1>
        <p className="text-white/70">Browse and enroll to start your learning journey.</p>
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
            <Card key={c.id} className="flex flex-col flex-grow relative overflow-hidden group">
              {c.cover_image_url && (
                <div className="w-full h-32 bg-white/5">
                  <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover rounded-t-lg transition-transform group-hover:scale-105" />
                </div>
              )}
              {c.level && (
                 <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-black/60 text-white backdrop-blur-md">
                   {c.level}
                 </span>
              )}
              <CardHeader>
                <CardTitle>{c.title}</CardTitle>
                <CardDescription className="text-brand font-semibold text-base mt-1">
                   {c.is_free ? "Free" : `${c.currency === 'USD' ? '$' : '₹'}${c.price}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="line-clamp-4 text-sm text-white/70">{c.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-white/40 font-medium">
                  {c.duration && <span>⏱ {c.duration}</span>}
                  {c.instructor_name && <span>👤 {c.instructor_name}</span>}
                   {c.has_certificate && <span className="text-emerald-400">🎓 Certifiable</span>}
                </div>
              </CardContent>
              <CardFooter className="justify-end bg-white/5 border-t border-white/10 pt-4">
                {c.is_enrolled ? (
                  <Link href={`/dashboard/courses/${c.id}`} className="w-full">
                    <Button size="sm" variant="secondary" className="w-full bg-brand/20 text-brand hover:bg-brand/30">
                      Continue Learning
                    </Button>
                  </Link>
                ) : c.is_free ? (
                   <Button size="sm" className="w-full" onClick={() => handleFreeEnroll(c.id)} disabled={enrollingId === c.id}>
                      {enrollingId === c.id ? "Enrolling..." : "Enroll for Free"}
                   </Button>
                ) : (
                  <Link href={`/checkout/${c.id}`} className="w-full">
                    <Button size="sm" className="w-full">Buy Course</Button>
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


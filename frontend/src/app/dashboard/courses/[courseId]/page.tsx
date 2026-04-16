"use client";

import React, { useEffect, useState } from "react";
import { studentGetClasses, studentGetMyResults, fetchCourses, ClassSession, Result, Course } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { use } from "react";
import Link from "next/link";

export default function StudentCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId: courseIdParam } = use(params);
  const courseId = Number(courseIdParam);

  const [course, setCourse] = useState<Course | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    Promise.all([
      fetchCourses(), // Just to get course details, might be inefficient but works
      studentGetClasses(courseId),
      studentGetMyResults()
    ]).then(([coursesData, classesData, resultsData]) => {
      const c = coursesData.find((crs) => crs.id === courseId);
      if (c) setCourse(c);
      
      setClasses(classesData.classes);
      
      const res = resultsData.results.find((r) => r.course_id === courseId);
      if (res) setResult(res);
      
      setLoading(false);
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to load course details. Make sure you are enrolled.");
      setLoading(false);
    });

  }, [courseId]);

  if (loading) {
    return <div className="text-white/60">Loading...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-500">
          {error}
        </div>
        <Link href="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{course?.title || "Course Details"}</h1>
        <p className="text-white/60">Course Workspace - Classes & Results</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Classes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Live Sessions</CardTitle>
            <CardDescription>Join your scheduled live classes below.</CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-white/50">No classes have been scheduled yet.</p>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4 bg-white/5 border border-white/10 rounded-md flex flex-col justify-between items-start gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-medium text-white">{cls.title}</h4>
                      <p className="text-xs text-white/60 mt-1">{new Date(cls.date_time).toLocaleString()}</p>
                    </div>
                    <a href={cls.meeting_link} target="_blank" rel="noreferrer">
                      <Button size="sm">Join Class</Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
            <CardDescription>Academic performance for this course.</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-sm text-white/50">Results have not been published yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm text-white/70">Marks</span>
                  <span className="font-semibold text-white">{result.marks}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm text-white/70">Grade</span>
                  {result.grade ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                      {result.grade}
                    </span>
                  ) : (
                    <span className="text-sm text-white/50">-</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-white/70">Remarks</span>
                  <span className="text-sm text-white/90">{result.remarks || "-"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

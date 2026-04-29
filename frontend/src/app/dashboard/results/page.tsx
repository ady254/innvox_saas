"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { studentGetMyResults, fetchCourses, type Result, type Course } from "@/lib/api";
import { Trophy, TrendingUp, Award, FileText } from "lucide-react";

export default function MyResultsPage() {
  const [results, setResults] = useState<Result[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      studentGetMyResults().then(res => setResults(res.results)),
      fetchCourses().then(res => setCourses(res))
    ]).catch(e => setError(e instanceof Error ? e.message : "Failed to load results"));
  }, []);

  const getCourseName = (courseId: number) =>
    courses.find(c => c.id === courseId)?.title || `Course #${courseId}`;

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "text-white/60";
    const g = grade.toUpperCase();
    if (g === "A+" || g === "A") return "text-emerald-400";
    if (g === "B+" || g === "B") return "text-blue-400";
    if (g === "C+" || g === "C") return "text-yellow-400";
    return "text-orange-400";
  };

  const getMarksBg = (marks: number) => {
    if (marks >= 90) return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30";
    if (marks >= 75) return "from-blue-500/20 to-blue-500/5 border-blue-500/30";
    if (marks >= 60) return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
    return "from-orange-500/20 to-orange-500/5 border-orange-500/30";
  };

  // Compute summary stats
  const avgMarks = results && results.length > 0
    ? (results.reduce((sum, r) => sum + r.marks, 0) / results.length).toFixed(1)
    : null;

  const topMarks = results && results.length > 0
    ? Math.max(...results.map(r => r.marks))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Results</h1>
        <p className="text-white/70">View your grades and marks across all courses.</p>
      </div>

      {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>}

      {!results ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <Card className="border-white/10 bg-white/5 py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-white/5 p-4">
              <FileText className="w-8 h-8 text-white/30" />
            </div>
            <div>
              <h2 className="text-lg font-medium">No results yet</h2>
              <p className="text-sm text-white/50">Your results will appear here once your instructors publish them.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-full bg-brand/10 p-2.5">
                <Trophy className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase font-semibold">Total Results</p>
                <p className="text-xl font-bold">{results.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-full bg-blue-500/10 p-2.5">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase font-semibold">Average Marks</p>
                <p className="text-xl font-bold">{avgMarks}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-full bg-emerald-500/10 p-2.5">
                <Award className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase font-semibold">Highest Score</p>
                <p className="text-xl font-bold">{topMarks}%</p>
              </div>
            </div>
          </div>

          {/* Results Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map(result => (
              <Card
                key={result.id}
                className={`relative overflow-hidden bg-gradient-to-br ${getMarksBg(result.marks)} shadow-lg`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
                <CardHeader className="relative z-10 pb-2">
                  <CardDescription className="text-white/60 text-xs uppercase font-semibold tracking-wider">
                    {new Date(result.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </CardDescription>
                  <CardTitle className="text-lg leading-snug">{getCourseName(result.course_id)}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-white/50 mb-0.5">Marks</p>
                      <p className="text-3xl font-bold tabular-nums">{result.marks}<span className="text-base text-white/40">%</span></p>
                    </div>
                    {result.grade && (
                      <div className="text-right">
                        <p className="text-xs text-white/50 mb-0.5">Grade</p>
                        <p className={`text-2xl font-bold ${getGradeColor(result.grade)}`}>{result.grade}</p>
                      </div>
                    )}
                  </div>
                  {result.remarks && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-white/50 mb-1">Remarks</p>
                      <p className="text-sm text-white/80 leading-relaxed">{result.remarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

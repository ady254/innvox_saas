"use client";

import React, { useEffect, useState } from "react";
import { fetchCourses, adminGetEnrolledStudents, adminCreateResult, adminGetResults, Course, Result } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminResultsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  
  const [students, setStudents] = useState<{ id: number; name: string; email: string }[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [marks, setMarks] = useState("");
  const [grade, setGrade] = useState("");
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const loadCourseData = async (courseId: number) => {
    setSelectedCourseId(courseId);
    setSelectedStudentId(null);
    setLoading(true);
    setFormError(null);
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        adminGetEnrolledStudents(courseId),
        adminGetResults(courseId)
      ]);
      setStudents(studentsRes.students);
      setResults(resultsRes.results);
    } catch (e) {
      console.error(e);
      setFormError("Failed to fetch course data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedStudentId) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await adminCreateResult({
        course_id: selectedCourseId,
        user_id: selectedStudentId,
        marks: Number(marks),
        grade: grade || null,
        remarks: remarks || null
      });
      setMarks("");
      setGrade("");
      setRemarks("");
      setSelectedStudentId(null);
      await loadCourseData(selectedCourseId);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create result.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Manage Results</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-sm text-white/60">No courses available.</p>
            ) : (
              <select
                className="w-full flex h-10 rounded-md border border-white/20 bg-background px-3 py-2 text-sm"
                value={selectedCourseId || ""}
                onChange={(e) => loadCourseData(Number(e.target.value))}
              >
                <option value="" disabled>Select a course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        {selectedCourseId && (
          <Card>
            <CardHeader>
              <CardTitle>Add Student Result</CardTitle>
              <CardDescription>Only students enrolled in this course are shown.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="text-xs text-white/70 mb-1 block">Student</label>
                  <select
                    className="w-full flex h-10 rounded-md border border-white/20 bg-background px-3 py-2 text-sm"
                    value={selectedStudentId || ""}
                    onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                    required
                  >
                    <option value="" disabled>Select a student...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/70 mb-1 block">Marks</label>
                  <Input value={marks} onChange={(e) => setMarks(e.target.value)} required type="number" min="0" step="0.01" placeholder="e.g. 85.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/70 mb-1 block">Grade (Optional)</label>
                    <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. A+" />
                  </div>
                  <div>
                    <label className="text-xs text-white/70 mb-1 block">Remarks (Optional)</label>
                    <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Excellent" />
                  </div>
                </div>
                <Button type="submit" disabled={formLoading} className="w-full">
                  {formLoading ? "Saving..." : "Save Result"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedCourseId && (
        <Card>
          <CardHeader>
            <CardTitle>Student Results</CardTitle>
            <CardDescription>Results recorded for this course.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : results.length === 0 ? (
              <p className="text-white/60 text-sm">No results uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-xs uppercase text-white/70">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3 text-right">Marks</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                      <th className="px-4 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {results.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium">{r.student_name}</td>
                        <td className="px-4 py-3 text-white/60">{r.student_email}</td>
                        <td className="px-4 py-3 text-right">{r.marks}</td>
                        <td className="px-4 py-3 text-center">
                          {r.grade ? (
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">{r.grade}</span>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-white/60">{r.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

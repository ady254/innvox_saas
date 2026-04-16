"use client";

import React, { useEffect, useState } from "react";
import { fetchCourses, adminGetClasses, adminCreateClass, Course, ClassSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminClassesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const loadClasses = async (courseId: number) => {
    setSelectedCourseId(courseId);
    setLoading(true);
    try {
      const res = await adminGetClasses(courseId);
      setClasses(res.classes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setFormLoading(true);
    setFormError(null);
    try {
      // Ensure datetime string is complete timestamp including timezone or adjust appropriately
      const dt = new Date(dateTime).toISOString();
      await adminCreateClass({
        title,
        meeting_link: meetingLink,
        date_time: dt,
        course_id: selectedCourseId,
      });
      setTitle("");
      setMeetingLink("");
      setDateTime("");
      await loadClasses(selectedCourseId);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create class.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Manage Classes</h1>

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
                onChange={(e) => loadClasses(Number(e.target.value))}
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
              <CardTitle>Add New Class</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="text-xs text-white/70 mb-1 block">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Lesson 1: Basics" />
                </div>
                <div>
                  <label className="text-xs text-white/70 mb-1 block">Meeting Link</label>
                  <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} required type="url" placeholder="https://meet.google.com/..." />
                </div>
                <div>
                  <label className="text-xs text-white/70 mb-1 block">Date & Time</label>
                  <Input value={dateTime} onChange={(e) => setDateTime(e.target.value)} required type="datetime-local" />
                </div>
                <Button type="submit" disabled={formLoading} className="w-full">
                  {formLoading ? "Creating..." : "Create Class"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedCourseId && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Classes</CardTitle>
            <CardDescription>All live sessions for this course.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : classes.length === 0 ? (
              <p className="text-white/60 text-sm">No classes scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4 border border-white/10 rounded-md bg-white/5 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-sm text-white">{cls.title}</h4>
                      <p className="text-xs text-white/60 mt-1">{new Date(cls.date_time).toLocaleString()}</p>
                    </div>
                    <a href={cls.meeting_link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                      Join Link
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

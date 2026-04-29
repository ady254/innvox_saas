"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  adminListCourses,
  adminUpdateCourse,
  adminDeleteCourse,
  fetchClientConfig,
  ClientConfig,
  type Course,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Loader2,
  BookOpen,
  Clock,
  Award,
  User,
  Save,
} from "lucide-react";

type CourseWithDate = Course & { created_at?: string };

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseWithDate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ClientConfig | null>(null);

  // Edit modal state
  const [editCourse, setEditCourse] = useState<CourseWithDate | null>(null);
  const [editForm, setEditForm] = useState<Partial<Course>>({});
  const [saving, setSaving] = useState(false);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();
    fetchClientConfig().then(setConfig).catch(console.error);
  }, []);

  const loadCourses = async () => {
    try {
      const data = await adminListCourses();
      setCourses(data.courses);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
    }
  };

  const openEdit = (course: CourseWithDate) => {
    setEditCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      price: course.price,
      is_free: course.is_free,
      cover_image_url: course.cover_image_url || "",
      currency: course.currency || "INR",
      duration: course.duration || "",
      level: course.level || "beginner",
      instructor_name: course.instructor_name || "",
      type: course.type || "self-paced",
      has_certificate: course.has_certificate || false,
    });
  };

  const handleSave = async () => {
    if (!editCourse) return;
    setSaving(true);
    try {
      await adminUpdateCourse(editCourse.id, editForm);
      toast.success("Course updated successfully");
      setEditCourse(null);
      loadCourses();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    try {
      await adminDeleteCourse(courseId);
      toast.success("Course deleted");
      setDeletingId(null);
      loadCourses();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete course");
    }
  };

  const activeFeatures = config?.active_features || [];
  const hasAdvanced = activeFeatures.includes("courses_advanced");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-white/60">
            {courses ? `${courses.length} course(s)` : "Loading…"}
          </p>
        </div>
        <Link href="/admin/add-course">
          <Button className="bg-brand hover:brightness-110">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>
      )}

      {!courses ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-6 space-y-3">
              <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
            </CardContent></Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="border-dashed border-white/20 bg-transparent py-12">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <BookOpen className="w-10 h-10 text-white/20" />
            <div>
              <h2 className="text-lg font-medium">No courses yet</h2>
              <p className="text-sm text-white/50">Create your first course to get started.</p>
            </div>
            <Link href="/admin/add-course">
              <Button className="bg-brand">Create Course</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Card
              key={course.id}
              className="group border-white/10 bg-white/5 hover:border-brand/30 transition-all duration-300 flex flex-col"
            >
              {course.cover_image_url && (
                <div className="relative h-36 overflow-hidden rounded-t-lg">
                  <img
                    src={course.cover_image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug line-clamp-2">{course.title}</CardTitle>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    course.is_free
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-brand/20 text-brand border border-brand/30"
                  }`}>
                    {course.is_free ? "Free" : `₹${course.price}`}
                  </span>
                </div>
                <CardDescription className="line-clamp-2 text-xs">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-3">
                <div className="flex flex-wrap gap-2 text-[10px] text-white/50">
                  {course.level && (
                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                      <Award className="h-3 w-3" /> {course.level}
                    </span>
                  )}
                  {course.duration && (
                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                      <Clock className="h-3 w-3" /> {course.duration}
                    </span>
                  )}
                  {course.instructor_name && (
                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                      <User className="h-3 w-3" /> {course.instructor_name}
                    </span>
                  )}
                  {course.type && (
                    <span className="bg-white/5 px-2 py-0.5 rounded capitalize">{course.type}</span>
                  )}
                </div>
              </CardContent>
              <div className="border-t border-white/5 p-3 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 text-xs text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => openEdit(course)}
                >
                  <Pencil className="mr-1.5 h-3 w-3" /> Edit
                </Button>
                {deletingId === course.id ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-red-500 hover:bg-red-600"
                      onClick={() => handleDelete(course.id)}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setDeletingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => setDeletingId(course.id)}
                  >
                    <Trash2 className="mr-1.5 h-3 w-3" /> Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl border-white/10 bg-black shadow-2xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-white/5">
              <div>
                <CardTitle>Edit Course</CardTitle>
                <CardDescription>Update course details</CardDescription>
              </div>
              <Button onClick={() => setEditCourse(null)} variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-white/70">Title</label>
                <Input
                  value={editForm.title || ""}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-white/70">Description</label>
                <Textarea
                  value={editForm.description || ""}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4 border border-white/10 p-4 rounded-md">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Free Course</label>
                  <p className="text-xs text-white/50">Students can enroll immediately.</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-brand"
                  checked={editForm.is_free || false}
                  onChange={e => setEditForm({ ...editForm, is_free: e.target.checked })}
                />
              </div>

              {!editForm.is_free && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-white/70">Price</label>
                    <Input
                      type="number"
                      min={0}
                      value={editForm.price ?? ""}
                      onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-white/70">Currency</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white"
                      value={editForm.currency || "INR"}
                      onChange={e => setEditForm({ ...editForm, currency: e.target.value })}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm text-white/70">Cover Image URL</label>
                <Input
                  value={(editForm.cover_image_url as string) || ""}
                  onChange={e => setEditForm({ ...editForm, cover_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Level</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white"
                    value={editForm.level || "beginner"}
                    onChange={e => setEditForm({ ...editForm, level: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Course Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white"
                    value={editForm.type || "self-paced"}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                  >
                    <option value="self-paced">Self-Paced Video</option>
                    <option value="live">Live Zoom Sessions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Duration</label>
                  <Input
                    value={(editForm.duration as string) || ""}
                    onChange={e => setEditForm({ ...editForm, duration: e.target.value })}
                    placeholder="E.g. 5 Hours or 6 Weeks"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Instructor Name</label>
                  <Input
                    value={(editForm.instructor_name as string) || ""}
                    onChange={e => setEditForm({ ...editForm, instructor_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 border border-white/10 p-4 rounded-md">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Issue Certificate</label>
                  <p className="text-xs text-white/50">Does this course reward a certificate?</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-brand"
                  checked={editForm.has_certificate || false}
                  onChange={e => setEditForm({ ...editForm, has_certificate: e.target.checked })}
                />
              </div>
            </CardContent>
            <div className="border-t border-white/10 p-4 flex justify-end gap-3 bg-white/5">
              <Button variant="ghost" onClick={() => setEditCourse(null)}>Cancel</Button>
              <Button className="bg-brand" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

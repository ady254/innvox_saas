"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminCreateCourse } from "@/lib/api";

export default function AdminAddCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add course</h1>
        <p className="text-sm text-white/60">Create a new course for this tenant.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course details</CardTitle>
          <CardDescription>Title, price, and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {done && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {done}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm text-white/70">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-white/70">Price (₹)</label>
            <Input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="999"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-white/70">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What students will learn"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              disabled={loading}
              onClick={async () => {
                setError(null);
                setDone(null);
                const p = Number(price);
                if (!title.trim() || !description.trim() || !Number.isFinite(p) || p < 0) {
                  setError("Please fill title, description, and a valid price.");
                  return;
                }
                setLoading(true);
                try {
                  const res = await adminCreateCourse({
                    title: title.trim(),
                    description: description.trim(),
                    price: Math.floor(p),
                  });
                  setDone(res.message || "Course created.");
                  setTitle("");
                  setDescription("");
                  setPrice("");
                  router.refresh();
                } catch (e: unknown) {
                  setError(e instanceof Error ? e.message : "Failed to create course");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Saving…" : "Create course"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

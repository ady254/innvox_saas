"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminCreateCourse, fetchClientConfig, ClientConfig } from "@/lib/api";

export default function AdminAddCoursePage() {
  const router = useRouter();
  const [config, setConfig] = useState<ClientConfig | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  
  // Advanced Form State
  const [isFree, setIsFree] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("beginner");
  const [instructor, setInstructor] = useState("");
  const [type, setType] = useState("self-paced");
  const [hasCertificate, setHasCertificate] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    fetchClientConfig().then(setConfig).catch(console.error);
  }, []);

  const activeFeatures = config?.active_features || [];
  const hasAdvanced = activeFeatures.includes("courses_advanced");

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-semibold">Create Course</h1>
        <p className="text-sm text-white/60">Configure learning experience options.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
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
            <label className="text-sm text-white/70">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-white/70">Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What students will learn"
            />
          </div>

          <div className="flex items-center gap-4 border border-white/10 p-4 rounded-md">
             <div className="flex-1 space-y-1">
               <label className="block text-sm font-medium">Free Course</label>
               <p className="text-xs text-white/50">Students can enroll immediately.</p>
             </div>
             <input type="checkbox" className="w-5 h-5 accent-brand" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
          </div>

          {!isFree && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-white/70">Price *</label>
                <Input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="999"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-white/70">Currency</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white" 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {hasAdvanced && (
        <Card className="border-brand/40 shadow-[0_0_15px_-3px_rgba(var(--brand),0.3)]">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                 Advanced Configurations
                 <span className="bg-brand/20 text-brand text-[10px] px-2 py-0.5 rounded uppercase">Growth</span>
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-white/70">Cover Image URL</label>
                {/* 
                  PRODUCTION SWITCH GUIDE: Cloudinary/S3 Integration
                  Replace this Input with a FileDropzone component.
                  Example: 
                  <FileUpload 
                     onUploadComplete={(url) => setCoverImageUrl(url)}
                     provider="cloudinary" // or "s3"
                  />
                  For now, paste an image URL directly:
                */}
                <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-sm text-white/70">Level</label>
                   <select 
                      className="flex h-10 w-full rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white" 
                      value={level} onChange={(e) => setLevel(e.target.value)}
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
                      value={type} onChange={(e) => setType(e.target.value)}
                   >
                      <option value="self-paced">Self-Paced Video</option>
                      <option value="live">Live Zoom Sessions</option>
                   </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-sm text-white/70">Duration</label>
                    <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="E.g. 5 Hours or 6 Weeks" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm text-white/70">Instructor Name</label>
                    <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="John Doe" />
                 </div>
              </div>

              <div className="flex items-center gap-4 border border-white/10 p-4 rounded-md mt-4">
                 <div className="flex-1 space-y-1">
                   <label className="block text-sm font-medium">Issue Certificate</label>
                   <p className="text-xs text-white/50">Does this course reward a valid certificate upon completion?</p>
                 </div>
                 <input type="checkbox" className="w-5 h-5 accent-brand" checked={hasCertificate} onChange={(e) => setHasCertificate(e.target.checked)} />
              </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
         <Button
            disabled={loading}
            onClick={async () => {
              setError(null); setDone(null);
              const p = Number(price);
              if (!title.trim() || !description.trim()) {
                setError("Title and description are required.");
                return;
              }
              if (!isFree && (!Number.isFinite(p) || p < 0)) {
                setError("A valid price is required for paid courses.");
                return;
              }
              
              setLoading(true);
              try {
                const res = await adminCreateCourse({
                  title: title.trim(),
                  description: description.trim(),
                  price: isFree ? 0 : Math.floor(p),
                  is_free: isFree,
                  cover_image_url: coverImageUrl.trim() || null,
                  currency: currency,
                  duration: duration.trim() || null,
                  level: level,
                  instructor_name: instructor.trim() || null,
                  type: type,
                  has_certificate: hasCertificate
                });
                setDone(res.message || "Course created.");
                setTitle(""); setDescription(""); setPrice(""); setCoverImageUrl(""); setIsFree(false);
                router.refresh();
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Failed to create course");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Saving…" : "Publish Course"}
          </Button>
      </div>
    </div>
  );
}

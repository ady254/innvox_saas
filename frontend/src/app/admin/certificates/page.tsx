"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminCreateCertificate, adminGetCertificates, adminListStudents, fetchCourses, Certificate, Course } from "@/lib/api";

type Student = {
  id: number;
  name: string;
  email: string;
};

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [userId, setUserId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [fileUrl, setFileUrl] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      adminGetCertificates().then(res => setCertificates(res.certificates)),
      adminListStudents().then(res => setStudents(res.students)),
      fetchCourses().then(res => setCourses(res))
    ]).catch(console.error);
  }, []);

  const handleAssign = async () => {
    setError(null);
    if (!userId || !courseId || !fileUrl.trim()) {
      setError("Please select a student, a course, and provide a file URL.");
      return;
    }

    setLoading(true);
    try {
      await adminCreateCertificate({
        user_id: Number(userId),
        course_id: Number(courseId),
        file_url: fileUrl.trim()
      });
      // Refresh list
      const res = await adminGetCertificates();
      setCertificates(res.certificates);
      setFileUrl("");
      setUserId("");
      setCourseId("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to assign certificate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mx-auto max-w-4xl pb-20">
      <div>
        <h1 className="text-2xl font-semibold">Certificates Management</h1>
        <p className="text-white/70">Issue and manage certificates for students who successfully completed courses.</p>
      </div>

      <Card className="border-brand/30">
         <CardHeader>
             <CardTitle>Assign New Certificate</CardTitle>
             <CardDescription>Select a student and course to issue.</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
            {error && <div className="text-sm text-red-400 bg-red-400/10 p-3 rounded-md border border-red-400/20">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-sm text-white/70">Student</label>
                 <select 
                    className="flex h-10 w-full rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white"
                    value={userId} onChange={e => setUserId(e.target.value)}
                 >
                    <option value="">Select Student...</option>
                    {students.map(s => (
                       <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-1">
                 <label className="text-sm text-white/70">Course</label>
                 <select 
                    className="flex h-10 w-full rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white"
                    value={courseId} onChange={e => setCourseId(e.target.value)}
                 >
                    <option value="">Select Course...</option>
                    {courses.map(c => (
                       <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                 </select>
              </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm text-white/70">Certificate File URL (PDF or Image)</label>
                {/* 
                  PRODUCTION SWITCH GUIDE: 
                  Replace this URL input with Cloudinary/S3 uploader logic.
                  <FileUploader 
                     onUpload={(url) => setFileUrl(url)} 
                     accept=".pdf,image/*" 
                  />
                */}
                <Input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." />
            </div>
         </CardContent>
         <CardFooter className="justify-end bg-white/5 border-t border-white/10 pt-4">
             <Button onClick={handleAssign} disabled={loading}>{loading ? "Assigning..." : "Assign Certificate"}</Button>
         </CardFooter>
      </Card>

      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold">Issued Certificates</h2>
        {certificates.length === 0 ? (
          <p className="text-white/50 text-sm">No certificates have been issued yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {certificates.map(cert => {
                const studentName = students.find(s => s.id === cert.user_id)?.name || `Student ID: ${cert.user_id}`;
                const courseTitle = courses.find(c => c.id === cert.course_id)?.title || `Course ID: ${cert.course_id}`;
                
                return (
                  <Card key={cert.id} className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-base">{courseTitle}</CardTitle>
                       <CardDescription>Issued to: {studentName}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                       <p className="text-xs text-white/40">Date: {new Date(cert.issued_at).toLocaleDateString()}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                       <a href={cert.file_url} target="_blank" rel="noreferrer" className="w-full">
                         <Button size="sm" variant="outline" className="w-full border-brand text-brand hover:bg-brand/10">View File</Button>
                       </a>
                    </CardFooter>
                  </Card>
                );
             })}
          </div>
        )}
      </div>
    </div>
  );
}

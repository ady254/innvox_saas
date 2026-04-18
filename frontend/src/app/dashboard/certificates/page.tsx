"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Certificate, studentGetMyCertificates, fetchCourses, Course } from "@/lib/api";
import { Download } from "lucide-react";

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      studentGetMyCertificates().then(res => setCertificates(res.certificates)),
      fetchCourses().then(res => setCourses(res))
    ]).catch(e => setError(e instanceof Error ? e.message : "Failed to load certificates"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Certificates</h1>
        <p className="text-white/70">View and download certificates you've earned from completing courses.</p>
      </div>

      {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>}

      {!certificates ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
             <Card key={i} className="flex flex-col">
                <CardHeader>
                   <Skeleton className="h-4 w-1/3" />
                   <Skeleton className="h-6 w-3/4 mt-2" />
                </CardHeader>
                <CardFooter>
                   <Skeleton className="h-9 w-24" />
                </CardFooter>
             </Card>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <Card className="border-white/10 bg-white/5 py-12">
           <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-white/5 p-4">
                 <Download className="w-8 h-8 text-white/30" />
              </div>
              <div>
                 <h2 className="text-lg font-medium">No certificates yet</h2>
                 <p className="text-sm text-white/50">Complete more courses that offer certificates to see them here.</p>
              </div>
           </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map(cert => {
             const courseTitle = courses.find(c => c.id === cert.course_id)?.title || `Course ID: ${cert.course_id}`;
             return (
               <Card key={cert.id} className="relative overflow-hidden group bg-gradient-to-br from-brand/10 to-transparent border-brand/20 shadow-[0_0_15px_-3px_rgba(var(--brand),0.1)]">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-brand/20 rounded-full blur-3xl" />
                 <CardHeader className="relative z-10 pb-4">
                    <CardDescription className="text-brand font-medium">Certificate of Completion</CardDescription>
                    <CardTitle className="text-xl leading-snug pt-1">{courseTitle}</CardTitle>
                 </CardHeader>
                 <CardContent className="relative z-10 pb-6">
                    <p className="text-sm text-white/50">
                       Issued on: {new Date(cert.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
                    </p>
                 </CardContent>
                 <CardFooter className="relative z-10 pt-0">
                    <a href={cert.file_url} target="_blank" rel="noreferrer" className="inline-block" download>
                       <Button size="sm" className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Download Certificate
                       </Button>
                    </a>
                 </CardFooter>
               </Card>
             );
          })}
        </div>
      )}
    </div>
  );
}

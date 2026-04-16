"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminListEnrollments } from "@/lib/api";

export default function AdminEnrollmentsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminListEnrollments>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListEnrollments()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Enrollments</h1>
        <p className="text-sm text-white/60">Student ↔ course enrollments for your tenant.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
          <CardDescription>{data ? `${data.count} record(s)` : "Loading…"}</CardDescription>
        </CardHeader>
        <CardContent>
          {!data ? (
            <p className="text-sm text-white/50">Loading…</p>
          ) : data.enrollments.length === 0 ? (
            <p className="text-sm text-white/60">No enrollments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="pb-2 pr-4 font-medium">Student</th>
                    <th className="pb-2 pr-4 font-medium">Course</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.enrollments.map((e) => (
                    <tr key={e.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">
                        <div className="font-medium">{e.student.name}</div>
                        <div className="text-xs text-white/50">{e.student.email}</div>
                      </td>
                      <td className="py-2 pr-4">
                        {e.course.title}
                        <span className="ml-2 text-white/40">₹{e.course.price}</span>
                      </td>
                      <td className="py-2 pr-4 capitalize text-white/80">{e.payment_status}</td>
                      <td className="py-2 text-white/50">
                        {e.created_at ? new Date(e.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminListStudents } from "@/lib/api";

export default function AdminStudentsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminListStudents>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListStudents()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Students</h1>
        <p className="text-sm text-white/60">Users with role student in your tenant.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All students</CardTitle>
          <CardDescription>
            {data ? `${data.count} student(s)` : "Loading…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data ? (
            <p className="text-sm text-white/50">Loading…</p>
          ) : data.students.length === 0 ? (
            <p className="text-sm text-white/60">No students yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr key={s.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">{s.name}</td>
                      <td className="py-2 pr-4 text-white/80">{s.email}</td>
                      <td className="py-2 text-white/50">
                        {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}
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

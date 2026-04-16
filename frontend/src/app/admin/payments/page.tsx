"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminListPayments } from "@/lib/api";

export default function AdminPaymentsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminListPayments>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListPayments()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-sm text-white/60">
          Payment history from enrollments (amount = course price at time of view).
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <CardDescription>{data ? `${data.count} record(s)` : "Loading…"}</CardDescription>
        </CardHeader>
        <CardContent>
          {!data ? (
            <p className="text-sm text-white/50">Loading…</p>
          ) : data.payments.length === 0 ? (
            <p className="text-sm text-white/60">No payment records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="pb-2 pr-4 font-medium">Student</th>
                    <th className="pb-2 pr-4 font-medium">Course</th>
                    <th className="pb-2 pr-4 font-medium">Amount</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p.enrollment_id} className="border-b border-white/5">
                      <td className="py-2 pr-4">
                        <div className="font-medium">{p.student.name}</div>
                        <div className="text-xs text-white/50">{p.student.email}</div>
                      </td>
                      <td className="py-2 pr-4">{p.course.title}</td>
                      <td className="py-2 pr-4">
                        {p.currency} {p.amount}
                      </td>
                      <td className="py-2 pr-4 capitalize text-white/80">{p.payment_status}</td>
                      <td className="py-2 text-white/50">
                        {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
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

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-sm text-white/60">
          Manage courses, students, enrollments, and payment records for your tenant.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add course</CardTitle>
            <CardDescription>Create a new course listing</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/add-course">
              <Button size="sm">Open</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>View all student accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/students">
              <Button size="sm" variant="secondary">
                Open
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enrollments</CardTitle>
            <CardDescription>Who enrolled in what</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/enrollments">
              <Button size="sm" variant="secondary">
                Open
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Enrollment payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/payments">
              <Button size="sm" variant="secondary">
                Open
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

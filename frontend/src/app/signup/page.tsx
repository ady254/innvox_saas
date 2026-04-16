"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/components/tenant-provider";
import { signup } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const tenant = useTenant();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create your account for this tenant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <div className="text-sm text-white/70">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-white/70">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-white/70">Password</div>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button
            className="w-full"
            disabled={loading || tenant.loading}
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                await signup({ name, email, password });
                router.push("/login");
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Signup failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Creating…" : "Create account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


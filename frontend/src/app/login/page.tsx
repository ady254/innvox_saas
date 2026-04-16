"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/components/tenant-provider";
import { login, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const tenant = useTenant();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <div className="text-sm text-white/70">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
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
                const res = await login({ email, password });
                setToken(res.access_token);
                router.push("/dashboard");
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Login failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Logging in…" : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


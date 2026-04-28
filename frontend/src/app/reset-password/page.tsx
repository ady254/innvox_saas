"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

import { resetPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    password: "",
    confirm_password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ token, new_password: formData.password });
      toast.success("Password updated successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-xl shadow-2xl text-center">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-500">Invalid Link</CardTitle>
              <CardDescription className="text-white/60">
                The password reset link is missing or malformed. Please request a new link.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/forgot-password" size="sm" className="w-full">
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 text-white">
                  Get New Link
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto bg-brand/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-brand" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white font-outfit">New Password</CardTitle>
            <CardDescription className="text-white/60">
              Please enter and confirm your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-brand/50 focus:ring-brand/20 transition-all"
                    placeholder="New Password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-brand/50 focus:ring-brand/20 transition-all"
                    placeholder="Confirm New Password"
                    type="password"
                    required
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  />
                </div>
              </div>
              <Button
                className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold transition-all group mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

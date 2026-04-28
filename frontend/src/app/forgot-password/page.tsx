"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft, Send } from "lucide-react";

import { forgotPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSuccess(true);
      toast.success("Check your email for the reset link");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl text-center">
            <CardHeader>
              <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
              <CardDescription className="text-white/60">
                We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                The link will expire in 15 minutes.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col pt-6">
              <Link href="/login" className="w-full">
                <Button className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold transition-all">
                  Back to Sign In
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
        <Link
          href="/login"
          className="flex items-center text-sm text-white/50 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Sign In
        </Link>
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-white font-outfit">Reset Password</CardTitle>
            <CardDescription className="text-white/60">
              Enter your email address and we'll send you a recovery link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-brand/50 focus:ring-brand/20 transition-all"
                    placeholder="name@example.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold transition-all mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

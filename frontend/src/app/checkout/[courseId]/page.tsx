"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createOrder, verifyPayment } from "@/lib/api";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: courseIdParam } = React.use(params);
  const router = useRouter();
  const courseId = Number(courseIdParam);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Pay securely with Razorpay to enroll.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">
              {error}
            </div>
          )}
          <Button
            className="w-full"
            disabled={loading || !Number.isFinite(courseId) || courseId <= 0}
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                const ok = await loadRazorpayScript();
                if (!ok) throw new Error("Failed to load Razorpay SDK");

                const order = await createOrder(courseId);

                const rz = new window.Razorpay({
                  key: order.key_id,
                  amount: order.amount,
                  currency: order.currency,
                  name: "Innvox",
                  description: order.course.title,
                  order_id: order.order_id,
                  handler: async (response: any) => {
                    try {
                      await verifyPayment({
                        course_id: courseId,
                        payment_id: response.razorpay_payment_id,
                        order_id: response.razorpay_order_id,
                        signature: response.razorpay_signature,
                      });
                      router.push("/dashboard");
                    } catch (e: unknown) {
                      setError(e instanceof Error ? e.message : "Payment verification failed");
                    }
                  },
                  theme: { color: "#3b82f6" },
                });

                rz.open();
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Checkout failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Starting payment…" : "Pay & Enroll"}
          </Button>
          <p className="text-xs text-white/60">
            If you’re not logged in, login first (login is required for order creation).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


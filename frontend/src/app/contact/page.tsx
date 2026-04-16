"use client";
import React from "react";
import { fetchPageContent, PageContent } from "@/lib/api";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [data, setData] = React.useState<PageContent | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPageContent("contact")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-500">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {data.title || "Get in Touch"}
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          {data.subtitle || "Have questions about our courses? We're here to help you on your learning journey."}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6 transition-all hover:bg-white/10">
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-brand/10 p-2 text-brand">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-white/60">support@yourtenant.com</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-brand/10 p-2 text-brand">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-white/60">+1 (555) 000-0000</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-brand/10 p-2 text-brand">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Office</div>
                  <div className="text-white/60">
                    {data.content || "123 Learning Lane, Knowledge City, EDU 45678"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-8">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input 
                type="text" 
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input 
                type="email" 
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea 
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="How can we help?"
              />
            </div>
            <button className="w-full rounded-lg bg-brand py-3 font-semibold text-white transition-all hover:brightness-110">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

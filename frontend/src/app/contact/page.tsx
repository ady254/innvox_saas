"use client";
import React from "react";
import { fetchPageContent, PageContent, fetchContactInfo, ContactSettings } from "@/lib/api";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [pageData, setPageData] = React.useState<PageContent | null>(null);
  const [contactInfo, setContactInfo] = React.useState<ContactSettings | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetchPageContent("contact"),
      fetchContactInfo()
    ])
    .then(([page, contact]) => {
      setPageData(page);
      setContactInfo(contact);
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-500">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {pageData?.title || "Get in Touch"}
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          {pageData?.subtitle || "Have questions about our courses? We're here to help you on your learning journey."}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6 transition-all hover:bg-white/10">
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            
            <div className="space-y-6">
              {/* PHONES */}
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-brand/10 p-2 text-brand">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm uppercase tracking-wider text-brand/80">Support Phones</div>
                  {contactInfo?.phones && contactInfo.phones.length > 0 ? (
                    contactInfo.phones.map((p, i) => <div key={i} className="text-white/70">{p}</div>)
                  ) : (
                    <div className="text-white/60">+1 (555) 000-0000</div>
                  )}
                </div>
              </div>

              {/* EMAILS */}
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-brand/10 p-2 text-brand">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm uppercase tracking-wider text-brand/80">Our Emails</div>
                  {contactInfo?.emails && contactInfo.emails.length > 0 ? (
                    contactInfo.emails.map((e, i) => <div key={i} className="text-white/70">{e}</div>)
                  ) : (
                    <div className="text-white/60">support@yourtenant.com</div>
                  )}
                </div>
              </div>

              {/* ADDRESS */}
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-brand/10 p-2 text-brand">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm uppercase tracking-wider text-brand/80">Main Office</div>
                  <div className="text-white/60 whitespace-pre-line">
                    {contactInfo?.address || pageData?.content || "123 Learning Lane, Knowledge City, EDU 45678"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-8">
          <h2 className="text-xl font-bold mb-6">Send us a message</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Name</label>
              <input 
                type="text" 
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email</label>
              <input 
                type="email" 
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Message</label>
              <textarea 
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="How can we help?"
              />
            </div>
            <button className="w-full rounded-xl bg-brand py-4 font-bold text-white transition-all hover:brightness-110 shadow-lg shadow-brand/20">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

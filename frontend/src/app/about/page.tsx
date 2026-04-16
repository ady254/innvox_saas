"use client";
import React from "react";
import { fetchPageContent, PageContent } from "@/lib/api";

export default function AboutPage() {
  const [data, setData] = React.useState<PageContent | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPageContent("about")
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
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {data.title || "About Us"}
        </h1>
        <p className="text-xl text-white/70 leading-relaxed font-light">
          {data.subtitle || ""}
        </p>
        <div className="h-1 w-20 bg-brand rounded-full" />
      </header>

      {data.banner_image && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
          <img 
            src={data.banner_image} 
            alt="About banner" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className="prose prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-white/80 text-lg leading-relaxed">
          {data.content || "No information provided yet."}
        </div>
      </article>
    </div>
  );
}

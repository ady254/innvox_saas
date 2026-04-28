"use client";

import { useEffect, useState } from "react";
import { fetchPlatformAnnouncements, PlatformAnnouncement } from "@/lib/api";
import { AlertCircle, Info, ShieldAlert, X } from "lucide-react";

export function PlatformAnnouncements() {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [closed, setClosed] = useState<number[]>([]);

  useEffect(() => {
    fetchPlatformAnnouncements()
      .then(data => setAnnouncements(data.announcements))
      .catch(console.error);
  }, []);

  const visible = announcements.filter(a => !closed.includes(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      {visible.map((a) => (
        <div 
          key={a.id} 
          className={`relative overflow-hidden rounded-xl border p-4 shadow-lg animate-in slide-in-from-top duration-500 ${
            a.type === "maintenance" || a.priority === "critical" 
              ? "bg-red-500/10 border-red-500/20 text-red-200" 
              : "bg-blue-500/10 border-blue-500/20 text-blue-200"
          }`}
        >
          <div className="flex gap-3 items-start">
            <div className={`mt-0.5 p-1.5 rounded-lg ${
               a.type === "maintenance" ? "bg-red-500/20" : "bg-blue-500/20"
            }`}>
              {a.type === "maintenance" ? <ShieldAlert className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            </div>
            <div className="flex-1 pr-8">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Platform Alert</span>
                 <span className="text-[10px] opacity-40">•</span>
                 <span className="text-[10px] opacity-40">{new Date(a.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">{a.message}</p>
            </div>
            <button 
              onClick={() => setClosed([...closed, a.id])}
              className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Background Decorative Element */}
          <div className={`absolute -right-4 -bottom-4 h-16 w-16 opacity-5 blur-2xl rounded-full ${
             a.type === "maintenance" ? "bg-red-500" : "bg-blue-500"
          }`} />
        </div>
      ))}
    </div>
  );
}

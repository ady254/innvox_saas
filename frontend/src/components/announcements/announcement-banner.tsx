"use client";

import { useEffect, useState } from "react";
import { fetchGeneralAnnouncements, Announcement } from "@/lib/api";
import { Bell, X } from "lucide-react";

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetchGeneralAnnouncements()
      .then((data) => {
        // Only show the latest high priority announcement if available, 
        // otherwise show the latest general one.
        const highPriority = data.find((a) => a.priority === "high");
        if (highPriority) {
          setAnnouncement(highPriority);
        } else if (data.length > 0) {
          setAnnouncement(data[0]);
        }
      })
      .catch((err) => console.error("Failed to fetch announcements:", err));
  }, []);

  if (!announcement || !visible) return null;

  const isHighPriority = announcement.priority === "high";

  return (
    <div
      className={`relative w-full py-3 px-4 flex items-center justify-center transition-all duration-500 overflow-hidden ${
        isHighPriority
          ? "bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white animate-pulse-subtle"
          : "bg-primary text-primary-foreground"
      }`}
    >
      <div className="flex items-center gap-3 max-w-7xl mx-auto px-4">
        <Bell className={`h-5 w-5 ${isHighPriority ? "animate-bounce" : ""}`} />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-bold uppercase tracking-wider text-xs bg-white/20 px-2 py-0.5 rounded">
            {isHighPriority ? "Urgent" : "Update"}
          </span>
          <span className="font-medium text-sm md:text-base">
            {announcement.title}: {announcement.message}
          </span>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 hover:bg-white/20 p-1 rounded-full transition-colors"
        aria-label="Close announcement"
      >
        <X className="h-4 w-4" />
      </button>

      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.92; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

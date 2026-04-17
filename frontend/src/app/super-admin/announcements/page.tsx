"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchMe,
  fetchPlatformAnnouncements,
  superAdminCreatePlatformAnnouncement,
  PlatformAnnouncement
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function SuperAdminAnnouncementsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);

  const [formData, setFormData] = useState({
    message: "",
    type: "info",
    priority: "normal",
    target: "all"
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchMe()
      .then((user) => {
        if (user.role !== "super_admin") {
          router.replace("/");
        } else {
          loadAnnouncements();
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  const loadAnnouncements = async () => {
    try {
      const data = await fetchPlatformAnnouncements();
      setAnnouncements(data.announcements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await superAdminCreatePlatformAnnouncement(formData);
      setFormData({ ...formData, message: "" });
      loadAnnouncements();
    } catch (err: any) {
      alert("Failed to create announcement");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/super-admin">
          <Button variant="ghost" size="default" className="h-8 w-8 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Announcements</h1>
          <p className="text-white/60 text-sm">Broadcast maintenance alerts or offers globally.</p>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>New Broadcast</CardTitle>
          <CardDescription>Send a message to all tenants or specific roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/50">Message Content</label>
              <Textarea
                required
                placeholder="e.g. Scheduled maintenance this Saturday at 2 AM..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-white/5 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Type</label>
                <select
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="info">Info</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offer">Offer</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Priority</label>
                <select
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Target Audience</label>
                <select
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                >
                  <option value="all">Everyone</option>
                  <option value="admins">Admins Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button disabled={creating} className="bg-brand w-full sm:w-auto">
                {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Broadcast Now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-lg">Broadcast History</h3>
        {announcements.map((a) => (
          <div key={a.id} className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2 relative overflow-hidden group">
            {a.priority === "high" && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${a.type === 'maintenance' ? 'bg-orange-500/20 text-orange-400' :
                  a.type === 'warning' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                }`}>
                {a.type}
              </span>
              <span className="text-[10px] uppercase font-bold text-white/40 bg-white/10 px-2 py-0.5 rounded">
                Target: {a.target}
              </span>
              <span className="text-xs text-white/30 ml-auto flex items-center gap-1">
                {new Date(a.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm font-medium">{a.message}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center p-8 border border-white/5 border-dashed rounded-xl text-white/40">
            No platform announcements yet.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { 
  adminListAnnouncements, 
  adminCreateAnnouncement, 
  adminDeleteAnnouncement, 
  Announcement 
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertCircle, Send, Plus } from "lucide-react";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"general" | "student">("general");
  const [priority, setPriority] = useState<"normal" | "high">("normal");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await adminListAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminCreateAnnouncement({ title, message, type, priority });
      setTitle("");
      setMessage("");
      loadAnnouncements();
    } catch (err) {
      alert("Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await adminDeleteAnnouncement(id);
      loadAnnouncements();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Announcement System</h1>
        <p className="text-white/50 text-sm">Broadcast updates to your home page or student dashboard.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* CREATE FORM */}
        <Card className="border-white/10 bg-white/5 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand" />
              New Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Title</label>
                <Input 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. 🔥 New Batch Alert"
                  className="bg-black/20 border-white/10 focus:ring-brand"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Message</label>
                <Textarea 
                  required 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Enter the main content of your broadcast..."
                  className="bg-black/20 border-white/10 focus:ring-brand min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Audience</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  >
                    <option value="general">General (Banner)</option>
                    <option value="student">Students (Dashboard)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (Red Alert)</option>
                  </select>
                </div>
              </div>

              <Button disabled={submitting} className="w-full bg-brand hover:brightness-110 font-bold h-12">
                {submitting ? "Publishing..." : "Send Announcement"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand" />
            Recent Announcements
          </h2>
          
          {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-24 w-full bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-12 text-center text-white/30 italic">
              No announcements found.
            </div>
          ) : (
            announcements.map((a) => (
              <Card key={a.id} className="border-white/10 bg-white/2 hover:bg-white/5 transition-colors group">
                <CardContent className="p-4 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        a.type === "high" ? "bg-red-500/10 border-red-500/50 text-red-500" : "bg-white/10 border-white/10 text-white/60"
                      }`}>
                        {a.type}
                      </span>
                      {a.priority === "high" && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/50 text-orange-500">High PR</span>}
                      <h3 className="font-bold text-sm">{a.title}</h3>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{a.message}</p>
                    <div className="text-[10px] text-white/20 pt-1">
                      {new Date(a.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/20 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

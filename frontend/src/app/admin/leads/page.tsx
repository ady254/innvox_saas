"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminListLeads, adminDeleteLead, type Lead } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, User, MessageSquare, Trash2, Inbox, Search, Calendar } from "lucide-react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const data = await adminListLeads();
      setLeads(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load leads");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminDeleteLead(id);
      toast.success("Lead deleted");
      setDeletingId(null);
      setLeads(prev => prev ? prev.filter(l => l.id !== id) : null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const filtered = leads?.filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.message.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads & Inquiries</h1>
          <p className="text-sm text-white/60">
            Contact form submissions from your website.
            {leads ? ` ${leads.length} total.` : ""}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>
      )}

      {/* Search */}
      {leads && leads.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/30" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
      )}

      {!leads ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-white/50 animate-pulse">Loading leads…</p>
          </CardContent>
        </Card>
      ) : leads.length === 0 ? (
        <Card className="border-white/10 bg-white/5 py-12">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-white/5 p-4">
              <Inbox className="w-8 h-8 text-white/30" />
            </div>
            <div>
              <h2 className="text-lg font-medium">No leads yet</h2>
              <p className="text-sm text-white/50">Inquiries from your contact page will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered && filtered.length === 0 && (
            <div className="text-center py-8 text-white/40 text-sm">No leads match your search.</div>
          )}
          {filtered?.map(lead => (
            <Card
              key={lead.id}
              className="border-white/10 bg-white/5 hover:border-white/20 transition-all duration-200"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="shrink-0 rounded-full bg-brand/10 p-2 mt-0.5">
                      <User className="h-4 w-4 text-brand" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-sm">{lead.name}</h3>
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 text-xs text-brand hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </a>
                      </div>
                      <div
                        className="mt-1.5 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                      >
                        <p className={`text-sm text-white/70 leading-relaxed ${
                          expandedId === lead.id ? "" : "line-clamp-2"
                        }`}>
                          <MessageSquare className="inline h-3 w-3 mr-1 text-white/30" />
                          {lead.message}
                        </p>
                        {lead.message.length > 150 && expandedId !== lead.id && (
                          <span className="text-[10px] text-brand cursor-pointer mt-1 inline-block">Show more</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-white/40">
                        <Calendar className="h-3 w-3" />
                        {new Date(lead.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {deletingId === lead.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="h-7 text-[10px] bg-red-500 hover:bg-red-600"
                          onClick={() => handleDelete(lead.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px]"
                          onClick={() => setDeletingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeletingId(lead.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

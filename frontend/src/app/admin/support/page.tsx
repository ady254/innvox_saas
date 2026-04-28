"use client";

import { useEffect, useState } from "react";
import {
  fetchMySupportTickets,
  createSupportTicket,
  fetchSupportTicketDetails,
  respondToSupportTicket,
  SupportTicket,
  SupportTicketResponse
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, MessageSquare, History, ArrowLeft, Send, LifeBuoy } from "lucide-react";

export default function AdminSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Partial<SupportTicket>[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  // New Ticket Form
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium"
  });
  const [creating, setCreating] = useState(false);

  // Detail View
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ ticket: SupportTicket, responses: SupportTicketResponse[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await fetchMySupportTickets();
      setTickets(data.tickets);
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
      await createSupportTicket(newTicket);
      setShowCreate(false);
      setNewTicket({ subject: "", description: "", priority: "medium" });
      loadTickets();
    } catch (err) {
      alert("Failed to raise ticket");
    } finally {
      setCreating(false);
    }
  };

  const openTicket = async (id: number) => {
    setSelectedTicketId(id);
    setLoadingDetail(true);
    try {
      const data = await fetchSupportTicketDetails(id);
      setDetail(data);
    } catch (err) {
      alert("Failed to load ticket details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !reply.trim()) return;
    setSendingReply(true);
    try {
      await respondToSupportTicket(selectedTicketId, reply);
      setReply("");
      const data = await fetchSupportTicketDetails(selectedTicketId);
      setDetail(data);
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Support & Help</h1>
          <p className="text-white/60">Raise issues or request features from the platform team.</p>
        </div>
        {!selectedTicketId && !showCreate && (
          <Button onClick={() => setShowCreate(true)} className="bg-brand">
            <Plus className="mr-2 h-4 w-4" />
            Raise Ticket
          </Button>
        )}
      </div>

      {showCreate ? (
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowCreate(false)} variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>New Support Ticket</CardTitle>
                <CardDescription>Describe the issue you're facing in detail.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Subject</label>
                <Input
                  required
                  placeholder="e.g. Courses not loading, Payment gateway error"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Description</label>
                <textarea
                  required
                  placeholder="Please provide as much detail as possible..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full min-h-[150px] rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Priority</label>
                <select
                  className="w-full flex h-10 items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex justify-end pt-4">
                <Button disabled={creating} className="bg-brand">
                  {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Submit Ticket
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : selectedTicketId && detail ? (
        <div className="space-y-6">
          <Button onClick={() => setSelectedTicketId(null)} variant="ghost" className="text-white/60 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
          </Button>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="border-b border-white/10">
                  <CardTitle>{detail.ticket.subject}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${detail.ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                        detail.ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          'bg-white/10 text-white/60'
                      }`}>
                      {detail.ticket.status}
                    </span>
                    <span className="text-[10px] text-white/40">{new Date(detail.ticket.created_at).toLocaleString()}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{detail.ticket.description}</p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-brand" /> Conversation
                </h3>
                {detail.responses.map(res => (
                  <div key={res.id} className="p-4 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex justify-between text-[10px] text-white/40 mb-2">
                      <span className="font-bold">{res.user_name}</span>
                      <span>{new Date(res.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{res.message}</p>
                  </div>
                ))}
                {detail.responses.length === 0 && (
                  <p className="text-center text-sm text-white/30 py-8 italic">Waiting for response from platform team...</p>
                )}
              </div>

              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full min-h-[100px] rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  required
                />
                <div className="flex justify-end">
                  <Button disabled={sendingReply || !reply.trim()} className="bg-brand">
                    {sendingReply ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Send Reply
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-sm">Ticket Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase text-white/40 font-bold">Priority</p>
                    <p className="text-sm capitalize">{detail.ticket.priority}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/40 font-bold">Ticket ID</p>
                    <p className="text-sm">#{detail.ticket.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/40 font-bold">Last Updated</p>
                    <p className="text-sm">Just now</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => openTicket(ticket.id!)}
              className="group p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-white/5 text-brand group-hover:scale-110 transition-transform`}>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white/90">{ticket.subject}</h3>
                  <p className="text-xs text-white/50 flex items-center gap-2">
                    <History className="h-3 w-3" /> {new Date(ticket.created_at!).toLocaleDateString()}
                    <span className="mx-1">•</span>
                    <span className="capitalize">{ticket.priority} Priority</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      'bg-white/10 text-white/60'
                  }`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
              <LifeBuoy className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No active tickets</h3>
              <p className="text-sm text-white/40 max-w-xs mx-auto mb-6">Need help? Raise a support ticket and our team will get back to you.</p>
              <Button onClick={() => setShowCreate(true)} className="bg-brand">
                Raise Your First Ticket
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

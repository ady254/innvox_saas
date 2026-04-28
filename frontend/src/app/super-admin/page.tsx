"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  fetchMe, 
  superAdminListClients, 
  superAdminUpdateClient,
  superAdminResetPassword,
  superAdminCreateClient,
  ClientData,
  Feature,
  ClientFeatureOverride,
  superAdminListFeatures,
  superAdminGetClientFeatures,
  superAdminSetClientFeature,
  superAdminGetAllTickets,
  superAdminGetSupportTicketDetails,
  superAdminRespondToSupportTicket,
  superAdminUpdateSupportTicketStatus,
  superAdminGetClientAdmins,
  SupportTicket,
  SupportTicketResponse,
  AdminUser
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, ShieldAlert, Key, Edit, Loader2, X, Check, LifeBuoy, Users, Settings, MessageSquare, History } from "lucide-react";
import Link from "next/link";

export default function SuperAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientData[]>([]);
  
  // Creation form state
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    primary_color: "#FF3366",
    plan: "starter",
    admin_name: "",
    admin_email: "",
    admin_password: ""
  });
  const [creating, setCreating] = useState(false);

  // Edit Modal State
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [clientOverrides, setClientOverrides] = useState<ClientFeatureOverride[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [activeTab, setActiveTab] = useState<"clients" | "tickets">("clients");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  
  // Ticket detail view
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponses, setTicketResponses] = useState<SupportTicketResponse[]>([]);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [isInternal, setIsInternal] = useState(0);

  // Client Detail View
  const [clientAdmins, setClientAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  useEffect(() => {
    fetchMe()
      .then((user) => {
        if (user.role !== "super_admin") {
          router.replace("/");
        } else {
          loadClients();
          loadTickets();
          superAdminListFeatures().then(data => setFeatures(data.features)).catch(console.error);
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  const loadClients = async () => {
    try {
      const data = await superAdminListClients();
      setClients(data.clients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await superAdminGetAllTickets();
      setTickets(data.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await superAdminCreateClient(formData);
      setShowCreate(false);
      loadClients();
    } catch (err: any) {
      alert(err.message || "Failed to create client");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (client: ClientData) => {
    try {
      await superAdminUpdateClient(client.id, { is_active: !client.is_active });
      loadClients();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const updatePlan = async (id: number, plan: string) => {
    try {
      await superAdminUpdateClient(id, { plan });
      loadClients();
    } catch (err) {
      alert("Failed to update plan");
    }
  };

  const openEditModal = async (client: ClientData) => {
    setSelectedClient(client);
    setLoadingFeatures(true);
    setLoadingAdmins(true);
    try {
      const [featData, adminData] = await Promise.all([
        superAdminGetClientFeatures(client.id),
        superAdminGetClientAdmins(client.id)
      ]);
      setClientOverrides(featData.overrides);
      setClientAdmins(adminData.admins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeatures(false);
      setLoadingAdmins(false);
    }
  };

  const updateClientDetail = async (payload: Partial<ClientData>) => {
    if (!selectedClient) return;
    try {
      await superAdminUpdateClient(selectedClient.id, payload);
      setSelectedClient({ ...selectedClient, ...payload });
      loadClients();
      // alert("Updated successfully");
    } catch (err) {
      alert("Failed to update");
    }
  };

  const openTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    try {
      const data = await superAdminGetSupportTicketDetails(ticket.id);
      setTicketResponses(data.responses);
    } catch (err) {
      alert("Failed to load ticket details");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !reply.trim()) return;
    setSendingReply(true);
    try {
      await superAdminRespondToSupportTicket(selectedTicket.id, reply, isInternal);
      setReply("");
      // Refresh responses
      const data = await superAdminGetSupportTicketDetails(selectedTicket.id);
      setTicketResponses(data.responses);
      loadTickets(); // Refresh list to update status
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      await superAdminUpdateSupportTicketStatus(ticketId, { status });
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
      loadTickets();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const resetAdminPassword = async (adminId: number) => {
    const newPass = prompt("Enter new password for this admin:");
    if (!newPass) return;
    try {
      await superAdminResetPassword({ user_id: adminId, new_password: newPass });
      alert("Password reset successfully");
    } catch (err) {
      alert("Failed to reset password");
    }
  };

  const closeEditModal = () => {
    setSelectedClient(null);
    setClientOverrides([]);
  };

  const toggleFeature = async (featureName: string) => {
    if (!selectedClient) return;
    const existing = clientOverrides.find(o => o.feature_name === featureName);
    const newState = existing ? !existing.is_enabled : true;

    try {
      await superAdminSetClientFeature({
        client_id: selectedClient.id,
        feature_name: featureName,
        is_enabled: newState
      });
      
      if (existing) {
        setClientOverrides(clientOverrides.map(o => o.feature_name === featureName ? { ...o, is_enabled: newState } : o));
      } else {
        setClientOverrides([...clientOverrides, { id: Date.now(), feature_name: featureName, is_enabled: newState }]);
      }
    } catch (err) {
      alert("Failed to toggle feature");
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
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setActiveTab("clients")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "clients" ? "bg-brand text-white shadow-lg" : "text-white/60 hover:text-white"}`}
            >
              <Users className="mr-2 h-4 w-4" />
              Clients
            </button>
            <button 
              onClick={() => setActiveTab("tickets")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "tickets" ? "bg-brand text-white shadow-lg" : "text-white/60 hover:text-white"}`}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Support Tickets
              {tickets.filter(t => t.status === "open").length > 0 && (
                <span className="ml-2 bg-white text-brand px-1.5 rounded-full text-[10px] font-bold">
                  {tickets.filter(t => t.status === "open").length}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-4">
            <Link href="/super-admin/announcements">
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Global Broadcast
              </Button>
            </Link>
            <Button onClick={() => setShowCreate(!showCreate)} className="bg-brand">
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </div>
        </div>
      </div>

      {showCreate && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Create New Tenant</CardTitle>
            <CardDescription>Provisions a new database segment and admin account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Company Name</label>
                <Input required placeholder="Acme Academy" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-white/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Domain/Host</label>
                <Input required placeholder="acme.localhost" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} className="bg-white/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Brand Color</label>
                <div className="flex gap-2">
                  <Input type="color" className="w-12 h-10 p-1 bg-white/5" value={formData.primary_color} onChange={(e) => setFormData({...formData, primary_color: e.target.value})} />
                  <Input className="bg-white/5 flex-1" value={formData.primary_color} onChange={(e) => setFormData({...formData, primary_color: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Plan</label>
                <select 
                  className="w-full flex h-10 items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-brand"
                  value={formData.plan} 
                  onChange={(e) => setFormData({...formData, plan: e.target.value})}
                >
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              <div className="col-span-2 pt-4 border-t border-white/10 mt-2">
                <h3 className="text-sm font-semibold mb-4 text-brand">Initial Admin User</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Admin Name</label>
                <Input required placeholder="John Doe" value={formData.admin_name} onChange={(e) => setFormData({...formData, admin_name: e.target.value})} className="bg-white/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Admin Email</label>
                <Input required type="email" placeholder="john@acme.com" value={formData.admin_email} onChange={(e) => setFormData({...formData, admin_email: e.target.value})} className="bg-white/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50">Admin Password</label>
                <Input required type="password" placeholder="••••••••" value={formData.admin_password} onChange={(e) => setFormData({...formData, admin_password: e.target.value})} className="bg-white/5" />
              </div>

              <div className="col-span-2 flex justify-end mt-4">
                <Button disabled={creating} className="bg-brand">
                  {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Provision Client
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "clients" ? (
        <div className="rounded-md border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-xs uppercase font-semibold text-white/60">
              <tr>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium">{client.name}</td>
                  <td className="px-6 py-4 text-white/50">{client.domain}</td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-black border border-white/10 rounded px-2 py-1 text-xs"
                      value={client.plan}
                      onChange={(e) => updatePlan(client.id, e.target.value)}
                    >
                      <option value="starter">Starter</option>
                      <option value="growth">Growth</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(client)}
                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${
                        client.is_active ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                      }`}
                    >
                      {client.is_active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-white/50">
                    {client.expiry_date ? new Date(client.expiry_date).toLocaleDateString() : "Lifetime"}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => updateClientDetail({ is_maintenance: !client.is_maintenance })}
                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border transition-colors ${
                        client.is_maintenance ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-white/5 text-white/30 border-white/10 hover:bg-white/10"
                      }`}
                      title={client.is_maintenance ? "Maintenance Active" : "Set to Maintenance"}
                    >
                      Maint.
                    </button>
                    <Button onClick={() => openEditModal(client)} variant="ghost" size="sm" className="h-8 text-white/40 hover:text-white" title="Manage Client">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/40">No clients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
           {/* Tickets List */}
           <div className="md:col-span-1 space-y-4">
              <div className="rounded-md border border-white/10 bg-white/5 overflow-hidden">
                <div className="bg-white/5 p-4 border-b border-white/10">
                  <h2 className="text-sm font-semibold">Active Tickets</h2>
                </div>
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                  {tickets.map(ticket => (
                    <div 
                      key={ticket.id} 
                      onClick={() => openTicket(ticket)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-white/10 ${selectedTicket?.id === ticket.id ? "bg-brand/10 border-l-2 border-brand" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          ticket.status === "open" ? "bg-blue-500/20 text-blue-400" :
                          ticket.status === "resolved" ? "bg-green-500/20 text-green-400" :
                          "bg-white/10 text-white/60"
                        }`}>
                          {ticket.status}
                        </span>
                        <span className="text-[10px] text-white/40">{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-sm font-medium line-clamp-1">{ticket.subject}</h3>
                      <p className="text-xs text-white/50 mt-1 flex items-center">
                        <Users className="h-3 w-3 mr-1" /> {ticket.user_name}
                      </p>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <div className="p-8 text-center text-white/40 text-sm">No tickets found.</div>
                  )}
                </div>
              </div>
           </div>

           {/* Ticket Detail */}
           <div className="md:col-span-2">
              {selectedTicket ? (
                <Card className="border-white/10 bg-white/5 h-full flex flex-col">
                  <CardHeader className="border-b border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedTicket.subject}</CardTitle>
                        <CardDescription>
                          Raised by {selectedTicket.user_name} 
                          <span className="mx-2">•</span>
                          Status: 
                          <select 
                            className="ml-2 bg-transparent border-none text-brand focus:ring-0 p-0 text-sm font-medium"
                            value={selectedTicket.status}
                            onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        selectedTicket.priority === "critical" ? "bg-red-500 text-white" :
                        selectedTicket.priority === "high" ? "bg-orange-500/20 text-orange-400" :
                        "bg-white/10 text-white/60"
                      }`}>
                        {selectedTicket.priority} Priority
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                    </div>

                    <div className="space-y-4">
                      {ticketResponses.map(res => (
                        <div key={res.id} className={`flex flex-col ${res.is_internal ? "border-l-4 border-yellow-500/50 bg-yellow-500/5" : ""}`}>
                          <div className="flex justify-between text-[10px] text-white/40 mb-1 px-2">
                            <span>{res.user_name} {res.is_internal ? "(Internal Note)" : ""}</span>
                            <span>{new Date(res.created_at).toLocaleString()}</span>
                          </div>
                          <div className={`p-3 rounded-lg text-sm ${res.is_internal ? "bg-yellow-500/10 text-yellow-200" : "bg-white/10"}`}>
                            {res.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t border-white/10 bg-white/5">
                    <form onSubmit={handleReply} className="space-y-3">
                      <textarea 
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your response..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-brand focus:outline-none min-h-[100px]"
                        required
                      />
                      <div className="flex justify-between items-center">
                        <label className="flex items-center text-xs text-white/60 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="mr-2 rounded border-white/10 bg-white/5 text-brand focus:ring-brand"
                            checked={isInternal === 1}
                            onChange={(e) => setIsInternal(e.target.checked ? 1 : 0)}
                          />
                          Internal Note (Hidden from Admin)
                        </label>
                        <Button disabled={sendingReply || !reply.trim()} className="bg-brand">
                          {sendingReply ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                          Send Reply
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-lg bg-white/5 p-12 text-center">
                  <div>
                    <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Select a ticket</h3>
                    <p className="text-sm text-white/40 max-w-xs mx-auto">Select a ticket from the left to view details and respond to the tenant admin.</p>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl border-white/10 bg-black shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-white/5 pb-4">
              <div>
                <CardTitle className="text-xl">{selectedClient.name}</CardTitle>
                <CardDescription>{selectedClient.domain} - {selectedClient.plan} Plan</CardDescription>
              </div>
              <Button onClick={closeEditModal} variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-brand mb-4 flex items-center">
                        <Settings className="h-4 w-4 mr-2" /> Feature Overrides
                      </h3>
                      <p className="text-xs text-white/50 mb-4">
                        Enable or disable specific features for this client.
                      </p>
                      
                      {loadingFeatures ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-brand" /></div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {features.map(f => {
                            const override = clientOverrides.find(o => o.feature_name === f.name);
                            const isEnabled = override ? override.is_enabled : false;
                            
                            return (
                              <div 
                                key={f.id} 
                                onClick={() => toggleFeature(f.name)}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                  isEnabled 
                                    ? "border-green-500/30 bg-green-500/10 text-green-400" 
                                    : "border-white/10 bg-white/5 hover:bg-white/10 text-white/70"
                                }`}
                              >
                                <span className="text-sm font-medium">{f.display_name || f.name}</span>
                                {isEnabled && <Check className="h-4 w-4 text-green-400" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-brand mb-4 flex items-center">
                        <Key className="h-4 w-4 mr-2" /> Admin Credentials
                      </h3>
                      <p className="text-xs text-white/50 mb-4">
                        Existing administrators for this tenant.
                      </p>
                      
                      {loadingAdmins ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-brand" /></div>
                      ) : (
                        <div className="space-y-3">
                          {clientAdmins.map(admin => (
                            <div key={admin.id} className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium">{admin.name}</p>
                                  <p className="text-xs text-white/40">{admin.email}</p>
                                </div>
                                <Button onClick={() => resetAdminPassword(admin.id)} variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-white/40 hover:text-white">
                                  Reset Pass
                                </Button>
                              </div>
                            </div>
                          ))}
                          {clientAdmins.length === 0 && <p className="text-xs text-center text-white/30 p-4">No admins found</p>}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-lg bg-brand/5 border border-brand/10 space-y-4">
                       <h3 className="text-xs font-bold uppercase text-brand mb-2">Billing & Integration</h3>
                       <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-white/40 uppercase font-bold">Razorpay Key</label>
                            <Input 
                              value={selectedClient.razorpay_key || ""} 
                              onChange={(e) => setSelectedClient({...selectedClient, razorpay_key: e.target.value})}
                              onBlur={(e) => updateClientDetail({ razorpay_key: e.target.value })}
                              className="bg-black/40 border-white/10 h-8 text-xs font-mono"
                              placeholder="rzp_test_..."
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-white/40 uppercase font-bold">Razorpay Secret</label>
                            <Input 
                              type="password"
                              value={selectedClient.razorpay_secret || ""} 
                              onChange={(e) => setSelectedClient({...selectedClient, razorpay_secret: e.target.value})}
                              onBlur={(e) => updateClientDetail({ razorpay_secret: e.target.value })}
                              className="bg-black/40 border-white/10 h-8 text-xs font-mono"
                              placeholder="••••••••••••••••"
                            />
                          </div>
                          <div className="pt-2">
                             <div className="flex items-center justify-between p-3 rounded-md bg-orange-500/5 border border-orange-500/20">
                                <span className="text-xs font-medium text-orange-200">Maintenance Mode</span>
                                <button 
                                  onClick={() => updateClientDetail({ is_maintenance: !selectedClient.is_maintenance })}
                                  className={`w-10 h-5 rounded-full relative transition-colors ${selectedClient.is_maintenance ? "bg-orange-500" : "bg-white/10"}`}
                                >
                                   <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${selectedClient.is_maintenance ? "right-1" : "left-1"}`} />
                                </button>
                             </div>
                             <p className="text-[10px] text-white/30 mt-1 italic">When active, users see a maintenance screen.</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}

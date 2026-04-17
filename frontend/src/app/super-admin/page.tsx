"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  fetchMe, 
  superAdminListClients, 
  superAdminUpdateClient,
  superAdminResetPassword,
  superAdminCreateClient,
  ClientData
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, ShieldAlert, Key, Edit, Loader2 } from "lucide-react";
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

  useEffect(() => {
    fetchMe()
      .then((user) => {
        if (user.role !== "super_admin") {
          router.replace("/");
        } else {
          loadClients();
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

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Global SaaS Management</h1>
          <p className="text-white/60">Manage all tenant clients and subscriptions.</p>
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
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="h-8 text-white/40 hover:text-white" title="Actions coming soon">
                    <Edit className="h-4 w-4" />
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
    </div>
  );
}

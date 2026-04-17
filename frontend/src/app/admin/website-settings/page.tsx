"use client";
import React from "react";
import { 
  fetchPageContent, 
  updatePageContent, 
  PageContent, 
  fetchTestimonials, 
  adminAddTestimonial, 
  adminDeleteTestimonial, 
  Testimonial,
  adminGetContactInfo,
  adminUpdateContactInfo,
  ContactSettings
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Info, 
  Mail, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  MessageSquare,
  Phone,
  PlusCircle,
  X
} from "lucide-react";

type PageType = "home" | "about" | "contact" | "testimonials";

export default function AdminPages() {
  const [activeTab, setActiveTab] = React.useState<PageType>("home");
  const [formData, setFormData] = React.useState<PageContent>({
    title: "",
    subtitle: "",
    content: "",
    banner_image: "",
    cta_text: "",
  });
  
  const [contactSettings, setContactSettings] = React.useState<ContactSettings>({
    id: 0,
    phones: [],
    emails: [],
    address: "",
    updated_at: ""
  });

  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
  const [newTestimonial, setNewTestimonial] = React.useState<Partial<Testimonial>>({
    name: "",
    course_name: "",
    content: "",
  });

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "testimonials") {
        const data = await fetchTestimonials();
        setTestimonials(data);
      } else if (activeTab === "contact") {
        const [page, contact] = await Promise.all([
          fetchPageContent("contact"),
          adminGetContactInfo()
        ]);
        setFormData(page);
        setContactSettings(contact);
      } else {
        const data = await fetchPageContent(activeTab);
        setFormData(data);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (activeTab === "contact") {
        await Promise.all([
          updatePageContent("contact", formData),
          adminUpdateContactInfo(contactSettings)
        ]);
      } else {
        await updatePageContent(activeTab as any, formData);
      }
      setMessage({ type: "success", text: "Page content updated successfully!" });
    } catch (err) {
      console.error("Failed to save:", err);
      setMessage({ type: "error", text: "Failed to save changes. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Dynamic Contact Handlers
  const addPhone = () => setContactSettings({ ...contactSettings, phones: [...contactSettings.phones, ""] });
  const updatePhone = (index: number, val: string) => {
    const newPhones = [...contactSettings.phones];
    newPhones[index] = val;
    setContactSettings({ ...contactSettings, phones: newPhones });
  };
  const removePhone = (index: number) => setContactSettings({ ...contactSettings, phones: contactSettings.phones.filter((_, i) => i !== index) });

  const addEmail = () => setContactSettings({ ...contactSettings, emails: [...contactSettings.emails, ""] });
  const updateEmail = (index: number, val: string) => {
    const newEmails = [...contactSettings.emails];
    newEmails[index] = val;
    setContactSettings({ ...contactSettings, emails: newEmails });
  };
  const removeEmail = (index: number) => setContactSettings({ ...contactSettings, emails: contactSettings.emails.filter((_, i) => i !== index) });

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAddTestimonial(newTestimonial);
      setNewTestimonial({ name: "", course_name: "", content: "" });
      loadData();
      setMessage({ type: "success", text: "Testimonial added!" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to add testimonial." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await adminDeleteTestimonial(id);
      loadData();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const tabs: { id: PageType; label: string; icon: any }[] = [
    { id: "home", label: "Home Page", icon: Home },
    { id: "about", label: "About Page", icon: Info },
    { id: "contact", label: "Contact Page", icon: Mail },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Website Settings</h1>
        <p className="text-white/60">Customize the content and appearance of your public pages.</p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tab Switcher */}
        <div className="flex flex-row gap-1 border-b border-white/10 pb-4 overflow-x-auto lg:flex-col lg:w-56 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1">
          {loading ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
              </CardContent>
            </Card>
          ) : activeTab === "testimonials" ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <Card className="border-white/10 bg-white/5 shadow-xl">
                <CardHeader>
                  <CardTitle>Add Testimonial</CardTitle>
                  <CardDescription>Share a student success story on your home page.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTestimonial} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Student Name</label>
                        <Input
                          required
                          value={newTestimonial.name}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Course/Role</label>
                        <Input
                          value={newTestimonial.course_name || ""}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, course_name: e.target.value })}
                          placeholder="e.g. Web Dev Graduate"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Testimonial Content</label>
                      <Textarea
                        required
                        value={newTestimonial.content}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                        placeholder="What did they achieve?"
                        className="bg-white/5 border-white/10 min-h-[100px]"
                      />
                    </div>
                    <Button disabled={saving} className="bg-brand">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Add Testimonial
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {testimonials.map((t) => (
                  <Card key={t.id} className="border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="text-lg">{t.name}</CardTitle>
                        <CardDescription className="text-brand/70 text-xs font-bold uppercase tracking-wider">
                          {t.course_name}
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => handleDeleteTestimonial(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/70 italic">"{t.content}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-white/10 bg-white/5 shadow-xl animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="capitalize">{activeTab} Content</CardTitle>
                <CardDescription>
                  Configure how the {activeTab} page appears to your students.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveContent} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Page Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Welcome to our academy"
                        className="bg-white/5 border-white/10 focus:border-brand"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Banner Image URL</label>
                      <Input
                        value={formData.banner_image || ""}
                        onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="bg-white/5 border-white/10 focus:border-brand"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Subtitle / Tagline</label>
                      <Input
                        value={formData.subtitle || ""}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="The best place to learn modern technology"
                        className="bg-white/5 border-white/10 focus:border-brand"
                      />
                    </div>
                    {activeTab === "home" && (
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium">CTA Button Text</label>
                        <Input
                          value={formData.cta_text || ""}
                          onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                          placeholder="Explore Catalog"
                          className="bg-white/5 border-white/10 focus:border-brand"
                        />
                      </div>
                    )}
                    
                    {activeTab === "contact" && (
                      <div className="md:col-span-2 space-y-6 border-y border-white/5 py-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand">Phone Numbers</label>
                            <Button type="button" variant="ghost" size="sm" onClick={addPhone} className="text-brand h-7">
                              <PlusCircle className="mr-1 h-3 w-3" /> Add Phone
                            </Button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {contactSettings.phones.map((p, i) => (
                              <div key={i} className="flex gap-2">
                                <Input 
                                  value={p} 
                                  onChange={(e) => updatePhone(i, e.target.value)}
                                  placeholder="+91 99999 99999"
                                  className="bg-white/5 border-white/10 h-9"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removePhone(i)} className="text-white/20 hover:text-red-400 h-9 w-9">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand">Email Addresses</label>
                            <Button type="button" variant="ghost" size="sm" onClick={addEmail} className="text-brand h-7">
                              <PlusCircle className="mr-1 h-3 w-3" /> Add Email
                            </Button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {contactSettings.emails.map((em, i) => (
                              <div key={i} className="flex gap-2">
                                <Input 
                                  value={em} 
                                  onChange={(e) => updateEmail(i, e.target.value)}
                                  placeholder="contact@academy.com"
                                  className="bg-white/5 border-white/10 h-9"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeEmail(i)} className="text-white/20 hover:text-red-400 h-9 w-9">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-brand">Office Address</label>
                          <Textarea 
                            value={contactSettings.address}
                            onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                            placeholder="Full physical address..."
                            className="bg-white/5 border-white/10 min-h-[80px]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">
                        {activeTab === "contact" ? "Contact Page Content (Extra)" : "Main Content"}
                      </label>
                      <Textarea
                        value={formData.content || ""}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder={activeTab === "contact" ? "Brief description or message..." : "Tell your story..."}
                        className="min-h-[150px] bg-white/5 border-white/10 focus:border-brand resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-6">
                    <div>
                      {message && (
                        <p className={cn(
                          "text-sm font-medium animate-in fade-in slide-in-from-left-2",
                          message.type === "success" ? "text-green-400" : "text-red-400"
                        )}>
                          {message.text}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-brand hover:brightness-110 text-white min-w-[140px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  Mail, 
  MessageSquare, 
  Phone, 
  Star,
  User,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnnouncementBanner } from "@/components/announcements/announcement-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  fetchPageContent, 
  fetchCourses, 
  fetchTestimonials,
  submitLead,
  getToken,
  type PageContent, 
  type Course, 
  type Testimonial 
} from "@/lib/api";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [homeData, setHomeData] = useState<PageContent | null>(null);
  const [aboutData, setAboutData] = useState<PageContent | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lead Form State
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [home, about, courseList, feedback] = await Promise.all([
          fetchPageContent("home"),
          fetchPageContent("about"),
          fetchCourses(),
          fetchTestimonials()
        ]);
        setHomeData(home);
        setAboutData(about);
        setCourses(courseList.slice(0, 3)); // Show top 3
        setTestimonials(feedback);
      } catch (error) {
        console.error("Failed to load home page data", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    try {
      await submitLead({ name: leadName, email: leadEmail, message: leadMessage });
      setLeadSuccess(true);
      setLeadName("");
      setLeadEmail("");
      setLeadMessage("");
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setSubmittingLead(false);
    }
  };

  const handleEnroll = (courseId: number) => {
    if (!getToken()) {
      router.push(`/login?redirect=/courses`);
      return;
    }
    router.push(`/courses`); // Go to course list/details to enroll
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-20">
      <AnnouncementBanner />
      {/* 1. HERO SECTION */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand/20 via-black to-black px-6 py-20 text-center">
        <div className="absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        {homeData?.banner_image && (
          <div 
            className="absolute inset-0 -z-20 opacity-30 bg-cover bg-center mix-blend-overlay" 
            style={{ backgroundImage: `url(${homeData.banner_image})` }} 
          />
        )}
        
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
            <Zap className="h-4 w-4" />
            <span>Join over 1,000+ students today</span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
            {homeData?.title || "Unlock Your Next Level of Skill"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-white/60">
            {homeData?.subtitle || "Professional courses designed to help you master modern technologies and launch your career in tech."}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="h-14 bg-brand px-8 text-lg font-bold hover:brightness-110">
                {homeData?.cta_text || "Explore Courses"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="h-14 border-white/10 px-8 text-lg hover:bg-white/5">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COURSES */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gradient">Featured Courses</h2>
          <p className="text-white/60 max-w-xl mx-auto">Start your journey with our most popular learning tracks.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="group flex flex-col border-white/10 bg-white/5 transition-all hover:border-brand/50 hover:bg-white/10">
              <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-white/5">
                <img 
                  src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop`} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
                    {course.price > 0 ? `$${course.price}` : "Free"}
                  </span>
                  {course.is_enrolled && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl group-hover:text-brand transition-colors">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-white/50">{course.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-0">
                <Button 
                  onClick={() => handleEnroll(course.id)}
                  className={cn(
                    "w-full font-bold",
                    course.is_enrolled ? "bg-white/10 hover:bg-white/20" : "bg-brand hover:brightness-110"
                  )}
                >
                  {course.is_enrolled ? "Continue Learning" : "Enroll Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Link href="/courses">
            <Button variant="ghost" className="text-brand hover:bg-brand/10">
              View all courses <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 3. TESTIMONIALS */}
      <section className="rounded-3xl border border-white/5 bg-white/2 p-8 md:p-16 space-y-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Student Feedback</h2>
            <p className="text-white/50 italic">Real results from real students across our platform.</p>
          </div>
          <div className="flex gap-1 text-brand">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-5 w-5 fill-current" />)}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.length > 0 ? (
            testimonials.map((t) => (
              <Card key={t.id} className="border-white/5 bg-black p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand/20 flex items-center justify-center text-brand">
                    {t.avatar_url ? <img src={t.avatar_url} className="h-full w-full rounded-full object-cover" /> : <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-white/40">{t.course_name || "Graduate"}</div>
                  </div>
                </div>
                <p className="text-sm text-white/70 italic leading-relaxed">"{t.content}"</p>
              </Card>
            ))
          ) : (
            <>
              <Card className="border-white/5 bg-black p-6 space-y-4">
                <p className="text-sm text-white/70 italic leading-relaxed">
                  "I landed my first freelance client after this course. The practical approach is unmatched!"
                </p>
                <div className="font-semibold text-sm">— Ahmed R., Web Dev Graduate</div>
              </Card>
              <Card className="border-white/5 bg-black p-6 space-y-4">
                <p className="text-sm text-white/70 italic leading-relaxed">
                  "The community and mentor support helped me transition into a senior role in just 4 months."
                </p>
                <div className="font-semibold text-sm">— Sarah L., Cloud Engineer</div>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* 4. ABOUT & CONTACT MINI */}
      <div className="grid gap-12 lg:grid-cols-2">
        {/* About Preview */}
        <section className="space-y-6 flex flex-col justify-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">About Our Academy</h2>
            <div className="h-1 w-12 bg-brand rounded-full"></div>
            <p className="text-lg text-white/60 leading-relaxed max-w-lg">
              {aboutData?.subtitle || "We are dedicated to providing the highest quality education for tomorrow's technology leaders."}
            </p>
            <p className="line-clamp-4 text-white/40">
              {aboutData?.content || "Founded with a mission to bridge the gap between academia and industry, Innvox Academy provides hands-on, project-based learning experiences."}
            </p>
          </div>
          <Link href="/about">
            <Button variant="outline" className="w-fit border-white/10 hover:bg-white/5">
              Read our full story
            </Button>
          </Link>
        </section>

        {/* Lead Capture Form */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-8 md:p-10 shadow-2xl">
          <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-bold">Have Questions?</h2>
            <p className="text-sm text-white/50">Send us a message and our team will get back to you within 24 hours.</p>
          </div>

          {leadSuccess ? (
            <div className="flex aspect-video flex-col items-center justify-center space-y-4 text-center animate-in zoom-in-95 duration-300">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Message Sent!</h3>
              <p className="text-sm text-white/50">Thank you for reaching out. Check your email soon.</p>
              <Button variant="ghost" className="text-brand" onClick={() => setLeadSuccess(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Name</label>
                  <input 
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email</label>
                  <input 
                    required
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={leadMessage}
                  onChange={(e) => setLeadMessage(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-all"
                  placeholder="How can we help you?"
                />
              </div>
              <Button type="submit" disabled={submittingLead} className="w-full h-12 bg-brand font-bold hover:brightness-110">
                {submittingLead ? "Sending..." : "Send Message"}
                <MessageSquare className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}


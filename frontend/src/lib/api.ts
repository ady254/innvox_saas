export type ClientConfig = {
  id?: number;
  name?: string;
  domain?: string;
  primary_color?: string;
  logo?: string | null;
  plan?: string;
  expiry_date?: string | null;
  allowed_languages?: string[];
  active_features?: string[];
};

export type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  client_id: number;
  is_enrolled?: boolean;
};

type ApiOptions = Omit<RequestInit, "headers"> & {
  auth?: boolean;
  headers?: Record<string, string>;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export function setToken(token: string) {
  window.localStorage.setItem("token", token);
}

export function clearToken() {
  window.localStorage.removeItem("token");
}

export function getHostname(): string {
  if (typeof window === "undefined") return "localhost";
  return window.location.hostname;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // 🔥 ADD THIS (IMPORTANT)
  if (typeof window !== "undefined") {
    headers["X-Tenant-Domain"] = window.location.hostname;
  }

  if (options.auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return (await res.json()) as T;
}

/** Tenant branding: backend resolves tenant from the Host header (same origin as API base URL). */
export async function fetchClientConfig(): Promise<ClientConfig> {
  return apiFetch<ClientConfig>("/client-config");
}

export async function signup(payload: { name: string; email: string; password: string }) {
  return apiFetch(`/auth/signup`, {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    }),
  });
}

export async function login(payload: { email: string; password: string }) {
  return apiFetch<{ access_token: string; token_type: string }>(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });
}

export async function fetchCourses(): Promise<Course[]> {
  return apiFetch<Course[]>(`/courses`, { method: "GET" });
}

export async function createOrder(courseId: number) {
  return apiFetch<{
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
    course: { id: number; title: string; price: number; client_id: number };
  }>(`/create-order/${courseId}`, { method: "POST", auth: true });
}

export async function verifyPayment(payload: {
  course_id: number;
  payment_id: string;
  order_id: string;
  signature: string;
}) {
  return apiFetch(`/verify-payment`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function fetchMyCourses() {
  return apiFetch<{ count: number; courses: Course[] }>(`/my-courses`, {
    method: "GET",
    auth: true,
  });
}

export type Me = {
  id: number;
  name: string;
  email: string;
  role: string;
  client_id: number;
};

export async function fetchMe(): Promise<Me> {
  return apiFetch<Me>(`/auth/me`, { method: "GET", auth: true });
}

export async function adminCreateCourse(payload: {
  title: string;
  description: string;
  price: number;
}) {
  return apiFetch<{ message: string; course: Course }>(`/admin/course`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function adminListStudents() {
  return apiFetch<{
    count: number;
    students: {
      id: number;
      name: string;
      email: string;
      role: string;
      created_at: string | null;
    }[];
  }>(`/admin/students`, { method: "GET", auth: true });
}

export async function adminListEnrollments() {
  return apiFetch<{
    count: number;
    enrollments: {
      id: number;
      payment_status: string;
      created_at: string | null;
      student: { id: number; name: string; email: string };
      course: { id: number; title: string; price: number };
    }[];
  }>(`/admin/enrollments`, { method: "GET", auth: true });
}

export async function adminListPayments() {
  return apiFetch<{
    count: number;
    payments: {
      enrollment_id: number;
      amount: number;
      currency: string;
      payment_status: string;
      created_at: string | null;
      student: { id: number; name: string; email: string };
      course: { id: number; title: string };
    }[];
  }>(`/admin/payments`, { method: "GET", auth: true });
}

export type ClassSession = {
  id: number;
  title: string;
  meeting_link: string;
  date_time: string;
  course_id: number;
  client_id: number;
};

export type Result = {
  id: number;
  user_id: number;
  course_id: number;
  marks: number;
  grade: string | null;
  remarks: string | null;
  client_id: number;
  created_at: string;
  student_name?: string;
  student_email?: string;
};

export async function adminGetEnrolledStudents(courseId: number) {
  return apiFetch<{ count: number; students: { id: number; name: string; email: string }[] }>(
    `/admin/course/${courseId}/students`,
    { method: "GET", auth: true }
  );
}

export async function adminCreateClass(payload: { title: string; meeting_link: string; date_time: string; course_id: number }) {
  return apiFetch<{ message: string; class_id: number }>(`/admin/class`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function adminGetClasses(courseId: number) {
  return apiFetch<{ classes: ClassSession[] }>(`/admin/classes/${courseId}`, { method: "GET", auth: true });
}

export async function adminCreateResult(payload: { user_id: number; course_id: number; marks: number; grade: string | null; remarks: string | null }) {
  return apiFetch<{ message: string; result_id: number }>(`/admin/result`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function adminGetResults(courseId: number) {
  return apiFetch<{ results: Result[] }>(`/admin/results/${courseId}`, { method: "GET", auth: true });
}

export async function studentGetClasses(courseId: number) {
  return apiFetch<{ classes: ClassSession[] }>(`/classes/${courseId}`, { method: "GET", auth: true });
}

export async function studentGetMyResults() {
  return apiFetch<{ results: Result[] }>(`/my-results`, { method: "GET", auth: true });
}

export type PageContent = {
  title: string;
  subtitle?: string;
  content?: string;
  banner_image?: string;
  cta_text?: string;
  page_name?: string;
};

export async function fetchPageContent(pageName: string): Promise<PageContent> {
  return apiFetch<PageContent>(`/page-content/${pageName}`);
}

export async function updatePageContent(pageName: string, data: Partial<PageContent>) {
  return apiFetch<PageContent>(`/admin/page-content/${pageName}`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}
export type Testimonial = {
  id: number;
  name: string;
  course_name?: string;
  content: string;
  avatar_url?: string;
  created_at: string;
};

export async function submitLead(payload: { name: string; email: string; message: string }) {
  return apiFetch(`/leads`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  return apiFetch<Testimonial[]>(`/testimonials`, { method: "GET" });
}

export async function adminAddTestimonial(payload: Partial<Testimonial>) {
  return apiFetch<Testimonial>(`/admin/testimonials`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteTestimonial(id: number) {
  return apiFetch(`/admin/testimonials/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

// --- Announcements ---

export type Announcement = {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  created_at: string;
};

export async function fetchGeneralAnnouncements(): Promise<Announcement[]> {
  return apiFetch<Announcement[]>(`/announcements/general`);
}

export async function fetchStudentAnnouncements(): Promise<Announcement[]> {
  return apiFetch<Announcement[]>(`/announcements/student`, { auth: true });
}

export async function adminCreateAnnouncement(payload: Partial<Announcement>) {
  return apiFetch<{ message: string; announcement_id: number }>(`/admin/announcement`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function adminListAnnouncements(): Promise<Announcement[]> {
  return apiFetch<Announcement[]>(`/admin/announcements`, { auth: true });
}

export async function adminDeleteAnnouncement(id: number) {
  return apiFetch(`/admin/announcement/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

// --- Contact Settings ---

export type ContactSettings = {
  id: number;
  phones: string[];
  emails: string[];
  address: string;
  updated_at: string | null;
};

export async function fetchContactInfo(): Promise<ContactSettings> {
  // Use public endpoint if it exists, otherwise use admin if needed. 
  // Let's assume we use /admin/contact-info for now OR add a public one.
  // The plan mentioned GET /contact-info (admin) and GET /contact-info (public).
  // Actually I added GET /admin/contact-info. I'll add a public one in admin_routes or a separate one.
  return apiFetch<ContactSettings>(`/admin/contact-info`, { auth: false }); 
}

export async function adminGetContactInfo(): Promise<ContactSettings> {
  return apiFetch<ContactSettings>(`/admin/contact-info`, { auth: true });
}

export async function adminUpdateContactInfo(payload: Partial<ContactSettings>) {
  return apiFetch<ContactSettings>(`/admin/contact-info`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

// --- Super Admin ---

export type ClientData = {
  id: number;
  name: string;
  domain: string;
  plan: string;
  is_active: boolean;
  expiry_date: string | null;
  created_at: string | null;
};

export async function superAdminListClients(): Promise<{ clients: ClientData[] }> {
  return apiFetch<{ clients: ClientData[] }>(`/super-admin/clients`, { auth: true });
}

export async function superAdminCreateClient(payload: any) {
  return apiFetch(`/super-admin/client`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function superAdminUpdateClient(id: number, payload: Partial<ClientData>) {
  return apiFetch(`/super-admin/client/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function superAdminResetPassword(payload: { user_id: number; new_password: string }) {
  return apiFetch(`/super-admin/reset-admin-password`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export type PlatformAnnouncement = {
  id: number;
  message: string;
  type: string;
  priority: string;
  target: string;
  created_at: string;
};

export async function superAdminCreatePlatformAnnouncement(payload: Partial<PlatformAnnouncement>) {
  return apiFetch(`/super-admin/announcement`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function fetchPlatformAnnouncements(): Promise<{ announcements: PlatformAnnouncement[] }> {
  return apiFetch<{ announcements: PlatformAnnouncement[] }>(`/super-admin/announcements`);
}

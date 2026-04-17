import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin Dashboard',
  description: 'Global SaaS Platform Management',
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-brand/30">
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

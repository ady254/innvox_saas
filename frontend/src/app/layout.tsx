import "./globals.css";

import type { Metadata } from "next";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TenantProvider } from "@/components/tenant-provider";

export const metadata: Metadata = {
  title: "Innvox SaaS",
  description: "Multi-tenant SaaS platform",
};

import { I18nProvider } from "@/components/i18n-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="min-h-screen bg-black text-white selection:bg-brand/30">
        <I18nProvider>
          <TenantProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
                {children}
              </main>
              <Footer />
            </div>
          </TenantProvider>
        </I18nProvider>
      </body>
    </html>
  );
}


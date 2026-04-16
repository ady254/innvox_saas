"use client";

import Link from "next/link";
import { useTenant } from "./tenant-provider";

export function Footer() {
  const { client } = useTenant();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10 bg-black/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-brand">
              {client.name || "Innvox"}
            </Link>
            <p className="max-w-xs text-sm text-white/50">
              Empowering learners with professional-grade courses and state-of-the-art SaaS solutions for modern education.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Platform</h3>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/courses" className="hover:text-brand transition-colors">Courses</Link></li>
              <li><Link href="/about" className="hover:text-brand transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-brand transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <ul className="space-y-2 text-sm text-white/50">
              <li>support@{client.domain || "tenant.com"}</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-white/30">
          <p>© {currentYear} {client.name}. All rights reserved. Powered by Innvox SaaS.</p>
        </div>
      </div>
    </footer>
  );
}

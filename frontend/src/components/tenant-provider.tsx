"use client";

import React from "react";
import { ClientConfig, fetchClientConfig } from "@/lib/api";

type TenantState = {
  loading: boolean;
  client: ClientConfig;
};

const TenantContext = React.createContext<TenantState | null>(null);

export function useTenant() {
  const ctx = React.useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}

// ---------------- DEFAULT ----------------

const defaultTenant: ClientConfig = {
  name: "Innvox",
  primary_color: "#1E90FF",
  logo: null,
};

// ---------------- COLOR CONVERT ----------------

function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
    l * 100
  )}%`;
}

// ---------------- APPLY BRAND ----------------

function applyBrand(color?: string) {
  const c = color || defaultTenant.primary_color;
  if (c) {
    document.documentElement.style.setProperty("--brand", hexToHsl(c));
  }
}

// ---------------- PROVIDER ----------------

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<TenantState>({
    loading: true,
    client: defaultTenant,
  });

  React.useEffect(() => {
    (async () => {
      try {
        const cfg = await fetchClientConfig();

        applyBrand(cfg.primary_color);

        setState({
          loading: false,
          client: cfg,
        });
      } catch (err) {
        console.error("Tenant fallback triggered");

        applyBrand(defaultTenant.primary_color);

        setState({
          loading: false,
          client: defaultTenant,
        });
      }
    })();
  }, []);

  return (
    <TenantContext.Provider value={state}>
      {children}
    </TenantContext.Provider>
  );
}
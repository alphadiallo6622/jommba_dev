"use client";
// components/admin/admin-shell.tsx
import { useState } from "react";
import { Sidebar, type NavBadges } from "./sidebar";
import { Topbar } from "./topbar";
import { ToastProvider } from "./ui/toast";
import type { AdminNotification, AdminIdentity } from "@/lib/admin/types";

const DEFAULT_IDENTITY: AdminIdentity = {
  name: "Admin Jommba",
  email: "admin@jommba.com",
  role: "super-admin",
  isMaster: true,
};

export function AdminShell({
  children,
  badges,
  notifications,
  identity,
}: {
  children: React.ReactNode;
  badges?: NavBadges;
  notifications?: AdminNotification[];
  identity?: AdminIdentity;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const admin = identity ?? DEFAULT_IDENTITY;

  return (
    <ToastProvider>
    <div className="min-h-screen bg-[var(--color-canvas)] flex">
      {/* Desktop sidebar — fixed */}
      <div className="hidden lg:block w-60 shrink-0 fixed inset-y-0 left-0 z-30">
        <Sidebar badges={badges} identity={admin} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-60 h-full">
            <Sidebar badges={badges} identity={admin} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <div className="sticky top-0 z-20">
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
            notifications={notifications ?? []}
            identity={admin}
          />
        </div>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
    </ToastProvider>
  );
}

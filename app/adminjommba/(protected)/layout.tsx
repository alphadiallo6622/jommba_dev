// app/admin/(protected)/layout.tsx
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { template: "%s | Jommba Admin", default: "Jommba Admin" },
  robots: "noindex,nofollow",
};

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
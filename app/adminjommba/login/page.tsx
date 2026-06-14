"use client";
// app/admin/login/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/adminjommba");
      } else {
        const data = await res.json();
        setError(data.error ?? "Identifiants invalides");
      }
    } catch {
      setError("Erreur de connexion, veuillez réessayer.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[var(--color-surface)] rounded-2xl border border-[var(--color-line)] shadow-[var(--shadow-pop)] p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-600)] flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">
            Jommba Admin
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Connexion au panneau d&apos;administration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
              E-mail
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-line)] rounded-lg bg-[var(--color-canvas)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
              Mot de passe
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-line)] rounded-lg bg-[var(--color-canvas)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[var(--color-brand-600)] text-white font-semibold text-sm hover:bg-[var(--color-brand-700)] disabled:opacity-60 transition-colors"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
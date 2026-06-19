"use client";
// app/admin/(protected)/parametres/page.tsx
import { useState, type ElementType } from "react";
import {
  UserPlus, MoreHorizontal, Bot, Database, Lock,
  CreditCard, Cloud, Mail, X, Pencil, MailIcon, Trash2,
  ChevronDown, Globe, Wallet, Eye, EyeOff,
} from "lucide-react";
import { Avatar } from "@/components/admin/ui/avatar";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { useToast } from "@/components/admin/ui/toast";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type AdminStatus = "active" | "invited";
interface AdminEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  status: AdminStatus;
  lastSeen: string;
}

type ModalState =
  | null
  | { admin: AdminEntry; step: "actions" }
  | { admin: AdminEntry; step: "editRole"; newRole: string }
  | { admin: AdminEntry; step: "confirmRemove" };

interface ApiService {
  id: string;
  name: string;
  desc: string;
  icon: ElementType;
  productionActive: boolean;
  kind?: "payment";
}

/* ── Constants ──────────────────────────────────────────────────────────────── */
const INIT_ADMINS: AdminEntry[] = [
  { id: "a1", name: "Admin Jommba",  email: "admin@jommba.com",    role: "super-admin", status: "active",  lastSeen: "Aujourd'hui" },
  { id: "a2", name: "Modérateur",    email: "mod@jommba.com",      role: "modération",  status: "active",  lastSeen: "Il y a 2 h"  },
  { id: "a3", name: "Aïssatou Ba",   email: "aissatou@jommba.com", role: "support",     status: "invited", lastSeen: "En attente"  },
];

const ROLES = ["super-admin", "modération", "support", "lecture seule"];

const INIT_API_SERVICES: ApiService[] = [
  { id: "ai",     name: "Anthropic — Coach IA",  desc: "Claude Sonnet 4.6 · clé configurée",  icon: Bot,        productionActive: true  },
  { id: "stripe", name: "Stripe",                desc: "Paiements Premium & Boosts",           icon: CreditCard, productionActive: false, kind: "payment" },
  { id: "square", name: "Square",                desc: "Alternative de paiement",              icon: Wallet,     productionActive: false, kind: "payment" },
  { id: "db",     name: "PostgreSQL / Prisma",   desc: "Base de données principale",           icon: Database,   productionActive: true  },
  { id: "auth",   name: "NextAuth.js",           desc: "Authentification & sessions",          icon: Lock,       productionActive: true  },
  { id: "google", name: "Google OAuth",          desc: "Connexion via compte Google",          icon: Globe,      productionActive: false },
  { id: "cloud",  name: "Cloudinary",            desc: "Stockage des photos de profil",        icon: Cloud,      productionActive: false },
  { id: "email",  name: "Email transactionnel",  desc: "OTP, bienvenue, resets",               icon: Mail,       productionActive: false },
];

/* ── Toggle switch ──────────────────────────────────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative rounded-full transition-colors shrink-0"
      style={{ width: 40, height: 22, background: on ? "var(--color-brand-600)" : "var(--color-line-2)" }}
    >
      <span
        className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all"
        style={{ left: on ? "calc(100% - 20px)" : "2px" }}
      />
    </button>
  );
}

/* ── API Config Modal ───────────────────────────────────────────────────────── */
function ConfigureApiModal({
  service,
  paymentConflict,
  onSave,
  onClose,
}: {
  service: ApiService;
  paymentConflict: string | null;
  onSave: (id: string, active: boolean) => void;
  onClose: () => void;
}) {
  const { show } = useToast();
  const [apiKey,  setApiKey]  = useState("");
  const [optUrl,  setOptUrl]  = useState("");
  const [showKey, setShowKey] = useState(false);
  const [active,  setActive]  = useState(service.productionActive);

  const ServiceIcon = service.icon;

  const handleSave = () => {
    onSave(service.id, active);
    show(`${service.name} — connexion enregistrée`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      <div
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-faint)] flex items-center justify-center shrink-0">
              <ServiceIcon className="w-3.5 h-3.5 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-sm font-bold text-[var(--color-ink)]">
              Configurer — {service.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Security note */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-amber-500 shrink-0 mt-0.5 text-sm">⚠</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              Les clés sont stockées côté serveur (variables d&apos;environnement). Elles ne sont jamais exposées au client.
            </p>
          </div>

          {/* API key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">
              Clé API / Secret
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full px-3.5 py-2.5 pr-10 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-line-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                {showKey
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye     className="w-4 h-4" />
                }
              </button>
            </div>
          </div>

          {/* Optional identifier / URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">
              Identifiant / URL{" "}
              <span className="font-normal text-[var(--color-muted)]">(optionnel)</span>
            </label>
            <input
              type="text"
              value={optUrl}
              onChange={(e) => setOptUrl(e.target.value)}
              placeholder="ex. cloud name, endpoint, client ID…"
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
            />
          </div>

          {/* Payment conflict warning */}
          {service.kind === "payment" && paymentConflict && active && (
            <div className="px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-800">
                En activant <strong>{service.name}</strong>, <strong>{paymentConflict}</strong> sera automatiquement désactivé en production.
              </p>
            </div>
          )}

          {/* Production toggle */}
          <div className="flex items-center justify-between gap-3 py-1 border-t border-[var(--color-line)] pt-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">Activer en production</p>
              <p className="text-xs text-[var(--color-muted)]">
                {service.kind === "payment"
                  ? "Un seul fournisseur de paiement peut être actif à la fois."
                  : "Active ce service pour les utilisateurs réels."}
              </p>
            </div>
            <Toggle on={active} onToggle={() => setActive((v) => !v)} />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
          >
            Enregistrer la connexion
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Actions Modal ────────────────────────────────────────────────────── */
function AdminModal({
  state,
  onClose,
  onEditRole,
  onSaveRole,
  onRemove,
  onResend,
}: {
  state: NonNullable<ModalState>;
  onClose:    () => void;
  onEditRole: (admin: AdminEntry) => void;
  onSaveRole: (admin: AdminEntry, role: string) => void;
  onRemove:   (admin: AdminEntry) => void;
  onResend:   (admin: AdminEntry) => void;
}) {
  const { admin, step } = state;
  const newRole = step === "editRole" ? state.newRole : admin.role;
  const [localRole, setLocalRole] = useState(newRole);

  const isCurrentUser = admin.id === "a1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      <div
        className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-line)]">
          <div className="flex items-center gap-2.5">
            <Avatar name={admin.name} size="sm" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">{admin.name}</p>
              {step !== "actions" && (
                <p className="text-xs text-[var(--color-muted)]">{admin.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step: actions list */}
        {step === "actions" && (
          <div className="py-1.5">
            <button
              onClick={() => onEditRole(admin)}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
            >
              <Pencil className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
              Modifier le rôle
            </button>
            <button
              onClick={() => onResend(admin)}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
            >
              <MailIcon className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
              Renvoyer l&apos;invitation
            </button>
            <div className="border-t border-[var(--color-line)] my-1" />
            <button
              onClick={() => !isCurrentUser && onRemove(admin)}
              disabled={isCurrentUser}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isCurrentUser
                  ? "text-[var(--color-muted)] cursor-not-allowed opacity-40"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Retirer l&apos;accès
            </button>
          </div>
        )}

        {/* Step: edit role */}
        {step === "editRole" && (
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">
                Nouveau rôle pour {admin.name}
              </label>
              <div className="relative">
                <select
                  value={localRole}
                  onChange={(e) => setLocalRole(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                Rôle actuel : <span className="font-medium text-[var(--color-ink)]">{admin.role}</span>
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => onSaveRole(admin, localRole)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {/* Step: confirm remove */}
        {step === "confirmRemove" && (
          <div className="p-5 space-y-3">
            <p className="text-sm text-[var(--color-ink)]">
              Retirer l&apos;accès administrateur de{" "}
              <strong>{admin.name}</strong> ?
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Cette personne ne pourra plus se connecter à la console admin.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => onRemove(admin)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Retirer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function ParametresPage() {
  const { show } = useToast();

  const [admins,      setAdmins]      = useState<AdminEntry[]>(INIT_ADMINS);
  const [modal,       setModal]       = useState<ModalState>(null);
  const [apiServices, setApiServices] = useState<ApiService[]>(INIT_API_SERVICES);
  const [configuring, setConfiguring] = useState<ApiService | null>(null);
  const [limits,      setLimits]      = useState({ contacts: 3, conversations: 3, coachQuestions: 3, visitors: 2 });
  const [pricing,     setPricing]     = useState({ launchPrice: 10, normalPrice: 15, refundWindow: 7, autoValidate: false });

  /* Admin action handlers */
  const openActions    = (admin: AdminEntry) => setModal({ admin, step: "actions" });
  const handleEditRole = (admin: AdminEntry) => setModal({ admin, step: "editRole", newRole: admin.role });

  const handleResend = (admin: AdminEntry) => {
    show(`Invitation renvoyée à ${admin.name}`, "success");
    setModal(null);
  };

  const handleSaveRole = (admin: AdminEntry, newRole: string) => {
    if (newRole === admin.role) {
      show("Aucune modification", "warning");
      setModal(null);
      return;
    }
    setAdmins((prev) =>
      prev.map((a) => a.id === admin.id ? { ...a, role: newRole } : a),
    );
    show(`Rôle de ${admin.name} → ${newRole}`, "success");
    setModal(null);
  };

  const handleRemove = (admin: AdminEntry) => {
    if (modal?.step === "actions") {
      setModal({ admin, step: "confirmRemove" });
      return;
    }
    setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    show(`Accès retiré · ${admin.name}`, "error");
    setModal(null);
  };

  /* API action handlers */
  const handleSaveApi = (id: string, active: boolean) => {
    setApiServices((prev) => {
      const saved = prev.find((s) => s.id === id);
      return prev.map((s) => {
        if (s.id === id) return { ...s, productionActive: active };
        if (saved?.kind === "payment" && s.kind === "payment" && active) {
          return { ...s, productionActive: false };
        }
        return s;
      });
    });
    setConfiguring(null);
  };

  /* Compute payment conflict for the modal */
  const paymentConflict = configuring?.kind === "payment"
    ? (apiServices.find((s) => s.kind === "payment" && s.id !== configuring.id && s.productionActive)?.name ?? null)
    : null;

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">Paramètres administrateur</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">
            Configuration de la plateforme et limites métier.
          </p>
        </div>

        {/* Admin accounts */}
        <Card>
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-line)]">
            <h3 className="font-semibold text-sm text-[var(--color-ink)]">Comptes administrateurs</h3>
            <button
              onClick={() => show("Invitation envoyée", "success")}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-brand-600)] hover:underline"
            >
              <UserPlus className="w-3.5 h-3.5" /> Inviter
            </button>
          </div>
          <div className="divide-y divide-[var(--color-line)]">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar name={a.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-ink)]">{a.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{a.email} · {a.role}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${a.status === "active" ? "text-emerald-600" : "text-amber-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${a.status === "active" ? "bg-emerald-500" : "bg-amber-400"}`} />
                  {a.status === "active" ? "Actif" : "Invité"}
                </span>
                <span className="text-xs text-[var(--color-muted)] w-20 text-right shrink-0">{a.lastSeen}</span>
                <button
                  onClick={() => openActions(a)}
                  className="p-1 rounded hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors shrink-0"
                  aria-label="Actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* API connections */}
        <Card>
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-line)]">
            <h3 className="font-semibold text-sm text-[var(--color-ink)]">Connexions & clés API</h3>
            <span className="text-xs text-[var(--color-muted)]">Production</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-[var(--color-line)] divide-y-0">
            {apiServices.map((s) => {
              const Icon = s.icon;
              const isPayment = s.kind === "payment";
              return (
                <div key={s.id} className="flex items-center gap-3 bg-[var(--color-surface)] px-5 py-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-faint)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--color-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)]">{s.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{s.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.productionActive && (
                      <span className={`flex items-center gap-1 text-xs font-semibold ${isPayment ? "text-emerald-600" : "text-emerald-600"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {isPayment ? "Actif" : "Actif"}
                      </span>
                    )}
                    <button
                      onClick={() => setConfiguring(s)}
                      className="px-3 py-1 rounded-lg border border-[var(--color-line)] text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
                    >
                      {s.productionActive ? "Modifier" : "Configurer"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Limits + Pricing */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Limites — membres Free" />
            <div className="p-5 space-y-4">
              {([
                { label: "Demandes de contact / jour",   key: "contacts"       as const },
                { label: "Conversations simultanées",     key: "conversations"  as const },
                { label: "Questions Coach IA / jour",     key: "coachQuestions" as const },
                { label: "Visiteurs visibles",            key: "visitors"       as const },
              ] as const).map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-ink)]">{label}</span>
                  <input
                    type="number"
                    min={0}
                    value={limits[key]}
                    onChange={(e) => setLimits((l) => ({ ...l, [key]: Number(e.target.value) }))}
                    className="w-16 text-center px-2 py-1.5 text-sm border border-[var(--color-line)] rounded-lg bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition"
                  />
                </div>
              ))}
              <button
                onClick={() => show("Limites enregistrées", "success")}
                className="mt-2 px-5 py-2 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Tarification & politique" />
            <div className="p-5 space-y-4">
              {([
                { label: "Premium — lancement (USD/mois)",  key: "launchPrice"  as const },
                { label: "Premium — prix normal (USD/mois)", key: "normalPrice"  as const },
                { label: "Fenêtre de remboursement (jours)", key: "refundWindow" as const },
              ] as const).map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-ink)]">{label}</span>
                  <input
                    type="number"
                    min={0}
                    value={pricing[key]}
                    onChange={(e) => setPricing((p) => ({ ...p, [key]: Number(e.target.value) }))}
                    className="w-16 text-center px-2 py-1.5 text-sm border border-[var(--color-line)] rounded-lg bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--color-ink)]">Validation auto. des profils</span>
                <Toggle
                  on={pricing.autoValidate}
                  onToggle={() => setPricing((p) => ({ ...p, autoValidate: !p.autoValidate }))}
                />
              </div>
              <button
                onClick={() => show("Tarification enregistrée", "success")}
                className="mt-2 px-5 py-2 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Admin modal */}
      {modal && (
        <AdminModal
          state={modal}
          onClose={() => setModal(null)}
          onEditRole={handleEditRole}
          onSaveRole={handleSaveRole}
          onRemove={handleRemove}
          onResend={handleResend}
        />
      )}

      {/* API config modal */}
      {configuring && (
        <ConfigureApiModal
          service={configuring}
          paymentConflict={paymentConflict}
          onSave={handleSaveApi}
          onClose={() => setConfiguring(null)}
        />
      )}
    </>
  );
}

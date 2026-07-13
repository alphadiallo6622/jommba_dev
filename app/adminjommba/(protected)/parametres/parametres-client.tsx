"use client";
// app/adminjommba/(protected)/parametres/parametres-client.tsx
import { useState, useTransition, type ElementType } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus, MoreHorizontal, Bot, Database, Lock,
  CreditCard, Cloud, Mail, X, Pencil, Trash2,
  ChevronDown, Globe, Wallet, Eye, EyeOff, Power, Wrench, Search, MapPin,
} from "lucide-react";
import { COUNTRIES, countryName } from "@/lib/admin/countries";
import { Avatar } from "@/components/admin/ui/avatar";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { useToast } from "@/components/admin/ui/toast";
import type {
  AdminAccountRow, ApiServiceRow, LimitsSettings, PricingSettings, MaintenanceSettings,
  GeoBlockSettings,
} from "@/lib/admin/types";
import {
  createAdminAccount, updateAdminRole, setAdminAccountStatus, deleteAdminAccount,
  saveApiConnection, saveLimits, savePricing, setMaintenance, setGeoBlock,
} from "@/app/adminjommba/actions";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type ModalState =
  | null
  | { admin: AdminAccountRow; step: "actions" }
  | { admin: AdminAccountRow; step: "editRole" }
  | { admin: AdminAccountRow; step: "confirmRemove" };

const ROLES = ["super-admin", "modération", "support", "lecture seule"];

const SERVICE_ICONS: Record<string, ElementType> = {
  ai: Bot, stripe: CreditCard, square: Wallet, db: Database,
  auth: Lock, google: Globe, cloud: Cloud, email: Mail,
};

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
  busy,
  onSave,
  onClose,
}: {
  service: ApiServiceRow;
  paymentConflict: string | null;
  busy: boolean;
  onSave: (id: string, input: { identifier: string; secret: string; productionActive: boolean }) => void;
  onClose: () => void;
}) {
  const [apiKey,  setApiKey]  = useState("");
  const [optUrl,  setOptUrl]  = useState(service.identifier);
  const [showKey, setShowKey] = useState(false);
  const [active,  setActive]  = useState(service.productionActive);

  const ServiceIcon = SERVICE_ICONS[service.id] ?? Database;

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
              Les clés sont stockées côté serveur et ne sont jamais exposées au client.
            </p>
          </div>

          {/* API key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">
              Clé API / Secret
              {service.hasSecret && (
                <span className="ml-2 font-normal text-emerald-600">· clé enregistrée</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={service.hasSecret ? "•••••••••••• (laisser vide pour conserver)" : "••••••••••••••••••••"}
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
            disabled={busy}
            onClick={() => onSave(service.id, { identifier: optUrl, secret: apiKey, productionActive: active })}
            className="w-full py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
          >
            {busy ? "Enregistrement…" : "Enregistrer la connexion"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Création d'un compte administrateur ───────────────────────────────────── */
function CreateAccountModal({
  busy,
  onCreate,
  onClose,
}: {
  busy: boolean;
  onCreate: (input: { name: string; email: string; password: string; role: string }) => void;
  onClose: () => void;
}) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [role,     setRole]     = useState(ROLES[2]); // "support" par défaut
  const [error,    setError]    = useState("");

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    const bytes = new Uint8Array(14);
    crypto.getRandomValues(bytes);
    setPassword(Array.from(bytes, (b) => chars[b % chars.length]).join(""));
    setShowPwd(true);
  };

  const handleSubmit = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim()) { setError("Le nom est requis."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) { setError("Adresse email invalide."); return; }
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    onCreate({ name: name.trim(), email: trimmedEmail, password, role });
  };

  const inputCls =
    "w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-faint)] flex items-center justify-center shrink-0">
              <UserPlus className="w-3.5 h-3.5 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-sm font-bold text-[var(--color-ink)]">Créer un compte administrateur</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Ex. Aïssatou Ba"
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="prenom@jommba.com"
              className={inputCls}
            />
            <p className="text-xs text-[var(--color-muted)]">
              Doit être différente des emails des comptes membres.
            </p>
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-ink)]">Mot de passe</label>
              <button
                type="button"
                onClick={generatePassword}
                className="text-xs font-medium text-[var(--color-brand-600)] hover:underline"
              >
                Générer
              </button>
            </div>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="8 caractères minimum"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Communiquez-le à la personne : elle pourra le changer une fois connectée.
            </p>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">Rôle</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 pr-9 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
            >
              Annuler
            </button>
            <button
              disabled={busy}
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {busy ? "Création…" : "Créer le compte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Actions Modal ────────────────────────────────────────────────────── */
function AdminModal({
  state,
  busy,
  onClose,
  onEditRole,
  onSaveRole,
  onToggleStatus,
  onRemove,
}: {
  state: NonNullable<ModalState>;
  busy: boolean;
  onClose:        () => void;
  onEditRole:     (admin: AdminAccountRow) => void;
  onSaveRole:     (admin: AdminAccountRow, role: string) => void;
  onToggleStatus: (admin: AdminAccountRow) => void;
  onRemove:       (admin: AdminAccountRow) => void;
}) {
  const { admin, step } = state;
  const [localRole, setLocalRole] = useState(admin.role);

  // Le compte principal (clé maître .env) ne se gère pas depuis l'interface.
  const locked = admin.isMaster;

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
            {locked && (
              <p className="px-5 py-2 text-xs text-[var(--color-muted)]">
                Compte principal — géré via les variables d&apos;environnement.
              </p>
            )}
            <button
              onClick={() => !locked && onEditRole(admin)}
              disabled={locked || busy}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                locked ? "text-[var(--color-muted)] cursor-not-allowed opacity-40" : "text-[var(--color-ink)] hover:bg-[var(--color-faint)]"
              }`}
            >
              <Pencil className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
              Modifier le rôle
            </button>
            <button
              onClick={() => !locked && onToggleStatus(admin)}
              disabled={locked || busy}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                locked ? "text-[var(--color-muted)] cursor-not-allowed opacity-40" : "text-amber-600 hover:bg-amber-50"
              }`}
            >
              <Power className="w-4 h-4 shrink-0" />
              {admin.status === "active" ? "Désactiver le compte" : "Réactiver le compte"}
            </button>
            <div className="border-t border-[var(--color-line)] my-1" />
            <button
              onClick={() => !locked && onRemove(admin)}
              disabled={locked || busy}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                locked
                  ? "text-[var(--color-muted)] cursor-not-allowed opacity-40"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Supprimer le compte
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
                disabled={busy}
                onClick={() => onSaveRole(admin, localRole)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
              >
                {busy ? "…" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}

        {/* Step: confirm remove */}
        {step === "confirmRemove" && (
          <div className="p-5 space-y-3">
            <p className="text-sm text-[var(--color-ink)]">
              Supprimer définitivement le compte administrateur de{" "}
              <strong>{admin.name}</strong> ?
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Son identifiant de connexion sera supprimé. Pour un retrait temporaire,
              préférez « Désactiver le compte ».
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
              >
                Annuler
              </button>
              <button
                disabled={busy}
                onClick={() => onRemove(admin)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {busy ? "…" : "Supprimer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export function ParametresClient({
  admins,
  apiServices,
  initialLimits,
  initialPricing,
  initialMaintenance,
  initialGeoBlock,
}: {
  admins: AdminAccountRow[];
  apiServices: ApiServiceRow[];
  initialLimits: LimitsSettings;
  initialPricing: PricingSettings;
  initialMaintenance: MaintenanceSettings;
  initialGeoBlock: GeoBlockSettings;
}) {
  const { show } = useToast();
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  const [modal,       setModal]       = useState<ModalState>(null);
  const [inviteOpen,  setInviteOpen]  = useState(false);
  const [configuring, setConfiguring] = useState<ApiServiceRow | null>(null);
  const [limits,      setLimits]      = useState<LimitsSettings>(initialLimits);
  const [pricing,     setPricing]     = useState<PricingSettings>(initialPricing);
  const [maintenance, setMaintenanceState] = useState<MaintenanceSettings>(initialMaintenance);
  const [geoBlock,    setGeoBlockState]    = useState<GeoBlockSettings>(initialGeoBlock);
  const [countryQuery, setCountryQuery]    = useState("");

  const act = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    msg: string,
    type: "success" | "warning" | "error" = "success",
    onDone?: () => void,
  ) => {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        show(msg, type);
        onDone?.();
        router.refresh();
      } else {
        show(res.error ?? "Une erreur est survenue", "error");
      }
    });
  };

  /* Création d'un compte admin */
  const handleCreate = (input: { name: string; email: string; password: string; role: string }) =>
    act(
      () => createAdminAccount(input),
      `Compte créé · ${input.name} (${input.role})`,
      "success",
      () => setInviteOpen(false),
    );

  /* Admin action handlers */
  const openActions    = (admin: AdminAccountRow) => setModal({ admin, step: "actions" });
  const handleEditRole = (admin: AdminAccountRow) => setModal({ admin, step: "editRole" });

  const handleSaveRole = (admin: AdminAccountRow, newRole: string) => {
    if (newRole === admin.role) {
      show("Aucune modification", "warning");
      setModal(null);
      return;
    }
    act(() => updateAdminRole(admin.id, newRole), `Rôle de ${admin.name} → ${newRole}`, "success", () => setModal(null));
  };

  const handleToggleStatus = (admin: AdminAccountRow) => {
    const next = admin.status === "active" ? "disabled" : "active";
    act(
      () => setAdminAccountStatus(admin.id, next),
      next === "disabled" ? `Compte désactivé · ${admin.name}` : `Compte réactivé · ${admin.name}`,
      next === "disabled" ? "warning" : "success",
      () => setModal(null),
    );
  };

  const handleRemove = (admin: AdminAccountRow) => {
    if (modal?.step === "actions") {
      setModal({ admin, step: "confirmRemove" });
      return;
    }
    act(() => deleteAdminAccount(admin.id), `Compte supprimé · ${admin.name}`, "error", () => setModal(null));
  };

  /* API action handler */
  const handleSaveApi = (id: string, input: { identifier: string; secret: string; productionActive: boolean }) => {
    const service = apiServices.find((s) => s.id === id);
    act(
      () => saveApiConnection(id, input),
      `${service?.name ?? id} — connexion enregistrée`,
      "success",
      () => setConfiguring(null),
    );
  };

  /* Bascule du mode maintenance */
  const handleToggleMaintenance = () => {
    const next: MaintenanceSettings = { ...maintenance, enabled: !maintenance.enabled };
    setMaintenanceState(next); // MAJ optimiste du switch
    act(
      () => setMaintenance(next),
      next.enabled
        ? "Site mis en maintenance — les visiteurs voient la page dédiée"
        : "Site remis en ligne",
      next.enabled ? "warning" : "success",
      undefined,
    );
  };

  const handleSaveMaintenanceMessage = () =>
    act(() => setMaintenance(maintenance), "Message de maintenance enregistré");

  /* Disponibilité par pays */
  const persistGeoBlock = (next: GeoBlockSettings, msg: string, type: "success" | "warning" = "success") => {
    setGeoBlockState(next); // MAJ optimiste
    act(() => setGeoBlock(next), msg, type);
  };

  const handleToggleGeoBlock = () => {
    const next = { ...geoBlock, enabled: !geoBlock.enabled };
    persistGeoBlock(
      next,
      next.enabled
        ? "Filtrage par pays activé"
        : "Filtrage par pays désactivé — le site est accessible partout",
      next.enabled ? "warning" : "success",
    );
  };

  const handleSetGeoMode = (mode: GeoBlockSettings["mode"]) => {
    if (mode === geoBlock.mode) return;
    persistGeoBlock(
      { ...geoBlock, mode },
      mode === "block"
        ? "Mode « liste noire » — les pays sélectionnés sont bloqués"
        : "Mode « liste blanche » — seuls les pays sélectionnés sont autorisés",
    );
  };

  const handleToggleCountry = (code: string) => {
    const has = geoBlock.countries.includes(code);
    const countries = has
      ? geoBlock.countries.filter((c) => c !== code)
      : [...geoBlock.countries, code];
    persistGeoBlock(
      { ...geoBlock, countries },
      has ? `${countryName(code)} retiré de la liste` : `${countryName(code)} ajouté à la liste`,
    );
  };

  const filteredCountries = COUNTRIES.filter((c) => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

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

        {/* Mode maintenance */}
        <Card>
          <div
            className={`flex items-start gap-4 px-5 py-4 ${
              maintenance.enabled ? "bg-amber-50" : ""
            } transition-colors rounded-t-2xl`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                maintenance.enabled ? "bg-amber-100" : "bg-[var(--color-faint)]"
              }`}
            >
              <Wrench className={`w-5 h-5 ${maintenance.enabled ? "text-amber-600" : "text-[var(--color-muted)]"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[var(--color-ink)]">Mode maintenance</h3>
                {maintenance.enabled && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    ACTIF
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">
                {maintenance.enabled
                  ? "Le site public est actuellement indisponible : les visiteurs voient une page « En maintenance ». La console admin reste accessible."
                  : "Coupez l'accès public au site le temps d'une mise à jour. La console admin reste toujours accessible."}
              </p>
            </div>
            <div className="shrink-0 pt-1">
              <Toggle on={maintenance.enabled} onToggle={handleToggleMaintenance} />
            </div>
          </div>

          {/* Message personnalisé */}
          <div className="px-5 pb-5 pt-1 border-t border-[var(--color-line)] space-y-2.5">
            <label className="text-xs font-semibold text-[var(--color-ink)] block pt-3">
              Message affiché aux visiteurs{" "}
              <span className="font-normal text-[var(--color-muted)]">(optionnel)</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={maintenance.message ?? ""}
                onChange={(e) => setMaintenanceState((m) => ({ ...m, message: e.target.value }))}
                placeholder="Ex. Retour prévu à 18h, in shā’ Allāh."
                className="flex-1 px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
              />
              <button
                disabled={busy}
                onClick={handleSaveMaintenanceMessage}
                className="px-5 py-2.5 rounded-xl border border-[var(--color-line)] text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors disabled:opacity-50 shrink-0"
              >
                Enregistrer le message
              </button>
            </div>
          </div>
        </Card>

        {/* Disponibilité par pays */}
        <Card>
          <div
            className={`flex items-start gap-4 px-5 py-4 ${
              geoBlock.enabled ? "bg-amber-50" : ""
            } transition-colors rounded-t-2xl`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                geoBlock.enabled ? "bg-amber-100" : "bg-[var(--color-faint)]"
              }`}
            >
              <Globe className={`w-5 h-5 ${geoBlock.enabled ? "text-amber-600" : "text-[var(--color-muted)]"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[var(--color-ink)]">Disponibilité par pays</h3>
                {geoBlock.enabled && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    ACTIF
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">
                Rendez le site indisponible dans certains pays. La détection se
                fait par adresse IP ; la console admin reste toujours accessible.
              </p>
            </div>
            <div className="shrink-0 pt-1">
              <Toggle on={geoBlock.enabled} onToggle={handleToggleGeoBlock} />
            </div>
          </div>

          {geoBlock.enabled && (
            <div className="px-5 pb-5 pt-1 border-t border-[var(--color-line)] space-y-4">
              {/* Mode : liste noire / liste blanche */}
              <div className="pt-3">
                <p className="text-xs font-semibold text-[var(--color-ink)] mb-2">Mode de filtrage</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSetGeoMode("block")}
                    className={`text-left px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                      geoBlock.mode === "block"
                        ? "border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-ink)]"
                        : "border-[var(--color-line)] text-[var(--color-muted)] hover:bg-[var(--color-faint)]"
                    }`}
                  >
                    <span className="font-semibold block">Bloquer les pays sélectionnés</span>
                    <span className="text-xs">Liste noire — tout le reste du monde a accès.</span>
                  </button>
                  <button
                    onClick={() => handleSetGeoMode("allow")}
                    className={`text-left px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                      geoBlock.mode === "allow"
                        ? "border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-ink)]"
                        : "border-[var(--color-line)] text-[var(--color-muted)] hover:bg-[var(--color-faint)]"
                    }`}
                  >
                    <span className="font-semibold block">Autoriser seulement ces pays</span>
                    <span className="text-xs">Liste blanche — tout le reste est bloqué.</span>
                  </button>
                </div>
              </div>

              {/* Pays sélectionnés */}
              {geoBlock.countries.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {geoBlock.countries.map((code) => (
                    <button
                      key={code}
                      onClick={() => handleToggleCountry(code)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-[var(--color-brand-600)] text-white text-xs font-medium hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
                    >
                      <MapPin className="w-3 h-3" />
                      {countryName(code)}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}

              {/* Recherche + liste */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <input
                    type="text"
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    placeholder="Rechercher un pays…"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--color-line)] divide-y divide-[var(--color-line)]">
                  {filteredCountries.length === 0 && (
                    <p className="px-3.5 py-4 text-sm text-[var(--color-muted)] text-center">Aucun pays trouvé.</p>
                  )}
                  {filteredCountries.map((c) => {
                    const selected = geoBlock.countries.includes(c.code);
                    return (
                      <button
                        key={c.code}
                        onClick={() => handleToggleCountry(c.code)}
                        disabled={busy}
                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm text-left transition-colors disabled:opacity-50 ${
                          selected ? "bg-[var(--color-brand-50)]" : "hover:bg-[var(--color-faint)]"
                        }`}
                      >
                        <span className="text-[var(--color-ink)]">
                          {c.name} <span className="text-[var(--color-muted)]">· {c.code}</span>
                        </span>
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            selected
                              ? "bg-[var(--color-brand-600)] border-[var(--color-brand-600)] text-white"
                              : "border-[var(--color-line)]"
                          }`}
                        >
                          {selected && (
                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  {geoBlock.mode === "block"
                    ? "Les visiteurs de ces pays verront une page « Indisponible dans votre région »."
                    : "Seuls les visiteurs de ces pays pourront accéder au site."}{" "}
                  Un VPN peut contourner ce filtrage : il s&apos;agit d&apos;une barrière, pas d&apos;un blocage absolu.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Admin accounts */}
        <Card>
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-line)]">
            <h3 className="font-semibold text-sm text-[var(--color-ink)]">Comptes administrateurs</h3>
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-brand-600)] hover:underline"
            >
              <UserPlus className="w-3.5 h-3.5" /> Créer un compte
            </button>
          </div>
          <div className="divide-y divide-[var(--color-line)]">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar name={a.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {a.name}
                    {a.isMaster && (
                      <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--color-faint)] text-[var(--color-muted)]">
                        compte principal
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{a.email} · {a.role}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${a.status === "active" ? "text-emerald-600" : "text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${a.status === "active" ? "bg-emerald-500" : "bg-gray-300"}`} />
                  {a.status === "active" ? "Actif" : "Désactivé"}
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
              const Icon = SERVICE_ICONS[s.id] ?? Database;
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
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Actif
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
                disabled={busy}
                onClick={() => act(() => saveLimits(limits), "Limites enregistrées")}
                className="mt-2 px-5 py-2 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
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
                disabled={busy}
                onClick={() => act(() => savePricing(pricing), "Tarification enregistrée")}
                className="mt-2 px-5 py-2 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Create account modal */}
      {inviteOpen && (
        <CreateAccountModal
          busy={busy}
          onCreate={handleCreate}
          onClose={() => setInviteOpen(false)}
        />
      )}

      {/* Admin modal */}
      {modal && (
        <AdminModal
          state={modal}
          busy={busy}
          onClose={() => setModal(null)}
          onEditRole={handleEditRole}
          onSaveRole={handleSaveRole}
          onToggleStatus={handleToggleStatus}
          onRemove={handleRemove}
        />
      )}

      {/* API config modal */}
      {configuring && (
        <ConfigureApiModal
          service={configuring}
          paymentConflict={paymentConflict}
          busy={busy}
          onSave={handleSaveApi}
          onClose={() => setConfiguring(null)}
        />
      )}
    </>
  );
}

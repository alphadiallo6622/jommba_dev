// lib/email.ts
// Envoi d'emails transactionnels via le SMTP configuré (EMAIL_SERVER_*).
// Server-only : jamais importé depuis un composant client.
import nodemailer from "nodemailer";

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.EMAIL_SERVER_HOST;
  const port = Number(process.env.EMAIL_SERVER_PORT ?? 465);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("Configuration SMTP incomplète (EMAIL_SERVER_HOST/USER/PASSWORD manquants)");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // TLS implicite sur 465, STARTTLS sinon
    auth: { user, pass },
    tls: {
      // L'environnement de dev intercepte le TLS sortant (proxy) et casse la
      // vérification de la chaîne de certificats — même contournement que
      // pour l'API Anthropic (app/api/coach/route.ts). Jamais désactivé en prod.
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
  return cachedTransporter;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Convertit un texte brut (avec retours à la ligne) en paragraphes HTML simples. */
function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 14px;">${escapeHtml(para).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export interface SendEmailInput {
  to: string;
  toName?: string;
  subject: string;
  /** Texte brut ; converti en paragraphes HTML pour le rendu. */
  text: string;
  /** Signature affichée sous le message (nom + fonction). */
  signatureName?: string;
  signatureRole?: string;
}

/**
 * Envoie un email transactionnel avec une mise en page cohérente avec
 * l'identité Jommba. Lève une erreur si le SMTP échoue — à appeler dans
 * un try/catch côté appelant pour ne jamais bloquer l'action métier.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER;
  const transporter = getTransporter();

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:linear-gradient(135deg,#0a7a52 0%,#0d9e6a 60%,#10b981 100%);padding:24px 28px;border-radius:16px 16px 0 0;">
        <span style="color:#fff;font-size:18px;font-weight:700;">Jommba</span>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:28px;">
        ${input.toName ? `<p style="margin:0 0 14px;">Bonjour ${escapeHtml(input.toName.split(" ")[0])},</p>` : ""}
        ${textToHtml(input.text)}
        <div style="margin-top:24px;padding-top:16px;border-top:1px dashed #e5e7eb;font-size:13px;color:#6b7280;">
          <p style="margin:0;font-weight:600;color:#1f2937;">${escapeHtml(input.signatureName ?? "Équipe Jommba")}</p>
          ${input.signatureRole ? `<p style="margin:2px 0 0;">${escapeHtml(input.signatureRole)}</p>` : ""}
          <p style="margin:6px 0 0;font-style:italic;">Jommba — Trouvez votre moitié dans le respect islamique.</p>
        </div>
      </div>
    </div>
  `.trim();

  await transporter.sendMail({
    from: `"Jommba" <${from}>`,
    to: input.toName ? `"${input.toName}" <${input.to}>` : input.to,
    subject: input.subject,
    text: input.text,
    html,
  });
}

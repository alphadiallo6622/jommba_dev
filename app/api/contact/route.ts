// app/api/contact/route.ts
// Réception des messages du formulaire de contact public.
// Relaye le message par email vers la boîte support.
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

const CONTACT_RECIPIENT = "jommba224@gmail.com";
const MAX_MESSAGE_LENGTH = 5000;

export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    website?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Honeypot anti-spam : champ invisible, rempli uniquement par les bots.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }

  try {
    await sendEmail({
      to: CONTACT_RECIPIENT,
      subject: `[Contact Jommba] ${subject} — ${name}`,
      text: `Nouveau message reçu via le formulaire de contact.\n\nNom : ${name}\nEmail : ${email}\nSujet : ${subject}\n\nMessage :\n${message}`,
      signatureName: "Formulaire de contact",
      signatureRole: "jommba.com",
    });
  } catch (error) {
    console.error("[contact] envoi email échoué :", error);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Mail,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { CONTACT_INFO } from "@/lib/constants";

const SUBJECT_KEYS = ["account", "subscription", "report", "partnership", "other"] as const;

type FormStatus = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? ""),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setStatus("error");
      setErrorMessage(t("validationError"));
      return;
    }

    setStatus("sending");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("send_failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(t("error"));
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary-light/60 to-jommba-bg pt-14 pb-10 sm:pt-20 sm:pb-14 overflow-hidden">
        <div className="absolute -top-20 right-1/4 w-[30vw] h-[30vw] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <Container className="relative z-10">
          <AnimatedSection className="flex flex-col items-center text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-green-btn">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-text-primary tracking-tight">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
              {t("subtitle")}
            </p>
          </AnimatedSection>
        </Container>
      </section>

      {/* Contenu : coordonnées + formulaire */}
      <section className="py-10 sm:py-14 bg-jommba-bg">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 max-w-5xl mx-auto">

            {/* Coordonnées */}
            <AnimatedSection delay={0.1} className="lg:col-span-5 space-y-4">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-5">
                {t("infoTitle")}
              </h2>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-primary-light/40 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-green-btn">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-text-muted font-medium">{t("emailLabel")}</div>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="text-sm sm:text-base font-semibold text-text-primary hover:text-primary transition-colors"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-primary-light/40 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-green-btn">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-text-muted font-medium">{t("addressLabel")}</div>
                  <div className="text-sm sm:text-base font-semibold text-text-primary">
                    {CONTACT_INFO.address}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-primary-light/40 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-green-btn">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-text-muted font-medium">{t("responseLabel")}</div>
                  <div className="text-sm sm:text-base font-semibold text-text-primary">
                    {t("responseValue")}
                  </div>
                </div>
              </div>

              {/* Rappel FAQ */}
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-800 text-sm leading-relaxed">
                <HelpCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <p>
                  {t("faqHintPrefix")}{" "}
                  <Link href="/faq" className="font-bold underline underline-offset-2 hover:text-amber-900">
                    {t("faqLinkText")}
                  </Link>{" "}
                  {t("faqHintSuffix")}
                </p>
              </div>
            </AnimatedSection>

            {/* Formulaire */}
            <AnimatedSection delay={0.2} className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-primary-light/40 shadow-lg p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-6">
                  {t("formTitle")}
                </h2>

                {status === "success" ? (
                  <div className="flex flex-col items-center text-center py-10 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <p className="text-base font-semibold text-text-primary max-w-sm">
                      {t("success")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot invisible anti-spam */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />

                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-semibold text-text-primary mb-1.5">
                        {t("nameLabel")} <span className="text-primary">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        placeholder={t("namePlaceholder")}
                        className="w-full px-4 py-3 rounded-xl border border-text-muted/20 bg-jommba-bg/50 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-semibold text-text-primary mb-1.5">
                        {t("emailFieldLabel")} <span className="text-primary">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        placeholder={t("emailPlaceholder")}
                        className="w-full px-4 py-3 rounded-xl border border-text-muted/20 bg-jommba-bg/50 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-sm font-semibold text-text-primary mb-1.5">
                        {t("subjectLabel")} <span className="text-primary">*</span>
                      </label>
                      <select
                        id="contact-subject"
                        name="subject"
                        required
                        defaultValue=""
                        className="w-full px-4 py-3 rounded-xl border border-text-muted/20 bg-jommba-bg/50 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all cursor-pointer"
                      >
                        <option value="" disabled>
                          {t("subjectPlaceholder")}
                        </option>
                        {SUBJECT_KEYS.map((key) => (
                          <option key={key} value={t(`subjects.${key}`)}>
                            {t(`subjects.${key}`)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-semibold text-text-primary mb-1.5">
                        {t("messageLabel")} <span className="text-primary">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={6}
                        maxLength={5000}
                        placeholder={t("messagePlaceholder")}
                        className="w-full px-4 py-3 rounded-xl border border-text-muted/20 bg-jommba-bg/50 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-y"
                      />
                    </div>

                    {status === "error" && errorMessage && (
                      <p className="text-sm font-medium text-error">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-green-btn hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("sending")}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t("submit")}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>
        </Container>
      </section>
    </>
  );
}

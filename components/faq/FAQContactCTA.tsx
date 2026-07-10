"use client";

import { useTranslations } from "next-intl";
import { Mail, MessageCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Container from "@/components/ui/Container";

export default function FAQContactCTA() {
  const t = useTranslations("faq.contactCta");

  return (
    <section className="py-12 bg-jommba-bg">
      <Container size="sm">
        <AnimatedSection>
          <Card className="text-center flex flex-col items-center p-8 sm:p-10 border-primary-light/45 shadow-sm relative overflow-hidden bg-white">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/3 blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-primary/3 blur-lg pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-6">
              <MessageCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-serif text-text-primary mb-3">
              {t("title")}
            </h3>

            <p className="text-sm text-text-muted leading-relaxed max-w-md mx-auto mb-8">
              {t("subtitle")}
            </p>

            <Button
              href="mailto:support@jommba.com"
              variant="dark"
              size="md"
              icon={<Mail className="w-4 h-4" />}
              iconPosition="left"
            >
              {t("button")}
            </Button>
          </Card>
        </AnimatedSection>
      </Container>
    </section>
  );
}

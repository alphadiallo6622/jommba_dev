import { NextIntlClientProvider } from 'next-intl'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // /onboarding vit hors de app/[locale]/ : on fournit ici les traductions au
  // client. La locale + les messages sont résolus par i18n/request.ts (cookie
  // NEXT_LOCALE), donc un provider « nu » suffit.
  return (
    <NextIntlClientProvider>
      <div className="min-h-screen bg-white">{children}</div>
    </NextIntlClientProvider>
  )
}

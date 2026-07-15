// Structure des catégories FAQ (id + icône). Les libellés et le contenu Q/R
// sont traduits (dashboard.aide.categories.* et dashboard.aide.faq.*) et
// résolus dans components/aide/AidePage.tsx via next-intl.
export type FaqCategoryMeta = { id: string; icon: string }

export const faqCategories: FaqCategoryMeta[] = [
  { id: 'inscription', icon: 'UserPlus' },
  { id: 'demandes',    icon: 'Heart' },
  { id: 'messages',    icon: 'MessageCircle' },
  { id: 'photos',      icon: 'Camera' },
  { id: 'premium',     icon: 'Crown' },
  { id: 'securite',    icon: 'Shield' },
  { id: 'compte',      icon: 'Settings' },
  { id: 'valeurs',     icon: 'BookOpen' },
]

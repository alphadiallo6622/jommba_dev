import type { Profile } from './types'
import type { MockUser } from '@/lib/mock-user'
import type { ExplorerProfile } from '@/lib/mock-explorer'

// Mappe un profil Supabase (snake_case) vers MockUser (camelCase)
// pour la compatibilité avec les composants existants.
export function profileToMockUser(profile: Profile, email: string): MockUser {
  return {
    id:                profile.user_id,
    firstName:         profile.first_name,
    lastName:          profile.last_name ?? '',
    gender:            (profile.gender as 'homme' | 'femme' | null) ?? null,
    age:               profile.age ?? 0,
    height:            profile.height ?? 0,
    city:              profile.city ?? '',
    country:           profile.country ?? 'SN',
    email,
    avatar:            profile.avatar_url ?? '/avatar-placeholder.svg',
    profileCompletion: profile.profile_completion ?? 0,
    isPremium:         profile.is_premium ?? false,
    isValidated:       profile.status === 'validated',
    stats:             { views: 0, visitors: 0, favorites: 0, requests: 0 },
    dailyRequests:     { used: 0, total: profile.is_premium ? 999 : 3 },
    tags:              buildTags(profile),
    marriageVision:    profile.marriage_vision ?? '',
    seeking:           profile.seeking ?? '',
    religion: {
      madhhab: profile.madhhab ?? '',
      mosque:  profile.mosque_frequency ?? '',
      arabic:  profile.arabic_level ?? '',
    },
    lifeProject: {
      hasChildren:  profile.has_children ?? '',
      wantsChildren: profile.wants_children ?? '',
      canRelocate:  profile.can_relocate ?? '',
      polygamy:     profile.polygamy ?? '',
    },
    interests:   profile.interests ?? '',
    qualities:   profile.qualities ?? '',
    flaws:       profile.flaws ?? '',
    dealbreakers: profile.dealbreakers ?? '',
    languages:   profile.languages ?? '',
    visibility:  profile.visibility ?? 'active',
  }
}

export function supabaseProfileToExplorer(p: Profile): ExplorerProfile {
  return {
    id: p.user_id,
    firstName: p.first_name,
    lastInitial: (p.last_name ?? '').charAt(0),
    age: p.age ?? 0,
    location: [p.city, p.country].filter(Boolean).join(', ') || 'Inconnu',
    maritalStatus: p.marital_status ?? '',
    job: p.job ?? '',
    photos: [p.avatar_url ?? '/avatar-placeholder.svg'],
    isEnAvant: p.is_premium,
    photosBlurred: p.photos_blurred ?? false,
    marriageVision: p.marriage_vision ?? '',
    ceQueJeRecherche: p.seeking ?? '',
    centresInteret: p.interests ?? '',
    mesQualites: p.qualities ?? '',
    info: {
      madhhab: p.madhhab ?? '',
      education: p.education ?? '',
      enfants: p.has_children ?? '',
      souhaitEnfants: p.wants_children ?? '',
      peutDemenager: p.can_relocate ?? '',
      polygamie: p.polygamy ?? '',
    },
  }
}

function buildTags(profile: Profile): string[] {
  const tags: string[] = []
  if (profile.marital_status) tags.push(profile.marital_status)
  if (profile.job)            tags.push(profile.job)
  if (profile.education)      tags.push(profile.education)
  return tags
}

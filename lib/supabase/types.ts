// Généré manuellement depuis le schéma Supabase (supabase/schema.sql)
// Mettre à jour après chaque migration de schéma.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ProfileStatus = 'pending' | 'validated' | 'refused' | 'suspended'
export type Visibility    = 'active' | 'pause' | 'discussion'
export type LikeType      = 'request' | 'favorite'
export type RequestStatus = 'pending' | 'accepted' | 'rejected'
export type SubscriptionPlan   = 'free' | 'premium'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'
export type ReportStatus  = 'pending' | 'reviewed' | 'resolved'
export type TicketStatus  = 'open' | 'in_progress' | 'closed'
export type ReportSeverity = 'high' | 'medium' | 'low'
export type PhotoStatus    = 'pending' | 'approved' | 'rejected'
export type BlogPostStatus = 'draft' | 'published'
export type BroadcastTarget = 'all' | 'free' | 'premium' | 'pending'
export type AdminAccountStatus = 'active' | 'disabled'

// ─── Tables ───────────────────────────────────────────────────────────────────

export interface Profile {
  id:                 string
  user_id:            string
  first_name:         string
  last_name:          string | null
  gender:             string | null
  age:                number | null
  height:             number | null
  city:               string | null
  country:            string | null
  avatar_url:         string | null
  bio:                string | null
  seeking:            string | null
  marriage_vision:    string | null
  interests:          string | null
  qualities:          string | null
  dealbreakers:       string | null
  languages:          string | null
  madhhab:            string | null
  mosque_frequency:   string | null
  arabic_level:       string | null
  marital_status:     string | null
  education:          string | null
  job:                string | null
  has_children:       string | null
  wants_children:     string | null
  can_relocate:       string | null
  polygamy:           string | null
  flaws:              string | null
  status:             ProfileStatus
  is_premium:         boolean
  profile_completion: number
  visibility:         Visibility
  photos_blurred:     boolean
  validated_at:       string | null
  refusal_reason:     string | null
  created_at:         string
  updated_at:         string
}

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'validated_at' | 'refusal_reason' | 'photos_blurred'> & {
  id?:             string
  created_at?:     string
  updated_at?:     string
  validated_at?:   string | null
  refusal_reason?: string | null
  photos_blurred?: boolean
}
export type ProfileUpdate = Partial<ProfileInsert>

export interface UserPreferences {
  id:             string
  user_id:        string
  photos_blurred: boolean
  sound_enabled:  boolean
  push_enabled:   boolean
  email_demande:  boolean
  email_message:  boolean
  email_promo:    boolean
  created_at:     string
  updated_at:     string
}

export interface ProfilePhoto {
  id:         string
  user_id:    string
  url:        string
  is_primary: boolean
  order:      number
  status:     PhotoStatus
  created_at: string
}

export interface Conversation {
  id:               string
  participant_1:    string
  participant_2:    string
  last_message_at:  string | null
  created_at:       string
}

export interface Message {
  id:              string
  conversation_id: string
  sender_id:       string
  receiver_id:     string
  content:         string
  is_read:         boolean
  created_at:      string
}

export interface Like {
  id:             string
  sender_id:      string
  receiver_id:    string
  type:           LikeType
  status:         RequestStatus
  flash_message?: string | null
  created_at:     string
}

export interface ProfileVisitor {
  id:         string
  visitor_id: string
  profile_id: string
  visited_at: string
}

export interface ProfileView {
  id:         string
  profile_id: string
  viewer_id:  string
  viewed_at:  string
}

export interface Boost {
  id:         string
  user_id:    string
  expires_at: string
  created_at: string
}

export interface Subscription {
  id:                    string
  user_id:               string
  plan:                  SubscriptionPlan
  status:                SubscriptionStatus
  stripe_subscription_id: string | null
  current_period_end:    string | null
  duration_months:       number
  payment_method:        string | null
  price_usd:             number | null
  cancelled_at:          string | null
  refunded_at:           string | null
  created_at:            string
  updated_at:            string
}

export interface Report {
  id:          string
  reporter_id: string
  reported_id: string
  reason:      string
  status:      ReportStatus
  severity:    ReportSeverity
  description: string | null
  created_at:  string
}

export interface Notification {
  id:         string
  user_id:    string
  type:       string
  title:      string
  body:       string
  is_read:    boolean
  data:       Json | null
  created_at: string
}

export interface SupportTicket {
  id:          string
  user_id:     string
  subject:     string
  body:        string
  status:      TicketStatus
  category:    string
  admin_reply: string | null
  replied_at:  string | null
  created_at:  string
  updated_at:  string
}

// ─── Tables admin ─────────────────────────────────────────────────────────────

export interface BlogPost {
  id:              string
  title:           string
  category:        string
  author:          string
  excerpt:         string | null
  content:         string | null
  cover_image_url: string | null
  status:          BlogPostStatus
  featured:        boolean
  published_at:    string | null
  created_at:      string
  updated_at:      string
}

export interface Broadcast {
  id:              string
  title:           string
  message:         string
  target:          BroadcastTarget
  recipient_count: number
  created_at:      string
}

export interface CoachUsage {
  id:         string
  user_id:    string | null
  tokens:     number | null
  rating:     number | null
  created_at: string
}

export interface AdminAccount {
  id:           string
  name:         string
  email:        string
  role:         string
  status:       AdminAccountStatus
  user_id:      string | null
  last_seen_at: string | null
  created_at:   string
}

export interface ApiConnection {
  id:                string
  name:              string
  description:       string | null
  kind:              string | null
  production_active: boolean
  identifier:        string | null
  secret:            string | null
  updated_at:        string
}

export interface PlatformSettings {
  id:          number
  limits:      Json
  pricing:     Json
  maintenance: Json
  updated_at:  string
}

export interface AdminMember {
  id:                 string
  user_id:            string
  first_name:         string
  last_name:          string | null
  gender:             string | null
  age:                number | null
  city:               string | null
  country:            string | null
  status:             ProfileStatus
  is_premium:         boolean
  avatar_url:         string | null
  job:                string | null
  education:          string | null
  marital_status:     string | null
  madhhab:            string | null
  bio:                string | null
  profile_completion: number
  created_at:         string
  validated_at:       string | null
  refusal_reason:     string | null
  email:              string
  last_sign_in_at:    string | null
}

// ─── Database (pour typage du client Supabase) ────────────────────────────────

// Helper: makes any interface/type compatible with the Record<string, unknown>
// constraint required by @supabase/postgrest-js v2 GenericTable.Row/Insert/Update.
// TypeScript 5.x no longer allows interfaces without index signatures to satisfy
// Record<string, unknown>, so we must widen explicitly at the Database boundary.
type Indexed<T> = T & Record<string, unknown>

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row:           Indexed<Profile>
        Insert:        Indexed<ProfileInsert>
        Update:        Indexed<ProfileUpdate>
        Relationships: []
      }
      user_preferences: {
        Row:           Indexed<UserPreferences>
        Insert:        Indexed<Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
        Update:        Indexed<Partial<UserPreferences>>
        Relationships: []
      }
      profile_photos: {
        Row:           Indexed<ProfilePhoto>
        Insert:        Indexed<Omit<ProfilePhoto, 'id' | 'created_at' | 'status'> & { id?: string; created_at?: string; status?: PhotoStatus }>
        Update:        Indexed<Partial<ProfilePhoto>>
        Relationships: []
      }
      conversations: {
        Row:           Indexed<Conversation>
        Insert:        Indexed<Omit<Conversation, 'id' | 'created_at'> & { id?: string; created_at?: string }>
        Update:        Indexed<Partial<Conversation>>
        Relationships: []
      }
      messages: {
        Row:           Indexed<Message>
        Insert:        Indexed<Omit<Message, 'id' | 'created_at'> & { id?: string; created_at?: string }>
        Update:        Indexed<Partial<Message>>
        Relationships: []
      }
      likes: {
        Row:           Indexed<Like>
        Insert:        Indexed<Omit<Like, 'id' | 'created_at'> & { id?: string; created_at?: string }>
        Update:        Indexed<Partial<Like>>
        Relationships: []
      }
      profile_visitors: {
        Row:           Indexed<ProfileVisitor>
        Insert:        Indexed<Omit<ProfileVisitor, 'id'> & { id?: string }>
        Update:        Indexed<Partial<ProfileVisitor>>
        Relationships: []
      }
      profile_views: {
        Row:           Indexed<ProfileView>
        Insert:        Indexed<Omit<ProfileView, 'id' | 'viewed_at'> & { id?: string; viewed_at?: string }>
        Update:        Indexed<Partial<ProfileView>>
        Relationships: []
      }
      boosts: {
        Row:           Indexed<Boost>
        Insert:        Indexed<Omit<Boost, 'id' | 'created_at'> & { id?: string; created_at?: string }>
        Update:        Indexed<Partial<Boost>>
        Relationships: []
      }
      subscriptions: {
        Row:           Indexed<Subscription>
        Insert:        Indexed<Omit<Subscription, 'id' | 'created_at' | 'updated_at' | 'duration_months' | 'payment_method' | 'price_usd' | 'cancelled_at' | 'refunded_at' | 'stripe_subscription_id'> & { id?: string; created_at?: string; updated_at?: string; duration_months?: number; payment_method?: string | null; price_usd?: number | null; cancelled_at?: string | null; refunded_at?: string | null; stripe_subscription_id?: string | null }>
        Update:        Indexed<Partial<Subscription>>
        Relationships: []
      }
      reports: {
        Row:           Indexed<Report>
        Insert:        Indexed<Omit<Report, 'id' | 'created_at' | 'severity' | 'description'> & { id?: string; created_at?: string; severity?: ReportSeverity; description?: string | null }>
        Update:        Indexed<Partial<Report>>
        Relationships: []
      }
      notifications: {
        Row:           Indexed<Notification>
        Insert:        Indexed<Omit<Notification, 'id' | 'created_at' | 'data'> & { id?: string; created_at?: string; data?: Json | null }>
        Update:        Indexed<Partial<Notification>>
        Relationships: []
      }
      support_tickets: {
        Row:           Indexed<SupportTicket>
        Insert:        Indexed<Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'category' | 'admin_reply' | 'replied_at'> & { id?: string; created_at?: string; updated_at?: string; category?: string; admin_reply?: string | null; replied_at?: string | null }>
        Update:        Indexed<Partial<SupportTicket>>
        Relationships: []
      }
      blog_posts: {
        Row:           Indexed<BlogPost>
        Insert:        Indexed<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
        Update:        Indexed<Partial<BlogPost>>
        Relationships: []
      }
      broadcasts: {
        Row:           Indexed<Broadcast>
        Insert:        Indexed<Omit<Broadcast, 'id' | 'created_at'> & { id?: string; created_at?: string }>
        Update:        Indexed<Partial<Broadcast>>
        Relationships: []
      }
      coach_usage: {
        Row:           Indexed<CoachUsage>
        Insert:        Indexed<Partial<CoachUsage>>
        Update:        Indexed<Partial<CoachUsage>>
        Relationships: []
      }
      admin_accounts: {
        Row:           Indexed<AdminAccount>
        Insert:        Indexed<Omit<AdminAccount, 'id' | 'created_at' | 'last_seen_at' | 'user_id'> & { id?: string; created_at?: string; last_seen_at?: string | null; user_id?: string | null }>
        Update:        Indexed<Partial<AdminAccount>>
        Relationships: []
      }
      api_connections: {
        Row:           Indexed<ApiConnection>
        Insert:        Indexed<Omit<ApiConnection, 'updated_at'> & { updated_at?: string }>
        Update:        Indexed<Partial<ApiConnection>>
        Relationships: []
      }
      platform_settings: {
        Row:           Indexed<PlatformSettings>
        Insert:        Indexed<{ id: number; limits?: Json; pricing?: Json; maintenance?: Json; updated_at?: string }>
        Update:        Indexed<Partial<PlatformSettings>>
        Relationships: []
      }
    }
    Views: {
      admin_members: {
        Row:           Indexed<AdminMember>
        Insert:        never
        Update:        never
        Relationships: []
      }
    }
    Functions: {
      get_platform_stats: {
        Args: Record<string, never>
        Returns: {
          members_total:     number
          members_validated: number
          countries:         number
          matches:           number
        }[]
      }
    }
    Enums:     Record<string, never>
  }
}

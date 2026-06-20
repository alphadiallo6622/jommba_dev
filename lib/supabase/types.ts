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
  status:             ProfileStatus
  is_premium:         boolean
  profile_completion: number
  visibility:         Visibility
  created_at:         string
  updated_at:         string
}

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
  id?:         string
  created_at?: string
  updated_at?: string
}
export type ProfileUpdate = Partial<ProfileInsert>

export interface UserPreferences {
  id:             string
  user_id:        string
  photos_blurred: boolean
  sound_enabled:  boolean
  created_at:     string
  updated_at:     string
}

export interface ProfilePhoto {
  id:         string
  user_id:    string
  url:        string
  is_primary: boolean
  order:      number
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
  id:          string
  sender_id:   string
  receiver_id: string
  type:        LikeType
  status:      RequestStatus
  created_at:  string
}

export interface ProfileVisitor {
  id:         string
  visitor_id: string
  profile_id: string
  visited_at: string
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
  created_at:            string
  updated_at:            string
}

export interface Report {
  id:          string
  reporter_id: string
  reported_id: string
  reason:      string
  status:      ReportStatus
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
  id:         string
  user_id:    string
  subject:    string
  body:       string
  status:     TicketStatus
  created_at: string
  updated_at: string
}

// ─── Database (pour typage du client Supabase) ────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row:    Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      user_preferences: {
        Row:    UserPreferences
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<UserPreferences>
      }
      profile_photos: {
        Row:    ProfilePhoto
        Insert: Omit<ProfilePhoto, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<ProfilePhoto>
      }
      conversations: {
        Row:    Conversation
        Insert: Omit<Conversation, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Conversation>
      }
      messages: {
        Row:    Message
        Insert: Omit<Message, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Message>
      }
      likes: {
        Row:    Like
        Insert: Omit<Like, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Like>
      }
      profile_visitors: {
        Row:    ProfileVisitor
        Insert: Omit<ProfileVisitor, 'id'> & { id?: string }
        Update: Partial<ProfileVisitor>
      }
      boosts: {
        Row:    Boost
        Insert: Omit<Boost, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Boost>
      }
      subscriptions: {
        Row:    Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Subscription>
      }
      reports: {
        Row:    Report
        Insert: Omit<Report, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Report>
      }
      notifications: {
        Row:    Notification
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Notification>
      }
      support_tickets: {
        Row:    SupportTicket
        Insert: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<SupportTicket>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

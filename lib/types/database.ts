// データベース型定義
// Supabaseの型生成コマンド: npx supabase gen types typescript --project-id <project-id> > lib/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: number
          name: string
          stripe_customer_id: string | null
          plan: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          stripe_customer_id?: string | null
          plan?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          stripe_customer_id?: string | null
          plan?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      company_users: {
        Row: {
          id: number
          company_id: number
          user_id: string
          is_admin: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          company_id: number
          user_id: string
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          company_id?: number
          user_id?: string
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      company_stores: {
        Row: {
          id: number
          company_id: number
          name: string
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          company_id: number
          name: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          company_id?: number
          name?: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_stores: {
        Row: {
          id: number
          user_id: string
          store_id: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          store_id: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          store_id?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shifts: {
        Row: {
          id: number
          user_id: string
          store_id: number
          date: string
          scheduled_start: string
          scheduled_end: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          store_id: number
          date: string
          scheduled_start: string
          scheduled_end: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          store_id?: number
          date?: string
          scheduled_start?: string
          scheduled_end?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      shift_breaks: {
        Row: {
          id: number
          shift_id: number
          break_start: string
          break_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          shift_id: number
          break_start: string
          break_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          shift_id?: number
          break_start?: string
          break_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      clock_records: {
        Row: {
          id: number
          user_id: string
          store_id: number
          shift_id: number | null
          break_id: number | null
          type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
          selected_time: string
          actual_time: string
          method: 'scheduled' | 'current' | 'manual'
          status: 'pending' | 'approved' | 'rejected'
          created_by: string
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          store_id: number
          shift_id?: number | null
          break_id?: number | null
          type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
          selected_time: string
          actual_time: string
          method: 'scheduled' | 'current' | 'manual'
          status?: 'pending' | 'approved' | 'rejected'
          created_by: string
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          store_id?: number
          shift_id?: number | null
          break_id?: number | null
          type?: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
          selected_time?: string
          actual_time?: string
          method?: 'scheduled' | 'current' | 'manual'
          status?: 'pending' | 'approved' | 'rejected'
          created_by?: string
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      store_settings: {
        Row: {
          id: number
          store_id: number
          approval_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          store_id: number
          approval_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          store_id?: number
          approval_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shift_copies: {
        Row: {
          id: number
          user_id: string
          source_date: string
          target_date: string
          overwrite: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          source_date: string
          target_date: string
          overwrite?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          source_date?: string
          target_date?: string
          overwrite?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: number
          company_id: number
          stripe_subscription_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          company_id: number
          stripe_subscription_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          company_id?: number
          stripe_subscription_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}


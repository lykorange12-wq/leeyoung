// 이 파일은 `pnpm db:types` 명령으로 Supabase에서 자동 생성됩니다.
// 아래는 초기 수동 타입 정의 (Supabase v2 호환 구조)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          plan: 'free' | 'pro' | 'business'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          plan?: 'free' | 'pro' | 'business'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          plan?: 'free' | 'pro' | 'business'
          created_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          id: string
          user_id: string
          name: string
          subdomain: string
          custom_domain: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          subdomain: string
          custom_domain?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          subdomain?: string
          custom_domain?: string | null
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sites_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      pages: {
        Row: {
          id: string
          site_id: string
          slug: string
          title: string
          meta_description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          slug: string
          title: string
          meta_description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          slug?: string
          title?: string
          meta_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pages_site_id_fkey'
            columns: ['site_id']
            referencedRelation: 'sites'
            referencedColumns: ['id']
          }
        ]
      }
      blocks: {
        Row: {
          id: string
          page_id: string
          type: string
          props: Json
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          type: string
          props: Json
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          type?: string
          props?: Json
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: 'blocks_page_id_fkey'
            columns: ['page_id']
            referencedRelation: 'pages'
            referencedColumns: ['id']
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: 'active' | 'cancelled' | 'past_due'
          toss_billing_key: string | null
          current_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          status: 'active' | 'cancelled' | 'past_due'
          toss_billing_key?: string | null
          current_period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          plan?: string
          status?: 'active' | 'cancelled' | 'past_due'
          toss_billing_key?: string | null
          current_period_end?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

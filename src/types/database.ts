export type UserRole = 'admin' | 'manager' | 'staff'
export type FeedbackType = 'like' | 'hold' | 'exclude'
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string
          name: string
          location: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['branches']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['branches']['Insert']>
      }
      uploads: {
        Row: {
          id: string
          branch_id: string
          version: number
          file_url: string
          file_name: string
          uploaded_by: string
          uploaded_at: string
        }
        Insert: Omit<Database['public']['Tables']['uploads']['Row'], 'id' | 'uploaded_at'>
        Update: Partial<Database['public']['Tables']['uploads']['Insert']>
      }
      analyses: {
        Row: {
          id: string
          upload_id: string
          status: AnalysisStatus
          result_json: AnalysisResult | null
          created_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['analyses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['analyses']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          eland_flag: boolean
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      recommendations: {
        Row: {
          id: string
          analysis_id: string
          category_id: string
          brand: string
          score: number
          reason: string
          is_eland_brand: boolean
        }
        Insert: Omit<Database['public']['Tables']['recommendations']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['recommendations']['Insert']>
      }
      feedbacks: {
        Row: {
          id: string
          recommendation_id: string
          user_id: string
          type: FeedbackType
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['feedbacks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['feedbacks']['Insert']>
      }
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          team_id: string | null
          full_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
    }
  }
}

export interface AnalysisResult {
  gap_categories: GapCategory[]
  summary: string
  analyzed_at: string
}

export interface GapCategory {
  category_id: string
  category_name: string
  gap_score: number
  recommendations: RecommendationItem[]
}

export interface RecommendationItem {
  brand: string
  score: number
  reason: string
  is_eland_brand: boolean
}

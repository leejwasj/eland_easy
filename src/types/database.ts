export type UserRole = 'admin' | 'manager' | 'staff'
export type FeedbackType = 'like' | 'hold' | 'exclude'
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'

// Row types (flat, no self-reference)
export interface BranchRow {
  id: string
  name: string
  location: string
  type: string
  created_at: string
  updated_at: string
}

export interface UploadRow {
  id: string
  branch_id: string
  version: number
  file_url: string
  file_name: string
  uploaded_by: string
  uploaded_at: string
}

export interface AnalysisRow {
  id: string
  upload_id: string
  status: AnalysisStatus
  result_json: AnalysisResult | null
  created_at: string
  completed_at: string | null
}

export interface CategoryRow {
  id: string
  name: string
  parent_id: string | null
  eland_flag: boolean
}

export interface RecommendationRow {
  id: string
  analysis_id: string
  category_id: string
  brand: string
  score: number
  reason: string
  is_eland_brand: boolean
}

export interface FeedbackRow {
  id: string
  recommendation_id: string
  user_id: string
  type: FeedbackType
  created_at: string
}

export interface UserRow {
  id: string
  email: string
  role: UserRole
  team_id: string | null
  full_name: string | null
  created_at: string
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      branches: {
        Row: BranchRow
        Insert: Omit<BranchRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BranchRow, 'id' | 'created_at' | 'updated_at'>>
      }
      uploads: {
        Row: UploadRow
        Insert: Omit<UploadRow, 'id' | 'uploaded_at'>
        Update: Partial<Omit<UploadRow, 'id' | 'uploaded_at'>>
      }
      analyses: {
        Row: AnalysisRow
        Insert: Omit<AnalysisRow, 'id' | 'created_at'>
        Update: Partial<Omit<AnalysisRow, 'id' | 'created_at'>>
      }
      categories: {
        Row: CategoryRow
        Insert: Omit<CategoryRow, 'id'>
        Update: Partial<Omit<CategoryRow, 'id'>>
      }
      recommendations: {
        Row: RecommendationRow
        Insert: Omit<RecommendationRow, 'id'>
        Update: Partial<Omit<RecommendationRow, 'id'>>
      }
      feedbacks: {
        Row: FeedbackRow
        Insert: Omit<FeedbackRow, 'id' | 'created_at'>
        Update: Partial<Omit<FeedbackRow, 'id' | 'created_at'>>
      }
      users: {
        Row: UserRow
        Insert: Omit<UserRow, 'created_at'>
        Update: Partial<Omit<UserRow, 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Analysis result JSON shape
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

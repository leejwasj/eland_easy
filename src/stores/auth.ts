import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/database'

interface UserProfile {
  id: string
  email: string
  role: UserRole
  team_id: string | null
  full_name: string | null
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  reset: () => set({ user: null, profile: null }),
}))

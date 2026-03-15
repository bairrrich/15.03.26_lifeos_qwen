import type { BaseEntity } from '@/core/entity'

export type FamilyRole = 'owner' | 'admin' | 'member' | 'child'
export type ShareScope = 'all' | 'habits' | 'goals' | 'finance' | 'nutrition' | 'workouts'

export interface Family extends BaseEntity {
  name: string
  description?: string
  owner_id: string
  member_count: number
  created_at: number
  settings: {
    require_approval: boolean
    default_share_scope: ShareScope
  }
}

export interface FamilyMember extends BaseEntity {
  family_id: string
  user_id: string
  email: string
  name: string
  role: FamilyRole
  joined_at: number
  share_scope: ShareScope[]
  is_active: boolean
}

export interface FamilyInvitation extends BaseEntity {
  family_id: string
  email: string
  invited_by: string
  invited_by_name: string
  role: FamilyRole
  share_scope: ShareScope[]
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: number
  token: string
}

export interface SharedData extends BaseEntity {
  family_id: string
  owner_id: string
  data_type: 'habit' | 'goal' | 'transaction' | 'workout' | 'nutrition'
  data_id: string
  visibility: 'all' | 'admins' | 'owner_only'
  created_at: number
}

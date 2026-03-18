'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FamilyService,
  FamilyMemberService,
  FamilyInvitationService,
  SharedDataService,
} from '../services'
import type { Family, SharedData, FamilyRole, ShareScope } from '../entities'

const familyService = new FamilyService()
const familyMemberService = new FamilyMemberService()
const familyInvitationService = new FamilyInvitationService()
const sharedDataService = new SharedDataService()

// Families
export function useFamily() {
  return useQuery({
    queryKey: ['family'],
    queryFn: () => familyService.getAll(),
  })
}

export function useCreateFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Family, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at' | 'member_count'>) =>
      familyService.create({ ...data, member_count: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] })
    },
  })
}

// Family Members
export function useFamilyMembers(familyId?: string) {
  return useQuery({
    queryKey: ['family-members', familyId],
    queryFn: () => (familyId ? familyMemberService.getByFamily(familyId) : Promise.resolve([])),
    enabled: !!familyId,
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: FamilyRole }) =>
      familyMemberService.updateRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] })
    },
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => familyMemberService.removeMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] })
    },
  })
}

// Family Invitations
export function useFamilyInvitations(familyId?: string) {
  return useQuery({
    queryKey: ['family-invitations', familyId],
    queryFn: () => (familyId ? familyInvitationService.getByFamily(familyId) : Promise.resolve([])),
    enabled: !!familyId,
  })
}

export function useCreateInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      family_id: string
      email: string
      invited_by: string
      invited_by_name: string
      role: FamilyRole
      share_scope: ShareScope[]
    }) => {
      const token = await familyInvitationService.generateToken()
      return familyInvitationService.create({
        ...data,
        token,
        status: 'pending',
        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 дней
        user_id: data.invited_by,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-invitations'] })
    },
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invitationId: string) => familyInvitationService.acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-invitations'] })
      queryClient.invalidateQueries({ queryKey: ['family-members'] })
    },
  })
}

// Shared Data
export function useSharedData(familyId?: string) {
  return useQuery({
    queryKey: ['shared-data', familyId],
    queryFn: () => (familyId ? sharedDataService.getByFamily(familyId) : Promise.resolve([])),
    enabled: !!familyId,
  })
}

export function useShareData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<SharedData, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'>) =>
      sharedDataService.shareData(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-data'] })
    },
  })
}

export function useUpdateSharedVisibility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ dataId, visibility }: { dataId: string; visibility: SharedData['visibility'] }) =>
      sharedDataService.updateVisibility(dataId, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-data'] })
    },
  })
}


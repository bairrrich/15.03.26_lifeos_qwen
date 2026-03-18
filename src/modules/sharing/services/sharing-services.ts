import { CrudService } from '@/core/crud'
import { db } from '@/core/database'
import type { Family, FamilyMember, FamilyInvitation, SharedData, FamilyRole, ShareScope } from '../entities'

export class FamilyService extends CrudService<Family> {
  constructor() {
    super('families')
  }

  async getUserFamily(userId: string): Promise<Family | undefined> {
    const families = await this.getAll()
    return families.find((f) => f.owner_id === userId)
  }

  async getMemberCount(familyId: string): Promise<number> {
    const members = await db.table('family_members').toArray()
    return members.filter((m: Record<string, unknown>) => (m.family_id as string) === familyId && (m.is_active as boolean)).length
  }
}

export class FamilyMemberService extends CrudService<FamilyMember> {
  constructor() {
    super('family_members')
  }

  async getByFamily(familyId: string): Promise<FamilyMember[]> {
    return await this.findByField('family_id', familyId)
  }

  async getByUser(userId: string): Promise<FamilyMember[]> {
    return await this.findByField('user_id', userId)
  }

  async updateRole(memberId: string, role: FamilyRole): Promise<void> {
    await this.update(memberId, { role })
  }

  async updateShareScope(memberId: string, scope: ShareScope[]): Promise<void> {
    await this.update(memberId, { share_scope: scope })
  }

  async removeMember(memberId: string): Promise<void> {
    await this.update(memberId, { is_active: false })
  }
}

export class FamilyInvitationService extends CrudService<FamilyInvitation> {
  constructor() {
    super('family_invitations')
  }

  async getByFamily(familyId: string): Promise<FamilyInvitation[]> {
    return await this.findByField('family_id', familyId)
  }

  async getByEmail(email: string): Promise<FamilyInvitation[]> {
    return await this.findByField('email', email)
  }

  async getByToken(token: string): Promise<FamilyInvitation | undefined> {
    const invitations = await this.getAll()
    return invitations.find((i) => i.token === token && i.status === 'pending' && i.expires_at > Date.now())
  }

  async acceptInvitation(invitationId: string): Promise<void> {
    await this.update(invitationId, { status: 'accepted' })
  }

  async declineInvitation(invitationId: string): Promise<void> {
    await this.update(invitationId, { status: 'declined' })
  }

  async expireInvitation(invitationId: string): Promise<void> {
    await this.update(invitationId, { status: 'expired' })
  }

  async generateToken(): Promise<string> {
    return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }
}

export class SharedDataService extends CrudService<SharedData> {
  constructor() {
    super('shared_data')
  }

  async getByFamily(familyId: string): Promise<SharedData[]> {
    return await this.findByField('family_id', familyId)
  }

  async getByOwner(ownerId: string): Promise<SharedData[]> {
    return await this.findByField('owner_id', ownerId)
  }

  async shareData(data: Omit<SharedData, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'>): Promise<SharedData> {
    return this.create({
      ...data,
      user_id: data.owner_id,
    })
  }

  async updateVisibility(dataId: string, visibility: SharedData['visibility']): Promise<void> {
    await this.update(dataId, { visibility })
  }

  async revokeAccess(dataId: string): Promise<void> {
    await this.delete(dataId)
  }
}


import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мок для Dexie (IndexedDB)
const mockTable = {
    add: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
    where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([]),
        }),
    }),
};

const mockDb = {
    test_entities: mockTable,
};

// Мок для sync service
const mockSyncService = {
    sync: vi.fn().mockResolvedValue({ success: true }),
    startAutoSync: vi.fn(),
    stopAutoSync: vi.fn(),
};

// Мок для auth
const mockGetLocalUser = vi.fn().mockReturnValue(null);

// Мок для uuid
const mockV4 = vi.fn().mockReturnValue('test-uuid-1234');

// Применяем моки
vi.mock('../../core/database', () => ({
    db: mockDb,
}));

vi.mock('../../core/sync', () => ({
    syncService: mockSyncService,
}));

vi.mock('../../core/auth', () => ({
    getLocalUser: mockGetLocalUser,
}));

vi.mock('uuid', () => ({
    v4: mockV4,
}));

// Тестовая сущность
interface TestEntity {
    id: string;
    user_id: string;
    name: string;
    value: number;
    created_at: number;
    updated_at: number;
    version: number;
    sync_status: 'local' | 'synced' | 'conflict' | 'pending';
    deleted_at?: number;
}

// Импортируем после моков
import { CrudService } from '../../core/crud/base-crud';

describe('CrudService', () => {
    let service: CrudService<TestEntity>;

    beforeEach(() => {
        vi.clearAllMocks();

        // Сбрасываем мок таблицы
        mockTable.add.mockResolvedValue(undefined);
        mockTable.get.mockResolvedValue(undefined);
        mockTable.update.mockResolvedValue(undefined);
        mockTable.delete.mockResolvedValue(undefined);
        mockTable.toArray.mockResolvedValue([]);

        service = new CrudService<TestEntity>('test_entities');
    });

    describe('create', () => {
        it('should create a new entity with generated id and timestamps', async () => {
            const entity = {
                name: 'Test Entity',
                value: 100,
                user_id: 'test-user-123',
            };

            const result = await service.create(entity);

            expect(result).toHaveProperty('id');
            expect(result.id).toBe('test-uuid-1234');
            expect(result.name).toBe('Test Entity');
            expect(result.value).toBe(100);
            expect(result.user_id).toBe('test-user-123');
            expect(result.created_at).toBeDefined();
            expect(result.updated_at).toBeDefined();
            expect(result.version).toBe(1);
            expect(result.sync_status).toBe('local');
        });

        it('should call table.add with correct data', async () => {
            const entity = {
                name: 'Test',
                value: 50,
                user_id: 'user-1',
            };

            await service.create(entity);

            expect(mockTable.add).toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('should return entity by id', async () => {
            const mockEntity: TestEntity = {
                id: 'test-123',
                name: 'Test',
                value: 10,
                user_id: 'user-1',
                created_at: Date.now(),
                updated_at: Date.now(),
                version: 1,
                sync_status: 'synced',
            };

            mockTable.get.mockResolvedValueOnce(mockEntity);

            const result = await service.getById('test-123');

            expect(result).toEqual(mockEntity);
            expect(mockTable.get).toHaveBeenCalledWith('test-123');
        });

        it('should return undefined for non-existent id', async () => {
            mockTable.get.mockResolvedValueOnce(undefined);

            const result = await service.getById('non-existent');

            expect(result).toBeUndefined();
        });
    });

    describe('getAll', () => {
        it('should return all non-deleted entities', async () => {
            const mockEntities: TestEntity[] = [
                {
                    id: '1',
                    name: 'Entity 1',
                    value: 10,
                    user_id: 'user-1',
                    created_at: Date.now(),
                    updated_at: Date.now(),
                    version: 1,
                    sync_status: 'synced',
                },
                {
                    id: '2',
                    name: 'Entity 2',
                    value: 20,
                    user_id: 'user-1',
                    created_at: Date.now(),
                    updated_at: Date.now(),
                    version: 1,
                    sync_status: 'synced',
                    deleted_at: Date.now(),
                },
            ];

            mockTable.toArray.mockResolvedValueOnce(mockEntities);

            const result = await service.getAll();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Entity 1');
        });
    });

    describe('update', () => {
        it('should update entity with new version and sync_status', async () => {
            const existingEntity: TestEntity = {
                id: 'test-123',
                name: 'Old Name',
                value: 10,
                user_id: 'user-1',
                created_at: Date.now(),
                updated_at: Date.now(),
                version: 1,
                sync_status: 'synced',
            };

            mockTable.get.mockResolvedValueOnce(existingEntity);

            await service.update('test-123', { name: 'New Name' });

            expect(mockTable.update).toHaveBeenCalledWith('test-123', expect.objectContaining({
                name: 'New Name',
                version: 2,
                sync_status: 'local',
            }));
        });

        it('should not update if entity does not exist', async () => {
            mockTable.get.mockResolvedValueOnce(undefined);

            await service.update('non-existent', { name: 'Test' });

            expect(mockTable.update).not.toHaveBeenCalled();
        });
    });

    describe('delete (soft delete)', () => {
        it('should soft delete entity by setting deleted_at', async () => {
            const existingEntity: TestEntity = {
                id: 'test-123',
                name: 'Test',
                value: 10,
                user_id: 'user-1',
                created_at: Date.now(),
                updated_at: Date.now(),
                version: 1,
                sync_status: 'synced',
            };

            mockTable.get.mockResolvedValueOnce(existingEntity);

            await service.delete('test-123');

            expect(mockTable.update).toHaveBeenCalledWith('test-123', expect.objectContaining({
                deleted_at: expect.any(Number),
                sync_status: 'local',
            }));
        });
    });

    describe('hardDelete', () => {
        it('should permanently delete entity', async () => {
            await service.hardDelete('test-123');

            expect(mockTable.delete).toHaveBeenCalledWith('test-123');
        });
    });

    describe('findByField', () => {
        it('should find entities by field value', async () => {
            const mockEntities: TestEntity[] = [
                { id: '1', name: 'Test 1', value: 10, user_id: 'user-1', created_at: Date.now(), updated_at: Date.now(), version: 1, sync_status: 'synced' },
                { id: '2', name: 'Test 2', value: 20, user_id: 'user-1', created_at: Date.now(), updated_at: Date.now(), version: 1, sync_status: 'synced' },
            ];

            mockTable.where.mockReturnValue({
                equals: vi.fn().mockReturnValue({
                    toArray: vi.fn().mockResolvedValue(mockEntities),
                }),
            } as never);

            const result = await service.findByField('name', 'Test 1');

            expect(result).toEqual(mockEntities);
        });
    });

    describe('getPendingSync', () => {
        it('should return entities with sync_status local', async () => {
            const pendingEntities: TestEntity[] = [
                { id: '1', name: 'Test', value: 10, user_id: 'user-1', created_at: Date.now(), updated_at: Date.now(), version: 1, sync_status: 'local' },
            ];

            mockTable.where.mockReturnValue({
                equals: vi.fn().mockReturnValue({
                    toArray: vi.fn().mockResolvedValue(pendingEntities),
                }),
            } as never);

            const result = await service.getPendingSync();

            expect(result).toEqual(pendingEntities);
        });
    });

    describe('markAsSynced', () => {
        it('should update entity to synced status', async () => {
            await service.markAsSynced('test-123');

            expect(mockTable.update).toHaveBeenCalledWith('test-123', expect.objectContaining({
                sync_status: 'synced',
                last_synced_at: expect.any(Number),
            }));
        });
    });
});

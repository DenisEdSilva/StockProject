import prismaClient from "../../prisma";
import { ValidationError, NotFoundError, ForbiddenError } from "../../errors";
import { CreateAuditLogService } from "../audit/CreateAuditLogService";
import { ActivityTracker } from "../activity/ActivityTracker";

interface UpdateStoreRequest {
    storeId: number;
    performedByUserId: number;
    userId: number;
    ipAddress: string;
    userAgent: string;
    name?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

class UpdateStoreService {
    async execute(data: UpdateStoreRequest) {
        const auditLogService = new CreateAuditLogService();
        const activityTracker = new ActivityTracker();
        return await prismaClient.$transaction(async (tx) => {
            if (!data.storeId || isNaN(data.storeId)) throw new ValidationError("ID da loja inválido");

            const store = await tx.store.findUnique({
                where: { id: data.storeId },
                select: { ownerId: true, name: true, city: true, state: true, zipCode: true }
            });

            if (!store) throw new NotFoundError("Loja não encontrada");
            if (store.ownerId !== data.userId) throw new ForbiddenError("Acesso não autorizado");

            const updateData: Record<string, any> = {};

            if (data.name !== undefined && data.name !== store.name) {
                updateData.name = data.name;
            }
            if (data.city !== undefined && data.city !== store.city) {
                updateData.city = data.city;
            }
            if (data.state !== undefined) {
                if (data.state.length !== 2) throw new ValidationError("Sigla do estado deve ter 2 caracteres");
                if (data.state !== store.state) updateData.state = data.state;
            }
            if (data.zipCode !== undefined && data.zipCode !== store.zipCode) {
                updateData.zipCode = data.zipCode;
            }

            if (Object.keys(updateData).length === 0) {
                return { 
                    message: "Nenhuma alteração necessária",
                    store: { ...store, ...updateData }
                };
            }

            const updatedStore = await tx.store.update({
                where: { id: data.storeId },
                data: updateData,
                select: { id: true, name: true, city: true, state: true, zipCode: true }
            });

            await Promise.all([
                tx.store.update({
                    where: { id: data.storeId },
                    data: { lastActivityAt: new Date() }
                }),
                tx.user.update({
                    where: { id: data.userId },
                    data: { lastActivityAt: new Date() }
                })
            ]);

            await activityTracker.track({
                tx,
                storeId: data.storeId,
                performedByUserId: data.performedByUserId
            })

            await auditLogService.create({
                action: "STORE_UPDATE",
                details: {
                    from: store,
                    to: updatedStore
                },
                userId: data.performedByUserId,
                storeId: data.storeId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            });

            return updatedStore;
        });
    }
}

export { UpdateStoreService };
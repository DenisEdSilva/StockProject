import prismaClient from "../../prisma";
import { ValidationError, NotFoundError, ConflictError } from "../../errors";
import { CreateAuditLogService } from "../audit/CreateAuditLogService";
import { ActivityTracker } from "../activity/ActivityTracker";

interface UpdateProductRequest {
    performedByUserId: number;
    storeId: number;
    categoryId?: number;
    productId: number;
    name?: string;
    price?: string;
    description?: string;
    ipAddress: string;
    userAgent: string;
}

class UpdateProductService {
    async execute(data: UpdateProductRequest) {
        const auditLogService = new CreateAuditLogService();
        const activityTracker = new ActivityTracker();
        return await prismaClient.$transaction(async (tx) => {
            this.validateInput(data);

            const isOwner = await tx.store.findUnique({ 
                where: { 
                    id: data.storeId 
                }, 
                select: { 
                    ownerId: true 
                } 
            });

            if (!data.productId || isNaN(data.productId)) throw new ValidationError("ID do produto inválido");

            const product = await tx.product.findUnique({ where: { id: data.productId } });
            if (!product) throw new NotFoundError("Produto não encontrado");
            if (product.isDeleted) throw new ConflictError("Produto excluído");

            if (data.categoryId) {
                const category = await tx.category.findUnique({ where: { id: data.categoryId } });
                if (!category) throw new NotFoundError("Categoria não existe");
            }

            const updatedProduct = await tx.product.update({
                where: { id: data.productId },
                data: { 
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    categoryId: data.categoryId
                },
                select: { id: true, name: true, price: true, stock: true }
            });

            await activityTracker.track({
                tx,
                storeId: data.storeId,
                performedByUserId: data.performedByUserId
            })

            const oldData = JSON.stringify(product, null, 2);
            const newData = JSON.stringify(updatedProduct, null, 2);

            await auditLogService.create({
                action: "PRODUCT_UPDATE",
                details: {
                    oldData,
                    newData
                },
                ...(isOwner ? {
                    userId: data.performedByUserId
                } : {
                    storeUserId: data.performedByUserId
                }),
                storeId: product.storeId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            });

            return updatedProduct;
        });
    }

    private validateInput(data: UpdateProductRequest) {
        if (data.price && isNaN(parseFloat(data.price))) throw new ValidationError("Preço inválido");
        if (data.name?.length > 100) throw new ValidationError("Nome muito longo (máx. 100 caracteres)");
    }
}

export { UpdateProductService };
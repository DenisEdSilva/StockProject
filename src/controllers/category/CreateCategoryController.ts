import { Request, Response, NextFunction } from "express";
import { CreateCategoryService } from "../../services/category/CreateCategoryService";

class CreateCategoryController {
    async handle(req: Request, res: Response, next: NextFunction) {
        const { name } = req.body;
        const storeId = parseInt(req.params.storeId, 10);
        const userId = req.userId;

        const service = new CreateCategoryService();
        const category = await service.execute({
            name,
            storeId,
            userId,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"] as string
        });

        return res.status(201).json(category);
    }
}

export { CreateCategoryController };
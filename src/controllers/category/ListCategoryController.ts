import { Request, Response } from "express";
import { ListCategoryService } from "../../services/category/ListCategoryService";

class ListCategoryController {
    async handle(req: Request, res: Response) {
        try {
            const listCategoryService = new ListCategoryService();

            const categories = await listCategoryService.execute(req.body);

            return res.json(categories);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

export { ListCategoryController };
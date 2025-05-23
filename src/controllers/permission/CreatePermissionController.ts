import { Request, Response } from "express";
import { CreatePermissionService } from "../../services/permission/CreatePermissionService";

class CreatePermissionController {
    async handle(req: Request, res: Response) {
        try {
            const createPermissionService = new CreatePermissionService();

            const permission = await createPermissionService.execute(req.body);

            return res.json(permission);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

export { CreatePermissionController };
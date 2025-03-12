import prismaClient from "../../prisma";

interface DeleteUserRequest {
    id: number;
}

class DeleteUserService {
    async execute({ id }: DeleteUserRequest) {
        try {
            if (!id) {
                throw new Error("User ID is required");
            }

            const user = await prismaClient.user.findUnique({
                where: {
                    id: id,
                },
                include: {
                    stores: true,
                }
            });

            if (!user) {
                throw new Error("User not found");
            }

            await prismaClient.user.update({
                where: {
                    id: id,
                },
                data: {
                    markedForDeletionAt: new Date(),
                }
            })



            return { message: "User marked for deletion. Data will be removed in 30 days" };           

        } catch (error) {
            console.log("Error marking user for deletion: ", error);
            throw new Error(`Failed to mark user for deletion. Error: ${error.message}`);
        }
    }
}
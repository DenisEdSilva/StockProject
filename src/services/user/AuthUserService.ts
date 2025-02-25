import prismaClient from "../../prisma";
import { compare } from "bcryptjs"
import { sign } from "jsonwebtoken";

interface AuthRequest {
    email: string;
    password: string
}

class AuthUserService {
    async execute({ email, password }: AuthRequest) {
        const user = await prismaClient.user.findFirst({
            where: {
                email: email
            }
        })

        if (!user) {
            throw new Error("User or password not found");
        }

        const passwordMatch = await compare(password, user.password);

        if (!passwordMatch) {
            throw new Error("User or password not found");
        }

        const token = sign({
            name: user.name,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, {
            subject: user.id,
            expiresIn: "30d"
        })

        return {
            user: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        }
    }
}

export { AuthUserService }
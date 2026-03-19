"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
class PrismaUserRepository {
    constructor(prismaClient) {
        this.prisma = prismaClient;
    }
    async create(input) {
        const createdUser = await this.prisma.user.create({
            data: {
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email,
                password: input.passwordHash,
            },
        });
        return createdUser;
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user;
    }
}
exports.PrismaUserRepository = PrismaUserRepository;

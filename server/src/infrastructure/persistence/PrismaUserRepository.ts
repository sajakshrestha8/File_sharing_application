import type { UserRecord, UserRepository } from "../../domain/interfaces/UserRepository";

export class PrismaUserRepository implements UserRepository {
  private prisma: any;

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }

  async create(input: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<UserRecord> {
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

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user;
  }
}


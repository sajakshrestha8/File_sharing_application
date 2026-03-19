import bcrypt from "bcrypt";
import type { UserRepository } from "../../domain/interfaces/UserRepository";

export type RegisterUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type RegisterUserOutput = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    if (!input.firstName || !input.lastName || !input.email || !input.password) {
      throw new Error("All fields are required");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const created = await this.userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
    });

    // Return the shape the presentation layer can embed in its response.
    return created;
  }
}


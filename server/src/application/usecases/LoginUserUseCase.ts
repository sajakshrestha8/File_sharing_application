import bcrypt from "bcrypt";
import type { UserRepository } from "../../domain/interfaces/UserRepository";

export type LoginUserInput = {
  email: string;
  password: string;
};

export class LoginUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: LoginUserInput): Promise<{ message: string }> {
    if (!input.email || !input.password) {
      throw new Error("All fields are required");
    }

    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error("User with this email is not registered");
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect password");
    }

    return { message: "Login successful" };
  }
}


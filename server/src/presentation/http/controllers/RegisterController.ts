import type { Request, Response } from "express";
import type { RegisterUserUseCase } from "../../../application/usecases/RegisterUserUseCase";

export const registerController =
  (useCase: RegisterUserUseCase) =>
  async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password } = req.body ?? {};

      const registeredUser = await useCase.execute({
        firstName,
        lastName,
        email,
        password,
      });

      res.status(200).json({ success: true, registeredUser });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ success: false, error: message });
    }
  };


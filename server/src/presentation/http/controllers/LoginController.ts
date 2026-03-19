import type { Request, Response } from "express";
import type { LoginUserUseCase } from "../../../application/usecases/LoginUserUseCase";

export const loginController =
  (useCase: LoginUserUseCase) =>
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body ?? {};

      const result = await useCase.execute({ email, password });
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ success: false, error: message });
    }
  };


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = void 0;
const loginController = (useCase) => async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        const result = await useCase.execute({ email, password });
        res.status(200).json({ success: true, message: result.message });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ success: false, error: message });
    }
};
exports.loginController = loginController;

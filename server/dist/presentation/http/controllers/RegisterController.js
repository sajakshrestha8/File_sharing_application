"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = void 0;
const registerController = (useCase) => async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body ?? {};
        const registeredUser = await useCase.execute({
            firstName,
            lastName,
            email,
            password,
        });
        res.status(200).json({ success: true, registeredUser });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ success: false, error: message });
    }
};
exports.registerController = registerController;

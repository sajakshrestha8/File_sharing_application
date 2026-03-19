"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class RegisterUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(input) {
        if (!input.firstName || !input.lastName || !input.email || !input.password) {
            throw new Error("All fields are required");
        }
        const passwordHash = await bcrypt_1.default.hash(input.password, 10);
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
exports.RegisterUserUseCase = RegisterUserUseCase;

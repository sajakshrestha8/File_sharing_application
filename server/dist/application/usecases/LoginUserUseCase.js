"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserUseCase = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class LoginUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(input) {
        if (!input.email || !input.password) {
            throw new Error("All fields are required");
        }
        const user = await this.userRepository.findByEmail(input.email);
        if (!user) {
            throw new Error("User with this email is not registered");
        }
        const isMatch = await bcrypt_1.default.compare(input.password, user.password);
        if (!isMatch) {
            throw new Error("Incorrect password");
        }
        return { message: "Login successful" };
    }
}
exports.LoginUserUseCase = LoginUserUseCase;

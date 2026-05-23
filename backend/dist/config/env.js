"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    PORT: Number(process.env.PORT || 5001),
    USE_DB: process.env.USE_DB === 'true',
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || 'locally_dev_secret',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
};
//# sourceMappingURL=env.js.map
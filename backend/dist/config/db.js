"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDB() {
    if (!env_1.ENV.USE_DB) {
        console.log('Skipping MongoDB connection (USE_DB=false)');
        return;
    }
    if (!env_1.ENV.MONGODB_URI) {
        console.warn('MONGODB_URI is not set, skipping DB connection.');
        return;
    }
    try {
        await mongoose_1.default.connect(env_1.ENV.MONGODB_URI);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
//# sourceMappingURL=db.js.map
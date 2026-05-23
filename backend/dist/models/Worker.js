"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const workerSchema = new mongoose_1.default.Schema({
    displayName: { type: String, required: true },
    phoneE164: { type: String, required: true, unique: true },
    whatsappE164: { type: String },
    categoryId: { type: String, required: true },
    languages: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    trustScore: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    localityLabel: { type: String },
    areaCoverageKm: { type: Number, default: 5 },
    location: {
        lat: { type: Number },
        lng: { type: Number },
    },
    workingHoursLabel: { type: String },
    emergencyAvailable: { type: Boolean, default: false },
    profileImage: { type: String },
    profession: { type: String },
    description: { type: String },
    estimatedStartingPrice: { type: Number },
    responseTimeMins: { type: Number },
});
exports.Worker = mongoose_1.default.model('Worker', workerSchema);
//# sourceMappingURL=Worker.js.map
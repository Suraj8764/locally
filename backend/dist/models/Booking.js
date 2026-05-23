"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bookingSchema = new mongoose_1.default.Schema({
    customerId: { type: String, required: true },
    workerId: { type: String, required: true },
    categoryId: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'on_the_way', 'started', 'completed', 'cancelled_by_customer', 'cancelled_by_worker'],
        default: 'pending'
    },
    createdAtMs: { type: Number, default: () => Date.now() },
    scheduledAtMs: { type: Number },
    address: { type: String, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number },
    },
    problemDescription: { type: String },
    issueImageUrl: { type: String },
    isEmergency: { type: Boolean, default: false },
    estimatedPrice: { type: Number },
    finalPrice: { type: Number },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'razorpay'] },
    paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
});
exports.Booking = mongoose_1.default.model('Booking', bookingSchema);
//# sourceMappingURL=Booking.js.map
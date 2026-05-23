"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const Worker_1 = require("../models/Worker");
const router = (0, express_1.Router)();
// Stub for sending OTP
router.post('/otp/send', async (req, res) => {
    const { phoneE164 } = req.body;
    if (!phoneE164) {
        res.status(400).json({ error: 'phoneE164 is required' });
        return;
    }
    // In a real app, this would use Firebase Admin SDK to send OTP
    res.json({ success: true, message: 'OTP sent (stub)' });
});
// Verify OTP and issue JWT
router.post('/otp/verify', async (req, res) => {
    const { phoneE164, code, role } = req.body;
    if (!phoneE164 || !code || !role) {
        res.status(400).json({ error: 'phoneE164, code, and role are required' });
        return;
    }
    // Stub verification logic
    if (code !== '123456' && process.env.NODE_ENV !== 'production') {
        // accept anything in dev for now
    }
    let userId = '';
    if (env_1.ENV.USE_DB) {
        if (role === 'customer') {
            let user = await User_1.User.findOne({ phoneE164 });
            if (!user) {
                user = await User_1.User.create({ phoneE164 });
            }
            userId = user._id.toString();
        }
        else if (role === 'worker') {
            let worker = await Worker_1.Worker.findOne({ phoneE164 });
            if (!worker) {
                res.status(404).json({ error: 'Worker not found with this phone number' });
                return;
            }
            userId = worker._id.toString();
        }
    }
    else {
        // Mock user
        userId = `mock_${role}_${Date.now()}`;
    }
    const token = jsonwebtoken_1.default.sign({ id: userId, phoneE164, role }, env_1.ENV.JWT_SECRET, { expiresIn: '30d' });
    res.json({
        token,
        user: { id: userId, phoneE164, role }
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map
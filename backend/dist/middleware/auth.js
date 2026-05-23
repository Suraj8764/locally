"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        req.user = {
            id: payload.id,
            role: payload.role,
            phoneE164: payload.phoneE164,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}
function requireRole(role) {
    return (req, res, next) => {
        if (req.user?.role !== role) {
            res.status(403).json({ error: 'Forbidden: Insufficient role' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketEvents = setupSocketEvents;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const Worker_1 = require("../models/Worker");
function setupSocketEvents(io) {
    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
            socket.data = {
                userId: payload.id,
                role: payload.role,
            };
            next();
        }
        catch (e) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);
        // Join a room specific to the user for direct messages
        socket.join(`user:${socket.data.userId}`);
        socket.on('worker:online', async ({ workerId }) => {
            if (socket.data.role === 'worker' && socket.data.userId === workerId) {
                if (env_1.ENV.USE_DB)
                    await Worker_1.Worker.findByIdAndUpdate(workerId, { isOnline: true });
                io.emit('worker:status-changed', { workerId, isOnline: true });
                console.log(`Worker ${workerId} went online`);
            }
        });
        socket.on('worker:offline', async ({ workerId }) => {
            if (socket.data.role === 'worker' && socket.data.userId === workerId) {
                if (env_1.ENV.USE_DB)
                    await Worker_1.Worker.findByIdAndUpdate(workerId, { isOnline: false });
                io.emit('worker:status-changed', { workerId, isOnline: false });
                console.log(`Worker ${workerId} went offline`);
            }
        });
        socket.on('disconnect', async () => {
            console.log(`Socket disconnected: ${socket.id}`);
            // In a real app, you might want to mark worker offline after a timeout
        });
    });
}
//# sourceMappingURL=events.js.map
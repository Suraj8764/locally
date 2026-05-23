"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const firebase_1 = require("./config/firebase");
const events_1 = require("./socket/events");
const auth_1 = __importDefault(require("./routes/auth"));
const workers_1 = __importDefault(require("./routes/workers"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const categories_1 = __importDefault(require("./routes/categories"));
const leads_1 = __importDefault(require("./routes/leads"));
async function bootstrap() {
    await (0, db_1.connectDB)();
    (0, firebase_1.initFirebase)();
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
        cors: { origin: '*' },
    });
    // Make io accessible in routes
    app.set('io', io);
    (0, events_1.setupSocketEvents)(io);
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', message: 'SebaLink Backend is running' });
    });
    app.use('/v1/auth', auth_1.default);
    app.use('/v1/workers', workers_1.default);
    app.use('/v1/bookings', bookings_1.default);
    app.use('/v1/categories', categories_1.default);
    app.use('/v1/leads', leads_1.default);
    server.listen(env_1.ENV.PORT, () => {
        console.log(`Server is running on port ${env_1.ENV.PORT}`);
    });
}
bootstrap().catch(console.error);
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const leads = []; // In-memory fallback
router.post('/', (req, res) => {
    const categoryId = String(req.body?.categoryId || '');
    const requirement = String(req.body?.requirement || '');
    const userPhone = typeof req.body?.userPhone === 'string' ? req.body.userPhone : undefined;
    const lat = Number(req.body?.lat);
    const lng = Number(req.body?.lng);
    if (!categoryId || !requirement || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        res.status(400).json({ error: 'categoryId, requirement, lat, lng are required' });
        return;
    }
    const lead = {
        id: `lead_${Date.now()}`,
        createdAtMs: Date.now(),
        categoryId,
        requirement,
        userPhone,
        location: { lat, lng },
    };
    leads.unshift(lead);
    const io = req.app.get('io');
    if (io) {
        io.emit('lead:new', lead); // Broadcast to all for now
    }
    res.status(201).json({ lead });
});
exports.default = router;
//# sourceMappingURL=leads.js.map
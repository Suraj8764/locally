"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Booking_1 = require("../models/Booking");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
const mockBookings = [];
router.post('/', auth_1.requireAuth, async (req, res) => {
    const { workerId, categoryId, address, problemDescription, location, isEmergency } = req.body;
    const customerId = req.user.id;
    const bookingData = {
        id: `booking_${Date.now()}`,
        customerId,
        workerId,
        categoryId,
        address,
        problemDescription,
        location,
        isEmergency,
        status: 'pending',
        createdAtMs: Date.now()
    };
    let newBooking;
    if (env_1.ENV.USE_DB) {
        newBooking = await Booking_1.Booking.create(bookingData);
    }
    else {
        mockBookings.push(bookingData);
        newBooking = bookingData;
    }
    // Socket emit happens in index.ts or a separate service
    const io = req.app.get('io');
    if (io) {
        io.to(`user:${workerId}`).emit('booking:new', newBooking);
    }
    res.status(201).json({ booking: newBooking });
});
router.patch('/:id/status', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let booking;
    if (env_1.ENV.USE_DB) {
        booking = await Booking_1.Booking.findByIdAndUpdate(id, { status }, { new: true });
    }
    else {
        booking = mockBookings.find(b => b.id === id);
        if (booking)
            booking.status = status;
    }
    if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
    }
    const io = req.app.get('io');
    if (io) {
        // Notify both parties
        io.to(`user:${booking.customerId}`).emit('booking:status', booking);
        io.to(`user:${booking.workerId}`).emit('booking:status', booking);
    }
    res.json({ booking });
});
router.get('/user/:userId', auth_1.requireAuth, async (req, res) => {
    const { userId } = req.params;
    if (req.user.id !== userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }
    let userBookings;
    if (env_1.ENV.USE_DB) {
        userBookings = await Booking_1.Booking.find({
            $or: [{ customerId: userId }, { workerId: userId }]
        }).sort({ createdAtMs: -1 });
    }
    else {
        userBookings = mockBookings.filter(b => b.customerId === userId || b.workerId === userId)
            .sort((a, b) => b.createdAtMs - a.createdAtMs);
    }
    res.json({ bookings: userBookings });
});
exports.default = router;
//# sourceMappingURL=bookings.js.map
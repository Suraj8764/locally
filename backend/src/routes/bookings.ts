import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Booking } from '../models/Booking';
import { ENV } from '../config/env';

const router = Router();
const mockBookings: any[] = [];

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { workerId, categoryId, address, problemDescription, location, isEmergency } = req.body;
  const customerId = req.user!.id;

  const bookingData = {
    id: `booking_${Date.now()}`,
    customerId,
    workerId,
    categoryId,
    address,
    problemDescription,
    location,
    isEmergency,
    status: 'pending' as const,
    createdAtMs: Date.now()
  };

  let newBooking;
  if (ENV.USE_DB) {
    newBooking = await Booking.create(bookingData);
  } else {
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

router.patch('/:id/status', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  let booking;
  if (ENV.USE_DB) {
    booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
  } else {
    booking = mockBookings.find(b => b.id === id);
    if (booking) booking.status = status;
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

router.get('/user/:userId', requireAuth, async (req: AuthRequest, res) => {
  const { userId } = req.params;
  
  if (req.user!.id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  let userBookings;
  if (ENV.USE_DB) {
    userBookings = await Booking.find({ 
      $or: [{ customerId: userId }, { workerId: userId }] 
    }).sort({ createdAtMs: -1 });
  } else {
    userBookings = mockBookings.filter(b => b.customerId === userId || b.workerId === userId)
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
  }

  res.json({ bookings: userBookings });
});

export default router;

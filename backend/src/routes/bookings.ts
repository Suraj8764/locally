import { Router } from 'express';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Booking } from '../models/Booking';
import { ENV } from '../config/env';

const router = Router();
const mockBookings: any[] = [];

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), requireAuth, async (req: AuthRequest, res) => {
  try {
    const { workerId, categoryId, address, problemDescription, location, isEmergency, scheduledAtMs } = req.body || {};
    const customerId = req.user!.id;

    if (!workerId || !categoryId || !address) {
      return res.status(400).json({ error: 'Missing required fields: workerId, categoryId, address' });
    }

    const bookingData = {
      id: `booking_${Date.now()}`,
      customerId,
      workerId,
      categoryId,
      address,
      problemDescription: problemDescription || '',
      location: location ? JSON.parse(location as string) : { lat: 0, lng: 0 },
      isEmergency: isEmergency === 'true' || isEmergency === true,
      status: 'pending' as const,
      createdAtMs: Date.now(),
      scheduledAtMs: scheduledAtMs ? parseInt(scheduledAtMs as string) : null
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
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
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

router.patch('/:id/accept', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const workerId = req.user!.id;

  let booking;
  if (ENV.USE_DB) {
    booking = await Booking.findOne({ id, workerId });
    if (booking) {
      booking.status = 'accepted';
      await booking.save();
    }
  } else {
    booking = mockBookings.find(b => b.id === id && b.workerId === workerId);
    if (booking) booking.status = 'accepted';
  }

  if (!booking) {
    res.status(404).json({ error: 'Booking not found or unauthorized' });
    return;
  }

  const io = req.app.get('io');
  if (io) {
    // Notify customer that booking was accepted
    io.to(`user:${booking.customerId}`).emit('booking:accepted', booking);
  }

  res.json({ booking });
});

router.patch('/:id/reject', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const workerId = req.user!.id;

  let booking;
  if (ENV.USE_DB) {
    booking = await Booking.findOne({ id, workerId });
    if (booking) {
      booking.status = 'rejected';
      await booking.save();
    }
  } else {
    booking = mockBookings.find(b => b.id === id && b.workerId === workerId);
    if (booking) booking.status = 'rejected';
  }

  if (!booking) {
    res.status(404).json({ error: 'Booking not found or unauthorized' });
    return;
  }

  const io = req.app.get('io');
  if (io) {
    // Notify customer that booking was rejected
    io.to(`user:${booking.customerId}`).emit('booking:rejected', booking);
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

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;

  let booking;
  if (ENV.USE_DB) {
    booking = await Booking.findOne({ id });
  } else {
    booking = mockBookings.find(b => b.id === id);
  }

  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  res.json({ booking });
});

export default router;

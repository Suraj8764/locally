import { Router } from 'express';
import { Worker } from '../models/Worker';
import { Review } from '../models/Review';
import { ENV } from '../config/env';

const router = Router();

// Admin phone number - only this number can create workers
const ADMIN_PHONE = '+919999999999'; // Replace with your actual admin number

// Mock workers defined in the original index.ts
import { workers as mockWorkers } from '../mockData';

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sLat1 = toRad(a.lat);
  const sLat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(sLat1) * Math.cos(sLat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

router.get('/nearby', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm || 5);
  const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
  const onlyOnline = String(req.query.onlyOnline || 'true') === 'true';

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: 'lat and lng are required' });
    return;
  }

  const userLoc = { lat, lng };

  let sourceWorkers = mockWorkers;
  
  if (ENV.USE_DB) {
    const query: any = {};
    if (categoryId) query.categoryId = categoryId;
    if (onlyOnline) query.isOnline = true;
    sourceWorkers = await Worker.find(query).lean() as any;
  }

  const results = sourceWorkers
    .filter((w) => (categoryId ? w.categoryId === categoryId : true))
    .filter((w) => (onlyOnline ? w.isOnline : true))
    .map((w) => {
      const distanceKm = haversineKm(userLoc, w.location);
      return { worker: w, distanceKm };
    })
    .filter((x) => x.distanceKm <= radiusKm)
    .sort((a, b) => {
      // Sort by status: available first, then busy, then offline
      const statusOrder: { [key: string]: number } = { available: 0, busy: 1, offline: 2 };
      const aStatus = (a.worker as any).status || 'offline';
      const bStatus = (b.worker as any).status || 'offline';
      
      const aOrder = statusOrder[aStatus] ?? 2;
      const bOrder = statusOrder[bStatus] ?? 2;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // Then by verification
      if (a.worker.isVerified !== b.worker.isVerified) {
        return a.worker.isVerified ? -1 : 1;
      }
      
      // Then by trust score
      if (b.worker.trustScore !== a.worker.trustScore) {
        return b.worker.trustScore - a.worker.trustScore;
      }
      
      // Finally by distance
      return a.distanceKm - b.distanceKm;
    })
    .map((x) => ({
      ...x.worker,
      distanceKm: Number(x.distanceKm.toFixed(2)),
      badges: [
        x.worker.isOnline ? 'Available now' : 'Offline',
        x.worker.isVerified ? 'Verified' : 'Unverified',
        x.worker.trustScore >= 90 ? 'Top trusted' : undefined,
      ].filter(Boolean),
    }));

  res.json({ workers: results, radiusKm });
});

router.get('/admin/all', async (req, res) => {
  try {
    if (ENV.USE_DB) {
      const workers = await Worker.find().lean();
      res.json({ workers });
    } else {
      res.json({ workers: mockWorkers });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

router.get('/:id', async (req, res) => {
  let worker;
  if (ENV.USE_DB) {
    worker = await Worker.findById(req.params.id);
  } else {
    worker = mockWorkers.find((w) => w.id === req.params.id);
  }

  if (!worker) {
    res.status(404).json({ error: 'worker not found' });
    return;
  }
  res.json({ worker });
});

router.post('/register', async (req, res) => {
  const {
    displayName,
    phoneE164,
    whatsappE164,
    categoryId,
    languages,
    experienceYears,
    localityLabel,
    areaCoverageKm,
    location,
    workingHoursLabel,
    emergencyAvailable,
    profession,
    description,
    skills,
    hourlyRate,
    estimatedStartingPrice,
    responseTimeMins,
    adminPhone, // Admin phone for verification
  } = req.body;

  // Admin check - only admin can create workers
  if (adminPhone !== ADMIN_PHONE) {
    res.status(403).json({ error: 'Forbidden: Only admin can create workers' });
    return;
  }

  if (!displayName || !phoneE164 || !categoryId) {
    res.status(400).json({ error: 'displayName, phoneE164, and categoryId are required' });
    return;
  }

  try {
    if (ENV.USE_DB) {
      const existingWorker = await Worker.findOne({ phoneE164 });
      if (existingWorker) {
        res.status(409).json({ error: 'Worker with this phone number already exists' });
        return;
      }

      const newWorker = await Worker.create({
        displayName,
        phoneE164,
        whatsappE164: whatsappE164 || phoneE164,
        categoryId,
        languages: languages || [],
        experienceYears: experienceYears || 0,
        localityLabel,
        areaCoverageKm: areaCoverageKm || 5,
        location: location || { lat: 0, lng: 0 },
        workingHoursLabel,
        emergencyAvailable: emergencyAvailable || false,
        profession,
        description,
        skills: skills || [],
        hourlyRate,
        estimatedStartingPrice,
        responseTimeMins,
        isOnline: false,
        isVerified: false,
        trustScore: 50,
        ratingAvg: 0,
        ratingCount: 0,
        completedJobs: 0,
      });

      res.json({ worker: newWorker });
    } else {
      // Mock registration - add to mock data
      const newWorker = {
        id: `worker_${Date.now()}`,
        displayName,
        phoneE164,
        whatsappE164: whatsappE164 || phoneE164,
        categoryId,
        languages: languages || [],
        experienceYears: experienceYears || 0,
        localityLabel,
        areaCoverageKm: areaCoverageKm || 5,
        location: location || { lat: 0, lng: 0 },
        workingHoursLabel,
        emergencyAvailable: emergencyAvailable || false,
        profession,
        description,
        skills: skills || [],
        hourlyRate,
        estimatedStartingPrice,
        responseTimeMins,
        isOnline: false,
        isVerified: false,
        trustScore: 50,
        ratingAvg: 0,
        ratingCount: 0,
        completedJobs: 0,
        status: 'offline',
      };

      mockWorkers.push(newWorker);
      res.json({ worker: newWorker });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to register worker' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { isOnline, status } = req.body;
  
  try {
    if (ENV.USE_DB) {
      const worker = await Worker.findByIdAndUpdate(
        req.params.id,
        { 
          ...(isOnline !== undefined && { isOnline }),
          ...(status && { status }),
        },
        { new: true }
      );
      if (!worker) {
        res.status(404).json({ error: 'worker not found' });
        return;
      }
      res.json({ worker });
    } else {
      const worker = mockWorkers.find((w) => w.id === req.params.id);
      if (!worker) {
        res.status(404).json({ error: 'worker not found' });
        return;
      }
      if (isOnline !== undefined) worker.isOnline = isOnline;
      if (status) worker.status = status;
      res.json({ worker });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to update worker status' });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    if (ENV.USE_DB) {
      const reviews = await Review.find({ workerId: req.params.id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      res.json({ reviews });
    } else {
      // Mock reviews
      res.json({ reviews: [] });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/:id/reviews', async (req, res) => {
  const { bookingId, customerId, rating, comment, tags } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'rating (1-5) is required' });
    return;
  }

  try {
    if (ENV.USE_DB) {
      const review = await Review.create({
        bookingId,
        customerId,
        workerId: req.params.id,
        rating,
        comment,
        tags: tags || [],
      });

      // Update worker rating stats
      const allReviews = await Review.find({ workerId: req.params.id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await Worker.findByIdAndUpdate(req.params.id, {
        ratingAvg: avgRating,
        ratingCount: allReviews.length,
      });

      res.json({ review });
    } else {
      // Mock review creation
      const review = {
        id: `review_${Date.now()}`,
        bookingId,
        customerId,
        workerId: req.params.id,
        rating,
        comment,
        tags: tags || [],
        createdAt: new Date(),
      };
      res.json({ review });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

router.patch('/:id/verify', async (req, res) => {
  const { aadhaarNumber, aadhaarName, verificationMethod } = req.body;

  if (!verificationMethod || !aadhaarNumber || !aadhaarName) {
    res.status(400).json({ error: 'verificationMethod, aadhaarNumber, and aadhaarName are required' });
    return;
  }

  try {
    if (ENV.USE_DB) {
      const worker = await Worker.findByIdAndUpdate(
        req.params.id,
        { 
          isVerified: true,
          trustScore: 80,
        },
        { new: true }
      );
      if (!worker) {
        res.status(404).json({ error: 'worker not found' });
        return;
      }
      res.json({ worker, message: 'Worker verified successfully' });
    } else {
      const worker = mockWorkers.find((w) => w.id === req.params.id);
      if (!worker) {
        res.status(404).json({ error: 'worker not found' });
        return;
      }
      worker.isVerified = true;
      worker.trustScore = 80;
      res.json({ worker, message: 'Worker verified successfully' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to verify worker' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (ENV.USE_DB) {
      const worker = await Worker.findByIdAndDelete(req.params.id);
      if (!worker) {
        res.status(404).json({ error: 'worker not found' });
        return;
      }
      res.json({ message: 'Worker deleted successfully' });
    } else {
      const index = mockWorkers.findIndex((w) => w.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ error: 'worker not found' });
        return;
      }
      mockWorkers.splice(index, 1);
      res.json({ message: 'Worker deleted successfully' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

export default router;

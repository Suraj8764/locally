import { Router } from 'express';
import { Worker } from '../models/Worker';
import { ENV } from '../config/env';

const router = Router();

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
      const scoreA = (a.worker.isVerified ? 10 : 0) + a.worker.trustScore / 10 + (a.worker.isOnline ? 3 : 0);
      const scoreB = (b.worker.isVerified ? 10 : 0) + b.worker.trustScore / 10 + (b.worker.isOnline ? 3 : 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
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

export default router;

import { Router } from 'express';
import { categories } from '../mockData';

const router = Router();

router.get('/', (req, res) => {
  // In future, you could fetch from DB if categories are dynamic
  res.json({ categories });
});

export default router;

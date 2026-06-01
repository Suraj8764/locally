import { Router } from 'express';
import { categories } from '../mockData';

const router = Router();

router.get('/', (req, res) => {
  // In future, you could fetch from DB if categories are dynamic
  res.json({ categories });
});

router.post('/', (req, res) => {
  const { nameEn, nameHi, nameOr, isEmergency } = req.body;

  if (!nameEn) {
    res.status(400).json({ error: 'nameEn is required' });
    return;
  }

  const newCategory = {
    id: `cat_${Date.now()}`,
    nameEn,
    nameHi: nameHi || nameEn,
    nameOr: nameOr || nameEn,
    isEmergency: isEmergency || false,
  };
  
  categories.push(newCategory);
  res.json({ category: newCategory });
});

router.delete('/:id', (req, res) => {
  const index = categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'category not found' });
    return;
  }
  categories.splice(index, 1);
  res.json({ message: 'Category deleted successfully' });
});

export default router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mockData_1 = require("../mockData");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    // In future, you could fetch from DB if categories are dynamic
    res.json({ categories: mockData_1.categories });
});
exports.default = router;
//# sourceMappingURL=categories.js.map
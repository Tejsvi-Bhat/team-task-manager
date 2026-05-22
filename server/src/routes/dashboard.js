const express = require('express');
const auth = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/projectRole');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.use(auth);

router.get('/:id/dashboard', requireProjectMember, getDashboard);

module.exports = router;

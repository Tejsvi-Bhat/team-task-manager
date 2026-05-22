const express = require('express');
const auth = require('../middleware/auth');
const { requireProjectMember, requireAdmin } = require('../middleware/projectRole');
const { createProject, getProjects, getProject, addMember, removeMember } = require('../controllers/projectController');

const router = express.Router();

router.use(auth);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', requireProjectMember, getProject);
router.post('/:id/members', requireProjectMember, requireAdmin, addMember);
router.delete('/:id/members/:userId', requireProjectMember, requireAdmin, removeMember);

module.exports = router;

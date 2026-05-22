const express = require('express');
const auth = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/projectRole');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.use(auth);

router.get('/:id/tasks', requireProjectMember, getTasks);
router.post('/:id/tasks', requireProjectMember, createTask);
router.patch('/:id/tasks/:taskId', requireProjectMember, updateTask);
router.delete('/:id/tasks/:taskId', requireProjectMember, deleteTask);

module.exports = router;

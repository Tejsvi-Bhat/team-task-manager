const prisma = require('../utils/prisma');

const getDashboard = async (req, res) => {
  const { id: projectId } = req.params;

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: { assignee: { select: { id: true, name: true } } }
  });

  const total = tasks.length;

  const byStatus = {
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter(t => t.status === 'DONE').length
  };

  const perUser = {};
  tasks.forEach(t => {
    const name = t.assignee ? t.assignee.name : 'Unassigned';
    perUser[name] = (perUser[name] || 0) + 1;
  });

  const now = new Date();
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length;

  res.json({ total, byStatus, perUser, overdue });
};

module.exports = { getDashboard };

const prisma = require('../utils/prisma');

const getTasks = async (req, res) => {
  const { id: projectId } = req.params;

  const where = { projectId };

  // Members can only see their own assigned tasks
  if (req.memberRole === 'MEMBER') {
    where.assigneeId = req.userId;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ tasks });
};

const createTask = async (req, res) => {
  if (req.memberRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can create tasks' });
  }

  const { title, description, dueDate, priority, assigneeId } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  // If assigning, verify the assignee is a project member
  if (assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id, userId: assigneeId } }
    });
    if (!isMember) {
      return res.status(400).json({ error: 'Assignee is not a member of this project' });
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'MEDIUM',
      projectId: req.params.id,
      assigneeId: assigneeId || null,
      createdBy: req.userId
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } }
    }
  });

  res.status(201).json({ task });
};

const updateTask = async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Members can only update status on their assigned tasks
  if (req.memberRole === 'MEMBER') {
    if (task.assigneeId !== req.userId) {
      return res.status(403).json({ error: 'You can only update tasks assigned to you' });
    }
    // Members can only change status
    const allowed = { status: req.body.status };
    if (!allowed.status) {
      return res.status(400).json({ error: 'Members can only update task status' });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: { status: allowed.status },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } }
      }
    });
    return res.json({ task: updated });
  }

  // Admin can update everything
  const { title, description, dueDate, priority, status, assigneeId } = req.body;

  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (priority !== undefined) data.priority = priority;
  if (status !== undefined) data.status = status;
  if (assigneeId !== undefined) data.assigneeId = assigneeId || null;

  const updated = await prisma.task.update({
    where: { id: req.params.taskId },
    data,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } }
    }
  });

  res.json({ task: updated });
};

const deleteTask = async (req, res) => {
  if (req.memberRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can delete tasks' });
  }

  await prisma.task.delete({ where: { id: req.params.taskId } });
  res.json({ message: 'Task deleted' });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };

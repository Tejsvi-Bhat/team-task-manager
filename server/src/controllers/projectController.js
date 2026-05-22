const prisma = require('../utils/prisma');

const createProject = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      createdBy: req.userId,
      members: {
        create: { userId: req.userId, role: 'ADMIN' }
      }
    },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } }
  });

  res.status(201).json({ project });
};

const getProjects = async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: req.userId } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { tasks: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ projects });
};

const getProject = async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { tasks: true } }
    }
  });

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({ project });
};

const addMember = async (req, res) => {
  const { email, role } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: 'User not found with that email' });
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: req.params.id, userId: user.id } }
  });
  if (existing) {
    return res.status(400).json({ error: 'User is already a member' });
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId: req.params.id,
      userId: user.id,
      role: role || 'MEMBER'
    },
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  res.status(201).json({ member });
};

const removeMember = async (req, res) => {
  const { id, userId } = req.params;

  if (userId === req.userId) {
    return res.status(400).json({ error: "You can't remove yourself" });
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId: id, userId } }
  });

  res.json({ message: 'Member removed' });
};

module.exports = { createProject, getProjects, getProject, addMember, removeMember };

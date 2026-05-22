const prisma = require('../utils/prisma');

const requireProjectMember = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.userId } }
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this project' });
  }

  req.memberRole = member.role;
  next();
};

const requireAdmin = async (req, res, next) => {
  if (req.memberRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { requireProjectMember, requireAdmin };

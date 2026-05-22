import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import MemberManager from '../components/MemberManager';

const STATUS_COLUMNS = [
  { key: 'TODO', label: 'To Do', color: 'bg-gray-100' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-50' },
  { key: 'DONE', label: 'Done', color: 'bg-green-50' },
];

const PRIORITY_BADGE = {
  LOW: 'bg-gray-200 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-red-100 text-red-700',
};

export default function ProjectBoard() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  const myRole = project?.members?.find(m => m.userId === user?.id)?.role;
  const isAdmin = myRole === 'ADMIN';

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const [projRes, taskRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`)
    ]);
    setProject(projRes.data.project);
    setTasks(taskRes.data.tasks);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? res.data.task : t));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleTaskSaved = (task) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([task, ...tasks]);
    }
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  if (!project) return <div className="text-center mt-12 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/" className="text-sm text-blue-600 hover:underline">&larr; Back to projects</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{project.name}</h1>
          {project.description && <p className="text-sm text-gray-500">{project.description}</p>}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/projects/${id}/dashboard`}
            className="border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
          >
            Dashboard
          </Link>
          {isAdmin && (
            <>
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
              >
                Members ({project.members?.length})
              </button>
              <button
                onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                + Add Task
              </button>
            </>
          )}
        </div>
      </div>

      {showMembers && isAdmin && (
        <MemberManager projectId={id} members={project.members} onUpdate={loadData} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLUMNS.map(col => (
          <div key={col.key} className={`${col.color} rounded-lg p-4`}>
            <h3 className="font-semibold text-gray-700 mb-3">
              {col.label} ({tasks.filter(t => t.status === col.key).length})
            </h3>
            <div className="space-y-2">
              {tasks.filter(t => t.status === col.key).map(task => (
                <div
                  key={task.id}
                  className={`bg-white p-3 rounded-md shadow-sm border ${isOverdue(task) ? 'border-red-300' : 'border-gray-100'}`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-gray-800">{task.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_BADGE[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {task.assignee ? task.assignee.name : 'Unassigned'}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs ${isOverdue(task) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {col.key !== 'TODO' && (
                      <button
                        onClick={() => handleStatusChange(task.id, col.key === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        &larr;
                      </button>
                    )}
                    {col.key !== 'DONE' && (
                      <button
                        onClick={() => handleStatusChange(task.id, col.key === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        &rarr;
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded ml-auto"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <TaskModal
          projectId={id}
          members={project.members}
          task={editingTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSaved={handleTaskSaved}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function TaskModal({ projectId, members, task, onClose, onSaved }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '');
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '');
  const [status, setStatus] = useState(task?.status || 'TODO');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { title, description, dueDate: dueDate || null, priority, assigneeId: assigneeId || null, status };
      let res;
      if (task) {
        res = await api.patch(`/projects/${projectId}/tasks/${task.id}`, data);
      } else {
        res = await api.post(`/projects/${projectId}/tasks`, data);
      }
      onSaved(res.data.task);
      toast.success(task ? 'Task updated' : 'Task created');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value: 'LOW', label: 'Low', activeClass: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200' },
    { value: 'MEDIUM', label: 'Medium', activeClass: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' },
    { value: 'HIGH', label: 'High', activeClass: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Title</label>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Description</label>
            <textarea
              placeholder="Add more details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Priority</label>
            <div className="flex gap-2">
              {priorities.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    priority === p.value ? p.activeClass : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Assign To</label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status (only for editing) */}
          {task && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              {loading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

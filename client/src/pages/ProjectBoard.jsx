import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import MemberManager from '../components/MemberManager';

const COLUMNS = [
  { key: 'TODO', label: 'To Do', headerColor: 'text-gray-500', dotColor: 'bg-gray-400', bg: 'bg-gray-100/70', dropBg: 'bg-gray-200/50' },
  { key: 'IN_PROGRESS', label: 'In Progress', headerColor: 'text-amber-600', dotColor: 'bg-amber-400', bg: 'bg-amber-50/70', dropBg: 'bg-amber-100/50' },
  { key: 'DONE', label: 'Done', headerColor: 'text-emerald-600', dotColor: 'bg-emerald-400', bg: 'bg-emerald-50/70', dropBg: 'bg-emerald-100/50' },
];

const STATUS_BADGE = {
  TODO: 'bg-gray-100 text-gray-500',
  IN_PROGRESS: 'bg-amber-50 text-amber-600',
  DONE: 'bg-emerald-50 text-emerald-600',
};

const STATUS_LABEL = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-500' },
  MEDIUM: { label: 'Med', color: 'bg-amber-50 text-amber-600' },
  HIGH: { label: 'High', color: 'bg-red-50 text-red-600' },
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

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    const [projRes, taskRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`)
    ]);
    setProject(projRes.data.project);
    setTasks(taskRes.data.tasks);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const task = tasks.find(t => t.id === draggableId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));

    try {
      await api.patch(`/projects/${id}/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: task.status } : t));
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

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (diff < 0) return { text: formatted, className: 'text-red-500 bg-red-50' };
    if (diff <= 2) return { text: formatted, className: 'text-amber-600 bg-amber-50' };
    return { text: formatted, className: 'text-gray-400 bg-gray-50' };
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-800 truncate">{project.name}</h1>
              {project.description && <p className="text-xs text-gray-400 truncate">{project.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Member avatars */}
            <div className="flex -space-x-1.5 mr-1">
              {project.members?.slice(0, 4).map(m => (
                <div key={m.user.id} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center" title={m.user.name}>
                  <span className="text-[10px] font-medium text-gray-600">{m.user.name.charAt(0)}</span>
                </div>
              ))}
              {(project.members?.length || 0) > 4 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-[9px] text-gray-400">+{project.members.length - 4}</span>
                </div>
              )}
            </div>
            <Link
              to={`/projects/${id}/dashboard`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              title="Dashboard"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </Link>
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className={`p-1.5 rounded-lg transition-colors ${showMembers ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                  title="Manage members"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </button>
                <button
                  onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="bg-blue-600 text-white pl-2 pr-3 py-1.5 rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Task
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Members panel */}
      {showMembers && isAdmin && (
        <div className="border-b border-gray-100 bg-white flex-shrink-0">
          <div className="px-6 py-3">
            <MemberManager projectId={id} members={project.members} onUpdate={loadData} />
          </div>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50 p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(col => {
              const columnTasks = tasks.filter(t => t.status === col.key);
              return (
                <div key={col.key} className={`w-72 flex flex-col h-full ${col.bg} rounded-xl`}>
                  {/* Column header */}
                  <div className="flex items-center justify-between px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <span className={`text-xs font-semibold ${col.headerColor} uppercase tracking-wide`}>{col.label}</span>
                      <span className="text-[10px] text-gray-400 bg-white/60 px-1.5 py-0.5 rounded-full font-medium">{columnTasks.length}</span>
                    </div>
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto rounded-b-xl px-2 pb-2 transition-colors ${snapshot.isDraggingOver ? col.dropBg : ''}`}
                      >
                        <div className="space-y-2">
                          {columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-lg border border-gray-100 p-3 cursor-grab active:cursor-grabbing transition-shadow group ${
                                    snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-200 rotate-[2deg]' : 'shadow-sm hover:shadow-md'
                                  } ${isOverdue(task) ? 'border-l-2 border-l-red-400' : ''}`}
                                >
                                  {/* Priority & Status badges */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1">
                                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${PRIORITY_CONFIG[task.priority].color}`}>
                                        {PRIORITY_CONFIG[task.priority].label}
                                      </span>
                                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_BADGE[task.status]}`}>
                                        {STATUS_LABEL[task.status]}
                                      </span>
                                    </div>
                                    {isAdmin && (
                                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setEditingTask(task); setShowTaskModal(true); }}
                                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                        >
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                        >
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <h4 className="text-sm font-medium text-gray-800 mt-2 leading-snug">{task.title}</h4>

                                  {/* Description */}
                                  {task.description && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                                  )}

                                  {/* Footer */}
                                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                                    {/* Assignee */}
                                    {task.assignee ? (
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                          <span className="text-[9px] font-medium text-gray-600">{task.assignee.name.charAt(0)}</span>
                                        </div>
                                        <span className="text-[11px] text-gray-400">{task.assignee.name.split(' ')[0]}</span>
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-gray-300 italic">Unassigned</span>
                                    )}

                                    {/* Due date */}
                                    {task.dueDate && (() => {
                                      const dateInfo = formatDate(task.dueDate);
                                      return (
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${dateInfo.className}`}>
                                          {dateInfo.text}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Task Modal */}
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

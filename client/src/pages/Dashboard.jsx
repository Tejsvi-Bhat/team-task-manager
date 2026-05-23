import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Dashboard() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}/dashboard`),
      api.get(`/projects/${id}`)
    ]).then(([dashRes, projRes]) => {
      setStats(dashRes.data);
      setProject(projRes.data.project);
    });
  }, [id]);

  if (!stats || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.byStatus.DONE / stats.total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/projects/${id}`} className="text-gray-300 hover:text-gray-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{project.name}</h1>
          <p className="text-xs text-gray-400">Dashboard</p>
        </div>
      </div>

      {/* Completion bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-gray-800">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{stats.byStatus.DONE} of {stats.total} tasks completed</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total Tasks" value={stats.total} icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        } iconBg="bg-blue-50 text-blue-500" />
        <StatCard label="To Do" value={stats.byStatus.TODO} icon={
          <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400" />
        } iconBg="bg-gray-50 text-gray-500" />
        <StatCard label="In Progress" value={stats.byStatus.IN_PROGRESS} icon={
          <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-400 border-r-transparent animate-spin" style={{ animationDuration: '2s' }} />
        } iconBg="bg-blue-50 text-blue-500" />
        <StatCard label="Done" value={stats.byStatus.DONE} icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        } iconBg="bg-emerald-50 text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overdue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stats.overdue > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {stats.overdue > 0 ? (
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Overdue Tasks</span>
          </div>
          <p className={`text-3xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {stats.overdue}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.overdue > 0 ? 'tasks past their due date' : 'all tasks are on track'}
          </p>
        </div>

        {/* Tasks per user */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tasks Per User</h3>
          {Object.keys(stats.perUser).length === 0 ? (
            <p className="text-xs text-gray-400">No tasks assigned yet</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(stats.perUser)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-medium text-gray-600">{name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-600 truncate">{name}</span>
                      <span className="text-xs font-semibold text-gray-700 ml-2">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((count / stats.total) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, iconBg }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${iconBg}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

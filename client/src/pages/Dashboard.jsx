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

  if (!stats || !project) return <div className="text-center mt-12 text-gray-500">Loading...</div>;

  return (
    <div>
      <Link to={`/projects/${id}`} className="text-sm text-blue-600 hover:underline">&larr; Back to board</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-6">{project.name} - Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tasks" value={stats.total} color="bg-blue-50 text-blue-700" />
        <StatCard label="To Do" value={stats.byStatus.TODO} color="bg-gray-50 text-gray-700" />
        <StatCard label="In Progress" value={stats.byStatus.IN_PROGRESS} color="bg-yellow-50 text-yellow-700" />
        <StatCard label="Done" value={stats.byStatus.DONE} color="bg-green-50 text-green-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Overdue Tasks</h3>
          <p className={`text-3xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.overdue}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {stats.overdue > 0 ? 'tasks past their due date' : 'no overdue tasks'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Tasks Per User</h3>
          {Object.keys(stats.perUser).length === 0 ? (
            <p className="text-sm text-gray-400">No tasks assigned yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.perUser).map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((count / stats.total) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-6 text-right">{count}</span>
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

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} rounded-lg p-4 text-center`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-75">{label}</p>
    </div>
  );
}

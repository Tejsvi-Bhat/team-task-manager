import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function MemberManager({ projectId, members, onUpdate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email });
      setEmail('');
      onUpdate();
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId, userName) => {
    if (!confirm(`Remove ${userName} from project?`)) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      onUpdate();
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-3">Members</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="email"
          placeholder="Add member by email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          Add
        </button>
      </form>
      <div className="space-y-2">
        {members.map(m => (
          <div key={m.user.id} className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-800">{m.user.name}</span>
              <span className="text-gray-400 ml-2">{m.user.email}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${m.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                {m.role}
              </span>
            </div>
            {m.role !== 'ADMIN' && (
              <button
                onClick={() => handleRemove(m.user.id, m.user.name)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

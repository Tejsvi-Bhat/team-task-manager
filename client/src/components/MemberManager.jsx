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
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="email"
          placeholder="Add member by email..."
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-medium transition-colors"
        >
          Add
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {members.map(m => (
          <div key={m.user.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-[9px] font-medium text-gray-600">{m.user.name.charAt(0)}</span>
            </div>
            <span className="text-xs text-gray-700">{m.user.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${m.role === 'ADMIN' ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'}`}>
              {m.role}
            </span>
            {m.role !== 'ADMIN' && (
              <button
                onClick={() => handleRemove(m.user.id, m.user.name)}
                className="text-gray-300 hover:text-red-500 transition-colors ml-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Users, Shield, CheckCircle, XCircle, Clock, Plus, Trash2 } from 'lucide-react';

interface PilotUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  pilotUser: boolean;
  pilotGrantedAt: string | null;
  pilotExpiresAt: string | null;
  pilotNotes: string | null;
  createdAt: string;
}

export default function AdminPilotPage() {
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDays, setExpiryDays] = useState('90');
  const [users, setUsers] = useState<PilotUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pilot-users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setLoaded(true);
      } else {
        setMessage({ type: 'error', text: 'Unauthorized. Admin only.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load users.' });
    }
    setLoading(false);
  };

  const grantPilot = async () => {
    if (!email) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/pilot-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, notes, expiryDays: parseInt(expiryDays) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Pilot access granted to ${email}` });
        setEmail('');
        setNotes('');
        loadUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to grant access.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Request failed.' });
    }
    setLoading(false);
  };

  const revokePilot = async (userId: string, userEmail: string) => {
    if (!confirm(`Revoke pilot access for ${userEmail}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pilot-users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: `Pilot access revoked for ${userEmail}` });
        loadUsers();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to revoke.' });
    }
    setLoading(false);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pilot User Management</h1>
              <p className="text-sgf-green-100 text-sm">Grant and manage Pro-level pilot access for beta testers</p>
            </div>
          </div>
        </div>

        {/* Grant Access Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-sgf-green-600" />Grant Pilot Access
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-gray-600 block mb-1">User Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-sgf-green-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Pilot Duration (days)</label>
              <select value={expiryDays} onChange={e => setExpiryDays(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-sgf-green-500 focus:outline-none">
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
                <option value="0">No expiry</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Internal Notes</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Dallas broker, referral from John"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-sgf-green-500 focus:outline-none" />
            </div>
          </div>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={grantPilot} disabled={loading || !email}
              className="inline-flex items-center gap-2 bg-sgf-green-600 hover:bg-sgf-green-700 text-white px-5 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 transition-colors">
              <Shield className="w-4 h-4" />Grant Pilot Access
            </button>
            <button onClick={loadUsers} disabled={loading}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold text-sm transition-colors">
              <Users className="w-4 h-4" />{loaded ? 'Refresh' : 'Load'} Pilot Users
            </button>
          </div>
        </div>

        {/* Pilot Users Table */}
        {loaded && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Pilot Users ({users.length})</h2>
              <span className="text-xs text-gray-500">All have Pro-level access</span>
            </div>
            {users.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No pilot users yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Plan</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Granted</th>
                    <th className="px-4 py-3 text-left">Expires</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{u.name || '—'}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-sgf-green-100 text-sgf-green-700 rounded-full text-xs font-bold uppercase">{u.plan}</span>
                        </td>
                        <td className="px-4 py-3">
                          {isExpired(u.pilotExpiresAt) ? (
                            <span className="flex items-center gap-1 text-red-600 text-xs font-semibold"><XCircle className="w-3.5 h-3.5" />Expired</span>
                          ) : (
                            <span className="flex items-center gap-1 text-sgf-green-600 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" />Active</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {u.pilotGrantedAt ? new Date(u.pilotGrantedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {u.pilotExpiresAt ? (
                            <span className={isExpired(u.pilotExpiresAt) ? 'text-red-500' : ''}>
                              {new Date(u.pilotExpiresAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sgf-green-600"><Clock className="w-3 h-3" />No expiry</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-32 truncate">{u.pilotNotes || '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => revokePilot(u.id, u.email)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

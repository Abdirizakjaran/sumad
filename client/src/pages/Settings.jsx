import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { canManageUsers } from '../utils/roles';
import { ROLE_LABELS } from '../utils/roles';

export default function Settings() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (canManageUsers(user?.role)) {
      api.get('/users').then((r) => setUsers(r.data.users));
      api.get('/users/activity-logs').then((r) => setLogs(r.data.logs));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <div className="card">
        <h3 className="font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">System</span><p className="font-bold">SUMAD TRAFFIC MGT</p></div>
          <div><span className="text-slate-500">Version</span><p>1.0.0</p></div>
          <div><span className="text-slate-500">Database</span><p>PostgreSQL (Neon)</p></div>
          <div><span className="text-slate-500">OCR Engine</span><p>Tesseract.js</p></div>
        </div>
      </div>
      {canManageUsers(user?.role) && (
        <>
          <div className="card">
            <h3 className="font-semibold mb-4">Officer Management</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="p-2">{u.fullName}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{ROLE_LABELS[u.role]}</td>
                    <td className="p-2">{u.isActive ? '✅ Active' : '❌ Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">Activity Logs</h3>
            <div className="max-h-64 overflow-y-auto space-y-2 text-sm font-mono">
              {logs.map((l) => (
                <div key={l.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-sumad-orange">{l.action}</span> — {l.user?.fullName || 'System'} — {new Date(l.createdAt).toLocaleString()}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/roles';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
      <div className="card text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-sumad-blue to-sumad-orange rounded-full flex items-center justify-center text-4xl text-white font-bold mx-auto mb-4">
          {user?.fullName?.charAt(0)}
        </div>
        <h2 className="text-xl font-bold">{user?.fullName}</h2>
        <p className="text-sumad-orange font-medium">{ROLE_LABELS[user?.role]}</p>
        <div className="mt-6 space-y-3 text-left text-sm">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="text-slate-500">Email</span>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="text-slate-500">Phone</span>
            <p className="font-medium">{user?.phone || 'N/A'}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="text-slate-500">Role</span>
            <p className="font-medium">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

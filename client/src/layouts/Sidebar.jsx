import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiTruck,
  FiAlertCircle,
  FiDollarSign,
  FiCamera,
  FiBarChart2,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  canManageVehicles,
  canManageFines,
  canManagePayments,
  canUseCamera,
  canViewReports,
} from '../utils/roles';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', icon: FiHome, label: t('dashboard'), show: true },
    { to: '/vehicles', icon: FiTruck, label: t('vehicles'), show: canManageVehicles(user?.role) || true },
    { to: '/fines', icon: FiAlertCircle, label: t('fines'), show: canManageFines(user?.role) || true },
    { to: '/payments', icon: FiDollarSign, label: t('payments'), show: canManagePayments(user?.role) || ['SUPER_ADMIN', 'TRAFFIC_ADMIN', 'FINANCE_OFFICER'].includes(user?.role) },
    { to: '/camera', icon: FiCamera, label: t('camera'), show: canUseCamera(user?.role) },
    { to: '/reports', icon: FiBarChart2, label: t('reports'), show: canViewReports(user?.role) },
    { to: '/settings', icon: FiSettings, label: t('settings'), show: true },
    { to: '/profile', icon: FiUser, label: t('profile'), show: true },
  ].filter((l) => l.show);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-full bg-sumad-navy text-white z-40 flex flex-col shadow-2xl"
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sumad-orange rounded-xl flex items-center justify-center text-xl shrink-0">
            🚦
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sm leading-tight">SUMAD</h1>
              <p className="text-xs text-orange-400">TRAFFIC MGT</p>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-sumad-orange text-white shadow-lg'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="text-xl shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 border-t border-white/10 text-xs text-slate-400 hover:text-white"
      >
        {collapsed ? '→' : '← Collapse'}
      </button>
    </motion.aside>
  );
}

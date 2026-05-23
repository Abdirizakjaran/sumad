import { FiMoon, FiSun, FiLogOut, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ROLE_LABELS } from '../utils/roles';
import NotificationCenter from '../components/NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { lang, setLanguage } = useLanguage();

  return (
    <header className="h-16 glass border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          SUMAD TRAFFIC MGT
        </h2>
        <p className="text-xs text-slate-500">Smart Traffic Management System</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLanguage(lang === 'en' ? 'so' : 'en')}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 text-sm"
          title="Toggle language"
        >
          <FiGlobe />
          {lang.toUpperCase()}
        </button>
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          {dark ? <FiSun /> : <FiMoon />}
        </button>
        <NotificationCenter />
        <div className="hidden md:block text-right mr-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.fullName}</p>
          <p className="text-xs text-sumad-orange">{ROLE_LABELS[user?.role]}</p>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
          title="Logout"
        >
          <FiLogOut className="text-xl" />
        </button>
      </div>
    </header>
  );
}

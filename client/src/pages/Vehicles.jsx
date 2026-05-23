import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEye } from 'react-icons/fi';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { canManageVehicles } from '../utils/roles';

const STATUS_COLORS = {
  CLEARED: 'bg-green-100 text-green-700',
  BLOCKED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',
};

export default function Vehicles() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const fetchVehicles = async () => {
    const { data } = await api.get('/vehicles', { params: { page, search, type, limit: 10 } });
    setVehicles(data.vehicles);
    setPagination(data.pagination);
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, search, type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('vehicles')}</h1>
        {canManageVehicles(user?.role) && (
          <Link to="/vehicles/add" className="btn-primary flex items-center gap-2 w-fit">
            <FiPlus /> {t('addVehicle')}
          </Link>
        )}
      </div>

      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('search')}
            className="input-field pl-10"
          />
        </div>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="input-field sm:w-40">
          <option value="">All Types</option>
          <option value="CAR">Car</option>
          <option value="MOTORCYCLE">Motorcycle</option>
          <option value="TRUCK">Truck</option>
          <option value="BUS">Bus</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left p-3">Plate</th>
              <th className="text-left p-3">Owner</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Model</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Fines</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono font-bold">{v.plateNumber}</td>
                <td className="p-3">{v.ownerFullName}</td>
                <td className="p-3">{v.vehicleType}</td>
                <td className="p-3">{v.vehicleModel}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[v.status]}`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-3">{v._count?.fines || 0}</td>
                <td className="p-3">
                  <Link to={`/vehicles/${v.id}`} className="text-sumad-blue hover:underline flex items-center gap-1">
                    <FiEye /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center p-4">
          <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-primary opacity-80 disabled:opacity-40 py-1 px-3 text-sm">Prev</button>
            <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="btn-primary opacity-80 disabled:opacity-40 py-1 px-3 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

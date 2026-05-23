import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiAlertCircle, FiCheckCircle, FiXCircle, FiDollarSign, FiCamera } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import api from '../services/api';
import { connectSocket } from '../services/socket';
import StatCard from '../components/StatCard';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#1e40af', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const { data: res } = await api.get('/dashboard/stats');
      setData(res);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const socket = connectSocket();
    socket.on('dashboard:update', fetchData);
    socket.on('payment:approved', fetchData);
    socket.on('detection:new', fetchData);
    const interval = setInterval(fetchData, 30000);
    return () => {
      clearInterval(interval);
      socket.off('dashboard:update');
      socket.off('payment:approved');
      socket.off('detection:new');
    };
  }, []);

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card h-32 animate-pulse bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    );
  }

  const { stats, recentPayments, recentDetections, charts } = data;

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-slate-900 dark:text-white"
      >
        {t('dashboard')}
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title={t('totalVehicles')} value={stats.totalVehicles} icon={FiTruck} color="blue" delay={0} />
        <StatCard title={t('totalFines')} value={stats.totalFines} icon={FiAlertCircle} color="navy" delay={0.05} />
        <StatCard title={t('paidFines')} value={stats.paidFines} icon={FiCheckCircle} color="green" delay={0.1} />
        <StatCard title={t('unpaidFines')} value={stats.unpaidFines} icon={FiXCircle} color="red" delay={0.15} />
        <StatCard title={t('revenue')} value={`$${stats.totalRevenue?.toLocaleString()}`} icon={FiDollarSign} color="orange" delay={0.2} />
        <StatCard title={t('detections')} value={stats.todayDetections} icon={FiCamera} color="blue" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Revenue (6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={charts.revenueByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Fines by Violation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={charts.finesByViolation || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {(charts.finesByViolation || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Recent Payments</h3>
          <div className="space-y-3">
            {recentPayments?.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{p.fine?.vehicle?.plateNumber}</p>
                  <p className="text-xs text-slate-500">{p.fine?.vehicle?.ownerFullName}</p>
                </div>
                <span className="font-bold text-emerald-600">${p.amount}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Live Camera Activity</h3>
          <div className="space-y-3">
            {recentDetections?.map((d) => (
              <div key={d.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-mono font-bold">{d.plateNumber}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    d.result === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : d.result === 'UNPAID'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {d.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, color = 'blue', delay = 0 }) {
  const colors = {
    blue: 'from-blue-600 to-blue-800',
    orange: 'from-orange-500 to-orange-700',
    green: 'from-emerald-500 to-emerald-700',
    red: 'from-red-500 to-red-700',
    navy: 'from-slate-700 to-slate-900',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`card bg-gradient-to-br ${colors[color]} text-white border-0`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="p-3 bg-white/20 rounded-xl">
            <Icon className="text-2xl" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

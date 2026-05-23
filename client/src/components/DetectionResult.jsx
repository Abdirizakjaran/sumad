import { motion } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

export default function DetectionResult({ check }) {
  const { t } = useLanguage();
  if (!check) return null;

  if (check.result === 'APPROVED') {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed inset-0 z-[100] bg-emerald-600 flex flex-col items-center justify-center text-white"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FiCheck className="text-[120px] md:text-[180px]" strokeWidth={3} />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black mt-6">{t('approved')}</h1>
        <p className="text-2xl mt-4 opacity-90">{check.ownerName}</p>
        <p className="text-4xl font-bold mt-2 tracking-widest">{check.plateNumber}</p>
        {check.paymentDate && (
          <p className="text-lg mt-4 opacity-80">
            Paid: {new Date(check.paymentDate).toLocaleDateString()}
          </p>
        )}
      </motion.div>
    );
  }

  if (check.result === 'UNPAID') {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center text-white"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <FiX className="text-[120px] md:text-[180px]" strokeWidth={3} />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black mt-6">{t('unpaid')}</h1>
        <p className="text-2xl mt-4">WARNING</p>
        <p className="text-4xl font-bold mt-2 tracking-widest">{check.plateNumber}</p>
        <p className="text-3xl font-bold mt-4">${check.fineAmount?.toFixed(2)}</p>
        <p className="text-lg mt-2 opacity-80">{check.ownerName}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-amber-600 flex flex-col items-center justify-center text-white"
    >
      <FiAlertTriangle className="text-[100px]" />
      <h1 className="text-4xl font-black mt-6">{t('notFound')}</h1>
      <p className="text-2xl mt-4">{check.plateNumber}</p>
    </motion.div>
  );
}

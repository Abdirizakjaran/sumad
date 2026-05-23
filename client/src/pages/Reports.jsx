import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import api from '../services/api';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [type, setType] = useState('revenue');

  const fetchReport = async () => {
    const endpoints = { revenue: '/reports/revenue', fines: '/reports/fines', vehicles: '/reports/vehicles' };
    const { data } = await api.get(endpoints[type]);
    setReport(data);
  };

  const download = (format) => {
    window.open(`/api/reports/${type}?format=${format}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
      <div className="card flex flex-wrap gap-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-field w-48">
          <option value="revenue">Revenue Report</option>
          <option value="fines">Fines Report</option>
          <option value="vehicles">Vehicles Report</option>
        </select>
        <button onClick={fetchReport} className="btn-primary">Generate Report</button>
        {type === 'revenue' && (
          <>
            <button onClick={() => download('pdf')} className="btn-secondary flex items-center gap-2">
              <FiDownload /> PDF
            </button>
            <button onClick={() => download('excel')} className="py-2.5 px-5 border rounded-lg flex items-center gap-2">
              <FiDownload /> Excel
            </button>
          </>
        )}
      </div>
      {report && (
        <div className="card">
          <p className="text-lg font-semibold mb-2">
            Total Records: {report.count || report.payments?.length || report.fines?.length || report.vehicles?.length}
          </p>
          {report.total !== undefined && (
            <p className="text-2xl font-bold text-emerald-600">Total Revenue: ${report.total?.toFixed(2)}</p>
          )}
          <pre className="mt-4 text-xs overflow-auto max-h-96 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            {JSON.stringify(report, null, 2).slice(0, 3000)}...
          </pre>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { canManageFines } from '../utils/roles';

const VIOLATIONS = [
  'OVER_SPEEDING', 'WRONG_PARKING', 'DANGEROUS_DRIVING',
  'RED_LIGHT_VIOLATION', 'NO_HELMET', 'ILLEGAL_PARKING',
];

export default function Fines() {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '', violationType: 'OVER_SPEEDING', description: '', amount: '', dueDate: '',
  });
  const [evidence, setEvidence] = useState(null);

  const fetchFines = () => api.get('/fines').then((r) => setFines(r.data.fines));
  useEffect(() => {
    fetchFines();
    api.get('/vehicles', { params: { limit: 100 } }).then((r) => setVehicles(r.data.vehicles));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (evidence) fd.append('evidenceImage', evidence);
    await api.post('/fines', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setModalOpen(false);
    fetchFines();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Traffic Fines</h1>
        {canManageFines(user?.role) && (
          <button onClick={() => setModalOpen(true)} className="btn-secondary flex items-center gap-2">
            <FiPlus /> Create Fine
          </button>
        )}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left p-3">Plate</th>
              <th className="text-left p-3">Violation</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Due Date</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {fines.map((f) => (
              <tr key={f.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="p-3 font-mono font-bold">{f.vehicle?.plateNumber}</td>
                <td className="p-3">{f.violationType.replace(/_/g, ' ')}</td>
                <td className="p-3 font-bold">${f.amount}</td>
                <td className="p-3">{new Date(f.dueDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    f.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    f.status === 'PAID' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Traffic Fine">
        <form onSubmit={handleCreate} className="space-y-4">
          <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="input-field" required>
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.plateNumber} - {v.ownerFullName}</option>
            ))}
          </select>
          <select value={form.violationType} onChange={(e) => setForm({ ...form, violationType: e.target.value })} className="input-field">
            {VIOLATIONS.map((v) => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
          </select>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Description" />
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="Amount" required />
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input-field" required />
          <input type="file" accept="image/*" onChange={(e) => setEvidence(e.target.files[0])} className="input-field" />
          <button type="submit" className="btn-primary w-full">Create Fine</button>
        </form>
      </Modal>
    </div>
  );
}

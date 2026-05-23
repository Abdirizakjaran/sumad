import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { canManagePayments } from '../utils/roles';

const METHODS = ['EVC_PLUS', 'WAAFI_PAY', 'SAHAL', 'CASH'];

export default function Payments() {
  const { user } = useAuth();
  const [unpaid, setUnpaid] = useState([]);
  const [payments, setPayments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [method, setMethod] = useState('EVC_PLUS');
  const [transactionId, setTransactionId] = useState('');
  const [receipt, setReceipt] = useState(null);

  const fetchData = async () => {
    const [u, p] = await Promise.all([
      api.get('/payments/unpaid'),
      api.get('/payments'),
    ]);
    setUnpaid(u.data.fines);
    setPayments(p.data.payments);
  };

  useEffect(() => { fetchData(); }, []);

  const handlePay = async () => {
    const { data } = await api.post('/payments', {
      fineId: selectedFine.id,
      method,
      transactionId,
    });
    setReceipt(data.receipt);
    fetchData();
  };

  const printReceipt = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><body style="font-family:Arial;padding:40px">
        <h1>SUMAD TRAFFIC MGT</h1>
        <h2>Payment Receipt</h2>
        <p>Receipt: ${receipt.receiptNumber}</p>
        <p>Amount: $${receipt.amount}</p>
        <p>Method: ${receipt.method}</p>
        <p>Date: ${new Date(receipt.date).toLocaleString()}</p>
        <p>Plate: ${receipt.fine?.vehicle?.plateNumber}</p>
      </body></html>
    `);
    w.print();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments & Tax</h1>

      {canManagePayments(user?.role) && (
        <div className="card">
          <h3 className="font-semibold mb-4 text-red-600">Unpaid Fines ({unpaid.length})</h3>
          <div className="space-y-2">
            {unpaid.map((f) => (
              <div key={f.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="font-mono font-bold">{f.vehicle?.plateNumber}</p>
                  <p className="text-sm">{f.violationType} - {f.vehicle?.ownerFullName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">${f.amount}</span>
                  <button
                    onClick={() => { setSelectedFine(f); setModalOpen(true); setReceipt(null); }}
                    className="btn-primary py-1 px-3 text-sm"
                  >
                    Receive Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-4">Payment History</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Receipt</th>
              <th className="text-left p-3">Plate</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Method</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="p-3 font-mono text-xs">{p.receiptNumber}</td>
                <td className="p-3 font-bold">{p.fine?.vehicle?.plateNumber}</td>
                <td className="p-3 text-emerald-600 font-bold">${p.amount}</td>
                <td className="p-3">{p.method}</td>
                <td className="p-3">{new Date(p.approvedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Receive Payment">
        {receipt ? (
          <div className="text-center space-y-4">
            <div className="text-6xl">✅</div>
            <p className="font-bold text-lg">Payment Approved!</p>
            <p className="font-mono">{receipt.receiptNumber}</p>
            <button onClick={printReceipt} className="btn-primary w-full">Print Receipt</button>
            <button onClick={() => setModalOpen(false)} className="w-full py-2 border rounded-lg">Close</button>
          </div>
        ) : selectedFine && (
          <div className="space-y-4">
            <p>Plate: <strong>{selectedFine.vehicle?.plateNumber}</strong></p>
            <p>Amount: <strong className="text-2xl text-emerald-600">${selectedFine.amount}</strong></p>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="input-field">
              {METHODS.map((m) => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
            </select>
            <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="input-field" placeholder="Transaction ID (optional)" />
            <button onClick={handlePay} className="btn-primary w-full">Approve Payment</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

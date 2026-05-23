import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function AddVehicle() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ownerFullName: '',
    phoneNumber: '',
    nationalId: '',
    vehicleType: 'CAR',
    plateNumber: '',
    vehicleModel: '',
    vehicleColor: '',
    registrationDate: new Date().toISOString().split('T')[0],
  });
  const [vehicleImage, setVehicleImage] = useState(null);
  const [driverImage, setDriverImage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (vehicleImage) fd.append('vehicleImage', vehicleImage);
    if (driverImage) fd.append('driverImage', driverImage);
    try {
      await api.post('/vehicles', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/vehicles');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('addVehicle')}</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        {[
          ['ownerFullName', 'Owner Full Name'],
          ['phoneNumber', 'Phone Number'],
          ['nationalId', 'National ID'],
          ['plateNumber', 'Plate Number'],
          ['vehicleModel', 'Vehicle Model'],
          ['vehicleColor', 'Vehicle Color'],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input name={name} value={form[name]} onChange={handleChange} className="input-field" required />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Type</label>
          <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className="input-field">
            <option value="CAR">Car</option>
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="TRUCK">Truck</option>
            <option value="BUS">Bus</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Registration Date</label>
          <input type="date" name="registrationDate" value={form.registrationDate} onChange={handleChange} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Image</label>
            <input type="file" accept="image/*" onChange={(e) => setVehicleImage(e.target.files[0])} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Driver Image</label>
            <input type="file" accept="image/*" onChange={(e) => setDriverImage(e.target.files[0])} className="input-field" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : t('save')}
          </button>
          <button type="button" onClick={() => navigate('/vehicles')} className="flex-1 py-2.5 border rounded-lg">
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

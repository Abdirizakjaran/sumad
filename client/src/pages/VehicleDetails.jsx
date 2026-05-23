import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function VehicleDetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    api.get(`/vehicles/${id}`).then((res) => setVehicle(res.data.vehicle));
  }, [id]);

  if (!vehicle) return <div className="card animate-pulse h-64" />;

  return (
    <div className="space-y-6">
      <Link to="/vehicles" className="text-sumad-blue text-sm hover:underline">← Back to Vehicles</Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h1 className="text-3xl font-black font-mono text-sumad-blue">{vehicle.plateNumber}</h1>
          <p className="text-xl mt-1">{vehicle.ownerFullName}</p>
          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div><span className="text-slate-500">Phone</span><p className="font-medium">{vehicle.phoneNumber}</p></div>
            <div><span className="text-slate-500">National ID</span><p className="font-medium">{vehicle.nationalId}</p></div>
            <div><span className="text-slate-500">Type</span><p className="font-medium">{vehicle.vehicleType}</p></div>
            <div><span className="text-slate-500">Model</span><p className="font-medium">{vehicle.vehicleModel}</p></div>
            <div><span className="text-slate-500">Color</span><p className="font-medium">{vehicle.vehicleColor}</p></div>
            <div><span className="text-slate-500">Status</span><p className="font-medium">{vehicle.status}</p></div>
          </div>
        </div>
        {vehicle.qrCode && (
          <div className="card flex flex-col items-center">
            <h3 className="font-semibold mb-4">Vehicle QR Code</h3>
            <img src={vehicle.qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
        )}
      </div>
      <div className="card">
        <h3 className="font-semibold mb-4">Fine History</h3>
        <div className="space-y-2">
          {vehicle.fines?.map((f) => (
            <div key={f.id} className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="font-medium">{f.violationType}</p>
                <p className="text-xs text-slate-500">{f.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${f.amount}</p>
                <span className="text-xs">{f.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

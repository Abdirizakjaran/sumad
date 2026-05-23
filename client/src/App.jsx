import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import AddVehicle from './pages/AddVehicle';
import VehicleDetails from './pages/VehicleDetails';
import Fines from './pages/Fines';
import Payments from './pages/Payments';
import CameraDetection from './pages/CameraDetection';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { connectSocket, disconnectSocket } from './services/socket';

export default function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) connectSocket();
    else disconnectSocket();
  }, [user]);

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/add" element={<AddVehicle />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/fines" element={<Fines />} />
        <Route path="/payments" element={<Payments />} />
        <Route
          path="/camera"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'CAMERA_OPERATOR', 'TRAFFIC_ADMIN']}>
              <CameraDetection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'TRAFFIC_ADMIN', 'FINANCE_OFFICER']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

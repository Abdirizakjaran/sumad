import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);

  const handleForgot = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/auth/forgot-password', { email });
    setMessage(data.message);
    if (data.resetToken) setToken(data.resetToken);
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    await api.post('/auth/reset-password', {
      token: form.get('token'),
      password: form.get('password'),
    });
    setMessage('Password reset successful! You can now login.');
    setStep(3);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sumad-navy p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md glass rounded-2xl p-8">
        <h1 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Reset Password</h1>
        {step === 1 && (
          <form onSubmit={handleForgot} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-field"
              required
            />
            <button type="submit" className="btn-primary w-full">Send Reset Link</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-green-600">{message}</p>
            <input name="token" defaultValue={token} placeholder="Reset Token" className="input-field" required />
            <input name="password" type="password" placeholder="New Password" className="input-field" required />
            <button type="submit" className="btn-primary w-full">Reset Password</button>
          </form>
        )}
        {step === 3 && <p className="text-green-600">{message}</p>}
        <Link to="/login" className="block text-center mt-4 text-sumad-blue text-sm">Back to Login</Link>
      </motion.div>
    </div>
  );
}

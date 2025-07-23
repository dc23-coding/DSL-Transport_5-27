// ✅ Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Login = () => {
  const { login, activateBypass } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);
    if (error) setError(error.message);
    else navigate('/');
  };

  const handleDevBypass = () => {
    activateBypass();
    navigate('/admin-dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-effect rounded-lg p-8 shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login to DSL Transport</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-input" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-input" required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <Button variant="outline" className="w-full mt-2" onClick={handleDevBypass}>🚧 Admin Bypass</Button>
        <div className="text-center mt-4">
          <span>Don't have an account? </span>
          <button className="text-primary underline" onClick={() => navigate('/register')}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Login = () => {
  const navigate = useNavigate();
  const { login, userRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: loginError } = await login(email, password /*, rememberMe*/);
    setLoading(false);
    if (loginError) {
      setError(loginError.message || 'Login failed. Please check your credentials.');
      return;
    }
    switch (userRole) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'broker':
        navigate('/broker-dashboard');
        break;
      case 'driver':
        navigate('/driver-dashboard');
        break;
      default:
        navigate('/');
    }
  };

  //const handleDevBypass = () => {
  //  console.warn('🚧 Developer Bypass Activated 🚧');
  //  navigate('/admin-dashboard');
  //};

  return (
    <div className="min-h-[calc(100vh-var(--header-height,4rem))] flex items-center justify-center py-8">
      <div className="glass-effect rounded-lg p-8 shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login to DSL Transport</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 rounded bg-input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 rounded bg-input"
            required
          />
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        {/*<Button onClick={handleDevBypass} variant="outline" className="w-full mt-2">
          🚧 Developer Bypass
        </Button>*/}
        <div className="text-center mt-4">
          <span>Don't have an account? </span>
          <button onClick={() => navigate('/register')} className="text-primary underline">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
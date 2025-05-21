import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  // 🚧 Developer Bypass (No Password Required)
  const handleDevBypass = () => {
    console.warn('🚧 Developer Bypass Activated 🚧');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background text-foreground">
      <div className="max-w-md w-full space-y-6 glass-effect p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        {error && <div className="text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md border bg-background"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md border bg-background"
            required
          />
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <Button onClick={handleDevBypass} variant="outline" className="w-full mt-2">
          🚧 Developer Bypass
        </Button>
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

// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to create an account. Email might be already in use or password too weak.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface p-4 animate-fadeIn">
      <div className="bg-surface p-8 rounded-2xl shadow-glow-lg border border-border w-full max-w-md transform transition-all duration-500 hover:scale-[1.01] hover:shadow-glow-md">
        <h2 className="text-4xl font-extrabold text-secondary mb-6 text-center tracking-tight">Join BabyBites!</h2>
        {error && <p className="text-error text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-textSecondary text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-textSecondary text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-textSecondary text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-300"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-secondary text-white rounded-xl font-semibold text-lg shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Register'
            )}
          </button>
        </form>
        <p className="text-center text-textSecondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

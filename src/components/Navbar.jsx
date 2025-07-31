// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <nav className="bg-surface shadow-surface-dark p-4 md:p-6 flex justify-between items-center sticky top-0 z-50 border-b border-border">
      <Link to="/" className="flex items-center space-x-3 animate-slideInLeft">
        <img src="/logo.svg" alt="BabyBites Logo" className="h-8 w-8 md:h-10 md:w-10" />
        <span className="text-2xl md:text-3xl font-bold text-primary tracking-tight">BabyBites</span>
      </Link>
      <div className="flex items-center space-x-4 animate-slideInRight">
        {currentUser ? (
          <>
            <span className="text-textSecondary text-sm md:text-base hidden sm:block">
              Welcome, {currentUser.email.split('@')[0]}!
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-accent text-white rounded-xl shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 text-sm md:text-base"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-primary border border-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 text-sm md:text-base"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-secondary text-white rounded-xl shadow-glow-sm hover:shadow-glow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75 text-sm md:text-base"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

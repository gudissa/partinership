import React, { useState } from "react";
import axios from "axios";
import apiClient from '../services/api-client';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    isInternal: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = formData.isInternal ? '/internal/login' : '/admin/login';
      const res = await apiClient.post(endpoint, {
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });

      const response = res; // normalize variable name below

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user || response.data.data.admin));

      // Determine redirect path based on user type and role
      let redirectPath = '/';
      if (formData.isInternal) {
        redirectPath = '/internal/dashboard';
      } else {
        const userData = response.data.data.user || response.data.data.admin;
        if (userData.role === 'super-admin') {
          redirectPath = '/super-admin';
        } else {
          redirectPath = '/admin';
        }
      }

      toast.success('Login successful!');
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3c8dbc]/5 via-white to-[#3c8dbc]/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1f88d8]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#116ab8]/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 glass p-10 rounded-3xl shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1f88d8] to-[#116ab8] mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-2">
            {formData.isInternal ? 'Internal User Login' : 'Admin Login'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {formData.isInternal ? (
              <button
                onClick={() => setFormData(prev => ({ ...prev, isInternal: false }))}
                className="font-medium text-[#3c8dbc] hover:text-[#2c6a8f] transition-all duration-200 underline decoration-2 underline-offset-4 hover:decoration-[#2c6a8f] hover:scale-105 inline-block"
              >
                Switch to Admin Login
              </button>
            ) : (
              <button
                onClick={() => setFormData(prev => ({ ...prev, isInternal: true }))}
                className="font-medium text-[#3c8dbc] hover:text-[#2c6a8f] transition-all duration-200 underline decoration-2 underline-offset-4 hover:decoration-[#2c6a8f] hover:scale-105 inline-block"
              >
                Switch to Internal User Login
              </button>
            )}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-modern appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]/20 focus:border-[#3c8dbc] sm:text-sm transition-all duration-300"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-modern appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]/20 focus:border-[#3c8dbc] sm:text-sm transition-all duration-300"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary group relative w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c8dbc] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

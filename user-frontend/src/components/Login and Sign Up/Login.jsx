import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Input, Button, Typography, Checkbox } from '@material-tailwind/react';
import toast, { Toaster } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../../services/api-client';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await apiClient.post('/user/login', {
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });

      const data = res.data;

      // Check if the user is internal
      if (data.data.role === 'internal') {
        throw new Error('This login page is only for external users. Please use the internal login page.');
      }

      // Only proceed if user is external
      localStorage.setItem('token', data.token);
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      toast.success('Login successful! Redirecting...');
      setTimeout(() => navigate('/user'), 1500);

    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsSubmitting(true);
      
      // Decode the Google JWT token to get user info
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Try to login with Google data (will create account if doesn't exist)
      const res = await apiClient.post('/user/google-signup', {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        picture: decoded.picture
      }, { withCredentials: true });

      const data = res.data;

      localStorage.setItem('token', data.token);
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      toast.success('Google login successful! Redirecting...');
      setTimeout(() => navigate('/user'), 1500);

    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-white via-[#3c8dbc]/5 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1f88d8]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#116ab8]/10 rounded-full blur-3xl"></div>
      </div>
      
      <Toaster position="top-center" reverseOrder={false} />
      
      <Card color="transparent" shadow={true} className="glass p-8 border border-[#3c8dbc]/20 rounded-3xl relative z-10 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1f88d8] to-[#116ab8] mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <Typography variant="h4" className="mb-2 text-center gradient-text font-bold">
            Welcome Back
          </Typography>
          <Typography color="gray" className="mb-8 text-center">
            Sign in to continue to your account
          </Typography>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <hr className="flex-1 border-gray-300" />
          <span className="px-4 text-gray-500 text-sm">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <form className="mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={handleSubmit}>
          <div className="mb-6">
            <Input
              size="lg"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              className="!border-gray-300 focus:!border-[#3c8dbc]"
              labelProps={{ className: "peer-focus:!text-[#3c8dbc]" }}
            />
            {errors.email && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.email}
              </Typography>
            )}
          </div>
          
          <div className="mb-4">
            <Input
              type="password"
              size="lg"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              className="!border-gray-300 focus:!border-[#3c8dbc]"
              labelProps={{ className: "peer-focus:!text-[#3c8dbc]" }}
            />
            {errors.password && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.password}
              </Typography>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <Checkbox
              label="Remember me"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              color="blue"
              className="checked:bg-[#3c8dbc]"
            />
            <Link 
              to="/forgot-password" 
              className="text-sm text-[#3c8dbc] hover:text-[#2c6a8f] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="btn-primary mt-2 bg-gradient-to-r from-[#1f88d8] to-[#116ab8] hover:from-[#116ab8] hover:to-[#0f5595] text-white shadow-lg" 
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </div>
            ) : 'Log In'}
          </Button>
          
          <Typography color="gray" className="mt-4 text-center">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-[#3c8dbc] hover:text-[#2c6a8f] font-medium transition-colors"
            >
              Create Account
            </Link>
          </Typography>
        </form>
      </Card>
    </div>
  );
}
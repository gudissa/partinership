import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Input, Tabs, TabsHeader, TabsBody, Tab, TabPanel, Alert } from '@material-tailwind/react';
import { UserCircleIcon, UserGroupIcon, TrashIcon, PencilIcon, BuildingOfficeIcon, LinkIcon, DocumentDuplicateIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import apiClient from '../services/api-client';
import { toast } from 'react-toastify';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('external-users');
  const [setupLinks, setSetupLinks] = useState({
    internalUser: null,
    admin: null
  });
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    department: '',
    role: 'internal' // Default to internal for new users
  });
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        // Verify token and get user info
        const response = await apiClient.get('/super-admin/me', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        const user = response.data.data.admin;
        if (user.role !== 'super-admin') {
          throw new Error('Unauthorized access');
        }

        setIsAuthenticated(true);
  localStorage.setItem('user', JSON.stringify(user));
  setCurrentUser(user);
        fetchData();
      } catch (error) {
        console.error('Auth error:', error);
        toast.error(error.response?.data?.message || 'Unauthorized access. Please login as super admin.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/super-admin');
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [usersRes, adminsRes] = await Promise.all([
        apiClient.get('/super-admin/users', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }),
        apiClient.get('/super-admin/admins', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      ]);

      setUsers(usersRes.data.data || []);
      setAdmins(adminsRes.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/super-admin');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch data');
      }
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.post(
        '/super-admin/users/internal',
        newUser,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Internal user creation response:', response.data);
      
      // Store the setup link - check multiple possible response structures
      const setupLink = response.data?.data?.setupLink || response.data?.setupLink;
      
      if (setupLink) {
        setSetupLinks(prev => ({
          ...prev,
          internalUser: setupLink
        }));
        toast.success('Internal user created successfully! Setup link is available below.');
      } else {
        console.warn('Setup link not found in response:', response.data);
        toast.warning('User created but setup link was not generated. Please check server logs.');
      }

      setNewUser({ email: '', name: '', department: '', role: 'internal' });
      fetchData();
    } catch (error) {
      console.error('Error creating internal user:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/super-admin');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create user');
      }
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.post('/super-admin/admins', {
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Admin creation response:', response.data);
      
      // Check if setupLink exists in response
      const setupLink = response.data?.data?.setupLink || response.data?.setupLink;
      
      if (!setupLink) {
        console.warn('Setup link not found in response:', response.data);
        toast.warning('Admin created but setup link was not generated. Please check server logs.');
      } else {
        console.log('Setup link generated:', setupLink);
        setSetupLinks(prev => ({
          ...prev,
          admin: setupLink
        }));
        toast.success('Admin added successfully! Setup link is available below.');
      }

      if (response.data?.data?.admin) {
        setAdmins(prev => [...prev, response.data.data.admin]);
      }
      
      setNewAdmin({
        name: '',
        email: '',
        role: 'partnership-division'
      });
    } catch (error) {
      console.error('Error adding admin:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        const token = localStorage.getItem('token');
        await apiClient.delete(`/super-admin/users/${userId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('User removed successfully');
        fetchData();
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/super-admin');
        } else {
          toast.error(error.response?.data?.message || 'Failed to remove user');
        }
      }
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to remove this admin?')) {
      try {
        const token = localStorage.getItem('token');
        await apiClient.delete(`/super-admin/admins/${adminId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Admin removed successfully');
        fetchData();
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/super-admin');
        } else {
          toast.error(error.response?.data?.message || 'Failed to remove admin');
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Try to notify server, but don't block logout if it fails
      await apiClient.get('/super-admin/logout').catch(() => {});
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('You have been logged out');
      navigate('/super-admin');
    }
  };

  const filterUsersByRole = (role) => {
    return users.filter(user => user.role === role);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const validate = () => {
    // Implement validation logic here
    return true; // Placeholder return, actual implementation needed
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f1f7fe] via-white to-[#e8f4fd] flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#1f88d8]/20 border-t-[#1f88d8] mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-[#1f88d8] animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f7fe] via-white to-[#e8f4fd] p-3 sm:p-4 md:p-6 lg:p-8 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#1f88d8]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#116ab8]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header - Fully Responsive */}
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 shadow-xl animate-fade-in">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#1f88d8] to-[#116ab8] shadow-lg">
                    <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Typography variant="h3" className="font-bold gradient-text text-xl sm:text-2xl md:text-3xl">
                    Super Admin Dashboard
                  </Typography>
                </div>
                <Typography variant="small" className="text-gray-600 text-sm sm:text-base">
                  Manage users, admins and quick setup links from here.
                </Typography>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="glass flex items-center rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 shadow-lg border border-white/50">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-[#1f88d8] to-[#116ab8] mr-2 sm:mr-3">
                    <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{currentUser?.name || 'Super Admin'}</div>
                    <div className="text-xs text-gray-500 capitalize">{currentUser?.role || 'super-admin'}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn-primary inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 text-sm sm:text-base"
                  title="Log out"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="card-modern p-4 sm:p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#1f88d8]/10 to-transparent rounded-full blur-2xl"></div>
            <div className="relative flex items-center">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#1f88d8] to-[#116ab8] mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Users</div>
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{users.length}</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-4 sm:p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-2xl"></div>
            <div className="relative flex items-center">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-green-600 mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Internal Users</div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{filterUsersByRole('internal').length}</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-4 sm:p-6 relative overflow-hidden group sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl"></div>
            <div className="relative flex items-center">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Admins</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{admins.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Setup Links Alerts - Responsive */}
        {setupLinks.internalUser && (
          <div className="card-modern p-4 sm:p-5 mb-4 sm:mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="p-2 sm:p-3 rounded-lg bg-green-500 shadow-lg flex-shrink-0">
                  <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <Typography variant="h6" className="font-bold text-gray-800 mb-1 text-sm sm:text-base">
                    Internal User Setup Link
                  </Typography>
                  <Typography variant="small" className="text-gray-600 text-xs sm:text-sm mb-2">
                    Share this link with the internal user to set their password
                  </Typography>
                  <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200 font-mono text-xs text-gray-700 break-all overflow-x-auto">
                    {setupLinks.internalUser}
                  </div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(setupLinks.internalUser)}
                className="btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 w-full sm:w-auto sm:flex-shrink-0"
              >
                <DocumentDuplicateIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Copy Link</span>
              </button>
            </div>
          </div>
        )}

        {setupLinks.admin && (
          <div className="card-modern p-4 sm:p-5 mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="p-2 sm:p-3 rounded-lg bg-blue-500 shadow-lg flex-shrink-0">
                  <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <Typography variant="h6" className="font-bold text-gray-800 mb-1 text-sm sm:text-base">
                    Admin Setup Link
                  </Typography>
                  <Typography variant="small" className="text-gray-600 text-xs sm:text-sm mb-2">
                    Share this link with the admin to set their password
                  </Typography>
                  <div className="p-2 bg-white rounded-lg border border-gray-200 font-mono text-xs text-gray-700 break-all overflow-x-auto">
                    {setupLinks.admin}
                  </div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(setupLinks.admin)}
                className="btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 w-full sm:w-auto sm:flex-shrink-0"
              >
                <DocumentDuplicateIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Copy Link</span>
              </button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
          <TabsHeader className="glass rounded-lg sm:rounded-xl p-1 sm:p-2 mb-4 sm:mb-6 shadow-lg border border-white/50 overflow-x-auto">
            <Tab 
              value="external-users" 
              className="flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm transition-all duration-300 data-[active]:bg-gradient-to-r data-[active]:from-[#1f88d8] data-[active]:to-[#116ab8] data-[active]:text-white rounded-md sm:rounded-lg px-3 sm:px-4 py-2 whitespace-nowrap"
            >
              <UserCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">External Users</span>
              <span className="xs:hidden">External</span>
            </Tab>
            <Tab 
              value="internal-users" 
              className="flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm transition-all duration-300 data-[active]:bg-gradient-to-r data-[active]:from-[#1f88d8] data-[active]:to-[#116ab8] data-[active]:text-white rounded-md sm:rounded-lg px-3 sm:px-4 py-2 whitespace-nowrap"
            >
              <BuildingOfficeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Internal Users</span>
              <span className="xs:hidden">Internal</span>
            </Tab>
            <Tab 
              value="admins" 
              className="flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm transition-all duration-300 data-[active]:bg-gradient-to-r data-[active]:from-[#1f88d8] data-[active]:to-[#116ab8] data-[active]:text-white rounded-md sm:rounded-lg px-3 sm:px-4 py-2 whitespace-nowrap"
            >
              <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Admins
            </Tab>
          </TabsHeader>
          <TabsBody>
            <TabPanel value="external-users">
              <Card className="glass p-4 sm:p-6 shadow-xl border border-white/50 animate-fade-in">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#1f88d8] to-[#116ab8]">
                    <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Typography variant="h5" className="font-bold gradient-text text-lg sm:text-xl md:text-2xl">
                    External Users
                  </Typography>
                </div>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-3">
                  {filterUsersByRole('external').length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No external users found</div>
                  ) : (
                    filterUsersByRole('external').map((user) => (
                      <div key={user._id} className="card-modern p-4 space-y-2">
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Name</div>
                          <div className="text-gray-700">{user.name}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Email</div>
                          <div className="text-gray-600 text-sm break-all">{user.email}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Company</div>
                          <div className="text-gray-600">{user.company?.name || 'N/A'}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user._id)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Name</th>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Email</th>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Company</th>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterUsersByRole('external').length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-500">
                            No external users found
                          </td>
                        </tr>
                      ) : (
                        filterUsersByRole('external').map((user) => (
                          <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-3 sm:p-4 font-medium text-gray-800 text-sm">{user.name}</td>
                            <td className="p-3 sm:p-4 text-gray-600 text-sm">{user.email}</td>
                            <td className="p-3 sm:p-4 text-gray-600 text-sm">{user.company?.name || 'N/A'}</td>
                            <td className="p-3 sm:p-4">
                              <button
                                onClick={() => handleRemoveUser(user._id)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabPanel>

            <TabPanel value="internal-users">
              <Card className="glass p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8 shadow-xl border border-white/50 animate-fade-in">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                    <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Typography variant="h5" className="font-bold gradient-text text-lg sm:text-xl md:text-2xl">
                    Add New Internal User
                  </Typography>
                </div>
                <form onSubmit={handleAddUser} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                        className="input-modern w-full text-sm sm:text-base"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        required
                        className="input-modern w-full text-sm sm:text-base"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                        required
                        className="input-modern w-full text-sm sm:text-base"
                        placeholder="Department Name"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full sm:w-auto">
                    <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                      <BuildingOfficeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add Internal User
                    </span>
                  </button>
                </form>
              </Card>

              <Card className="glass p-4 sm:p-6 shadow-xl border border-white/50 animate-fade-in">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                    <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Typography variant="h5" className="font-bold gradient-text text-lg sm:text-xl md:text-2xl">
                    Internal Users
                  </Typography>
                </div>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-3">
                  {filterUsersByRole('internal').length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No internal users found</div>
                  ) : (
                    filterUsersByRole('internal').map((user) => (
                      <div key={user._id} className="card-modern p-4 space-y-2">
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Name</div>
                          <div className="text-gray-700">{user.name}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Email</div>
                          <div className="text-gray-600 text-sm break-all">{user.email}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Department</div>
                          <div className="text-gray-600">{user.department}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user._id)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Name</th>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Email</th>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Department</th>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterUsersByRole('internal').length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-500">
                            No internal users found
                          </td>
                        </tr>
                      ) : (
                        filterUsersByRole('internal').map((user) => (
                          <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-3 sm:p-4 font-medium text-gray-800 text-sm">{user.name}</td>
                            <td className="p-3 sm:p-4 text-gray-600 text-sm">{user.email}</td>
                            <td className="p-3 sm:p-4 text-gray-600 text-sm">{user.department}</td>
                            <td className="p-3 sm:p-4">
                              <button
                                onClick={() => handleRemoveUser(user._id)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabPanel>

            <TabPanel value="admins">
              <Card className="glass p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8 shadow-xl border border-white/50 animate-fade-in">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Typography variant="h5" className="font-bold gradient-text text-lg sm:text-xl md:text-2xl">
                    Add New Admin
                  </Typography>
                </div>
                <form onSubmit={handleAddAdmin} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        required
                        className="input-modern w-full text-sm sm:text-base"
                        placeholder="Admin Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        required
                        className="input-modern w-full text-sm sm:text-base"
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        className="input-modern w-full text-sm sm:text-base"
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="partnership-division">Partnership Division</option>
                        <option value="law-service">Law Service</option>
                        <option value="law-research">Law Research</option>
                        <option value="director">Director</option>
                        <option value="general-director">General Director</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>
                    <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                      <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {isSubmitting ? 'Adding...' : 'Add Admin'}
                    </span>
                  </button>
                </form>
              </Card>

              <Card className="glass p-4 sm:p-6 shadow-xl border border-white/50 animate-fade-in">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <Typography variant="h5" className="font-bold gradient-text text-lg sm:text-xl md:text-2xl">
                    All Admins
                  </Typography>
                </div>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-3">
                  {!Array.isArray(admins) || admins.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No admins found</div>
                  ) : (
                    admins.map((admin) => (
                      <div key={admin._id} className="card-modern p-4 space-y-2">
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Name</div>
                          <div className="text-gray-700">{admin.name}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Email</div>
                          <div className="text-gray-600 text-sm break-all">{admin.email}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Role</div>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize mt-1">
                            {admin.role?.replace('-', ' ') || 'N/A'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveAdmin(admin._id)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Name</th>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Email</th>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Role</th>
                        <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!Array.isArray(admins) || admins.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-500">
                            No admins found
                          </td>
                        </tr>
                      ) : (
                        admins.map((admin) => (
                          <tr key={admin._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-3 sm:p-4 font-medium text-gray-800 text-sm">{admin.name}</td>
                            <td className="p-3 sm:p-4 text-gray-600 text-sm">{admin.email}</td>
                            <td className="p-3 sm:p-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                                {admin.role?.replace('-', ' ') || 'N/A'}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4">
                              <button
                                onClick={() => handleRemoveAdmin(admin._id)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard; 
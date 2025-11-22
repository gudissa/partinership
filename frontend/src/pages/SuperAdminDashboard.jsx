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
      
      // Store the setup link
      setSetupLinks(prev => ({
        ...prev,
        internalUser: response.data.data.setupLink
      }));

      toast.success('Internal user created successfully');
      setNewUser({ email: '', name: '', department: '', role: 'internal' });
      fetchData();
    } catch (error) {
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

      setAdmins(prev => [...prev, response.data.data.admin]);
      setSetupLinks(prev => ({
        ...prev,
        admin: response.data.data.setupLink
      }));
      setNewAdmin({
        name: '',
        email: '',
        role: 'partnership-division'
      });
      toast.success('Admin added successfully!');
    } catch (error) {
      console.error('Error adding admin:', error);
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c8dbc]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <Typography variant="h3" color="blue-gray" className="font-bold">
              Super Admin Dashboard
            </Typography>
            <Typography variant="small" className="text-gray-600">
              Manage users, admins and quick setup links from here.
            </Typography>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white shadow-md rounded-lg px-4 py-2">
              <UserCircleIcon className="w-8 h-8 text-[#3c8dbc] mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-800">{currentUser?.name || 'Super Admin'}</div>
                <div className="text-xs text-gray-500">{currentUser?.role || 'super-admin'}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
              title="Log out"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-lg bg-[#3c8dbc]/10 text-[#3c8dbc] mr-4">
              <UserCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Users</div>
              <div className="text-2xl font-semibold text-gray-900">{users.length}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
              <BuildingOfficeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Internal Users</div>
              <div className="text-2xl font-semibold text-gray-900">{filterUsersByRole('internal').length}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Admins</div>
              <div className="text-2xl font-semibold text-gray-900">{admins.length}</div>
            </div>
          </div>
        </div>

        {/* Setup Links Alerts */}
        {setupLinks.internalUser && (
          <Alert color="green" className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="font-bold">
                  Internal User Setup Link
                </Typography>
                <Typography variant="small" className="mt-1">
                  Share this link with the internal user to set their password
                </Typography>
              </div>
              <Button
                size="sm"
                variant="text"
                className="flex items-center gap-2"
                onClick={() => copyToClipboard(setupLinks.internalUser)}
              >
                <LinkIcon className="w-4 h-4" />
                Copy Link
              </Button>
            </div>
          </Alert>
        )}

        {setupLinks.admin && (
          <Alert
            color="green"
            className="mb-4"
            action={
              <Button
                variant="text"
                color="white"
                className="!absolute right-3 top-3"
                onClick={() => copyToClipboard(setupLinks.admin)}
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
              </Button>
            }
          >
            <Typography variant="small" className="font-medium">
              Admin Setup Link
            </Typography>
            <Typography variant="small" className="font-normal opacity-80">
              {setupLinks.admin}
            </Typography>
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
          <TabsHeader className="bg-transparent">
            <Tab value="external-users" className="flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5" />
              External Users
            </Tab>
            <Tab value="internal-users" className="flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5" />
              Internal Users
            </Tab>
            <Tab value="admins" className="flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" />
              Admins
            </Tab>
          </TabsHeader>
          <TabsBody>
            <TabPanel value="external-users">
              <Card className="p-6">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  External Users
                </Typography>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-gray-100">
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left">Company</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterUsersByRole('external').map((user) => (
                        <tr key={user._id} className="border-b border-blue-gray-100">
                          <td className="p-4">{user.name}</td>
                          <td className="p-4">{user.email}</td>
                          <td className="p-4">{user.company?.name || 'N/A'}</td>
                          <td className="p-4">
                            <Button
                              variant="text"
                              color="red"
                              onClick={() => handleRemoveUser(user._id)}
                              className="flex items-center gap-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabPanel>

            <TabPanel value="internal-users">
              <Card className="p-6 mb-8">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Add New Internal User
                </Typography>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                    <Input
                      label="Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Department"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-[#3c8dbc]">
                    Add Internal User
                  </Button>
                </form>
              </Card>

              <Card className="p-6">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Internal Users
                </Typography>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-gray-100">
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left">Department</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterUsersByRole('internal').map((user) => (
                        <tr key={user._id} className="border-b border-blue-gray-100">
                          <td className="p-4">{user.name}</td>
                          <td className="p-4">{user.email}</td>
                          <td className="p-4">{user.department}</td>
                          <td className="p-4">
                            <Button
                              variant="text"
                              color="red"
                              onClick={() => handleRemoveUser(user._id)}
                              className="flex items-center gap-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabPanel>

            <TabPanel value="admins">
              <Card className="p-6 mb-8">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Add New Admin
                </Typography>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      required
                    />
                    <select
                      className="border rounded-lg p-2"
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
                  <Button type="submit" className="bg-[#3c8dbc]">
                    Add Admin
                  </Button>
                </form>
              </Card>

              <Card className="p-6">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  All Admins
                </Typography>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-gray-100">
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left">Role</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(admins) && admins.map((admin) => (
                        <tr key={admin._id} className="border-b border-blue-gray-100">
                          <td className="p-4">{admin.name}</td>
                          <td className="p-4">{admin.email}</td>
                          <td className="p-4">{admin.role}</td>
                          <td className="p-4">
                            <Button
                              variant="text"
                              color="red"
                              onClick={() => handleRemoveAdmin(admin._id)}
                              className="flex items-center gap-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
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
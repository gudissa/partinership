const axios = require('axios');

// Allow overriding the API base URL via env when running scripts
const { DEFAULT_API_URL } = require('../config/defaults');
const API_BASE = process.env.API_BASE_URL || DEFAULT_API_URL;

const createInternalUser = async () => {
  try {
    const response = await axios.post(`${API_BASE}/api/v1/super-admin/users/internal`, {
      email: 'internal@insa.com',
      name: 'Internal User',
      department: 'Internal Affairs'
    });

    console.log('Internal user created successfully:', response.data);
    console.log('Setup link:', response.data.data.setupLink);
  } catch (error) {
    console.error('Error creating internal user:', error.response?.data || error.message);
  }
};

createInternalUser();
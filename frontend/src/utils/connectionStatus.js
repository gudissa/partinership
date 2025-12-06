/**
 * Utility to check backend connection status
 */
export const checkBackendConnection = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return { connected: true, data };
    }
    return { connected: false, error: 'Backend returned an error' };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};


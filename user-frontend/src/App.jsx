// src/App.js
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RouteConfig from "./route/RouteConfig";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ConnectionStatus from './components/common/ConnectionStatus';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  // For development, you need to set up your own Google OAuth client ID
  if (!googleClientId && import.meta.env.DEV) {
    console.warn('⚠️ VITE_GOOGLE_CLIENT_ID not found. Google OAuth will not work.');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId || "PLACEHOLDER_CLIENT_ID"}>
      <BrowserRouter>
        <AuthProvider>
          <RouteConfig />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <ConnectionStatus />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
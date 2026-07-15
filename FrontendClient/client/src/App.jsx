import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { UserProvider } from './context/userContext';
import { SocketProvider } from './context/socketContext';
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <TenantProvider>
            <UserProvider>
              <SocketProvider>
                <AppRoutes />
              </SocketProvider>
            </UserProvider>
          </TenantProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
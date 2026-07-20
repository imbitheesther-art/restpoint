import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRouter';
import { AuthProvider } from './utils/context/AuthContext';
import { TenantProvider } from './utils/context/TenantContext';
import { UserProvider } from './utils/context/userContext';
import { SocketProvider } from './utils/context/socketContext';
import InstallPrompt from './components/pwa/InstallPrompt';
import './index.css';

function App() {
  return (
    <>
      {/* All Providers */}
      <HelmetProvider>
        <Router>
          <AuthProvider>
            <TenantProvider>
              <UserProvider>
                <SocketProvider>
                  <AppRoutes />
                  <InstallPrompt />
                </SocketProvider>
              </UserProvider>
            </TenantProvider>
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </>
  );
}

export default App;
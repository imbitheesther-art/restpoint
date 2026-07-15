import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { UserProvider } from './context/userContext';
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <TenantProvider>
            <UserProvider>
              <AppRoutes />
            </UserProvider>
          </TenantProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
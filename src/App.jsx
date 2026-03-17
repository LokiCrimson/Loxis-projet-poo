import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Public/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import MainLayout from './components/Layout/MainLayout';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import AuditLogsList from './pages/Core/AuditLogsList';
import PropertiesList from './pages/Properties/PropertiesList';
import PropertyDetail from './pages/Properties/PropertyDetail';
import TenantsList from './pages/Tenants/TenantsList';
import TenantDetail from './pages/Tenants/TenantDetail';
import LeasesList from './pages/Leases/LeasesList';
import FinancesOverview from './pages/Finances/FinancesOverview';
import Settings from './pages/Core/Settings';
import { getUserRole } from './services/api';

// Composant pour protéger les routes selon le rôle
const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = getUserRole();
  
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes Protégées - Dashboard */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['OWNER', 'ADMIN', 'TENANT']}>
              <MainLayout>
                <Routes>
                  <Route index element={<DashboardOverview />} />
                  
                  {/* ADMIN ONLY */}
                  <Route 
                    path="audit" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AuditLogsList />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Placeholders pour les parties suivantes */}
                  <Route path="properties" element={<PropertiesList />} />
                  <Route path="properties/:id" element={<PropertyDetail />} />
                  <Route path="tenants" element={<TenantsList />} />
                  <Route path="tenants/:id" element={<TenantDetail />} />
                  <Route path="leases" element={<LeasesList />} />
                  <Route path="finances" element={<FinancesOverview />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

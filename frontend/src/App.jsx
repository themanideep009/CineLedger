import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { CityProvider } from './context/CityContext';
import { CitySelectorModal } from './components/CitySelectorModal';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AiChatbotWidget } from './components/AiChatbotWidget';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SeatMapPage } from './pages/SeatMapPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ScanEntryPage } from './pages/ScanEntryPage';
import { TheatreDashboard } from './pages/TheatreDashboard';
import { ProducerDashboard } from './pages/ProducerDashboard';
import { CollectionsDashboard } from './pages/CollectionsDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Verifying session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 glass-panel border border-rose-500/30 rounded-3xl text-center space-y-4">
        <h2 className="text-xl font-bold text-rose-300">403 Access Forbidden</h2>
        <p className="text-xs text-slate-300">
          This area is restricted to roles: {allowedRoles.join(', ')}. Your role is {user.role}.
        </p>
      </div>
    );
  }

  return children;
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CityProvider>
            <BrowserRouter>
              <div className="flex flex-col min-h-screen transition-colors duration-300">
                <Navbar />

                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<CustomerDashboard />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/seat-map/:showId" element={<SeatMapPage />} />
                    <Route path="/ticket/:ticketId" element={<TicketDetailPage />} />

                    <Route
                      path="/my-bookings"
                      element={
                        <ProtectedRoute allowedRoles={['CUSTOMER', 'THEATRE_ADMIN', 'PRODUCER', 'SUPER_ADMIN']}>
                          <MyBookingsPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/scan-entry"
                      element={
                        <ProtectedRoute allowedRoles={['THEATRE_ADMIN', 'SUPER_ADMIN']}>
                          <ScanEntryPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/theatre-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['THEATRE_ADMIN', 'SUPER_ADMIN']}>
                          <TheatreDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/producer-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['PRODUCER', 'SUPER_ADMIN']}>
                          <CollectionsDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/collections-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['PRODUCER', 'SUPER_ADMIN']}>
                          <CollectionsDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                          <SuperAdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
                <AiChatbotWidget />
                <CitySelectorModal />
              </div>
            </BrowserRouter>
          </CityProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Loans from './pages/Loans';
import Requests from './pages/Requests';
import Settings from './pages/Settings';
import Reservations from './pages/Reservations';

function AppRoutes() {
  const { currentUser } = useLibrary();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/catalog" replace />} />
        <Route path="catalog" element={<Catalog />} />

        {/* Protected Routes */}
        {currentUser ? (
          <>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="loans" element={<Loans />} />
            <Route path="reservations" element={<Reservations />} />

            {/* Admin Only Routes */}
            {currentUser.role === 'Admin' && (
              <>
                <Route path="members" element={<Members />} />
                <Route path="members/:id" element={<MemberProfile />} />
                <Route path="requests" element={<Requests />} />
                <Route path="settings" element={<Settings />} />
              </>
            )}
          </>
        ) : (
          // Redirect protected route attempts to catalog if unauthenticated
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        )}
      </Route>
      <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/catalog"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LibraryProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LibraryProvider>
  );
}

export default App;

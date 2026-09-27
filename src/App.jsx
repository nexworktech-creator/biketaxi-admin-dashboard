import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Captains from './pages/Captains';
import LiveMap from './pages/LiveMap';
import Rides from './pages/Rides';
import Riders from './pages/Riders';
import Coupons from './pages/Coupons';
import Billing from './pages/Billing';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="captains" element={<Captains />} />
            <Route path="live-map" element={<LiveMap />} />
            <Route path="rides" element={<Rides />} />
            <Route path="riders" element={<Riders />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="billing" element={<Billing />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

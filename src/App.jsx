import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MockTestEngine from './pages/MockTestEngine';
import SectionalTestEngine from './pages/SectionalTestEngine';
import TestResult from './pages/TestResult';
import Learn from './pages/Learn';
import SmartRevision from './pages/SmartRevision';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import ComingSoon from './pages/ComingSoon';
import AnalyticsPage from './pages/AnalyticsPage';
import Contact from './pages/Contact';
import SettingsPage from './pages/Settings';
import MockTests from './pages/MockTests';
import StudyPlanner from './pages/StudyPlanner';
import './App.css';

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function PublicHomeRoute() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) return <Navigate to="/dashboard" replace />;
  return <Home />;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicHomeRoute />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
          <Route path="/revise" element={<ProtectedRoute><SmartRevision /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
          <Route path="/test" element={<ProtectedRoute><MockTests /></ProtectedRoute>} />
          <Route path="/test/engine" element={<ProtectedRoute><MockTestEngine /></ProtectedRoute>} />
          <Route path="/test/sectional" element={<ProtectedRoute><SectionalTestEngine /></ProtectedRoute>} />
          <Route path="/test/result" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

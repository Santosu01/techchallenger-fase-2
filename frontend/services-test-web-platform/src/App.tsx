import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import FlagPage from './pages/FlagPage';
import TargetingPage from './pages/TargetingPage';
import EvaluationPage from './pages/EvaluationPage';
import AnalyticsPage from './pages/AnalyticsPage';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors theme="dark" />
        <Layout>
          <Routes>
            <Route path="/" element={<HomeLoader />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/flags" element={<FlagPage />} />
            <Route path="/targeting" element={<TargetingPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

// Simple loader/wrapper for Home
function HomeLoader() {
  return <Home />;
}

export default App;

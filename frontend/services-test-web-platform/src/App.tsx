import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import { FlagPage } from './pages/flags';
import { TargetingPage } from './pages/targeting';
import EvaluationPage from './pages/EvaluationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { LoadTestPage } from './pages/load-test';

import { AuthProvider } from './context/auth-context';

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
            <Route path="/load-test" element={<LoadTestPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

function HomeLoader() {
  return <Home />;
}

export default App;

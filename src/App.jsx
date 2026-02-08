import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import ReportDetails from './pages/ReportDetails';
import Compare from './pages/Compare';
import History from './pages/History';
import Settings from './pages/Settings';
import Suggestions from './pages/Suggestions';
import CICD from './pages/CICD';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report/:id" element={<ReportDetails />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/cicd" element={<CICD />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

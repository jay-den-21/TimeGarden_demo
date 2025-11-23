import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseTasks from './pages/BrowseTasks';
import TaskCreate from './pages/TaskCreate';
import TaskDetails from './pages/TaskDetails';
import Wallet from './pages/Wallet';
import Contracts from './pages/Contracts';
import ContractDetails from './pages/ContractDetails';
import Messages from './pages/Messages';
import Proposals from './pages/Proposals';
import { isAuthenticated } from './services/authService';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  // For now, we'll allow access (since we don't have full auth yet)
  // In production, check: if (!isAuthenticated()) return <Navigate to="/login" />;
  return children;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/browse" element={<BrowseTasks />} />
                <Route path="/create-task" element={<ProtectedRoute><TaskCreate /></ProtectedRoute>} />
                <Route path="/task/:id" element={<TaskDetails />} />
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
                <Route path="/contracts/:id" element={<ProtectedRoute><ContractDetails /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
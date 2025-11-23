import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BrowseTasks from './pages/BrowseTasks';
import TaskCreate from './pages/TaskCreate';
import TaskDetails from './pages/TaskDetails';
import Wallet from './pages/Wallet';
import Contracts from './pages/Contracts';
import ContractDetails from './pages/ContractDetails';
import Messages from './pages/Messages';
import Proposals from './pages/Proposals';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/browse" element={<BrowseTasks />} />
          <Route path="/create-task" element={<TaskCreate />} />
          <Route path="/task/:id" element={<TaskDetails />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/contracts/:id" element={<ContractDetails />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/proposals" element={<Proposals />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
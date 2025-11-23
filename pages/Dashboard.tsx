import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, CheckCircle, AlertCircle, MessageCircle, Loader2 } from 'lucide-react';
import { getWalletData, getMyTasks, getMyProposals, getMyContracts, getCurrentUser } from '../services/mockDatabase';
import { User, WalletData, Task, Proposal, Contract } from '../types';

const ActionRow = ({ icon: Icon, text, time, type }: { icon: any; text: string; time: string; type: 'alert' | 'info' | 'success' }) => {
  const colors = {
    alert: 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400',
    info: 'bg-blue-50 text-blue-700 border-l-4 border-blue-400',
    success: 'bg-green-50 text-green-700 border-l-4 border-green-400',
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-r-lg ${colors[type]} mb-3`}>
      <div className="flex items-center space-x-3">
        <Icon size={18} />
        <span className="text-sm font-medium">{text}</span>
      </div>
      <span className="text-xs opacity-70">{time}</span>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, escrowBalance: 0 });
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [myContracts, setMyContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [u, w, t, p, c] = await Promise.all([
        getCurrentUser(),
        getWalletData(),
        getMyTasks(),
        getMyProposals(),
        getMyContracts()
      ]);
      setUser(u);
      setWallet(w);
      setMyTasks(t);
      setMyProposals(p);
      setMyContracts(c);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500">Welcome back, {user?.displayName}! Here's what's happening.</p>
        </div>
        <Link 
          to="/create-task" 
          className="hidden md:flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Post New Task
        </Link>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-white opacity-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <p className="text-blue-100 font-medium mb-1">Total Balance</p>
            <h3 className="text-4xl md:text-5xl font-bold mb-6">{(wallet.balance + wallet.escrowBalance).toFixed(2)} TC</h3>
            
            <div className="flex space-x-8">
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider">Available</p>
                <p className="text-xl font-semibold">{wallet.balance.toFixed(2)} TC</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider">In Escrow</p>
                <p className="text-xl font-semibold">{wallet.escrowBalance.toFixed(2)} TC</p>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 flex flex-col space-y-3 w-full md:w-auto">
            <Link to="/wallet" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2 rounded-lg font-medium text-center transition-colors">
              View Wallet
            </Link>
            <Link to="/wallet" className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium text-center transition-colors shadow-sm">
              Add Funds
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800">My Tasks</h4>
                <Link to="/browse" className="text-xs text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Posted</span> <span>{myTasks.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Active</span> <span>{myTasks.filter(t => t.status === 'active' || t.status === 'in-progress').length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Completed</span> <span>{myTasks.filter(t => t.status === 'completed').length}</span></div>
            </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800">My Proposals</h4>
                <Link to="/proposals" className="text-xs text-blue-600 hover:underline">View All</Link>
            </div>
             <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Sent</span> <span>{myProposals.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Accepted</span> <span>{myProposals.filter(p => p.status === 'accepted').length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pending</span> <span>{myProposals.filter(p => p.status === 'pending').length}</span></div>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
             <h4 className="font-semibold text-gray-800 mb-4">My Contracts</h4>
             <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Active</span> <span>{myContracts.filter(c => c.status === 'active' || c.status === 'in-progress').length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Awaiting Review</span> <span>{myContracts.filter(c => c.status === 'awaiting_review').length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Completed</span> <span>{myContracts.filter(c => c.status === 'completed').length}</span></div>
             </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Actions</h3>
        <div className="space-y-2">
          {myContracts.find(c => c.status === 'awaiting_review') && (
             <ActionRow 
                icon={AlertCircle} 
                text="Contract needs review: Product Promo Video" 
                time="Today" 
                type="alert" 
            />
          )}
          <ActionRow 
            icon={CheckCircle} 
            text="Proposal accepted for 'Community Garden Website'" 
            time="2 days ago" 
            type="success" 
          />
          <ActionRow 
            icon={MessageCircle} 
            text="Unread message from FrankH" 
            time="1 hour ago" 
            type="info" 
          />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <button className="text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center w-full">
                View All Activity <ArrowRight size={14} className="ml-1" />
            </button>
        </div>
      </div>
      
      <Link 
          to="/create-task" 
          className="md:hidden flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-lg"
        >
          <Plus size={18} className="mr-2" />
          Post New Task
        </Link>
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Download, Lock, Loader2 } from 'lucide-react';
import { getWalletData, getMyTransactions, exportTransactions } from '../services/mockDatabase';
import { WalletData, Transaction } from '../types';

const MOCK_CHART_DATA = [
  { name: 'Feb', earned: 30, spent: 45 },
  { name: 'Mar', earned: 85, spent: 60 },
  { name: 'Apr', earned: 120, spent: 30 },
  { name: 'May', earned: 50, spent: 90 },
];

const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, escrowBalance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([getWalletData(), getMyTransactions()]).then(([w, t]) => {
      setWallet(w);
      setTransactions(t);
      setLoading(false);
    });
  }, []);

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    setExporting(true);
    try {
      const blob = await exportTransactions(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
             <h2 className="text-2xl font-bold text-gray-900">Wallet & Transactions</h2>
             <p className="text-gray-500">Manage your Time Coins and view transaction history</p>
        </div>
        <div className="flex space-x-3">
            <div className="relative">
              <button 
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Download size={16} className="mr-2"/>
                {exporting ? 'Exporting...' : 'Export JSON'}
              </button>
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block">
                <button 
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Export CSV
                </button>
              </div>
            </div>
        </div>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
             <p className="text-blue-100 font-medium mb-1">Total Balance</p>
            <h3 className="text-5xl font-bold mb-8">{(wallet.balance + wallet.escrowBalance).toFixed(2)} TC</h3>
            
            <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-6">
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Available</p>
                <p className="text-2xl font-semibold">{wallet.balance.toFixed(2)} TC</p>
              </div>
              <div>
                <div className="flex items-center text-blue-200 text-xs uppercase tracking-wider mb-1">
                     In Escrow <Lock size={12} className="ml-1" />
                </div>
                <p className="text-2xl font-semibold">{wallet.escrowBalance.toFixed(2)} TC</p>
              </div>
            </div>
        </div>

        {/* Mini Analytics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center">
             <h4 className="font-semibold text-gray-800 mb-6">This Month</h4>
             <div className="space-y-6">
                 <div>
                     <p className="text-sm text-gray-500 mb-1">Earned</p>
                     <div className="flex items-center text-green-600 font-bold text-xl">
                         <ArrowUpRight size={20} className="mr-1" /> + 50 TC
                     </div>
                 </div>
                 <div>
                     <p className="text-sm text-gray-500 mb-1">Spent</p>
                     <div className="flex items-center text-gray-800 font-bold text-xl">
                         <ArrowDownLeft size={20} className="mr-1" /> - 90 TC
                     </div>
                 </div>
             </div>
        </div>
      </div>
    
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <button 
             onClick={() => handleExport('json')}
             className="p-4 bg-pink-50 hover:bg-pink-100 rounded-xl border border-pink-100 transition-colors text-left group"
           >
                <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-pink-700 mb-2 group-hover:scale-110 transition-transform">
                    <Download size={16} />
                </div>
                <div className="font-semibold text-pink-900">Statements</div>
                <div className="text-xs text-pink-700">Download reports</div>
           </button>
      </div>

      {/* Analytics Chart & History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
              <div className="flex items-center space-x-2">
                <select className="text-sm border-gray-300 border rounded-lg px-2 py-1">
                    <option>All Time</option>
                    <option>This Month</option>
                </select>
                <button
                  onClick={() => handleExport('csv')}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Export CSV
                </button>
              </div>
          </div>

          <div className="space-y-4">
              {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                      <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              t.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                              {t.type === 'escrow_release' || t.type === 'credit' ? <ArrowDownLeft size={18} /> : 
                               t.type === 'debit' || t.type === 'escrow_lock' ? <Lock size={18} /> :
                               <ArrowUpRight size={18} />}
                          </div>
                          <div>
                              <p className="font-medium text-gray-900">{t.description}</p>
                              <p className="text-xs text-gray-400">#{t.id} • {t.date} • <span className="capitalize">{t.type.replace('_', ' ')}</span></p>
                          </div>
                      </div>
                      <div className={`font-bold ${t.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {t.amount > 0 ? '+' : ''} {Math.abs(t.amount)} TC
                      </div>
                  </div>
              ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
               <h4 className="text-sm font-bold text-gray-700 mb-4">Monthly Activity (Projected)</h4>
               <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CHART_DATA}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{fill: '#f3f4f6'}}
                        />
                        <Bar dataKey="earned" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
               </div>
          </div>
      </div>
    </div>
  );
};

export default Wallet;

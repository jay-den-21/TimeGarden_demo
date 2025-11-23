import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ContractStatus, Contract } from '../types';
import { CheckCircle, Clock, AlertCircle, Package, ChevronRight, Loader2 } from 'lucide-react';
import { getMyContracts } from '../services/mockDatabase';

const StatusBadge = ({ status }: { status: ContractStatus }) => {
    const styles = {
        [ContractStatus.ACTIVE]: 'bg-blue-100 text-blue-700',
        [ContractStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
        [ContractStatus.COMPLETED]: 'bg-green-100 text-green-700',
        [ContractStatus.DELIVERED]: 'bg-purple-100 text-purple-700',
        [ContractStatus.AWAITING_ESCROW]: 'bg-yellow-100 text-yellow-700',
        [ContractStatus.AWAITING_REVIEW]: 'bg-yellow-100 text-yellow-700',
        [ContractStatus.DISPUTED]: 'bg-red-100 text-red-700',
        [ContractStatus.CANCELLED]: 'bg-gray-100 text-gray-700',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

const Contracts: React.FC = () => {
  const [myContracts, setMyContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyContracts().then(c => {
        setMyContracts(c);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Contracts</h2>
        <p className="text-gray-500">Manage your active and completed contracts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between">
               <div>
                   <p className="text-gray-500 text-sm">Active/In Progress</p>
                   <p className="text-3xl font-bold text-blue-600">{myContracts.filter(c => c.status === 'active' || c.status === 'in-progress').length}</p>
               </div>
               <Clock size={32} className="text-gray-200" />
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between">
               <div>
                   <p className="text-gray-500 text-sm">Awaiting Review</p>
                   <p className="text-3xl font-bold text-purple-600">{myContracts.filter(c => c.status === 'awaiting_review').length}</p>
               </div>
               <Package size={32} className="text-gray-200" />
          </div>
           <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between">
               <div>
                   <p className="text-gray-500 text-sm">Completed</p>
                   <p className="text-3xl font-bold text-green-600">{myContracts.filter(c => c.status === 'completed').length}</p>
               </div>
               <CheckCircle size={32} className="text-gray-200" />
          </div>
      </div>

      {/* Contract List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">All Contracts</h3>
              <select className="text-sm border-gray-300 border rounded px-2 py-1">
                  <option>All Roles</option>
                  <option>Requester</option>
                  <option>Provider</option>
              </select>
          </div>
          
          <div className="divide-y divide-gray-100">
              {myContracts.map(contract => (
                  <div key={contract.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-bold text-gray-900 text-lg">{contract.taskTitle}</h4>
                                  <StatusBadge status={contract.status} />
                              </div>
                              <div className="flex items-center text-sm text-gray-500 space-x-4">
                                  <span>ID: #{contract.id}</span>
                                  <span>Start: {contract.startDate}</span>
                                  <span>•</span>
                                  <span>{contract.amount} TC</span>
                              </div>
                          </div>

                          <div className="flex items-center space-x-6">
                              <div className="text-right hidden md:block">
                                  <p className="text-xs text-gray-400 uppercase tracking-wide">Partner</p>
                                  <p className="text-sm font-medium text-gray-800">{contract.providerName}</p>
                              </div>
                              
                               <Link 
                                to={`/contracts/${contract.id}`}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                              >
                                View Details <ChevronRight size={16} className="ml-1" />
                              </Link>
                          </div>
                      </div>
                      
                      {contract.status === ContractStatus.AWAITING_REVIEW && (
                          <div className="mt-4 bg-purple-50 text-purple-800 text-sm p-3 rounded-lg flex items-center">
                              <AlertCircle size={16} className="mr-2" />
                              Action Required: Review deliverables and release payment
                          </div>
                      )}
                  </div>
              ))}
              {myContracts.length === 0 && (
                   <div className="p-8 text-center text-gray-500">No contracts found.</div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Contracts;
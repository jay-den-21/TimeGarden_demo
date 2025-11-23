import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Loader2, ArrowRight, ChevronRight } from 'lucide-react';
import { getMyProposals } from '../services/mockDatabase';
import { Proposal } from '../types';

const Proposals: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    getMyProposals().then(data => {
      setProposals(data);
      setLoading(false);
    });
  }, []);

  const filteredProposals = proposals.filter(p => 
    filter === 'all' ? true : p.status === filter
  );

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'accepted': return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1"/> Accepted</span>;
      case 'rejected': return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} className="mr-1"/> Rejected</span>;
      default: return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1"/> Pending</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Proposals</h2>
        <p className="text-gray-500">Track the status of your job applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">Total Sent</p>
            <p className="text-2xl font-bold text-gray-900">{proposals.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{proposals.filter(p => p.status === 'accepted').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{proposals.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{proposals.filter(p => p.status === 'rejected').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'accepted', 'rejected'].map(f => (
             <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === f 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
             >
                 {f}
             </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredProposals.length > 0 ? (
            filteredProposals.map(proposal => (
                <div key={proposal.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{proposal.taskTitle}</h3>
                                {getStatusBadge(proposal.status)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                                <span>Applied: {proposal.createdAt}</span>
                                <span>•</span>
                                <span className="font-medium text-gray-700">Bid: {proposal.amount} TC</span>
                            </div>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm italic line-clamp-2">
                                "{proposal.message}"
                            </p>
                        </div>
                        
                        <div className="flex items-center md:flex-col gap-2 shrink-0">
                            <Link 
                                to={`/task/${proposal.taskId}`} 
                                className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 w-full md:w-auto"
                            >
                                View Task <ArrowRight size={16} className="ml-1" />
                            </Link>
                             {proposal.status === 'accepted' && (
                                <Link 
                                    to="/contracts" 
                                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 w-full md:w-auto"
                                >
                                    Go to Contract
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No proposals found</h3>
                <p className="text-gray-500 mb-4">You haven't submitted any proposals in this category.</p>
                <Link to="/browse" className="inline-flex items-center text-blue-600 font-medium hover:underline">
                    Browse Tasks <ChevronRight size={16} />
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default Proposals;
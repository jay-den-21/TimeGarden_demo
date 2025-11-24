import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, FileText, Loader2, MessageCircle, XCircle } from 'lucide-react';
import { getReceivedProposals, updateProposalStatus, initiateThread } from '../services/mockDatabase';
import { Proposal } from '../types';

const statusBadge = (status: Proposal['status']) => {
  switch (status) {
    case 'accepted':
      return (
        <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" /> Accepted
        </span>
      );
    case 'rejected':
      return (
        <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={12} className="mr-1" /> Declined
        </span>
      );
    default:
      return (
        <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={12} className="mr-1" /> Pending
        </span>
      );
  }
};

const ReceivedProposals: React.FC = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [actioningId, setActioningId] = useState<number | null>(null);

  useEffect(() => {
    getReceivedProposals()
      .then((data) => setProposals(data))
      .catch((err: any) => alert(err.message || 'Failed to load proposals'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: number, status: 'accepted' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this proposal?`)) return;
    setActioningId(id);
    try {
      await updateProposalStatus(id, status);
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
      if (status === 'accepted') {
        // Notify layout to refresh wallet header, etc.
        window.dispatchEvent(new Event('auth-state-changed'));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update proposal');
    } finally {
      setActioningId(null);
    }
  };

  const handleMessage = async (taskId: number, applicantId: number) => {
    try {
      await initiateThread(taskId, applicantId);
      navigate('/messages');
    } catch (err: any) {
      alert(err.message || 'Failed to start conversation');
    }
  };

  const filtered = proposals.filter((p) =>
    filter === 'all' ? true : p.status === filter
  );

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Received Proposals</h2>
          <p className="text-gray-500">Review applications submitted for your tasks</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">{proposals.length}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-semibold text-yellow-600">{proposals.filter(p => p.status === 'pending').length}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">Accepted</p>
            <p className="text-lg font-semibold text-green-600">{proposals.filter(p => p.status === 'accepted').length}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">Declined</p>
            <p className="text-lg font-semibold text-red-600">{proposals.filter(p => p.status === 'rejected').length}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['all', 'pending', 'accepted', 'rejected'].map((f) => (
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

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {proposal.taskTitle || 'Untitled Task'}
                    </h3>
                    {statusBadge(proposal.status)}
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-3 gap-3">
                    <span>From: <span className="font-medium text-gray-700">{proposal.applicantName || 'Applicant'}</span></span>
                    <span>•</span>
                    <span>Bid: <span className="font-semibold text-gray-800">{proposal.amount} TC</span></span>
                    {proposal.createdAt && (
                      <>
                        <span>•</span>
                        <span>Received: {proposal.createdAt}</span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                    {proposal.message}
                  </p>
                </div>
                <div className="flex items-center md:flex-col gap-2 shrink-0">
                  <Link
                    to={`/task/${proposal.taskId}`}
                    className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 w-full md:w-auto"
                  >
                    View Task
                  </Link>
                  <button
                    onClick={() => handleMessage(proposal.taskId, proposal.applicantId)}
                    className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 w-full md:w-auto"
                  >
                    <MessageCircle size={16} className="mr-1" /> Message
                  </button>
                  {proposal.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(proposal.id, 'accepted')}
                        disabled={actioningId === proposal.id}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 w-full md:w-auto disabled:opacity-50"
                      >
                        {actioningId === proposal.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <CheckCircle size={16} className="mr-1" /> Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleStatusChange(proposal.id, 'rejected')}
                        disabled={actioningId === proposal.id}
                        className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 w-full md:w-auto disabled:opacity-50"
                      >
                        {actioningId === proposal.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <XCircle size={16} className="mr-1" /> Decline
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No proposals received</h3>
            <p className="text-gray-500 mb-4">You don’t have any incoming proposals yet.</p>
            <Link to="/my-tasks" className="inline-flex items-center text-blue-600 font-medium hover:underline">
              View My Tasks
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivedProposals;

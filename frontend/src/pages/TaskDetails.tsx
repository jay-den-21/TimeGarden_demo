import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Calendar, MapPin, Users, CheckCircle, XCircle, MessageCircle, Briefcase, Loader2, X } from 'lucide-react';
import { getTaskById, getCurrentUser, getProposalsForTask, createProposal } from '../services/mockDatabase';
import { TaskStatus, Task, Proposal, User } from '../types';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'messages'>('overview');
  
  const [task, setTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Proposal form state
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalAmount, setProposalAmount] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      Promise.all([
        getTaskById(Number(id)),
        getCurrentUser()
      ]).then(([t, u]) => {
        setTask(t);
        setCurrentUser(u);
        if (t) {
          getProposalsForTask(t.id).then(setProposals);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setProposalError(null);

    if (!task || !currentUser) {
      setProposalError('You must be logged in to submit a proposal');
      return;
    }

    if (!proposalAmount || !proposalMessage) {
      setProposalError('Please fill in all fields');
      return;
    }

    const amount = Number(proposalAmount);
    if (isNaN(amount) || amount <= 0) {
      setProposalError('Please enter a valid amount');
      return;
    }

    setSubmittingProposal(true);

    try {
      await createProposal({
        taskId: task.id,
        amount: amount,
        message: proposalMessage,
      });
      
      // Success - close modal, refresh proposals, show success message
      setShowProposalModal(false);
      setProposalAmount('');
      setProposalMessage('');
      
      // Refresh proposals list
      getProposalsForTask(task.id).then(setProposals);
      
      // Optionally show success message or redirect
      alert('Proposal submitted successfully!');
    } catch (err: any) {
      setProposalError(err.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  if (!task) {
    return <div className="p-8 text-center">Task not found</div>;
  }

  const isOwner = task?.posterId === currentUser?.id;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link to="/browse" className="text-sm text-gray-500 hover:text-gray-800 mb-2 inline-block">&larr; Back to Browse</Link>
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold capitalize">{task.category}</span>
                    <span className="flex items-center"><Clock size={14} className="mr-1"/> Posted {task.createdAt || 'Recently'}</span>
                    <span className="flex items-center"><MapPin size={14} className="mr-1"/> Remote</span>
                </div>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{task.budget} TC</div>
                <div className="text-sm text-gray-500">Fixed Budget</div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Overview
            </button>
            {isOwner && (
                <button 
                    onClick={() => setActiveTab('proposals')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'proposals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Proposals ({proposals.length})
                </button>
            )}
             {/* Only show messages tab if owner or if engaged (mock logic simplified to owner for now) */}
             {isOwner && (
                <button 
                    onClick={() => setActiveTab('messages')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'messages' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Messages
                </button>
             )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {task.skills.map(skill => (
                                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'proposals' && (
                <div className="space-y-4 animate-fade-in">
                    {proposals.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">No proposals yet.</div>
                    ) : (
                        proposals.map(proposal => (
                            <div key={proposal.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                            {proposal.applicantName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{proposal.applicantName}</h4>
                                            <p className="text-xs text-gray-500">Applied {proposal.createdAt || 'recently'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-gray-900">{proposal.amount} TC</span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm mb-4">
                                    {proposal.message}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Message</button>
                                    {proposal.status === 'pending' ? (
                                        <>
                                            <button className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">
                                                <XCircle size={16} className="mr-1"/> Reject
                                            </button>
                                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm">
                                                <CheckCircle size={16} className="mr-1"/> Accept
                                            </button>
                                        </>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                            proposal.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {proposal.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            
             {activeTab === 'messages' && (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                    <MessageCircle className="mx-auto mb-2 text-gray-300" size={48} />
                    <p>Check your inbox for threads related to this task.</p>
                    <Link to="/messages" className="text-blue-600 font-medium mt-2 inline-block hover:underline">Go to Messages</Link>
                </div>
            )}
        </div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">About the Client</h4>
                <div className="flex items-center space-x-3 mb-4">
                     <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {task.publisherName.charAt(0)}
                     </div>
                     <div>
                         <p className="font-medium text-gray-900">{task.publisherName}</p>
                         <p className="text-xs text-gray-500">Verified Member</p>
                     </div>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Tasks Posted</span>
                        <span className="font-medium text-gray-900">12</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Hire Rate</span>
                        <span className="font-medium text-gray-900">85%</span>
                    </div>
                </div>
            </div>

            {!isOwner && (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl text-white shadow-lg">
                    <h4 className="font-bold text-lg mb-2">Interested?</h4>
                    <p className="text-blue-100 text-sm mb-6">Submit a proposal to apply for this task. Your Time Coins are protected by escrow.</p>
                    <button 
                        onClick={() => setShowProposalModal(true)}
                        className="w-full bg-white text-blue-600 py-3 rounded-lg font-bold shadow-sm hover:bg-blue-50 transition-colors"
                    >
                        Apply Now
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Submit Your Proposal</h3>
              <button
                onClick={() => {
                  setShowProposalModal(false);
                  setProposalError(null);
                  setProposalAmount('');
                  setProposalMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="p-6 space-y-6">
              {proposalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {proposalError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Bid Amount (Time Coins) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={task.budget}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Max: ${task.budget} TC`}
                    value={proposalAmount}
                    onChange={(e) => setProposalAmount(e.target.value)}
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">TC</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Task budget: {task.budget} TC</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                  placeholder="Explain why you're the right person for this task. Include your relevant experience and approach..."
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This will be visible to the task owner</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowProposalModal(false);
                    setProposalError(null);
                    setProposalAmount('');
                    setProposalMessage('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submittingProposal ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Proposal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
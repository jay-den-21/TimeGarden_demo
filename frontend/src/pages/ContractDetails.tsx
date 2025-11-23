import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Lock, FileText, Upload, Shield, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { ContractStatus, Contract } from '../types';
import { getContractById } from '../services/mockDatabase';
import { getUser } from '../services/authService';

const ContractDetails: React.FC = () => {
  const { id } = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = getUser();

  useEffect(() => {
    if (id) {
        getContractById(Number(id)).then(c => {
            setContract(c);
            setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  if (!contract) {
      return <div className="p-8 text-center">Contract not found.</div>;
  }

  // Logic to determine steps based on status
  const steps = [
    { id: 1, label: 'Unfunded', icon: FileText, done: true },
    { id: 2, label: 'In Escrow', icon: Lock, done: contract.status !== ContractStatus.AWAITING_ESCROW },
    { id: 3, label: 'Released', icon: CheckCircle, done: contract.status === ContractStatus.COMPLETED },
  ];

  const isRequester = currentUser && contract && contract.requesterId === currentUser.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/contracts" className="flex items-center text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeft size={16} className="mr-1"/> Back to Contracts
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Contract #{contract.id}</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full capitalize">
            {contract.status.replace('_', ' ')}
        </span>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex justify-between items-center max-w-2xl mx-auto">
            {/* Progress Line Background */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0 -translate-y-1/2"></div>
            
            {/* Progress Line Active */}
            <div 
                className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 -translate-y-1/2 transition-all duration-500" 
                style={{width: contract.status === 'completed' ? '100%' : contract.status === 'awaiting_escrow' ? '0%' : '50%'}}
            ></div>

            {steps.map((step) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center bg-white px-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-colors ${
                        step.done ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'
                    }`}>
                        <step.icon size={18} />
                    </div>
                    <span className={`text-xs font-medium ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</span>
                </div>
            ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg flex items-center justify-center">
            <Shield size={14} className="mr-2 text-green-600" />
            Funds are held safely in TimeGarden Escrow until deliverables are approved.
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="md:col-span-2 space-y-6">
               <div className="bg-white p-6 rounded-xl border border-gray-200">
                   <h3 className="font-bold text-gray-900 mb-4">{contract.taskTitle}</h3>
                   <div className="space-y-4 text-sm">
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <p className="text-gray-500">Created</p>
                               <p className="font-medium">{contract.startDate}</p>
                           </div>
                           <div>
                               <p className="text-gray-500">Deadline</p>
                               <p className="font-medium">{contract.deadline || 'Open Ended'}</p>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Deliverables Section - Conditional */}
               {contract.status !== ContractStatus.COMPLETED && contract.status !== ContractStatus.CANCELLED && (
                   <div className="bg-white p-6 rounded-xl border border-gray-200">
                       <h3 className="font-bold text-gray-900 mb-4">Deliverables</h3>
                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                           <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                           <p className="text-sm font-medium text-gray-700">Upload deliverables</p>
                           <p className="text-xs text-gray-400 mt-1">ZIP, PNG, PDF up to 50MB</p>
                           <input type="file" className="hidden" />
                       </div>
                       
                       <div className="mt-4">
                           <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                               {isRequester ? 'Review & Release Funds' : 'Mark as Delivered'}
                           </button>
                       </div>
                   </div>
               )}

               {contract.status === ContractStatus.DISPUTED && (
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-800">
                        <div className="flex items-center mb-2 font-bold">
                            <AlertTriangle size={20} className="mr-2" /> Contract Disputed
                        </div>
                        <p className="text-sm">This contract is currently under review by TimeGarden admins due to a reported issue.</p>
                    </div>
               )}
          </div>

          {/* Right: Sidebar Info */}
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                   <h4 className="font-bold text-gray-900 mb-4">Participants</h4>
                   <div className="space-y-4">
                       <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                               <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                                   {contract.requesterName.charAt(0)}
                               </div>
                               <div>
                                   <p className="text-sm font-medium text-gray-900">{contract.requesterName}</p>
                                   <p className="text-xs text-gray-500">Requester {isRequester && '(You)'}</p>
                               </div>
                           </div>
                       </div>
                       <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                               <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                                   {contract.providerName.charAt(0)}
                               </div>
                               <div>
                                   <p className="text-sm font-medium text-gray-900">{contract.providerName}</p>
                                   <p className="text-xs text-gray-500">Provider {!isRequester && '(You)'}</p>
                               </div>
                           </div>
                       </div>
                   </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                   <h4 className="font-bold text-gray-900 mb-4">Payment</h4>
                   <div className="flex justify-between items-center mb-2">
                       <span className="text-gray-600 text-sm">Contract Value</span>
                       <span className="font-bold text-gray-900">{contract.amount} TC</span>
                   </div>
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-gray-600 text-sm">Escrow Status</span>
                       <span className={`text-xs font-bold px-2 py-1 rounded ${
                           contract.status === 'awaiting_escrow' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-50 text-green-600'
                       }`}>
                           {contract.status === 'awaiting_escrow' ? 'UNFUNDED' : 'FUNDED'}
                       </span>
                   </div>
                   <div className="text-xs text-gray-400 border-t pt-3">
                       Funds will be released to the wallet upon Requester approval.
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ContractDetails;
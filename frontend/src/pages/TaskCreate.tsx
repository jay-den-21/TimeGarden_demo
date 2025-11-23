import React, { useState } from 'react';
import { getPriceRecommendation, PriceRecommendation, RecommendationResult } from '../services/geminiService';
import { Loader2, Sparkles, Info, AlertTriangle, XCircle } from 'lucide-react';

const TaskCreate: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    budget: '',
    deadline: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [loadingAI, setLoadingAI] = useState(false);
  const [recommendation, setRecommendation] = useState<PriceRecommendation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const fetchPriceRecommendation = async () => {
    if (!formData.title || !formData.description) return;
    
    setLoadingAI(true);
    setRecommendation(null);
    setAiError(null);

    const result: RecommendationResult = await getPriceRecommendation(
      formData.title,
      formData.description,
      formData.category,
      skills
    );

    if (result.recommendation) {
      setRecommendation(result.recommendation);
    } else {
      setAiError(result.error);
    }

    setLoadingAI(false);
  };

  const applyRecommendedPrice = () => {
    if (recommendation) {
      setFormData({ ...formData, budget: recommendation.recommendedPrice.toString() });
    }
  };
  
  const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg animate-fade-in">
        <div className="flex items-center">
            <XCircle size={20} className="mr-3"/>
            <div className='text-left'>
                <p className="font-bold text-sm">Error</p>
                <p className="text-xs">{message}</p>
            </div>
        </div>
        <button 
            onClick={fetchPriceRecommendation}
            className="text-red-600 text-xs font-medium hover:underline mt-3 text-left"
        >
            Try Again
        </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
        <p className="text-gray-500">Post a task and receive proposals from providers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Basic Info */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs mr-2">1</span> 
                    Basic Information
                </h3>
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Build a responsive website"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        onBlur={fetchPriceRecommendation}
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                        placeholder="Describe your task in detail..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        onBlur={fetchPriceRecommendation}
                    />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option>Programming</option>
                            <option>Design</option>
                            <option>Tutoring</option>
                            <option>Writing</option>
                            <option>Admin</option>
                        </select>
                    </div>
                </div>
            </div>

             {/* Skills */}
             <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs mr-2">2</span> 
                    Required Skills
                </h3>
                <div>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                        placeholder="Type skill and press Enter (e.g., React)"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                    />
                    <div className="flex flex-wrap gap-2 min-h-[2rem]">
                        {skills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="ml-2 text-gray-400 hover:text-red-500">×</button>
                        </span>
                        ))}
                    </div>
                </div>
             </div>

            {/* Budget & Timeline */}
             <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs mr-2">3</span> 
                    Budget & Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Time Coins) *</label>
                        <input 
                            type="number" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="Enter amount"
                            value={formData.budget}
                            onChange={e => setFormData({...formData, budget: e.target.value})}
                        />
                        {recommendation && Number(formData.budget) < recommendation.minPrice && formData.budget !== '' && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center">
                                <AlertTriangle size={12} className="mr-1"/> Below recommended floor ({recommendation.minPrice} TC)
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <input 
                            type="date" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={formData.deadline}
                            onChange={e => setFormData({...formData, deadline: e.target.value})}
                        />
                    </div>
                </div>
             </div>

             <div className="pt-6 flex justify-end space-x-4">
                 <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Save Draft</button>
                 <button className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 font-medium shadow-sm">Publish Task</button>
             </div>

          </form>
        </div>

        {/* Right - AI Pricing Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm sticky top-24">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="text-indigo-600" size={20} />
              <h3 className="font-bold text-indigo-900">AI Price Assistant</h3>
            </div>

            {!formData.title && !formData.description ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    <Info className="mx-auto mb-2 opacity-50" />
                    <p>Fill in task details to generate a price recommendation.</p>
                </div>
            ) : loadingAI ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="animate-spin text-indigo-600 mb-2" size={24} />
                    <p className="text-sm text-indigo-600 font-medium">Analyzing market rates...</p>
                </div>
            ) : aiError ? (
                <ErrorState message={aiError} />
            ) : recommendation ? (
                <div className="space-y-5 animate-fade-in">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Recommended Price</p>
                        <div className="text-4xl font-bold text-gray-900">{recommendation.recommendedPrice} <span className="text-lg text-gray-500 font-normal">TC</span></div>
                        <p className="text-xs text-gray-400">Range: {recommendation.minPrice} - {recommendation.maxPrice} TC</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-indigo-50">
                         <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Confidence Score</span>
                            <span className="font-bold text-indigo-600">{recommendation.confidenceScore}%</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${recommendation.confidenceScore}%`}}></div>
                         </div>
                    </div>

                    <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                        <p className="mb-2 font-medium text-gray-800">Why this price?</p>
                        <p className="text-xs leading-relaxed">{recommendation.reasoning}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                        <span>Acceptance Prediction:</span>
                        <span className={`font-bold ${
                            recommendation.acceptanceRate === 'High' ? 'text-green-600' : 
                            recommendation.acceptanceRate === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>{recommendation.acceptanceRate}</span>
                    </div>

                    <button 
                        onClick={applyRecommendedPrice}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                    >
                        Apply Recommendation
                    </button>
                </div>
            ) : (
                 <div className="text-center py-4">
                    <button 
                        onClick={fetchPriceRecommendation}
                        className="text-indigo-600 text-sm font-medium hover:underline"
                    >
                        Refresh Recommendation
                    </button>
                 </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCreate;
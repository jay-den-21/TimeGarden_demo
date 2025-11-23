import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllTasks } from '../services/mockDatabase';
import { Task } from '../types';

const BrowseTasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hideLowPrice, setHideLowPrice] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTasks().then(tasks => {
      setAllTasks(tasks);
      setLoading(false);
    });
  }, []);

  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
    const isNotLowPrice = hideLowPrice ? task.budget >= 25 : true;

    return matchesSearch && matchesCategory && isNotLowPrice;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Browse Tasks</h2>
        <p className="text-gray-500">Find opportunities to earn Time Coins</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search tasks, skills, or keywords..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <select 
              className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none w-full md:w-48"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Tech">Tech</option>
              <option value="Creative">Creative</option>
              <option value="Academic">Academic</option>
              <option value="Writing">Writing</option>
              <option value="Labor">Labor</option>
            </select>
            
            <div className="hidden md:block h-6 w-px bg-gray-300"></div>

            <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-600 whitespace-nowrap">
              <input 
                type="checkbox" 
                checked={hideLowPrice}
                onChange={(e) => setHideLowPrice(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500" 
              />
              <span>Hide low-price tasks (&lt;25 TC)</span>
            </label>
          </div>
          
          <button className="flex items-center text-gray-500 hover:text-gray-800 text-sm font-medium">
             <Filter size={16} className="mr-1"/> More Filters
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
        ) : (
          <>
            {filteredTasks.map(task => (
              <div key={task.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {task.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    {task.budget < 25 && !hideLowPrice && (
                        <span className="mb-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase font-bold rounded-full flex items-center">
                            <AlertTriangle size={10} className="mr-1" /> Low Price
                        </span>
                    )}
                    <div className="text-xl font-bold text-blue-600">{task.budget} TC</div>
                    <span className="text-xs text-gray-400">Fixed Price</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <div className="flex space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>Due {task.deadline}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      <span>{task.proposalsCount} Proposals</span>
                    </div>
                    <div className="hidden sm:flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        {task.publisherName}
                    </div>
                    <div className="hidden sm:flex items-center capitalize">
                        <span className={`w-2 h-2 rounded-full mr-2 ${task.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {task.status.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/task/${task.id}`}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
            
            {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No tasks found matching your criteria.</p>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseTasks;
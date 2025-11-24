import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Task } from '../types/types';
import { getMyTasks } from '../services/mockDatabase';

const MyTasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            const myTasks = await getMyTasks();
            setTasks(myTasks);
        };
        fetchTasks();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(task => (
                    <div key={task.id} className="border p-4 rounded-lg">
                        <h2 className="text-xl font-bold">{task.title}</h2>
                        <p>{task.description}</p>
                        <p>Status: {task.status}</p>
                        <p>Budget: ${task.budget}</p>
                        <Link to={`/task/${task.id}`} className="text-blue-500">View Details</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyTasks;

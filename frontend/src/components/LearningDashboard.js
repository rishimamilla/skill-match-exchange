import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LearningDashboard = ({ exchangeId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', deadline: '' });
  const [newNote, setNewNote] = useState('');
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'Article' });

  useEffect(() => {
    fetchProgress();
  }, [exchangeId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learning-progress/${exchangeId}`);
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      toast.error('Failed to fetch learning progress');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    try {
      const response = await fetch(`/api/learning-progress/${exchangeId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMilestone)
      });
      const data = await response.json();
      setProgress(data);
      setNewMilestone({ title: '', description: '', deadline: '' });
      toast.success('Milestone added successfully');
    } catch (error) {
      toast.error('Failed to add milestone');
    }
  };

  const handleAddNote = async () => {
    try {
      const response = await fetch(`/api/learning-progress/${exchangeId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote })
      });
      const data = await response.json();
      setProgress(data);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleAddResource = async () => {
    try {
      const response = await fetch(`/api/learning-progress/${exchangeId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource)
      });
      const data = await response.json();
      setProgress(data);
      setNewResource({ title: '', url: '', type: 'Article' });
      toast.success('Resource added successfully');
    } catch (error) {
      toast.error('Failed to add resource');
    }
  };

  const chartData = {
    labels: progress?.milestones.map(m => m.title) || [],
    datasets: [
      {
        label: 'Progress',
        data: progress?.milestones.map(m => m.completed ? 100 : 0) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'milestones', 'notes', 'resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900">Current Level</h3>
                  <p className="text-3xl font-bold text-blue-600">{progress?.currentLevel}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900">Progress</h3>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-green-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress?.progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                      />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-600 mt-2">{progress?.progress}%</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900">Hours Spent</h3>
                  <p className="text-3xl font-bold text-purple-600">{progress?.totalHoursSpent}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Chart</h3>
                <Line data={chartData} />
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Milestone</h3>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Milestone Title"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    className="input"
                  />
                  <textarea
                    placeholder="Description"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                    className="input"
                  />
                  <input
                    type="date"
                    value={newMilestone.deadline}
                    onChange={(e) => setNewMilestone({ ...newMilestone, deadline: e.target.value })}
                    className="input"
                  />
                  <button onClick={handleAddMilestone} className="btn-primary">
                    Add Milestone
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {progress?.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium">{milestone.title}</h4>
                      <p className="text-sm text-gray-500">{milestone.description}</p>
                      <p className="text-xs text-gray-400">
                        Deadline: {new Date(milestone.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={() => {/* Handle milestone completion */}}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-500">
                        {milestone.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Note</h3>
                <textarea
                  placeholder="Write your note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="input h-32"
                />
                <button onClick={handleAddNote} className="btn-primary mt-4">
                  Add Note
                </button>
              </div>

              <div className="space-y-4">
                {progress?.notes.map((note, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-800">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Resource</h3>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Resource Title"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="input"
                  />
                  <input
                    type="url"
                    placeholder="Resource URL"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className="input"
                  />
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    className="input"
                  >
                    <option value="Video">Video</option>
                    <option value="Article">Article</option>
                    <option value="Document">Document</option>
                    <option value="Other">Other</option>
                  </select>
                  <button onClick={handleAddResource} className="btn-primary">
                    Add Resource
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {progress?.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium">{resource.title}</h4>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {resource.url}
                      </a>
                      <p className="text-xs text-gray-400">{resource.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={resource.completed}
                        onChange={() => {/* Handle resource completion */}}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-500">
                        {resource.completed ? 'Completed' : 'To Do'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard; 
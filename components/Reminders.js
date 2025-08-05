import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Trash2, Check } from 'lucide-react';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium'
  });

  useEffect(() => {
    // Load reminders from localStorage
    const savedReminders = localStorage.getItem('personalDashboardReminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  const saveReminders = (updatedReminders) => {
    setReminders(updatedReminders);
    localStorage.setItem('personalDashboardReminders', JSON.stringify(updatedReminders));
  };

  const addReminder = () => {
    if (!newReminder.title || !newReminder.date) return;

    const reminder = {
      id: Date.now(),
      ...newReminder,
      completed: false,
      createdAt: new Date().toISOString()
    };

    saveReminders([...reminders, reminder]);
    setNewReminder({ title: '', description: '', date: '', time: '', priority: 'medium' });
    setShowAddForm(false);
  };

  const toggleReminder = (id) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    );
    saveReminders(updatedReminders);
  };

  const deleteReminder = (id) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    saveReminders(updatedReminders);
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}${time ? `T${time}` : ''}`);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(time && { hour: '2-digit', minute: '2-digit' })
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">⏰ Reminders</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Reminder</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Reminder title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-20"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newReminder.date}
                  onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={newReminder.priority}
                onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={addReminder}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
                Add Reminder
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No reminders yet</p>
            <p className="text-gray-400">Click "Add Reminder" to get started</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`border-l-4 ${getPriorityColor(reminder.priority)} rounded-lg p-4 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className={`mt-1 p-1 rounded-full ${
                      reminder.completed
                        ? 'bg-green-600 text-white'
                        : 'border-2 border-gray-300 hover:border-green-600'
                    }`}
                  >
                    <Check size={16} />
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {reminder.title}
                    </h3>
                    {reminder.description && (
                      <p className="text-gray-600 text-sm mt-1">{reminder.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDateTime(reminder.date, reminder.time)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        reminder.priority === 'high' ? 'bg-red-100 text-red-800' :
                        reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {reminder.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reminders;

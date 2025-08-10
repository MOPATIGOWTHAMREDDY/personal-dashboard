import { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Clock, Trash2, Check, Edit2, DollarSign, 
  Target, TrendingUp, TrendingDown, PiggyBank, Receipt,
  FileText, X, Save, AlertCircle, CheckCircle
} from 'lucide-react';

const Remainder = () => {
  const [activeTab, setActiveTab] = useState('reminders');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Personal Dashboard</h1>
          <p className="text-gray-600">Manage your reminders and budget in one place</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'reminders'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ⏰ Reminders
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'budget'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💰 Budget Tracker
          </button>
        </div>

        {/* Content */}
        {activeTab === 'reminders' ? <RemindersComponent /> : <BudgetComponent />}
      </div>
    </div>
  );
};

// Reminders Component
const RemindersComponent = () => {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium',
    category: 'personal'
  });

  useEffect(() => {
    const saved = localStorage.getItem('personalDashboardReminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  }, []);

  const saveReminders = (updatedReminders) => {
    setReminders(updatedReminders);
    localStorage.setItem('personalDashboardReminders', JSON.stringify(updatedReminders));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.date) return;

    if (editingId) {
      const updated = reminders.map(r => 
        r.id === editingId ? { ...r, ...formData } : r
      );
      saveReminders(updated);
      setEditingId(null);
    } else {
      const newReminder = {
        id: Date.now(),
        ...formData,
        completed: false,
        createdAt: new Date().toISOString()
      };
      saveReminders([...reminders, newReminder]);
    }

    setFormData({ title: '', description: '', date: '', time: '', priority: 'medium', category: 'personal' });
    setShowForm(false);
  };

  const editReminder = (reminder) => {
    setFormData(reminder);
    setEditingId(reminder.id);
    setShowForm(true);
  };

  const deleteReminder = (id) => {
    saveReminders(reminders.filter(r => r.id !== id));
  };

  const toggleComplete = (id) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    saveReminders(updated);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-400 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-400 bg-green-50 text-green-800';
      default: return 'border-gray-400 bg-gray-50 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'health': return '🏥';
      case 'shopping': return '🛒';
      default: return '📝';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reminders</h2>
          <p className="text-gray-600">{reminders.length} total reminders</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Reminder' : 'Add New Reminder'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ title: '', description: '', date: '', time: '', priority: 'medium', category: 'personal' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Reminder title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="health">Health</option>
                  <option value="shopping">Shopping</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.date}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>{editingId ? 'Update' : 'Add'}</span>
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ title: '', description: '', date: '', time: '', priority: 'medium', category: 'personal' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors"
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
          <div className="text-center py-16">
            <Clock size={80} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No reminders yet</h3>
            <p className="text-gray-400">Create your first reminder to get started!</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 ${getPriorityColor(reminder.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <button
                    onClick={() => toggleComplete(reminder.id)}
                    className={`mt-1 p-2 rounded-full transition-all duration-200 ${
                      reminder.completed
                        ? 'bg-green-500 text-white'
                        : 'border-2 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    <Check size={16} />
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getCategoryIcon(reminder.category)}</span>
                      <h3 className={`font-bold text-lg ${
                        reminder.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {reminder.title}
                      </h3>
                    </div>
                    
                    {reminder.description && (
                      <p className="text-gray-600 mb-3 leading-relaxed">{reminder.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
                        <Calendar size={14} />
                        <span>{new Date(reminder.date).toLocaleDateString()}</span>
                        {reminder.time && (
                          <>
                            <Clock size={14} />
                            <span>{reminder.time}</span>
                          </>
                        )}
                      </div>
                      
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => editReminder(reminder)}
                    className="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Budget Component
const BudgetComponent = () => {
  const [budget, setBudget] = useState({
    monthlyIncome: 0,
    expenses: [],
    notes: []
  });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    const saved = localStorage.getItem('personalDashboardBudget');
    if (saved) {
      setBudget(JSON.parse(saved));
    }
  }, []);

  const saveBudget = (updatedBudget) => {
    setBudget(updatedBudget);
    localStorage.setItem('personalDashboardBudget', JSON.stringify(updatedBudget));
  };

  const addExpense = () => {
    if (!expenseForm.title || !expenseForm.amount) return;

    const expense = {
      id: Date.now(),
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      createdAt: new Date().toISOString()
    };

    if (editingExpenseId) {
      const updatedExpenses = budget.expenses.map(exp =>
        exp.id === editingExpenseId ? { ...exp, ...expenseForm, amount: parseFloat(expenseForm.amount) } : exp
      );
      saveBudget({ ...budget, expenses: updatedExpenses });
      setEditingExpenseId(null);
    } else {
      saveBudget({ ...budget, expenses: [...budget.expenses, expense] });
    }

    setExpenseForm({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], description: '' });
    setShowExpenseForm(false);
  };

  const addNote = () => {
    if (!noteForm.title || !noteForm.content) return;

    const note = {
      id: Date.now(),
      ...noteForm,
      createdAt: new Date().toISOString()
    };

    if (editingNoteId) {
      const updatedNotes = budget.notes.map(note =>
        note.id === editingNoteId ? { ...note, ...noteForm } : note
      );
      saveBudget({ ...budget, notes: updatedNotes });
      setEditingNoteId(null);
    } else {
      saveBudget({ ...budget, notes: [...budget.notes, note] });
    }

    setNoteForm({ title: '', content: '', category: 'general' });
    setShowNoteForm(false);
  };

  const deleteExpense = (id) => {
    const updatedExpenses = budget.expenses.filter(exp => exp.id !== id);
    saveBudget({ ...budget, expenses: updatedExpenses });
  };

  const deleteNote = (id) => {
    const updatedNotes = budget.notes.filter(note => note.id !== id);
    saveBudget({ ...budget, notes: updatedNotes });
  };

  const editExpense = (expense) => {
    setExpenseForm(expense);
    setEditingExpenseId(expense.id);
    setShowExpenseForm(true);
  };

  const editNote = (note) => {
    setNoteForm(note);
    setEditingNoteId(note.id);
    setShowNoteForm(true);
  };

  const totalExpenses = budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = budget.monthlyIncome - totalExpenses;

  const expensesByCategory = budget.expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food': return '🍽️';
      case 'transport': return '🚗';
      case 'entertainment': return '🎬';
      case 'shopping': return '🛒';
      case 'bills': return '💡';
      case 'health': return '🏥';
      default: return '💰';
    }
  };

  const getNoteIcon = (category) => {
    switch (category) {
      case 'ideas': return '💡';
      case 'goals': return '🎯';
      case 'reminders': return '📝';
      default: return '📄';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget Tracker</h2>
        <p className="text-gray-600">Track your income, expenses, and financial goals</p>
      </div>

      {/* Income Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <DollarSign className="mr-2 text-green-500" size={24} />
          Monthly Income
        </h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            placeholder="Enter your monthly income"
            value={budget.monthlyIncome}
            onChange={(e) => saveBudget({ ...budget, monthlyIncome: parseFloat(e.target.value) || 0 })}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <div className="text-2xl font-bold text-green-600">
            ${budget.monthlyIncome.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Income</p>
              <p className="text-2xl font-bold">${budget.monthlyIncome.toLocaleString()}</p>
            </div>
            <TrendingUp size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
            </div>
            <TrendingDown size={32} className="text-red-200" />
          </div>
        </div>

        <div className={`bg-gradient-to-r ${remainingBudget >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white rounded-2xl p-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${remainingBudget >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm`}>
                {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
              </p>
              <p className="text-2xl font-bold">${Math.abs(remainingBudget).toLocaleString()}</p>
            </div>
            <PiggyBank size={32} className={remainingBudget >= 0 ? 'text-blue-200' : 'text-orange-200'} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setShowExpenseForm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
        <button
          onClick={() => setShowNoteForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <FileText size={20} />
          <span>Add Note</span>
        </button>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={() => {
                  setShowExpenseForm(false);
                  setEditingExpenseId(null);
                  setExpenseForm({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], description: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Expense title"
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              
              <input
                type="number"
                placeholder="Amount"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="food">Food & Dining</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills & Utilities</option>
                  <option value="health">Healthcare</option>
                  <option value="other">Other</option>
                </select>
                
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <textarea
                placeholder="Description (optional)"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addExpense}
                disabled={!expenseForm.title || !expenseForm.amount}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>{editingExpenseId ? 'Update' : 'Add'}</span>
              </button>
              <button
                onClick={() => {
                  setShowExpenseForm(false);
                  setEditingExpenseId(null);
                  setExpenseForm({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], description: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingNoteId ? 'Edit Note' : 'Add New Note'}
              </h3>
              <button
                onClick={() => {
                  setShowNoteForm(false);
                  setEditingNoteId(null);
                  setNoteForm({ title: '', content: '', category: 'general' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Note title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <select
                value={noteForm.category}
                onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">General</option>
                <option value="ideas">Ideas</option>
                <option value="goals">Goals</option>
                <option value="reminders">Reminders</option>
              </select>
              
              <textarea
                placeholder="Write your note here..."
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addNote}
                disabled={!noteForm.title || !noteForm.content}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>{editingNoteId ? 'Update' : 'Add'}</span>
              </button>
              <button
                onClick={() => {
                  setShowNoteForm(false);
                  setEditingNoteId(null);
                  setNoteForm({ title: '', content: '', category: 'general' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Receipt className="mr-2 text-red-500" size={24} />
            Recent Expenses ({budget.expenses.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {budget.expenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No expenses yet</p>
              </div>
            ) : (
              budget.expenses.map((expense) => (
                <div key={expense.id} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{expense.title}</h4>
                        <p className="text-sm text-gray-500 capitalize">{expense.category}</p>
                        <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                        {expense.description && (
                          <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-red-600">-${expense.amount}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => editExpense(expense)}
                          className="text-indigo-500 hover:text-indigo-700 p-1"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="mr-2 text-blue-500" size={24} />
            Notes ({budget.notes.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {budget.notes.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No notes yet</p>
              </div>
            ) : (
              budget.notes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getNoteIcon(note.category)}</span>
                      <h4 className="font-semibold text-gray-900">{note.title}</h4>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => editNote(note)}
                        className="text-indigo-500 hover:text-indigo-700 p-1"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                      {note.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Expenses by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryIcon(category)}</span>
                    <span className="font-medium capitalize text-gray-700">{category}</span>
                  </div>
                  <span className="font-bold text-red-600">${amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Remainder;

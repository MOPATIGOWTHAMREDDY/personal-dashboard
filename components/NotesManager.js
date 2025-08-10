import { useState, useEffect } from 'react';
import { 
  StickyNote, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Star, 
  Clock, 
  Tag, 
  AlertCircle, 
  CheckCircle2,
  X,
  Calendar,
  Bell,
  Filter,
  Archive,
  MoreHorizontal
} from 'lucide-react';

const NotesManager = () => {
  const [notes, setNotes] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [editingNote, setEditingNote] = useState(null);

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    reminder: '',
    tags: []
  });

  const categories = [
    { id: 'general', name: 'General', color: 'bg-blue-500' },
    { id: 'work', name: 'Work', color: 'bg-purple-500' },
    { id: 'personal', name: 'Personal', color: 'bg-green-500' },
    { id: 'finance', name: 'Finance', color: 'bg-yellow-500' },
    { id: 'health', name: 'Health', color: 'bg-red-500' },
    { id: 'travel', name: 'Travel', color: 'bg-indigo-500' },
    { id: 'shopping', name: 'Shopping', color: 'bg-pink-500' }
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: 'text-gray-400', icon: MoreHorizontal },
    { id: 'normal', name: 'Normal', color: 'text-blue-400', icon: Clock },
    { id: 'high', name: 'High', color: 'text-yellow-400', icon: AlertCircle },
    { id: 'urgent', name: 'Urgent', color: 'text-red-400', icon: Star }
  ];

  const filters = [
    { id: 'all', name: 'All Notes' },
    { id: 'important', name: 'Important' },
    { id: 'reminders', name: 'With Reminders' },
    { id: 'recent', name: 'Recent' }
  ];

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const savedNotes = localStorage.getItem('personal_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  };

  const saveNotes = (updatedNotes) => {
    setNotes(updatedNotes);
    localStorage.setItem('personal_notes', JSON.stringify(updatedNotes));
  };

  const addNote = () => {
    if (!newNote.title.trim()) return;

    const note = {
      id: Date.now(),
      ...newNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveNotes([note, ...notes]);
    setNewNote({
      title: '',
      content: '',
      category: 'general',
      priority: 'normal',
      reminder: '',
      tags: []
    });
    setShowAddNote(false);
  };

  const deleteNote = (id) => {
    if (confirm('Are you sure you want to delete this note?')) {
      saveNotes(notes.filter(note => note.id !== id));
    }
  };

  const togglePriority = (id) => {
    const updatedNotes = notes.map(note => {
      if (note.id === id) {
        const currentIndex = priorities.findIndex(p => p.id === note.priority);
        const nextIndex = (currentIndex + 1) % priorities.length;
        return { ...note, priority: priorities[nextIndex].id, updatedAt: new Date().toISOString() };
      }
      return note;
    });
    saveNotes(updatedNotes);
  };

  const getFilteredNotes = () => {
    let filtered = notes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected filter
    switch (selectedFilter) {
      case 'important':
        filtered = filtered.filter(note => note.priority === 'high' || note.priority === 'urgent');
        break;
      case 'reminders':
        filtered = filtered.filter(note => note.reminder);
        break;
      case 'recent':
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        filtered = filtered.filter(note => new Date(note.createdAt) >= threeDaysAgo);
        break;
    }

    return filtered.sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotes = getFilteredNotes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <StickyNote className="mr-3 text-yellow-500" size={32} />
              Notes Manager
            </h1>
            <p className="text-gray-400 text-lg">Organize your thoughts and reminders</p>
          </div>
          
          <button
            onClick={() => setShowAddNote(true)}
            className="bg-yellow-600 hover:bg-yellow-700 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <StickyNote className="text-yellow-400 mb-2" size={24} />
            <div className="text-2xl font-bold">{notes.length}</div>
            <div className="text-sm text-gray-400">Total Notes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <Star className="text-red-400 mb-2" size={24} />
            <div className="text-2xl font-bold">{notes.filter(n => n.priority === 'urgent').length}</div>
            <div className="text-sm text-gray-400">Urgent</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <Bell className="text-blue-400 mb-2" size={24} />
            <div className="text-2xl font-bold">{notes.filter(n => n.reminder).length}</div>
            <div className="text-sm text-gray-400">With Reminders</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <Tag className="text-green-400 mb-2" size={24} />
            <div className="text-2xl font-bold">{new Set(notes.map(n => n.category)).size}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
          >
            {filters.map(filter => (
              <option key={filter.id} value={filter.id} className="bg-gray-800">
                {filter.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="px-6 pb-32">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <StickyNote className="mx-auto text-gray-500 mb-4" size={64} />
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">No notes found</h3>
            <p className="text-gray-500">Create your first note to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => {
              const category = categories.find(cat => cat.id === note.category);
              const priority = priorities.find(p => p.id === note.priority);
              const PriorityIcon = priority?.icon || Clock;
              
              return (
                <div key={note.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-3 h-3 ${category?.color} rounded-full`}></div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePriority(note.id)}
                        className={`p-1 rounded-lg transition-colors ${priority?.color}`}
                      >
                        <PriorityIcon size={16} />
                      </button>
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-white mb-2 line-clamp-2">{note.title}</h3>
                  
                  {note.content && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{note.content}</p>
                  )}
                  
                  {note.reminder && (
                    <div className="flex items-center space-x-2 text-xs text-yellow-400 mb-3">
                      <Bell size={12} />
                      <span>Reminder: {new Date(note.reminder).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{category?.name}</span>
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add Note</h3>
              <button
                onClick={() => setShowAddNote(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Title</label>
                <input
                  type="text"
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Content</label>
                <textarea
                  placeholder="Write your note here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id} className="bg-gray-800">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Priority</label>
                  <select
                    value={newNote.priority}
                    onChange={(e) => setNewNote({...newNote, priority: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id} className="bg-gray-800">
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Reminder (Optional)</label>
                <input
                  type="datetime-local"
                  value={newNote.reminder}
                  onChange={(e) => setNewNote({...newNote, reminder: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddNote(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-2xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addNote}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-3 rounded-2xl font-medium transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesManager;

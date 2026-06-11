import React, { useEffect, useState } from 'react';
import { 
  CalendarDays, Plus, Edit, Trash2, CalendarX2, X, Users 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'general',
    venue: '',
    date: '',
    registration_deadline: '',
    registration_link: '',
    poster_url: ''
  });

  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [selectedEventLogs, setSelectedEventLogs] = useState({ event: null, visitors: [], isLoading: false });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const openRegistrations = async (event) => {
    setSelectedEventLogs({ event, visitors: [], isLoading: true });
    setRegistrationsModalOpen(true);
    
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          registered_at,
          user_id,
          profiles:user_id ( name, email, branch, semester )
        `)
        .eq('event_id', event.id)
        .order('registered_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          toast.info("Database table 'event_registrations' is missing. Please create it via SQL.");
        } else {
          toast.error("Failed to fetch registrations.");
        }
        setSelectedEventLogs({ event, visitors: [], isLoading: false });
        return;
      }
      
      setSelectedEventLogs({ event, visitors: data || [], isLoading: false });
    } catch (e) {
      toast.error("An error occurred.");
      setSelectedEventLogs({ event, visitors: [], isLoading: false });
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const eventCode = {
        ...newEvent,
        is_active: true,
        is_pinned: false
      };

      const { data: insertedEvent, error } = await supabase
        .from('events')
        .insert([eventCode])
        .select()
        .single();
        
      if (error) throw error;

      // Auto-add deadline
      const deadlineDate = insertedEvent.registration_deadline || insertedEvent.date;
      if (deadlineDate) {
        const { error: deadlineError } = await supabase.from('deadlines').insert({
          title: 'Register: ' + insertedEvent.title,
          date: deadlineDate,
          type: 'event',
          related_id: insertedEvent.id,
          is_active: true
        });
        if (deadlineError) console.error("Error adding deadline:", deadlineError);
      }

      setEvents([insertedEvent, ...events]);
      setIsAddModalOpen(false);
      setNewEvent({ title: '', description: '', event_type: 'general', venue: '', date: '', registration_deadline: '', registration_link: '', poster_url: '' });
      toast.success('Event added successfully');
    } catch (error) {
      toast.error('Failed to add event');
      console.error(error);
    }
  };

  const toggleStatus = async (id, field, currentVal) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ [field]: !currentVal })
        .eq('id', id);
        
      if (error) throw error;
      setEvents(events.map(e => e.id === id ? { ...e, [field]: !currentVal } : e));
      toast.success('Updated successfully');
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">Manage Events 📅</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CalendarX2 className="w-10 h-10 text-zinc-300 mb-3" />
            <div className="text-zinc-500 font-medium">No events yet</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Event</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Type</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Date</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Venue</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium text-center">Pinned</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium text-center">Active</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {event.poster_url ? (
                          <img src={event.poster_url} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-zinc-400" />
                          </div>
                        )}
                        <span className="font-medium text-sm text-zinc-900">{event.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md capitalize">{event.event_type || 'General'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 max-w-[120px] truncate">{event.venue || 'TBA'}</td>
                    <td className="px-4 py-3 text-center">
                      <div 
                        onClick={() => toggleStatus(event.id, 'is_pinned', event.is_pinned)}
                        className={`inline-block w-10 h-6 rounded-full relative cursor-pointer transition-colors ${event.is_pinned ? 'bg-amber-500' : 'bg-zinc-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${event.is_pinned ? 'left-5' : 'left-1'}`} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div 
                        onClick={() => toggleStatus(event.id, 'is_active', event.is_active)}
                        className={`inline-block w-10 h-6 rounded-full relative cursor-pointer transition-colors ${event.is_active ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${event.is_active ? 'left-5' : 'left-1'}`} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openRegistrations(event)}
                          className="p-1.5 text-zinc-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="View Registrations"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-zinc-400 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteEvent(event.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {registrationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Registered Users</h2>
                <p className="text-sm text-zinc-500 mt-1">{selectedEventLogs.event?.title}</p>
              </div>
              <button 
                onClick={() => setRegistrationsModalOpen(false)} 
                className="text-zinc-400 hover:text-zinc-600 transition-colors bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto max-h-[60vh]">
              {selectedEventLogs.isLoading ? (
                <div className="p-8 text-center text-zinc-400 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-zinc-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                  Loading registrations...
                </div>
              ) : selectedEventLogs.visitors.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Users className="w-12 h-12 text-zinc-200 mb-3" />
                  <div className="text-zinc-500 font-medium text-lg">No one registered yet</div>
                  <p className="text-zinc-400 text-sm mt-1">Users will appear here once they register for the event.</p>
                </div>
              ) : (
                <table className="w-full text-left bg-white">
                  <thead className="bg-white border-b border-zinc-100 sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="px-6 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold bg-white">Student Name</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold bg-white">Branch / Sem</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold text-right bg-white">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEventLogs.visitors.map((reg) => (
                      <tr key={reg.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{reg.profiles?.name || 'Unknown Student'}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{reg.profiles?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-zinc-700 bg-zinc-100 px-2 py-1 rounded inline-block">{reg.profiles?.branch || 'N/A'}</div>
                          <div className="text-xs text-zinc-500 mt-1">Sem {reg.profiles?.semester || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500 text-right font-medium">
                          {new Date(reg.registered_at).toLocaleDateString()}<br/>
                          <span className="text-xs font-normal text-zinc-400">{new Date(reg.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center">
              <div className="text-sm font-medium text-zinc-500">Total: {selectedEventLogs.visitors?.length || 0} students</div>
              <button 
                onClick={() => setRegistrationsModalOpen(false)}
                className="px-5 py-2 font-medium text-zinc-600 bg-white hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-200 shadow-sm leading-none flex items-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Add New Event</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Title *</label>
                <input 
                  required
                  type="text" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Event Type *</label>
                  <select
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="general">General</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Venue</label>
                  <input 
                    type="text" 
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Event Date</label>
                  <input 
                    type="date" 
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Registration Deadline</label>
                  <input 
                    type="date" 
                    value={newEvent.registration_deadline}
                    onChange={(e) => setNewEvent({...newEvent, registration_deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Registration Link</label>
                <input 
                  type="url" 
                  value={newEvent.registration_link}
                  onChange={(e) => setNewEvent({...newEvent, registration_link: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Poster URL</label>
                <input 
                  type="url" 
                  value={newEvent.poster_url}
                  onChange={(e) => setNewEvent({...newEvent, poster_url: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

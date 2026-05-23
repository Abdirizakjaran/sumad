import { useEffect, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import api from '../services/api';
import { connectSocket } from '../services/socket';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const socket = connectSocket();
    socket.on('payment:approved', fetchNotifications);
    socket.on('fine:created', fetchNotifications);
    socket.on('detection:new', fetchNotifications);
    socket.on('dashboard:update', fetchNotifications);
    return () => {
      socket.off('payment:approved');
      socket.off('fine:created');
      socket.off('detection:new');
      socket.off('dashboard:update');
    };
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <FiBell className="text-xl" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 glass rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-semibold">Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-sumad-blue">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-slate-100 dark:border-slate-700 ${
                    !n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

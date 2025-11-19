import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Clock, DollarSign, CheckCircle, XCircle, Tag } from 'lucide-react';
import { chatService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import './ChatList.css';

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchChatSessions();
    }
  }, [user]);

  const fetchChatSessions = async () => {
    try {
      const data = await chatService.getChatSessions(user._id || user.id);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const searchLower = searchQuery.toLowerCase();
    return (
      session.productTitle?.toLowerCase().includes(searchLower) ||
      session.otherUserName?.toLowerCase().includes(searchLower)
    );
  });

  const getLastMessage = (session) => {
    if (!session.messages || session.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMsg = session.messages[session.messages.length - 1];
    if (lastMsg.type === 'bargain_offer') {
      return `💰 Offered $${lastMsg.offerPrice}`;
    } else if (lastMsg.type === 'bargain_accepted') {
      return `✅ Price accepted: $${lastMsg.acceptedPrice}`;
    } else if (lastMsg.type === 'bargain_rejected') {
      return `❌ Offer rejected`;
    } else if (lastMsg.type === 'bargain_counter') {
      return `💬 Counter offer: $${lastMsg.counterPrice}`;
    }
    return lastMsg.message || 'Message';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="chat-list-container">
        <div className="loading-spinner">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h1>Messages</h1>
        <p>Your conversations with buyers and sellers</p>
      </div>

      <div className="chat-list-search">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="chat-sessions-list">
        {filteredSessions.length === 0 ? (
          <div className="no-conversations">
            <MessageCircle className="icon" />
            <h3>No conversations yet</h3>
            <p>Start chatting with sellers or buyers about products!</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session._id || session.id}
              className="chat-session-item"
              onClick={() => navigate(`/chat/${session._id || session.id}`)}
            >
              <div className="session-avatar">
                <MessageCircle className="icon" />
              </div>
              <div className="session-content">
                <div className="session-header">
                  <h3>{session.productTitle || 'Product'}</h3>
                  <span className="session-time">
                    <Clock className="icon" />
                    {formatTime(session.lastMessageTime || session.updatedAt)}
                  </span>
                </div>
                <p className="session-other-user">
                  {user.role === 'seller' ? 'Buyer' : 'Seller'}: {session.otherUserName || 'User'}
                </p>
                <p className="session-last-message">{getLastMessage(session)}</p>
                {session.activeBargain && (
                  <div className="bargain-badge">
                    <Tag className="icon" />
                    Bargaining in progress
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;


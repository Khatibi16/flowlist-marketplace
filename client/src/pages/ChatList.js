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
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchChatSessions = async () => {
    try {
      const userId = user._id || user.id;
      if (!userId) {
        console.error('User ID not available');
        setLoading(false);
        setSessions([]);
        return;
      }
      console.log('Fetching chat sessions for user:', userId);
      const data = await chatService.getChatSessions(userId);
      console.log('Received chat sessions:', data);
      // Always set sessions to an array, even if empty
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Don't show error toast if it's just "no sessions" - that's normal
      if (error.response?.status !== 404) {
        toast.error('Failed to load conversations');
      }
      setSessions([]);
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

  if (!user) {
    return (
      <div className="chat-list-container">
        <div className="error-container">
          <h2>Please login to view messages</h2>
          <p>You need to be logged in to access your conversations.</p>
        </div>
      </div>
    );
  }

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
        {filteredSessions.length === 0 && !loading ? (
          <div className="no-conversations">
            <MessageCircle className="icon" />
            <h3>No conversations yet</h3>
            <p>Start chatting with sellers or buyers about products!</p>
            <p className="hint-text">Click "Chat with Seller" on any product to start a conversation.</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const sessionId = session._id || session.id;
            if (!sessionId) {
              console.warn('Session missing ID:', session);
              return null;
            }
            console.log('ChatList: Session ID to navigate to:', sessionId, 'Type:', typeof sessionId);
            return (
              <div
                key={sessionId}
                className="chat-session-item"
                onClick={() => {
                  console.log('ChatList: Navigating to chat with sessionId:', sessionId);
                  navigate(`/chat/${encodeURIComponent(sessionId)}`);
                }}
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
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;


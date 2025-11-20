import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Tag,
  ArrowLeft,
  ShoppingBag,
  Image as ImageIcon
} from 'lucide-react';
import { chatService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import './Chat.css';

const Chat = () => {
  const { sessionId: rawSessionId } = useParams();
  // Decode the sessionId in case it was URL encoded
  const sessionId = rawSessionId ? decodeURIComponent(rawSessionId) : null;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State declarations
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [bargainPrice, setBargainPrice] = useState('');
  const [showBargainInput, setShowBargainInput] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please login to access chat');
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Log the sessionId when component mounts
  useEffect(() => {
    console.log('Chat component mounted with sessionId:', sessionId);
    console.log('Raw sessionId from params:', rawSessionId);
  }, [sessionId, rawSessionId]);
  
  // Early return if user is not logged in - MUST be before any render logic
  if (!user) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h2>Please login to access chat</h2>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setSession(null);
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSession = async () => {
    if (!sessionId) {
      console.error('No sessionId provided');
      setLoading(false);
      setSession(null);
      return;
    }

    try {
      console.log('=== FRONTEND: Fetching session ===');
      console.log('SessionId from URL:', sessionId);
      console.log('SessionId type:', typeof sessionId);
      const data = await chatService.getSession(sessionId);
      console.log('✅ Session data received:', data);
      if (data && (data._id || data.id)) {
        setSession(data);
        setLoading(false);
      } else {
        console.error('❌ Invalid session data:', data);
        setSession(null);
        setLoading(false);
        toast.error('Chat session not found');
        setTimeout(() => navigate('/chat'), 2000);
      }
    } catch (error) {
      console.error('❌ Failed to fetch session:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setSession(null);
      setLoading(false);
      const errorMsg = error.response?.data?.message || 'Failed to load chat session';
      const errorDetails = error.response?.data;
      if (errorDetails?.availableIds) {
        console.error('Available session IDs:', errorDetails.availableIds);
      }
      toast.error(errorMsg);
      setTimeout(() => navigate('/chat'), 2000);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await chatService.getMessages(sessionId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Add message optimistically
    const userRole = user?.role || 'buyer';
    const tempMessage = {
      id: Date.now().toString(),
      sender: userRole === 'buyer' ? 'buyer' : 'seller',
      message: messageText,
      timestamp: new Date().toISOString(),
      type: 'message'
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      await chatService.sendMessage(sessionId, userRole === 'buyer' ? 'buyer' : 'seller', messageText);
      fetchMessages(); // Refresh to get server timestamp
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const handleBargainOffer = async () => {
    const price = parseFloat(bargainPrice);
    if (!price || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (price >= session.productPrice) {
      toast.error('Bargain price must be lower than the original price');
      return;
    }

    try {
      await chatService.sendBargainOffer(sessionId, price);
      setBargainPrice('');
      setShowBargainInput(false);
      toast.success('Price offer sent!');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send price offer');
    }
  };

  const handleBargainResponse = async (bargainId, action, counterPrice = null) => {
    try {
      await chatService.respondToBargain(sessionId, bargainId, action, counterPrice);
      toast.success(action === 'accept' ? 'Price offer accepted!' : action === 'reject' ? 'Offer rejected' : 'Counter offer sent!');
      fetchMessages();
      fetchSession();
    } catch (error) {
      toast.error('Failed to respond to offer');
    }
  };

  const handleBuyAtBargainPrice = async () => {
    const acceptedBargain = messages
      .filter(m => m.type === 'bargain_accepted')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    if (!acceptedBargain) {
      toast.error('No accepted price offer found');
      return;
    }

    toast.success(`Redirecting to purchase at $${acceptedBargain.acceptedPrice}...`);
    // In a real app, you'd navigate to checkout with the bargain price
    navigate(`/product/${session.productId}?bargainPrice=${acceptedBargain.acceptedPrice}`);
  };

  const getActiveBargain = () => {
    return messages
      .filter(m => m.type === 'bargain_offer' && m.status === 'pending')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  };

  const getAcceptedBargain = () => {
    return messages
      .filter(m => m.type === 'bargain_accepted')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading-spinner">Loading conversation...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="chat-container">
        <div className="error-container">
          <h2>Chat session not found</h2>
          <p>The chat session you're looking for doesn't exist or has been deleted.</p>
          <button onClick={() => navigate('/chat')} className="back-to-chat-btn">
            <ArrowLeft className="icon" />
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  // Safety check - user should exist at this point due to early return above
  // Double check to prevent any null access errors during re-renders
  if (!user || !user.role) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h2>Please login to access chat</h2>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // At this point, user and user.role are guaranteed to exist
  // Use direct access since we've verified user exists above
  const isBuyer = user.role === 'buyer';
  const activeBargain = getActiveBargain();
  const acceptedBargain = getAcceptedBargain();
  const canBargain = isBuyer && !activeBargain && !acceptedBargain;

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <button onClick={() => navigate('/chat')} className="back-button">
          <ArrowLeft className="icon" />
        </button>
        <div className="header-info">
          <h2>{session.productTitle || 'Product'}</h2>
          <p>{isBuyer ? 'Seller' : 'Buyer'}: {session.otherUserName || session.buyerName || session.sellerName || 'User'}</p>
        </div>
        {session.productImage && (
          <img 
            src={`http://localhost:5001${session.productImage}`} 
            alt={session.productTitle}
            className="header-product-image"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>

      {/* Product Info Card */}
      <div className="product-info-card">
        <div className="product-info-content">
          <div>
            <h3>{session.productTitle}</h3>
            <div className="price-info">
              <span className="current-price">${session.productPrice}</span>
              {session.originalPrice && (
                <span className="original-price">${session.originalPrice}</span>
              )}
            </div>
          </div>
          {acceptedBargain && isBuyer && (
            <button onClick={handleBuyAtBargainPrice} className="buy-button">
              <ShoppingBag className="icon" />
              Buy at ${acceptedBargain.acceptedPrice}
            </button>
          )}
        </div>
      </div>

      {/* Active Bargain Card */}
      {activeBargain && (
        <div className="bargain-card">
          <div className="bargain-header">
            <Tag className="icon" />
            <h4>Price Offer</h4>
          </div>
          <div className="bargain-content">
            <p>
              {isBuyer ? 'You offered' : 'Buyer offered'}: <strong>${activeBargain.offerPrice}</strong>
            </p>
            {!isBuyer && (
              <div className="bargain-actions">
                <button
                  onClick={() => handleBargainResponse(activeBargain._id || activeBargain.id, 'accept')}
                  className="accept-button"
                >
                  <CheckCircle className="icon" />
                  Accept
                </button>
                <button
                  onClick={() => handleBargainResponse(activeBargain._id || activeBargain.id, 'reject')}
                  className="reject-button"
                >
                  <XCircle className="icon" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    const counter = prompt('Enter your counter offer price:');
                    if (counter) {
                      handleBargainResponse(activeBargain._id || activeBargain.id, 'counter', parseFloat(counter));
                    }
                  }}
                  className="counter-button"
                >
                  <Tag className="icon" />
                  Counter Offer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Watermark Message */}
      <div className="watermark-message">
        💬 Talk with the {isBuyer ? 'seller' : 'buyer'} or bargain the price
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id || message.id}
              className={`message ${message.sender === (isBuyer ? 'buyer' : 'seller') ? 'message-sent' : 'message-received'}`}
            >
              {message.type === 'bargain_offer' && (
                <div className="bargain-message">
                  <Tag className="icon" />
                  <div>
                    <p className="bargain-label">Price Offer</p>
                    <p className="bargain-price">${message.offerPrice}</p>
                    {message.status === 'pending' && <p className="bargain-status">Waiting for response...</p>}
                  </div>
                </div>
              )}
              {message.type === 'bargain_accepted' && (
                <div className="bargain-message accepted">
                  <CheckCircle className="icon" />
                  <div>
                    <p className="bargain-label">Price Accepted!</p>
                    <p className="bargain-price">${message.acceptedPrice}</p>
                  </div>
                </div>
              )}
              {message.type === 'bargain_rejected' && (
                <div className="bargain-message rejected">
                  <XCircle className="icon" />
                  <div>
                    <p className="bargain-label">Offer Rejected</p>
                  </div>
                </div>
              )}
              {message.type === 'bargain_counter' && (
                <div className="bargain-message counter">
                  <Tag className="icon" />
                  <div>
                    <p className="bargain-label">Counter Offer</p>
                    <p className="bargain-price">${message.counterPrice}</p>
                  </div>
                </div>
              )}
              {message.type === 'message' && (
                <p className="message-text">{message.message}</p>
              )}
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bargain Input */}
      {showBargainInput && canBargain && (
        <div className="bargain-input-card">
          <h4>Make a Price Offer</h4>
          <div className="bargain-input-group">
            <span className="dollar-sign">$</span>
            <input
              type="number"
              placeholder="Enter your offer"
              value={bargainPrice}
              onChange={(e) => setBargainPrice(e.target.value)}
              min="0"
              step="0.01"
              max={session.productPrice}
            />
            <button onClick={handleBargainOffer} className="send-offer-button">
              Send Offer
            </button>
            <button onClick={() => setShowBargainInput(false)} className="cancel-button">
              Cancel
            </button>
          </div>
          <p className="bargain-hint">Original price: ${session.productPrice}</p>
        </div>
      )}

      {/* Message Input */}
      <div className="message-input-container">
        {canBargain && !showBargainInput && (
          <button
            onClick={() => setShowBargainInput(true)}
            className="bargain-button"
            title="Make a price offer"
          >
            <DollarSign className="icon" />
            Bargain
          </button>
        )}
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="message-input"
          />
          <button type="submit" className="send-button">
            <Send className="icon" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

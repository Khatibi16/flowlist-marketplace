import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video,
  Sparkles,
  ShoppingBag,
  Heart,
  Share2
} from 'lucide-react';
import { chatService } from '../services/authService';
import toast from 'react-hot-toast';

const Chat = () => {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await chatService.getMessages(sessionId);
      setMessages(data);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      sender: 'buyer',
      message: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message to server
      await chatService.sendMessage(sessionId, 'buyer', messageText);
      
      // Simulate AI response
      setAiTyping(true);
      setTimeout(async () => {
        try {
          const aiResponse = await chatService.getAIRecommendations(messageText, '1');
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            message: aiResponse.aiResponse,
            timestamp: new Date().toISOString(),
            suggestions: aiResponse.suggestions
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error('AI response failed:', error);
        } finally {
          setAiTyping(false);
        }
      }, 2000);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">AI Shopping Assistant</h2>
                  <p className="text-gray-600">I'm here to help you find the perfect items!</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="card p-6 mb-6">
            <div className="h-96 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'buyer'
                        ? 'bg-purple-600 text-white'
                        : message.sender === 'ai'
                        ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-gray-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm">{message.message}</p>
                    {message.suggestions && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-600">Quick suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-3 py-1 bg-white text-purple-600 rounded-full text-xs hover:bg-purple-50 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {aiTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button className="card p-4 text-center hover:bg-purple-50 transition-colors">
              <ShoppingBag className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Browse Products</span>
            </button>
            <button className="card p-4 text-center hover:bg-purple-50 transition-colors">
              <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium">My Favorites</span>
            </button>
            <button className="card p-4 text-center hover:bg-purple-50 transition-colors">
              <Share2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Share Items</span>
            </button>
            <button className="card p-4 text-center hover:bg-purple-50 transition-colors">
              <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium">AI Styling</span>
            </button>
          </div>

          {/* Message Input */}
          <div className="card p-6">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask me anything about products, styling, or recommendations..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

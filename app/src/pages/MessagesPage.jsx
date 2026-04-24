/**
 * Messages Page
 * Private messaging interface for communicating with friends and family
 */

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { circleAPI } from '../api';
import toast from 'react-hot-toast';
import { Send, CornerUpLeft, ArrowLeft, Check, X, MessageCircle, UserX } from 'lucide-react';

const MessagesPage = () => {
  // Tab management for chats vs message requests
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'requests'

  // Data state
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);

  // UI refs and navigation
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const currentUserId = user?._id || user?.id;

  // Fetch initial data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch messages when friend is selected
  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id);
    }
  }, [selectedFriend]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Fetch friends list and message requests
   */
  const fetchData = async () => {
    try {
      // Fetch friends and message requests in parallel
      const [circleResponse, requestsResponse] = await Promise.all([
        circleAPI.getMyCircle(),
        circleAPI.getMessageRequests()
      ]);

      // Filter for accepted friends/family/colleagues with registered accounts
      const acceptedFriends = (circleResponse.data.circles || []).filter(person =>
        (person.relationship === 'friend' || person.relationship === 'family' || person.relationship === 'colleague') &&
        person.requester && person.status === 'accepted'
      );
      setFriends(acceptedFriends || []);
      setRequests(requestsResponse.data.requests || []);
    } catch (err) {
      toast.error('Error fetching data');
    }
  };

  const fetchMessages = async (friendId) => {
    setLoading(true);
    try {
      const response = await circleAPI.getMessages(friendId);
      setMessages(response.data.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;

    try {
      await circleAPI.sendMessage({
        receiverId: selectedFriend._id,
        text: newMessage,
        replyTo: replyTo?._id
      });
      setNewMessage('');
      setReplyTo(null);
      fetchMessages(selectedFriend._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message for everyone?')) return;
    try {
      await circleAPI.deleteMessage(messageId);
      toast.success('Message deleted');
      setMessages(messages.filter(m => m._id !== messageId));
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleClearChat = async () => {
    if (!selectedFriend) return;
    if (!window.confirm(`Clear entire conversation with ${selectedFriend.username || selectedFriend.name}? This cannot be undone.`)) return;
    try {
      await circleAPI.clearChat(selectedFriend._id);
      toast.success('Chat cleared');
      setMessages([]);
    } catch (err) {
      toast.error('Failed to clear chat');
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      await circleAPI.acceptMessageRequest(senderId);
      toast.success('Request accepted');
      setActiveTab('chats');
      fetchData(); // refresh friends & requests
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (senderId) => {
    if(!window.confirm('Reject and delete request?')) return;
    try {
      await circleAPI.rejectMessageRequest(senderId);
      toast.success('Request deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    document.getElementById('message-input')?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border border-gray-100 flex overflow-hidden" style={{ height: '85vh' }}>
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-100 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 btn-hover"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>

          <div className="flex px-4 pt-4 pb-2 border-b border-gray-100 gap-2">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
                activeTab === 'chats' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`relative flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
                activeTab === 'requests' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Requests
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {requests.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
              {activeTab === 'chats' ? (
                (friends || []).length === 0 ? (
                <div className="p-8 text-gray-400 text-center flex flex-col items-center">
                  <MessageCircle size={48} className="mb-4 opacity-50" />
                  <p>No friends yet. Add some friends to start messaging!</p>
                </div>
              ) : (
                (friends || []).map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => setSelectedFriend({ ...friend.requester || friend })}
                    className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex items-center gap-3 ${
                      selectedFriend?._id === (friend.requester?._id || friend._id) ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {friend.friendUsername ? friend.friendUsername.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{friend.friendUsername || 'User'}</div>
                      <div className="text-xs text-gray-500">View Conversation</div>
                    </div>
                  </div>
                ))
              )
            ) : (
              (requests || []).length === 0 ? (
                <div className="p-8 text-gray-400 text-center flex flex-col items-center">
                  <UserX size={48} className="mb-4 opacity-50" />
                  <p>No pending message requests.</p>
                </div>
              ) : (
                (requests || []).map((reqItem) => (
                  <div key={reqItem.sender._id} className="p-4 border-b border-gray-100 bg-orange-50/50">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                         {reqItem.sender.name.charAt(0)}
                       </div>
                       <div>
                         <div className="font-bold text-gray-900 text-sm">{reqItem.sender.name}</div>
                         <div className="text-xs text-gray-500">Wants to chat</div>
                       </div>
                    </div>
                    <div className="text-sm bg-white p-3 rounded-xl border border-orange-100 text-gray-700 italic mb-3">
                      "{reqItem.lastMessage.text}"
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptRequest(reqItem.sender._id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1">
                        <Check size={14}/> Accept
                      </button>
                      <button onClick={() => handleRejectRequest(reqItem.sender._id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1">
                        <X size={14}/> Reject
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50/50 ${!selectedFriend ? 'hidden md:flex' : 'flex'}`}>
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl shadow-sm">
                    {selectedFriend.username ? selectedFriend.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{selectedFriend.username || selectedFriend.name}</h3>
                    <p className="text-xs text-green-500 font-medium">Connected Friend</p>
                  </div>
                </div>
                <button 
                  onClick={handleClearChat}
                  className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                >
                  Clear Chat
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 my-10">Syncing chat...</div>
                ) : (messages || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageCircle size={64} className="mb-4 opacity-30 text-indigo-300" />
                    <p>Start your conversation here!</p>
                  </div>
                ) : (
                  (messages || []).map((message, index) => {
                    const isCurrentUser = message.sender === currentUserId;
                    const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="flex justify-center my-6">
                            <span className="bg-gray-200/60 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">{formatDate(message.createdAt)}</span>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
                          <div className={`max-w-[75%] lg:max-w-md flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            
                            {/* Reply indicator */}
                            {message.replyTo && (
                              <div className={`mb-1 px-3 py-2 rounded-xl text-xs flex items-center gap-2 opacity-80 backdrop-blur-md ${
                                isCurrentUser ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-gray-200 text-gray-700 border border-gray-300'
                              }`}>
                                <CornerUpLeft size={12} className="opacity-50" />
                                <div className="truncate max-w-[200px]">{message.replyTo.text}</div>
                              </div>
                            )}

                            <div className={`px-5 py-3 rounded-2xl relative shadow-sm group/bubble ${
                              isCurrentUser
                                ? 'bg-white text-gray-800 border border-gray-200 rounded-br-none'
                                : 'bg-[#e7f9e8] text-gray-800 border border-[#d1efd3] rounded-bl-none shadow'
                            }`}>
                              <span className="leading-relaxed">{message.text}</span>
                              
                              {/* Delete message button */}
                              {isCurrentUser && (
                                <button 
                                  onClick={() => handleDeleteMessage(message._id)}
                                  className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover/bubble:opacity-100 transition-all"
                                  title="Delete Message"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 px-1">
                              <span className="text-[10px] font-medium text-gray-400">
                                {formatTime(message.createdAt)}
                              </span>
                              {!isCurrentUser && (
                                <button
                                  onClick={() => handleReply(message)}
                                  className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                >
                                  <CornerUpLeft size={10} /> Reply
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Staging */}
              {replyTo && (
                <div className="px-6 py-3 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-900 text-sm">
                    <CornerUpLeft size={16} className="text-indigo-500"/>
                    <span className="opacity-70">Replying to:</span>
                    <span className="font-bold truncate max-w-xs">{replyTo.text}</span>
                  </div>
                  <button onClick={cancelReply} className="text-indigo-400 hover:text-indigo-800 transition-colors p-1 bg-indigo-100 rounded-full">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-3 bg-gray-50 border border-gray-200 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-400 transition-all shadow-sm">
                  <textarea
                    id="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none px-3 py-3 rounded-xl overflow-y-auto outline-none"
                    rows="1"
                    required
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 mb-1 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:transform-none shadow-md"
                  >
                    <Send size={20} className="ml-1" />
                  </button>
                </div>
                <div className="text-center mt-2">
                   <span className="text-[10px] text-gray-400">Press Enter to send, Shift + Enter for new line</span>
                </div>
              </form>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-indigo-300 shadow-sm border border-gray-100 mb-6">
                 <MessageCircle size={40} />
               </div>
               <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Messages</h3>
               <p className="text-gray-500">Select a conversation or accept a request to start chatting.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
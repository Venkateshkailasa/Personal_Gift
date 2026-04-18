import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { circleAPI } from '../api';

const MessagesPage = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id);
    }
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchFriends = async () => {
    try {
      const response = await circleAPI.getMyCircle();
      // Filter only accepted friends
      const acceptedFriends = response.data.circles.filter(person =>
        person.relationship === 'friend' && person.requester && person.status === 'accepted'
      );
      setFriends(acceptedFriends);
    } catch (err) {
      setError('Failed to fetch friends');
    }
  };

  const fetchMessages = async (friendId) => {
    setLoading(true);
    try {
      const response = await circleAPI.getMessages(friendId);
      setMessages(response.data.messages);
    } catch (err) {
      setError('Failed to fetch messages');
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
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    document.getElementById('message-input').focus();
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg h-[600px] flex">
          {/* Friends List */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Friends</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {friends.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">
                  No friends yet. Add some friends to start messaging!
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedFriend?._id === friend._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">{friend.name}</div>
                    <div className="text-sm text-gray-500">{friend.email}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedFriend ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedFriend.name}</h3>
                  <p className="text-sm text-gray-600">{selectedFriend.email}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isCurrentUser = message.sender === localStorage.getItem('userId');
                      const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                      return (
                        <div key={message._id}>
                          {showDate && (
                            <div className="text-center text-xs text-gray-500 my-4">
                              {formatDate(message.createdAt)}
                            </div>
                          )}
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}>
                              {/* Reply indicator */}
                              {message.replyTo && (
                                <div className={`mb-2 p-2 rounded text-sm ${
                                  isCurrentUser ? 'bg-blue-600' : 'bg-gray-300'
                                }`}>
                                  <div className="text-xs opacity-75">Replying to:</div>
                                  <div className="truncate">{message.replyTo.text}</div>
                                </div>
                              )}

                              <div>{message.text}</div>
                              <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                                {formatTime(message.createdAt)}
                              </div>

                              {/* Reply button */}
                              {!isCurrentUser && (
                                <button
                                  onClick={() => handleReply(message)}
                                  className="text-xs mt-1 opacity-75 hover:opacity-100 underline"
                                >
                                  Reply
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply indicator */}
                {replyTo && (
                  <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">Replying to: </span>
                        <span className="text-sm font-medium">{replyTo.text}</span>
                      </div>
                      <button
                        onClick={cancelReply}
                        className="text-gray-500 hover:text-gray-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      id="message-input"
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a friend to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
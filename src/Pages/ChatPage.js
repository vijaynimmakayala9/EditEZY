import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa"; 
import axios from "axios";

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyCOi06p94fKvs4Qpy_hOZezoZW9QO-qU3o';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-2.0-flash';

const ChatComponent = ({ onBack }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const processMessageWithGemini = async (newMessageContent) => {
    const API_URL = `${GEMINI_BASE}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
      const contents = [];

      for (let msg of chatMessages) {
        if (msg.message && msg.message.trim() !== "") {
          contents.push({
            role: msg.sender === "User" ? "user" : "model",
            parts: [{ text: msg.message }]
          });
        }
      }

      contents.push({
        role: "user",
        parts: [{ text: newMessageContent }]
      });

      const requestBody = {
        contents: contents,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const responseData = await response.json();
      const assistantMessage = responseData.candidates[0].content.parts[0].text;

      return {
        sender: "Allude! Assistant",
        message: assistantMessage,
      };
    } catch (error) {
      console.error("Gemini API request failed:", error);
      return {
        sender: "EDITEZY! Assistant",
        message: "I'm having trouble processing your request. Please try again later.",
      };
    }
  };

  const handleSendRequest = async () => {
    const message = messageInputRef.current.value;
    if (!message) return;

    messageInputRef.current.value = '';

    const userMessage = {
      sender: "User",
      message: message,
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await processMessageWithGemini(message);
      if (response) {
        setChatMessages(prev => [...prev, response]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header with back arrow */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <button 
          onClick={() => window.history.back()}
          className="mr-3 text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          <FaArrowLeft className="text-lg sm:text-xl" />
        </button>
        <h4 className="text-lg sm:text-xl font-semibold flex-1">AI Chat</h4>
        {isTyping && (
          <div className="flex items-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce animation-delay-400"></div>
            </div>
            <span className="ml-2 text-xs sm:text-sm text-gray-600">Thinking...</span>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
        <div className="space-y-3 sm:space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Ask anything to EDITEZY! Assistant</p>
              <p className="text-sm mt-2">Ask anything about our products or services</p>
            </div>
          ) : (
            chatMessages.map((msg, index) => {
              const isUser = msg.sender === "User";
              const direction = isUser ? "justify-end" : "justify-start";

              return (
                <div key={index} className={`flex ${direction}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "bg-blue-100" : "bg-gray-100"} p-2 sm:p-3 rounded-lg`}>
                    {!isUser && (
                      <div className="text-xs font-medium text-gray-700 mb-1">{msg.sender}</div>
                    )}
                    <div className="text-xs sm:text-sm break-words">{msg.message}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-200 flex items-center space-x-2 sm:space-x-3">
        <input
          type="text"
          ref={messageInputRef}
          className="flex-1 p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-sm"
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
        />
        <button
          onClick={handleSendRequest}
          className="bg-blue-500 text-white p-2 sm:p-3 rounded-full hover:bg-blue-600 focus:outline-none transition-colors"
          aria-label="Send message"
        >
          <FaPaperPlane className="text-sm sm:text-base" />
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import api from '../utils/api';
import './CustomerChatbot.css';

export default function CustomerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your ServicePro AI. Describe the problem with your appliance or home, and I'll help you diagnose it, provide safe DIY tips, or recommend the right mechanic!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', text: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send the history (excluding the first welcome message if preferred, but we can send all)
      const res = await api.post('/ai/chat', {
        history: newMessages.slice(0, -1), // everything before current
        message: userMessage.text
      });

      setMessages(prev => [...prev, { role: 'assistant', text: res.data.text }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting to the network right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to safely render markdown-like lists or basic bolding from Gemini
  const formatMessage = (text) => {
    // A simple basic formatter since we don't have react-markdown installed.
    return text.split('\n').map((line, i) => {
      // Remove basic markdown stars for bolding just for clean text, or format them.
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={i} dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
      }
      return <p key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
          <MessageSquare size={28} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={20} color="white" />
              </div>
              <div>
                <h3 className="chatbot-title">ServicePro AI</h3>
                <p className="chatbot-subtitle">Diagnostic Assistant</p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.role === 'assistant' ? (
                  <div style={{ paddingLeft: '4px' }}>{formatMessage(msg.text)}</div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-msg bot">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="e.g. My AC is leaking water..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="chatbot-send-btn"
              disabled={!input.trim() || isLoading}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

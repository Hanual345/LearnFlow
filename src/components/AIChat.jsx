import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, FileText, Sparkles, HelpCircle } from 'lucide-react';

export default function AIChat({ activeDoc }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize messages on document change
  useEffect(() => {
    if (activeDoc) {
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: `Hi there! I've fully analyzed **${activeDoc.name}**. 

I can help you understand this document better. Ask me to:
- Explain specific terms or concepts.
- Summarize the overall document.
- Create study questions or clarify complex points.`
        }
      ]);
    }
  }, [activeDoc]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!activeDoc) {
    return (
      <div className="glass-panel empty-state" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Bot size={48} className="empty-state-icon" />
        <h3>No active document</h3>
        <p>Please return to the Dashboard and click "AI Chat" on any study material to start conversing with the AI assistant.</p>
      </div>
    );
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey) {
      // Real Gemini 2.5 Flash Integration
      try {
        const systemPrompt = `You are LearnFlow AI, a premium study assistant. Below is the parsed text of the study material uploaded by the student:
---
${activeDoc.content}
---
Please answer the student's question based strictly on this document. If the answer cannot be found in the document, use your broad context to provide a helpful answer but clearly state it is supplementary. Keep formatting neat with markdown.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nStudent's Question: ${userMessage.text}` }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini HTTP Error ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I processed your request but couldn't parse the reply candidate. Please try again.";

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: replyText
        }]);
      } catch (err) {
        console.error("Gemini API Connection failed:", err);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: `⚠️ **Gemini API Error:** ${err.message}. Falling back to simulation mode.`
        }]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Simulate smart AI response based on document content (Sandbox Mock)
      setTimeout(() => {
        let aiResponseText = "";
        const query = userMessage.text.toLowerCase();
        const content = activeDoc.content.toLowerCase();

        if (query.includes("summarize") || query.includes("summary")) {
          aiResponseText = `Here is a summary of the main points from **${activeDoc.name}**:
          
  • **Core Subject**: Overview of concepts related to ${activeDoc.name.replace(/\.[^/.]+$/, "")}.
  • **Key Takeaways**:
  ${activeDoc.content.split('\n').filter(line => line.includes('-') || line.includes(':') || /^\d+\./.test(line)).slice(0, 4).join('\n')}

  Would you like me to go deeper into any of these specific points?`;
        } else if (query.includes("key concept") || query.includes("concepts") || query.includes("points")) {
          aiResponseText = `Based on **${activeDoc.name}**, here are the most important concepts you should review:

  ${activeDoc.content.split('\n').filter(line => /^\d+\./.test(line) || line.includes(':')).slice(0, 5).join('\n')}

  I can also generate flashcards or a quiz for you to test your knowledge of these topics!`;
        } else if (query.includes("hello") || query.includes("hi ") || query.includes("hey")) {
          aiResponseText = `Hello! I'm ready to answer any questions you have regarding **${activeDoc.name}**. Feel free to ask about key definitions, processes, or overall explanations!`;
        } else {
          // Find matching lines in text or fallback
          const sentences = activeDoc.content.split('\n');
          const matches = sentences.filter(s => {
            const words = query.split(' ').filter(w => w.length > 3);
            return words.some(w => s.toLowerCase().includes(w));
          });

          if (matches.length > 0) {
            aiResponseText = `Here is what I found in the document regarding your query:

  "${matches.slice(0, 2).join('\n')}"

  To explain this in simple terms: this section highlights how these entities interact within the system to produce the primary outcomes. Let me know if you want me to expand on this.`;
          } else {
            aiResponseText = `That's an interesting question about the material! 

  Based on my analysis of **${activeDoc.name}**:
  - The document covers the fundamental architecture and principles of this topic.
  - A key detail is the structured relationship between its components (refer to the document viewer on the left).

  Could you clarify which specific term or section you're referring to so I can give you a more precise answer?`;
          }
        }

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponseText
        }]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <div>
      <div className="header-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Active Session</span>
            {hasApiKey ? (
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                🟢 Gemini API Connected
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 700 }}>
                ⚠️ Sandbox Mock Mode (Set VITE_GEMINI_API_KEY in .env)
              </span>
            )}
            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginTop: '0.25rem' }}>AI Study Console</h1>
        </div>
      </div>

      <div className="chat-container">
        {/* Document Panel (Left) */}
        <div className="glass-panel document-viewer">
          <div className="viewer-header">
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
            <span>{activeDoc.name}</span>
          </div>
          <div className="viewer-body">
            {activeDoc.content}
          </div>
        </div>

        {/* Chat Panel (Right) */}
        <div className="glass-panel chat-console">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>
                  {msg.sender === 'ai' ? <Bot size={14} /> : <User size={14} />}
                  <span>{msg.sender === 'ai' ? 'LearnFlow AI' : 'You'}</span>
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message ai">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>
                  <Bot size={14} />
                  <span>LearnFlow AI is processing...</span>
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-row">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask anything about this document..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }} disabled={isTyping}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

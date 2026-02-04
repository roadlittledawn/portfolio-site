import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: any;
  contextLabel: string;
  collection?: string;
  roleType?: string;
}

export default function AIChatPanel({
  isOpen,
  onClose,
  contextData,
  contextLabel,
  collection = 'projects',
  roleType = 'technical_writer',
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const claudeMessages = newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/.netlify/functions/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          messages: claudeMessages,
          context: {
            editingContext: {
              collection,
              roleType,
            },
            currentItem: contextData,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          content: data.message.content,
        },
      ]);
    } catch (error) {
      console.error('AI request failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Please try again.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Side Panel - slides in from right */}
      <div className="relative w-full max-w-lg h-full bg-dark-card border-l border-dark-border shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-layer">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">AI Writing Assistant</h2>
            <p className="text-sm text-text-muted">Context: {contextLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-dark-hover rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Context Section */}
        <div className="px-4 py-3 border-b border-dark-border bg-dark-layer/50">
          <button
            type="button"
            onClick={() => setShowContext(!showContext)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showContext ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            View Data Context
          </button>
          {showContext && (
            <pre className="mt-2 p-3 bg-dark-base rounded-lg text-xs text-text-muted overflow-auto max-h-40">
              {JSON.stringify(contextData, null, 2)}
            </pre>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-text-primary mb-4">Hi! I can help you with:</p>
              <ul className="text-text-secondary text-sm space-y-2 text-left max-w-xs mx-auto">
                <li>• Writing compelling descriptions</li>
                <li>• Improving clarity and impact</li>
                <li>• Suggesting keywords and technologies</li>
                <li>• Refining your messaging</li>
              </ul>
              <p className="text-text-muted mt-4 text-sm">Ask me anything about your content!</p>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-accent-blue text-white'
                    : 'bg-dark-layer text-text-primary border border-dark-border'
                }`}
              >
                <div
                  className={`text-xs mb-1 font-medium ${
                    message.role === 'user' ? 'text-white/70' : 'text-accent-green'
                  }`}
                >
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg p-3 bg-dark-layer border border-dark-border">
                <div className="text-xs text-accent-green mb-1 font-medium">AI Assistant</div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <span className="animate-pulse">Thinking</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-dark-border bg-dark-layer">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for help... (Shift+Enter for new line)"
              rows={2}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-dark-base border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue resize-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-5 py-2.5 bg-accent-blue hover:bg-accent-blue/80 disabled:bg-accent-blue/50 text-white font-medium rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

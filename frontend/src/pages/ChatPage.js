import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from 'react-query';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, PieChart, Target, BarChart3, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { aiApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your AI financial assistant. I can help you understand your spending patterns, answer questions about your finances, and provide personalized insights. What would you like to know?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  // Mutation for sending messages
  const sendMessageMutation = useMutation(
    ({ message, conversationId }) => aiApi.chat(message, conversationId),
    {
      onSuccess: (response) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString(),
        }]);
        setConversationId(response.data.conversationId);
        setIsTyping(false);
      },
      onError: (error) => {
        toast.error('Failed to send message');
        console.error('Chat error:', error);
        setIsTyping(false);
      }
    }
  );

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sendMessageMutation.isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const message = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    // For demo purposes, we'll simulate AI responses
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      }]);
      setIsTyping(false);
    }, 1500);

    // Uncomment this to use real API
    // sendMessageMutation.mutate({ message, conversationId });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  // Demo AI response generator
  const generateAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
      return "I'd be happy to help you analyze your spending patterns! However, I don't see any transaction data in your account yet. To get personalized insights about your spending:\n\n1. Connect your bank accounts for automatic transaction sync\n2. Manually add transactions to track your expenses\n3. Upload financial documents for analysis\n\nOnce you have some transaction data, I can show you detailed spending breakdowns by category, trends over time, and personalized recommendations!";
    }
    
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      return "Great question about saving! To provide personalized savings insights, I need to see your financial data first. Here's how to get started:\n\n1. **Connect accounts** - Link your bank accounts to see your income and expenses\n2. **Set goals** - Define what you're saving for (emergency fund, vacation, etc.)\n3. **Track progress** - I'll help you monitor your savings rate and progress\n\nOnce you have some transaction data, I can calculate your savings rate, suggest improvements, and help you create a specific savings plan!";
    }
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('plan')) {
      return "I'd love to help you create a budget! To provide personalized budgeting recommendations, I need to analyze your income and spending patterns first.\n\n**To get started:**\n1. Connect your bank accounts or add transactions manually\n2. Let me analyze your spending patterns over the past few months\n3. I'll suggest budget categories and recommended amounts\n\nOnce you have some financial data in your account, I can create a detailed budget plan tailored to your specific situation!";
    }
    
    if (lowerMessage.includes('investment') || lowerMessage.includes('invest')) {
      return "I can help you with investment analysis! However, I don't see any investment account data yet. To get personalized investment insights:\n\n1. **Connect investment accounts** - Link your brokerage, 401(k), or IRA accounts\n2. **Upload statements** - Share investment documents for analysis\n3. **Set investment goals** - Define your risk tolerance and timeline\n\nOnce you have investment data in your account, I can analyze your portfolio allocation, performance, and provide personalized recommendations!";
    }
    
    if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
      return "I can help you create a debt payoff strategy! To provide personalized debt management advice, I need to see your current debt situation.\n\n**How to get started:**\n1. Add your debt accounts (credit cards, loans, etc.)\n2. Include current balances and interest rates\n3. Share your monthly payment capacity\n\nOnce you have this information in your account, I can create a customized debt payoff plan with specific strategies to save money and pay off debt faster!";
    }
    
    // Default response
    return "I'd be happy to help you with that! I can provide insights on your spending patterns, help you create budgets, analyze your financial goals, and answer questions about your accounts and transactions.\n\nTo get started, try:\n• Connecting your bank accounts\n• Adding some transactions manually\n• Uploading financial documents\n\nOnce you have some financial data, I can provide much more personalized and detailed advice!";
  };

  const suggestedQuestions = [
    { icon: PieChart, text: "How much did I spend on groceries this month?", color: "from-green-500 to-emerald-500" },
    { icon: Target, text: "What's my savings rate?", color: "from-blue-500 to-cyan-500" },
    { icon: BarChart3, text: "Help me create a budget", color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, text: "Show me my investment performance", color: "from-orange-500 to-red-500" },
    { icon: Zap, text: "How can I reduce my expenses?", color: "from-yellow-500 to-orange-500" },
    { icon: DollarSign, text: "What are my biggest spending categories?", color: "from-indigo-500 to-purple-500" }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-950 to-gray-900 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-gray-950 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Financial Assistant</h1>
                <p className="text-sm text-gray-400 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-400" />
                  Powered by advanced AI • Always learning
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 animate-fade-in ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-md ${
                message.role === 'assistant' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot className="h-5 w-5 text-white" />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              
              <div className={`max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl shadow-sm ${
                  message.role === 'assistant'
                    ? 'bg-gray-800/50 backdrop-blur border border-gray-700/50 text-gray-100'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                </div>
                <div className={`text-xs text-gray-500 mt-2 ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start space-x-4 animate-fade-in">
              <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Modern Suggested Questions */}
      {messages.length <= 1 && (
        <div className="border-t border-gray-800/50 bg-gray-950/50 backdrop-blur">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Try asking me about:</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question.text)}
                  className="group relative overflow-hidden bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 hover:border-gray-600/50 rounded-xl p-4 text-left transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${question.color} bg-opacity-10`}>
                      <question.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                        {question.text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

             {/* Modern Input Area */}
       <div className="border-t border-gray-800/50 bg-gray-950/80 backdrop-blur">
         <div className="max-w-4xl mx-auto px-6 py-4">
           <div className="relative">
             <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl shadow-lg">
               <div className="flex items-center space-x-3 p-3">
                 <div className="flex-1">
                   <textarea
                     ref={inputRef}
                     value={inputMessage}
                     onChange={(e) => setInputMessage(e.target.value)}
                     onKeyPress={handleKeyPress}
                     placeholder="Ask me anything about your finances..."
                     className="w-full resize-none bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm leading-relaxed min-h-[40px]"
                     rows={1}
                     style={{ maxHeight: '120px' }}
                   />
                 </div>
                 <button
                   onClick={handleSendMessage}
                   disabled={!inputMessage.trim() || isTyping}
                   className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95"
                 >
                   <Send className="h-4 w-4" />
                 </button>
               </div>
             </div>
           </div>
          
          {/* Footer Info */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span>AI responses are generated in real-time</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span>Real-time insights</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3 text-blue-400" />
                <span>Personalized advice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 
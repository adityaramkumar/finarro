const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Chat with AI
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate conversation ID if not provided
    const currentConversationId = conversationId || uuidv4();

    // Get user's financial context
    const userContext = await getUserFinancialContext(userId);

    // Create AI prompt with context
    const prompt = `You are a helpful financial assistant for Financier. Based on the user's financial data, provide personalized advice and answer their questions.

User Financial Context:
${JSON.stringify(userContext, null, 2)}

User Question: "${message}"

Please provide a helpful, accurate, and personalized response. Be concise but thorough. If you need more information, ask specific questions.`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Save user message
    await db('chat_messages').insert({
      user_id: userId,
      conversation_id: currentConversationId,
      role: 'user',
      content: message,
      context_data: userContext
    });

    // Save AI response
    await db('chat_messages').insert({
      user_id: userId,
      conversation_id: currentConversationId,
      role: 'assistant',
      content: aiResponse,
      context_data: userContext
    });

    res.json({
      response: aiResponse,
      conversationId: currentConversationId
    });

    logger.info(`AI chat interaction for user: ${req.user.email}`);
  } catch (error) {
    logger.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Get chat history
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const messages = await db('chat_messages')
      .where({ user_id: userId, conversation_id: conversationId })
      .orderBy('created_at', 'asc')
      .select('id', 'role', 'content', 'created_at');

    res.json({ messages });
  } catch (error) {
    logger.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Get user's conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conversations = await db('chat_messages')
      .where({ user_id: userId })
      .select('conversation_id')
      .select(db.raw('MAX(created_at) as last_message_at'))
      .select(db.raw('COUNT(*) as message_count'))
      .select(db.raw('MAX(CASE WHEN role = "user" THEN content END) as last_user_message'))
      .groupBy('conversation_id')
      .orderBy('last_message_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json({ conversations });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

// Generate financial insights
router.post('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30days' } = req.body;

    // Get user's financial data
    const userContext = await getUserFinancialContext(userId, timeframe);

    if (!userContext.transactions || userContext.transactions.length === 0) {
      return res.status(400).json({ error: 'Not enough financial data to generate insights' });
    }

    const prompt = `Analyze the following financial data and provide actionable insights and recommendations for the user. Focus on spending patterns, budgeting opportunities, and financial health.

Financial Data:
${JSON.stringify(userContext, null, 2)}

Please provide:
1. Key insights about spending patterns
2. Areas for improvement
3. Positive financial behaviors
4. Specific actionable recommendations
5. Potential risks or concerns

Keep the response concise but comprehensive.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insights = response.text();

    res.json({ insights });
    logger.info(`Generated financial insights for user: ${req.user.email}`);
  } catch (error) {
    logger.error('Generate insights error:', error);
    res.status(500).json({ error: 'Failed to generate financial insights' });
  }
});

// Helper function to get user's financial context
async function getUserFinancialContext(userId, timeframe = '30days') {
  try {
    const dateFilter = new Date();
    
    // Calculate date range based on timeframe
    switch (timeframe) {
      case '7days':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30days':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90days':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      case '1year':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 30);
    }

    // Get user's accounts
    const accounts = await db('accounts')
      .where({ user_id: userId, is_active: true })
      .select('id', 'account_name', 'account_type', 'current_balance', 'available_balance');

    // Get recent transactions
    const transactions = await db('transactions')
      .where({ user_id: userId })
      .where('date', '>=', dateFilter)
      .orderBy('date', 'desc')
      .limit(100)
      .select('name', 'amount', 'date', 'category_primary', 'merchant_name');

    // Calculate spending by category
    const spendingByCategory = await db('transactions')
      .where({ user_id: userId })
      .where('date', '>=', dateFilter)
      .where('amount', '<', 0) // Only expenses
      .groupBy('category_primary')
      .select('category_primary as category')
      .select(db.raw('SUM(ABS(amount)) as total'))
      .orderBy('total', 'desc');

    // Calculate monthly income vs expenses
    const monthlyData = await db('transactions')
      .where({ user_id: userId })
      .where('date', '>=', dateFilter)
      .select(db.raw('DATE_TRUNC(\'month\', date) as month'))
      .select(db.raw('SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income'))
      .select(db.raw('SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses'))
      .groupBy(db.raw('DATE_TRUNC(\'month\', date)'))
      .orderBy('month');

    // Get total balances
    const totalBalances = accounts.reduce((acc, account) => {
      acc[account.account_type] = (acc[account.account_type] || 0) + parseFloat(account.current_balance || 0);
      return acc;
    }, {});

    return {
      timeframe,
      accounts,
      transactions,
      spendingByCategory,
      monthlyData,
      totalBalances,
      accountCount: accounts.length,
      transactionCount: transactions.length
    };
  } catch (error) {
    logger.error('Error getting user financial context:', error);
    return {};
  }
}

module.exports = router; 
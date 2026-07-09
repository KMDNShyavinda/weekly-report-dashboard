const fetch = global.fetch || require('node-fetch');
const Report = require('../models/Report');

// Build a short list of recent report data to give the AI enough context.
const buildReportContext = async () => {
  // If MongoDB is connected, load real reports from the database.
  if (Report?.db?.readyState === 1) {
    const reports = await Report.find()
      .populate('userId', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(8);

    // Convert each report into a simple object that is easy for the AI to read.
    return reports.map((report) => ({
      project: report.projectId?.name || 'Unknown project',
      employee: report.userId?.name || 'Unknown employee',
      title: report.title || 'No title',
      tasksCompleted: report.tasksCompleted || 'No completed tasks listed',
      tasksPlanned: report.tasksPlanned || 'No planned tasks listed',
      blockers: report.blockers || 'No blockers reported',
      status: report.reviewStatus || report.status || 'Unknown status'
    }));
  }

  // Fallback sample data when the database is not available.
  return [
    {
      project: 'Client Expansion',
      employee: 'Alicia Chen',
      title: 'Quarterly Client Summary',
      tasksCompleted: 'Prepared status report and reviewed deliverables.',
      tasksPlanned: 'Finalize action plan for next week.',
      blockers: 'None',
      status: 'pending'
    }
  ];
};

// Send the prepared conversation to the Gemini API and return the generated answer.
const geminiRequest = async (messages) => {
  // Read the API key from the environment.
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured. Set this environment variable to enable the AI assistant.');
  }

  // Separate the system instruction from the regular chat messages.
  const systemMessage = messages.find((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  // Convert the chat messages into the format expected by Gemini.
  const contents = conversationMessages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }]
  }));

  // Build the request body for Gemini.
  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500
    }
  };

  // Add the system instruction if one exists.
  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage.content }]
    };
  }

  // Send the request to the Gemini API.
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  // If the API returns an error, show the details clearly.
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Gemini request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  // Parse the Gemini response and return the generated text.
  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
};

// Format the report context into a readable block of text for the AI.
const formatContext = (reportContext) => {
  return reportContext
    .map((item, index) => `Report ${index + 1}:
  Project: ${item.project}
  Employee: ${item.employee}
  Title: ${item.title}
  Completed: ${item.tasksCompleted}
  Planned: ${item.tasksPlanned}
  Blockers: ${item.blockers}
  Status: ${item.status}`)
    .join('\n\n');
};

// Main controller that receives a manager question and returns an AI answer.
const handleAssistantMessage = async (req, res) => {
  try {
    // Read the question sent by the frontend.
    const { question } = req.body;
    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: 'Please provide a question for the assistant.' });
    }

    // Gather recent report information to help the AI answer accurately.
    const reportContext = await buildReportContext();
    const contextText = formatContext(reportContext);

    // Build the conversation that will be sent to Gemini.
    const messages = [
      {
        role: 'system',
        content:
          'You are an AI assistant embedded in a weekly report dashboard for managers. Use available report summaries and team activity context to answer questions about completed work, blockers, workload, and review status.'
      },
      {
        role: 'user',
        content: `Here is the recent report context:\n\n${contextText}\n\nAnswer the manager's question using only this data. If you do not have enough information, be transparent and provide a constructive response.`
      },
      {
        role: 'user',
        content: question
      }
    ];

    // Ask Gemini to answer the question using the provided report context.
    const assistantText = await geminiRequest(messages);
    res.json({ answer: assistantText });
  } catch (error) {
    // If anything fails, return a clear error message to the client.
    console.error('Assistant error', error);
    res.status(500).json({ message: error.message || 'Unable to process assistant request.' });
  }
};

module.exports = { handleAssistantMessage };

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

const generateContent = async (prompt) => {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate content');
  }
};

const generateStructuredContent = async (prompt, format = 'json') => {
  try {
    const model = getModel();
    const structuredPrompt = `${prompt}\n\nPlease respond in valid ${format.toUpperCase()} format only.`;
    const result = await model.generateContent(structuredPrompt);
    const response = await result.response;
    const text = response.text();
    
    if (format === 'json') {
      // Clean up the response text
      let cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      // Try to find JSON object in the response
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      }
      
      return JSON.parse(cleanText);
    }
    return text;
  } catch (error) {
    console.error('Gemini Structured API Error:', error);
    throw new Error('Failed to generate structured content');
  }
};

module.exports = {
  generateContent,
  generateStructuredContent,
  getModel
};
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Access your API key as an environment variable
// IMPORTANT: Make sure to set the GOOGLE_AI_API_KEY environment variable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function testAI() {
  // The Gemini 1.5 models are versatile and work with most use cases
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Write a short story about a magic backpack.";

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAI();
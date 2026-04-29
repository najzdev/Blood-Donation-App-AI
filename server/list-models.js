require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('=== Listing Available Gemini Models ===\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY not found');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try common model names
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-pro-vision',
      'text-bison',
      'chat-bison',
    ];

    console.log('Trying to initialize models...\n');

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        console.log(`✅ ${modelName} - WORKS`);
      } catch (err) {
        if (err.status === 404) {
          console.log(`❌ ${modelName} - Not available (404)`);
        } else if (err.message.includes('API key')) {
          console.log(`⚠️  ${modelName} - API key issue`);
        } else {
          console.log(`⚠️  ${modelName} - Error: ${err.message.substring(0, 60)}...`);
        }
      }
    }

    console.log('\n=== RECOMMENDATION ===');
    console.log('If none work, your API key may not have the required permissions.');
    console.log('Go to: https://makersuite.google.com/app/apikey');
    console.log('And generate a new API key with all permissions enabled.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

listModels();

require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('=== Gemini API Test ===\n');

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
  }
  console.log('✅ API Key found:', `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);

  try {
    // Initialize Gemini
    console.log('\nInitializing GoogleGenerativeAI...');
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialized');

    // Get model
    console.log('\nGetting generative model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Model obtained (gemini-1.5-flash)');

    // Test 1: Simple message
    console.log('\n--- Test 1: Simple Message ---');
    console.log('Sending test message...');
    const result = await model.generateContent('Say "Hello from Dem AI"');
    console.log('✅ Response received');

    // Get text (synchronous!)
    console.log('Extracting text (synchronous)...');
    const response = result.response.text();
    console.log('✅ Text extracted');
    console.log('Response:', response);

    // Test 2: Chat history
    console.log('\n--- Test 2: Chat with History ---');
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi! How can I help?' }] }
      ],
      generationConfig: { maxOutputTokens: 100 }
    });

    const msg = await chat.sendMessage('What is blood type compatibility?');
    const text = msg.response.text();
    console.log('✅ Chat response received');
    console.log('Response:', text.substring(0, 100) + '...');

    console.log('\n✅ All tests passed! Gemini API is working correctly.');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error('\nFull Error:');
    console.error(err);
    console.error('\nError Type:', err.constructor.name);
    process.exit(1);
  }
}

testGemini();
